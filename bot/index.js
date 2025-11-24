/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import TelegramBot from 'node-telegram-bot-api';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к базе данных
const dbPath = path.join(__dirname, '..', 'main.db');
const db = new Database(dbPath);

const {
  BOT_TOKEN,
  TELEGRAM_ADMIN_IDS,
} = process.env;

if (!BOT_TOKEN || !TELEGRAM_ADMIN_IDS) {
  console.error('FATAL: Переменные окружения не настроены. Exiting.');
  process.exit(1);
}

// --- ИСПРАВЛЕНИЕ 1: Надежный парсинг ID админов ---
// Удаляет дубликаты, удаляет мусор (пробелы, >), фильтрует нечисловые значения
const adminIds = [
  ...new Set(
    TELEGRAM_ADMIN_IDS.split(',')
      .map(id => {
        const cleanId = id.replace(/[^0-9]/g, ''); // Оставляем только цифры
        return parseInt(cleanId, 10);
      })
      .filter(id => !isNaN(id) && id > 0) // Убираем ошибки парсинга
  )
];

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log(`✅ Бот запущен. Админы (всего ${adminIds.length}): [${adminIds.join(', ')}].`);

// --- ИСПРАВЛЕНИЕ 2: Функция экранирования Markdown ---
// Предотвращает падение бота, если в имени есть символы _ * [ ] `
const escapeMarkdown = (text) => {
  if (!text) return '';
  return text.toString().replace(/[_*[\]`]/g, '\\$&');
};

const checkAdmin = (msg) => {
  if (!msg.from || !adminIds.includes(msg.from.id)) {
    return false;
  }
  return true;
};

// Уровни розыгрышей
const LOTTERY_LEVELS = [
  { level: 1, name: 'Глубокий чек-лист от «АССИСТ+»', winners: 10 },
  { level: 5, name: 'Разбор резюме и портфолио от команды «АССИСТ+»', winners: 1 },
  { level: 10, name: 'Книга + размещение канала в рекомендациях на 30 дней', winners: 1 },
  { level: 25, name: 'Закрытый мини-разбор с предпринимателем (онлайн, 60 минут, группа)', winners: 1 },
  { level: 50, name: 'Очная встреча в Сколково с секретным гостем', winners: 1 }
];

// Функция для уведомления админов о выигрыше (магазин/рулетка)
export async function notifyAdminsAboutWinning(userId, userName, userUsername, prizeName, prizeType) {
  try {
    // Экранируем данные пользователя, чтобы не сломать Markdown
    const safeName = escapeMarkdown(userName);
    const safePrize = escapeMarkdown(prizeName);
    const safeUsername = userUsername ? escapeMarkdown(userUsername) : 'не указан';

    const message = `🎁 *Новый выигрыш!*\n\n` +
                   `👤 *Пользователь:* ${safeName}\n` +
                   `📱 *Username:* @${safeUsername}\n` +
                   `🎯 *Приз:* ${safePrize}\n` +
                   `📦 *Тип:* ${prizeType === 'rare' ? 'Редкий' : 'Обычный'}\n\n` +
                   `💬 *ID пользователя:* \`${userId}\``;

    for (const adminId of adminIds) {
      try {
        await bot.sendMessage(adminId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error(`[ADMIN NOTIFY] Не удалось отправить админу ${adminId}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[ADMIN NOTIFY] Ошибка при уведомлении админов:', error);
  }
}

// Функция для отправки приза пользователю
export async function sendPrizeToUser(userId, prizeName, messageType, checklistFileName = null) {
  try {
    let messageText = '';
    
    if (messageType === 'checklist' && checklistFileName) {
      const checklistPath = path.join(process.cwd(), 'public', 'checklists', checklistFileName);
      if (!fs.existsSync(checklistPath)) throw new Error('Checklist file not found');
      const caption = `🎉 Поздравляем! Вы получили чек-лист!\n\n📄 ${checklistFileName.replace('.pdf', '')}`;
      await bot.sendDocument(userId, checklistPath, { caption });
      return true;
    } 
    else if (messageType === 'playbook' && checklistFileName) {
        const filePath = path.join(process.cwd(), 'public', 'checklists', checklistFileName);
        if (!fs.existsSync(filePath)) throw new Error('Playbook file not found');
        const caption = `🎉 Поздравляем! Вы выиграли: *${escapeMarkdown(prizeName)}*\n\n📄 Держите ваш файл с лайфхаками!`;
        await bot.sendDocument(userId, filePath, { caption, parse_mode: 'Markdown' });
        return true;
    }
    else if (messageType === 'checklist_bonus') {
      messageText = `🎉🎉🎉 *Поздравляем!*\n\n` +
                   `Вы получили все 10 чек-листов!\n\n` +
                   `🎁 Бонус: *+250 A+* начислены на ваш баланс!`;
    } else if (messageType === 'manual_contact') {
      messageText = `🎉 Поздравляем! Вы выиграли: *${escapeMarkdown(prizeName)}*\n\n` +
                   `✨ С вами свяжутся в ближайшее время для организации вашего приза!`;
    }

    if (messageText) {
      await bot.sendMessage(userId, messageText, { parse_mode: 'Markdown' });
    }
    
    return true;
  } catch (error) {
    console.error(`[SEND PRIZE] Ошибка отправки приза пользователю ${userId}:`, error);
    if (error.response?.body?.error_code === 403) {
      return { error: 'bot_not_started' };
    }
    throw error;
  }
}

// --- ФУНКЦИИ РОЗЫГРЫШЕЙ ---

async function conductMonthlyLottery() {
  console.log('\n====================================');
  console.log('🎰 НАЧАЛО ЕЖЕМЕСЯЧНОГО РОЗЫГРЫША');
  console.log('====================================\n');

  const results = [];
  
  try {
    for (const lottery of LOTTERY_LEVELS) {
      const participantsStmt = db.prepare(`
        SELECT tg_id, first_name, last_name, username, current_month_referrals
        FROM users
        WHERE current_month_referrals >= ? AND bot_started = 1
      `);
      
      const participants = participantsStmt.all(lottery.level);
      
      if (participants.length === 0) {
        results.push({
          level: lottery.level,
          name: lottery.name,
          status: 'no_participants',
          participants: 0,
          winners: []
        });
        continue;
      }
      
      let winners = [];
      const maxWinners = Math.min(lottery.winners, participants.length);
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      winners = shuffled.slice(0, maxWinners);
      
      results.push({
        level: lottery.level,
        name: lottery.name,
        status: 'success',
        participants: participants.length,
        winners: winners
      });
      
      for (const winner of winners) {
        try {
          await bot.sendMessage(
            winner.tg_id,
            `🎉🎉🎉 *ПОЗДРАВЛЯЕМ!* 🎉🎉🎉\n\n` +
            `Вы выиграли в ежемесячном розыгрыше среди пользователей с ${lottery.level}+ приглашениями!\n\n` +
            `🎁 Ваш приз: *${escapeMarkdown(lottery.name)}*\n\n` +
            `С вами свяжутся в ближайшее время для организации вручения приза!`,
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
          console.error(`   ❌ Не удалось уведомить победителя ${winner.tg_id}:`, error.message);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await notifyAdminsAboutLotteryResults(results);
    await notifyAllUsersAboutResults(results);
    await resetMonthlyCounters();
    
    console.log('✅ РОЗЫГРЫШ ЗАВЕРШЁН');
    
  } catch (error) {
    console.error('[LOTTERY] Критическая ошибка:', error);
    adminIds.forEach(id => bot.sendMessage(id, `❌ *ОШИБКА В РОЗЫГРЫШЕ*\n\n${error.message}`, { parse_mode: 'Markdown' }).catch(() => {}));
  }
}

async function notifyAdminsAboutLotteryResults(results) {
  let message = `📊 *ИТОГИ ЕЖЕМЕСЯЧНОГО РОЗЫГРЫША*\n\n`;
  
  for (const result of results) {
    message += `*Уровень ${result.level}+ рефералов*\n`;
    message += `Приз: ${escapeMarkdown(result.name)}\n`;
    
    if (result.status === 'no_participants') {
      message += `❌ Недостаточно участников (0)\n\n`;
    } else {
      message += `✅ Участников: ${result.participants}\n`;
      message += `🏆 Победителей: ${result.winners.length}\n\n`;
      
      result.winners.forEach((winner, index) => {
        const name = escapeMarkdown(`${winner.first_name}${winner.last_name ? ' ' + winner.last_name : ''}`);
        const username = winner.username ? `@${escapeMarkdown(winner.username)}` : 'нет username';
        message += `${index + 1}. ${name} (${username})\n`;
        message += `   ID: \`${winner.tg_id}\` | Рефералов: ${winner.current_month_referrals}\n`;
      });
      message += '\n';
    }
  }
  
  for (const adminId of adminIds) {
    try {
      // Разбиваем длинные сообщения, если нужно
      if (message.length > 4000) {
         const chunks = message.match(/[\s\S]{1,4000}/g) || [];
         for (const chunk of chunks) await bot.sendMessage(adminId, chunk, { parse_mode: 'Markdown' });
      } else {
         await bot.sendMessage(adminId, message, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error(`Не удалось отправить итоги админу ${adminId}:`, error.message);
    }
  }
}

async function notifyAllUsersAboutResults(results) {
  const usersStmt = db.prepare(`SELECT tg_id, first_name FROM users WHERE bot_started = 1`);
  const users = usersStmt.all();
  
  let message = `🎉 *ИТОГИ ЕЖЕМЕСЯЧНОГО РОЗЫГРЫША*\n\n`;
  let hasWinners = false;
  
  for (const result of results) {
    if (result.status !== 'no_participants') {
      hasWinners = true;
      message += `📋 *${result.level}+ приглашений*\n`;
      message += `🎁 Приз: ${escapeMarkdown(result.name)}\n`;
      message += `🏆 Победители:\n`;
      
      result.winners.forEach((winner, index) => {
        const name = escapeMarkdown(`${winner.first_name}${winner.last_name ? ' ' + winner.last_name : ''}`);
        message += `   ${index + 1}. ${name}\n`;
      });
      message += '\n';
    }
  }
  
  if (!hasWinners) message += `\n💬 В этом месяце не было достаточно участников ни в одном розыгрыше.\n`;
  
  message += `\n🔄 Счётчики обнулены. Новый розыгрыш уже начался!\nПриглашай друзей и участвуй в следующем месяце! 🚀`;
  
  let sent = 0;
  for (const user of users) {
    try {
      await bot.sendMessage(user.tg_id, message, { parse_mode: 'Markdown' });
      sent++;
      if (sent % 25 === 0) await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      // Игнорируем ошибки блокировки
    }
  }
}

async function resetMonthlyCounters() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const resetStmt = db.prepare(`UPDATE users SET current_month_referrals = 0, last_referral_reset = ? WHERE current_month_referrals > 0`);
  resetStmt.run(currentMonth);
}

// Проверка и запуск розыгрыша (проверяем каждый час)
async function checkAndRunLottery() {
  const now = new Date();
  const day = now.getDate();
  const hours = now.getHours();
  
  if (day === 1 && hours === 0) {
    const lastRunKey = `lottery_run_${now.getFullYear()}_${now.getMonth()}`;
    const checkStmt = db.prepare(`SELECT COUNT(*) as count FROM lotteries WHERE name = ? AND created_at >= datetime('now', '-1 hour')`);
    const check = checkStmt.get(lastRunKey);
    
    if (check.count === 0) {
      console.log(`\n🎰 Запуск автоматического розыгрыша (${now.toISOString()})`);
      const insertStmt = db.prepare(`INSERT INTO lotteries (name, description, start_date, end_date, required_referrals, status) VALUES (?, ?, ?, ?, 1, 'FINISHED')`);
      insertStmt.run(lastRunKey, 'Автоматический ежемесячный розыгрыш', now.toISOString(), now.toISOString());
      await conductMonthlyLottery();
    }
  }
}

// Проверка и завершение аукционов
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
    const updateStmt = db.prepare(`UPDATE Lots SET status = 'FINISHED' WHERE id = ?`);
    
    const finishTransaction = db.transaction((lots) => {
        for (const lot of lots) {
            updateStmt.run(lot.id);
            let notificationMessage;
            const safeTitle = escapeMarkdown(lot.title);
            
            if (lot.winner_id && lot.first_name) {
                const safeName = escapeMarkdown(`${lot.first_name}${lot.last_name ? ` ${lot.last_name}` : ''}`);
                const safeUsername = lot.tg_username ? `@${escapeMarkdown(lot.tg_username)}` : 'нет username';
                notificationMessage = `🎉 *Аукцион завершен!*\n\n*Лот:* "${safeTitle}" (ID: ${lot.id})\n*Победитель:* ${safeName}\n*Telegram:* ${safeUsername}\n\nПожалуйста, свяжитесь с победителем.`;
            } else {
                notificationMessage = `⌛️ *Аукцион завершен без победителя.*\n\n*Лот:* "${safeTitle}" (ID: ${lot.id})`;
            }
            
            adminIds.forEach(adminId => {
                bot.sendMessage(adminId, notificationMessage, { parse_mode: 'Markdown' }).catch(() => {});
            });
        }
    });

    if (expiredLots.length > 0) finishTransaction(expiredLots);

  } catch (error) {
    console.error('[AUCTION CHECKER] Ошибка:', error);
  }
}

async function checkAndResetMonthlyReferrals() {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const checkResetStmt = db.prepare(`SELECT id FROM users WHERE current_month_referrals > 0 AND (last_referral_reset IS NULL OR last_referral_reset != ?)`);
    const usersToReset = checkResetStmt.all(currentMonth);
    
    if (usersToReset.length > 0) {
      const resetStmt = db.prepare(`UPDATE users SET current_month_referrals = 0, last_referral_reset = ? WHERE id = ?`);
      const resetTransaction = db.transaction((users) => {
        for (const user of users) resetStmt.run(currentMonth, user.id);
      });
      resetTransaction(usersToReset);
    }
  } catch (error) {
    console.error('[LOTTERY] Ошибка при сбросе рефералов:', error);
  }
}

