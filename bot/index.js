import { execa } from 'execa';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const {
  BOT_TOKEN,
  TELEGRAM_ADMIN_IDS,
  ADMIN_API_SECRET_KEY,
  NEXT_PUBLIC_API_URL = 'http://localhost:3000',
} = process.env;

if (!BOT_TOKEN || !TELEGRAM_ADMIN_IDS || !ADMIN_API_SECRET_KEY) {
  console.error('FATAL: Переменные окружения не настроены. Exiting.');
  process.exit(1);
}

const adminIds = TELEGRAM_ADMIN_IDS.split(',').map(id => parseInt(id.trim(), 10));
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const API_BASE_URL = `${NEXT_PUBLIC_API_URL}/api/admin`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from '../src/lib/init-database.ts';

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'lots');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

console.log(`✅ Бот запущен. Админы: [${adminIds.join(', ')}].`);

async function apiCall(endpoint, method = 'POST', body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Secret-Key': ADMIN_API_SECRET_KEY },
    body: body ? JSON.stringify(body) : null,
  };
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Не удалось прочитать ошибку API' }));
    throw new Error(errorData.error || `API ошибка со статусом ${response.status}`);
  }
  return response.json();
}

async function downloadPhoto(file_id, savePath) {
  const fileInfo = await bot.getFile(file_id);
  const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;
  const writer = fs.createWriteStream(savePath);
  const response = await axios({ url: fileUrl, method: 'GET', responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
}

const checkAdmin = (msg) => {
  if (!msg.from || !adminIds.includes(msg.from.id)) {
    if (msg.from) bot.sendMessage(msg.from.id, "⛔️ У вас нет прав для использования этого бота.");
    return false;
  }
  return true;
};

async function checkAndFinishAuctions() {
  try {
    const now = new Date().toISOString();
    const findExpiredLots = db.prepare(`
      SELECT l.id, l.title, l.winner_id, u.first_name, u.last_name, u.username AS tg_username
      FROM Lots l
      LEFT JOIN users u ON l.winner_id = u.id
      WHERE l.status = 'ACTIVE' AND l.expires_at <= ?
    `);
    const expiredLots = findExpiredLots.all(now);

    if (expiredLots.length > 0) {
      console.log(`[AUCTION CHECKER] Найдено ${expiredLots.length} истекших аукционов.`);
    }

    const updateStmt = db.prepare(`UPDATE Lots SET status = 'FINISHED' WHERE id = ?`);
    const finishTransaction = db.transaction((lots) => {
        for (const lot of lots) {
            updateStmt.run(lot.id);
            let notificationMessage;
            if (lot.winner_id && lot.first_name) {
                const winnerName = `${lot.first_name}${lot.last_name ? ` ${lot.last_name}` : ''}`;
                const winnerUsername = lot.tg_username ? `@${lot.tg_username}` : 'нет username';
                notificationMessage = `🎉 *Аукцион завершен!*\n\n*Лот:* "${lot.title}" (ID: ${lot.id})\n*Победитель:* ${winnerName}\n*Telegram:* ${winnerUsername}\n\nПожалуйста, свяжитесь с победителем.`;
            } else {
                notificationMessage = `⌛️ *Аукцион завершен без победителя.*\n\n*Лот:* "${lot.title}" (ID: ${lot.id})`;
            }
            adminIds.forEach(adminId => {
                bot.sendMessage(adminId, notificationMessage, { parse_mode: 'Markdown' }).catch(err => {
                    console.error(`[AUCTION CHECKER] Не удалось отправить сообщение админу ${adminId} о лоте ${lot.id}:`, err.response?.body || err.message);
                });
            });
        }
    });

    if (expiredLots.length > 0) {
        finishTransaction(expiredLots);
    }

  } catch (error) {
    console.error('[AUCTION CHECKER] Фатальная ошибка при проверке аукционов:', error);
  }
}

setInterval(checkAndFinishAuctions, 60000);
console.log('✅ Фоновая задача проверки аукционов запущена.');

const waitingForPhoto = {};

bot.onText(/\/start|\/help/, (msg) => {
  if (!checkAdmin(msg)) return;
  const helpText = `*👋 Админ-панель "Ассист+"*\n\n*Создание лота (2 шага):*\n1. \`/addlot <Название>;<Цена>;<Часы>;<Описание>;<Город>;<Возраст>\`\n2. Отправьте картинку.\n\n*Редактирование картинки (2 шага):*\n1. \`/editphoto <ID лота>\`\n2. Отправьте новую картинку.\n\n*Просмотр:*\n\`/listlots\`\n\n*Редактирование полей:*\n\`/editlot <ID> <поле> <новое значение>\`\n\n*Удаление:*\n\`/deletelot <ID>\``;
  bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
});

bot.onText(/\/addlot (.+)/s, async (msg, match) => {
  if (!checkAdmin(msg)) return;
  const chatId = msg.chat.id;
  try {
    const parts = match[1].split(';').map(p => p.trim());
    if (parts.length !== 6) throw new Error("Неверный формат. Нужно 6 параметров.");
    const [title, start_price_str, duration_hours_str, description, city, age_str] = parts;
    const lotData = { title, description, city, start_price: parseInt(start_price_str), duration_hours: parseInt(duration_hours_str), age: parseInt(age_str) };
    if (isNaN(lotData.start_price) || isNaN(lotData.duration_hours) || isNaN(lotData.age)) throw new Error("Цена, часы, возраст должны быть числами.");
    waitingForPhoto[chatId] = { type: 'add', lotData };
    await bot.sendMessage(chatId, `⏳ Данные приняты. Теперь отправьте картинку для лота "${title}".`);
  } catch (error) {
    await bot.sendMessage(chatId, `❌ *Ошибка:*\n${error.message}`, { parse_mode: 'Markdown' });
  }
});

bot.onText(/\/editphoto (\d+)/, async (msg, match) => {
  if (!checkAdmin(msg)) return;
  const chatId = msg.chat.id;
  try {
    const lotId = parseInt(match[1], 10);
    if (isNaN(lotId)) throw new Error("Некорректный ID лота.");
    waitingForPhoto[chatId] = { type: 'edit', lotId };
    await bot.sendMessage(chatId, `⏳ Готов изменить фото для лота *${lotId}*. Отправьте новую картинку.`, { parse_mode: 'Markdown' });
  } catch (error) {
     await bot.sendMessage(chatId, `❌ *Ошибка:*\n${error.message}`, { parse_mode: 'Markdown' });
  }
});

bot.on('photo', async (msg) => {
  if (!checkAdmin(msg)) return;
  const chatId = msg.chat.id;
  const state = waitingForPhoto[chatId];
  if (!state) return;
  delete waitingForPhoto[chatId];
  try {
    await bot.sendMessage(chatId, `⏳ Получил картинку, обрабатываю...`);
    const photo = msg.photo[msg.photo.length - 1];
    if (state.type === 'add') {
      const { lotData } = state;
      const result = await apiCall('/lots', 'POST', lotData);
      const lotId = result.lotId;
      const photoPath = path.join(UPLOAD_DIR, `${lotId}.jpg`);
      await downloadPhoto(photo.file_id, photoPath);
      const photoUrl = `/uploads/lots/${lotId}.jpg`;
      await apiCall(`/lots/${lotId}`, 'PATCH', { photoUrl });
      await bot.sendMessage(chatId, `✅ Успешно! Лот *${lotId}* ("${lotData.title}") создан с картинкой.`, { parse_mode: 'Markdown' });
    } else if (state.type === 'edit') {
      const { lotId } = state;
      const photoPath = path.join(UPLOAD_DIR, `${lotId}.jpg`);
      await downloadPhoto(photo.file_id, photoPath);
      const photoUrl = `/uploads/lots/${lotId}.jpg?v=${Date.now()}`;
      await apiCall(`/lots/${lotId}`, 'PATCH', { photoUrl });
      await bot.sendMessage(chatId, `✅ Успешно! Картинка для лота *${lotId}* обновлена.`, { parse_mode: 'Markdown' });
    }
    await execa('pm2', ['reload', 'tap-app']);
  } catch (error) {
    await bot.sendMessage(chatId, `❌ *Фатальная ошибка:*\n${error.message || "Неизвестная ошибка"}`, { parse_mode: 'Markdown' });
  }
});

bot.onText(/\/listlots/, async (msg) => {
  if (!checkAdmin(msg)) return;
  const chatId = msg.chat.id;
  try {
    await bot.sendMessage(chatId, '⏳ Запрашиваю список лотов...');
    const lots = await apiCall('/lots', 'GET');
    if (lots.length === 0) {
      await bot.sendMessage(chatId, "Лотов в базе данных пока нет.");
      return;
    }
    const MAX_LENGTH = 4000;
    let reply = "🗂 *Список всех лотов:*\n\n";
    for (const lot of lots) {
      const lotString = `*ID: ${lot.id}* (${lot.status}) - _${lot.title}_\n`;
      if (reply.length + lotString.length > MAX_LENGTH) {
        await bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
        reply = "";
      }
      reply += lotString;
    }
    if (reply.length > 0) {
      await bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    await bot.sendMessage(chatId, `❌ *Ошибка при загрузке списка:*\n${error.message}`, { parse_mode: 'Markdown' });
  }
});

bot.onText(/\/editlot (\d+) (\w+) (.+)/s, async (msg, match) => {
  if (!checkAdmin(msg)) return;
  const chatId = msg.chat.id;
  try {
    const [, lotId, field, value_encoded] = match;
    let value = decodeURIComponent(value_encoded.trim());
    const allowedFields = ['title', 'description', 'city', 'age', 'start_price', 'status'];
    if (!allowedFields.includes(field)) {
      throw new Error(`Недопустимое поле. Для фото используйте /editphoto.`);
    }
    if (['age', 'start_price'].includes(field)) {
      value = parseInt(value, 10);
      if(isNaN(value)) throw new Error("Значение для этого поля должно быть числом.");
    }
    await bot.sendMessage(chatId, `⏳ Редактирую поле \`${field}\` для лота *${lotId}*...`, { parse_mode: 'Markdown' });
    await apiCall(`/lots/${lotId}`, 'PATCH', { [field]: value });
    await bot.sendMessage(chatId, `✅ Успешно! Лот *${lotId}* обновлен.`, { parse_mode: 'Markdown' });
  } catch (error) {
    await bot.sendMessage(chatId, `❌ *Ошибка при редактировании:*\n${error.message}`, { parse_mode: 'Markdown' });
  }
});

bot.onText(/\/deletelot (\d+)/, async (msg, match) => {
  if (!checkAdmin(msg)) return;
  const chatId = msg.chat.id;
  try {
    const lotId = match[1];
    await bot.sendMessage(chatId, `⏳ Отменяю лот *${lotId}*...`, { parse_mode: 'Markdown' });
    await apiCall(`/lots/${lotId}`, 'DELETE');
    await bot.sendMessage(chatId, `✅ Успешно! Лот *${lotId}* был отменен.`, { parse_mode: 'Markdown' });
  } catch (error) {
    await bot.sendMessage(chatId, `❌ *Ошибка при отмене:*\n${error.message}`, { parse_mode: 'Markdown' });
  }
});