// Запуск фоновых задач
setInterval(checkAndFinishAuctions, 60000);
setInterval(checkAndRunLottery, 3600000);
setInterval(checkAndResetMonthlyReferrals, 3600000);
setTimeout(() => checkAndRunLottery(), 5000);

// ===== КОМАНДЫ БОТА =====

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || '';
  const firstName = msg.from.first_name || 'Пользователь';
  const lastName = msg.from.last_name || '';
  
  try {
    const checkUser = db.prepare('SELECT id, bot_started FROM users WHERE tg_id = ?');
    const existingUser = checkUser.get(userId);
    
    if (existingUser) {
      if (!existingUser.bot_started) {
        db.prepare('UPDATE users SET bot_started = 1 WHERE tg_id = ?').run(userId);
      }
    } else {
      db.prepare(`INSERT INTO users (tg_id, username, first_name, last_name, bot_started) VALUES (?, ?, ?, ?, 1)`).run(userId, username, firstName, lastName);
    }
    
    const welcomeText = `👋 *Добро пожаловать в бота АССИСТ+!*\n\nТеперь ты можешь полноценно пользоваться нашим приложением 🤍`;
    bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('[BOT START] Ошибка:', error);
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const isAdmin = checkAdmin(msg);
  
  let helpText = `*📖 Помощь - Бот АССИСТ+*\n\n/start - Активировать бота\n/help - Показать эту справку\n`;
  if (isAdmin) {
    helpText += `\n*👑 Команды администратора:*\n/admin - Панель управления\n/lottery - Управление розыгрышами\n/participants <уровень> - Список участников\n/draw <уровень> - Провести розыгрыш вручную\n/runlottery - Запустить полный розыгрыш сейчас\n/reset_month - Сбросить месячные счетчики`;
  }
  bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
});

bot.onText(/\/admin/, async (msg) => {
  if (!checkAdmin(msg)) return bot.sendMessage(msg.chat.id, "⛔️ У вас нет прав.");
  
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN bot_started = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN current_month_referrals >= 1 THEN 1 ELSE 0 END) as lottery_1,
        SUM(CASE WHEN current_month_referrals >= 5 THEN 1 ELSE 0 END) as lottery_5,
        SUM(CASE WHEN current_month_referrals >= 10 THEN 1 ELSE 0 END) as lottery_10,
        SUM(CASE WHEN current_month_referrals >= 25 THEN 1 ELSE 0 END) as lottery_25,
        SUM(CASE WHEN current_month_referrals >= 50 THEN 1 ELSE 0 END) as lottery_50
      FROM users
    `).get();
    
    const message = `*👑 Админ-панель*\n\n📊 *Статистика:*\nВсего: ${stats.total_users}\nАктивных (бот): ${stats.active_users}\n\n🎰 *Участники (мес.):*\n1+: ${stats.lottery_1}\n5+: ${stats.lottery_5}\n10+: ${stats.lottery_10}\n25+: ${stats.lottery_25}\n50+: ${stats.lottery_50}`;
    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(msg.chat.id, '❌ Ошибка при получении статистики');
  }
});

// --- ИСПРАВЛЕНИЕ 3: Команда participants с чанками и БЕЗ Markdown для списка ---
bot.onText(/\/participants (\d+)/, async (msg, match) => {
  if (!checkAdmin(msg)) return bot.sendMessage(msg.chat.id, "⛔️ У вас нет прав.");
  
  const chatId = msg.chat.id;
  const level = parseInt(match[1]);
  
  if (![1, 5, 10, 25, 50].includes(level)) return bot.sendMessage(chatId, `❌ Уровень: 1, 5, 10, 25, 50`);
  
  try {
    const participants = db.prepare(`
      SELECT tg_id, first_name, last_name, username, current_month_referrals, referral_count_subscribed
      FROM users
      WHERE current_month_referrals >= ?
      ORDER BY current_month_referrals DESC
    `).all(level);
    
    if (participants.length === 0) return bot.sendMessage(chatId, `Участников с ${level}+ рефералами нет.`);
    
    // Отправляем заголовок с Markdown
    await bot.sendMessage(chatId, `🎰 *Участники (${level}+ рефералов):* Всего: ${participants.length}`, { parse_mode: 'Markdown' });

    // Отправляем список ОБЫЧНЫМ текстом, чтобы никнеймы с "_" не ломали бота
    let chunk = "";
    for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        const name = `${p.first_name}${p.last_name ? ' ' + p.last_name : ''}`;
        const username = p.username ? `@${p.username}` : 'нет';
        const line = `${i + 1}. ${name} (${username})\n   В этом мес: ${p.current_month_referrals} | Всего: ${p.referral_count_subscribed || 0}\n\n`;
        
        if (chunk.length + line.length > 3000) {
            await bot.sendMessage(chatId, chunk);
            chunk = "";
        }
        chunk += line;
    }
    if (chunk) await bot.sendMessage(chatId, chunk);
    
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
  }
});

bot.onText(/\/lottery/, async (msg) => {
  if (!checkAdmin(msg)) return;
  bot.sendMessage(msg.chat.id, `*🎰 Управление*\n\n/participants <ур> - Список\n/runlottery - Запуск сейчас\n/reset_month - Сброс счетчиков`, { parse_mode: 'Markdown' });
});

bot.onText(/\/runlottery/, async (msg) => {
  if (!checkAdmin(msg)) return;
  bot.sendMessage(msg.chat.id, '🎰 Запускаю полный розыгрыш...');
  await conductMonthlyLottery();
  bot.sendMessage(msg.chat.id, '✅ Розыгрыш завершён!');
});

// --- ИСПРАВЛЕНИЕ 4: Команда draw с экранированием ---
bot.onText(/\/draw (\d+)/, async (msg, match) => {
  if (!checkAdmin(msg)) return;
  const chatId = msg.chat.id;
  const level = parseInt(match[1]);
  
  if (![1, 5, 10, 25, 50].includes(level)) return bot.sendMessage(chatId, `❌ Уровень: 1, 5, 10, 25, 50`);
  
  try {
    const participants = db.prepare(`SELECT tg_id, first_name, last_name, username, current_month_referrals FROM users WHERE current_month_referrals >= ?`).all(level);
    if (participants.length === 0) return bot.sendMessage(chatId, `❌ Нет участников`);
    
    const prizes = {
      1: 'Глубокий чек-лист', 5: 'Разбор резюме', 10: 'Книга + рекомендации',
      25: 'Мини-разбор', 50: 'Встреча в Сколково'
    };
    
    let winners = [];
    if (level === 1) {
      winners = [...participants].sort(() => Math.random() - 0.5).slice(0, Math.min(10, participants.length));
    } else {
      winners = [participants[Math.floor(Math.random() * participants.length)]];
    }
    
    let msgText = `🎉 *Розыгрыш завершен (Ручной)*\nУровень: ${level}+\nПриз: ${prizes[level]}\n\n🏆 *Победители:*\n`;
    winners.forEach((w, i) => {
        const name = escapeMarkdown(`${w.first_name}${w.last_name ? ' ' + w.last_name : ''}`);
        const username = w.username ? `@${escapeMarkdown(w.username)}` : 'нет';
        msgText += `${i+1}. ${name} (${username}) [ID: \`${w.tg_id}\`]\n`;
    });
    
    bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
    
    // Уведомляем победителей
    for (const winner of winners) {
      try {
        await bot.sendMessage(winner.tg_id, `🎉 Вы выиграли: *${escapeMarkdown(prizes[level])}*`, { parse_mode: 'Markdown' });
      } catch (e) {}
    }
    
  } catch (error) {
    bot.sendMessage(chatId, '❌ Ошибка при проведении розыгрыша');
  }
});

bot.onText(/\/reset_month/, async (msg) => {
  if (!checkAdmin(msg)) return;
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const result = db.prepare(`UPDATE users SET current_month_referrals = 0, last_referral_reset = ? WHERE current_month_referrals > 0`).run(currentMonth);
    bot.sendMessage(msg.chat.id, `✅ Сброшено для ${result.changes} пользователей`);
  } catch (error) {
    bot.sendMessage(msg.chat.id, '❌ Ошибка при сбросе');
  }
});

export default bot;