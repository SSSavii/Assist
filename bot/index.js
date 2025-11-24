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

const adminIds = TELEGRAM_ADMIN_IDS.split(',').map(id => parseInt(id.trim(), 10));
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log(`✅ Бот запущен. Админы: [${adminIds.join(', ')}].`);

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

// Функция для уведомления админов о выигрыше
export async function notifyAdminsAboutWinning(userId, userName, userUsername, prizeName, prizeType) {
  try {
    const message = `🎁 *Новый выигрыш!*\n\n` +
                   `👤 *Пользователь:* ${userName}\n` +
                   `📱 *Username:* ${userUsername ? '@' + userUsername : 'не указан'}\n` +
                   `🎯 *Приз:* ${prizeName}\n` +
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
    
    // Отправка Чек-листов
    if (messageType === 'checklist' && checklistFileName) {
      const checklistPath = path.join(process.cwd(), 'public', 'checklists', checklistFileName);
      
      if (!fs.existsSync(checklistPath)) {
        console.error(`[SEND PRIZE] Чек-лист не найден: ${checklistPath}`);
        throw new Error('Checklist file not found');
      }

      const caption = `🎉 Поздравляем! Вы получили чек-лист!\n\n📄 ${checklistFileName.replace('.pdf', '')}`;
      
      await bot.sendDocument(userId, checklistPath, { caption });
      return true;
    } 
    // НОВОЕ: Отправка Плейбука (Лайфхаки)
    else if (messageType === 'playbook' && checklistFileName) {
        const filePath = path.join(process.cwd(), 'public', 'checklists', checklistFileName); // Файл лежит там же, в public/checklists
        
        if (!fs.existsSync(filePath)) {
          console.error(`[SEND PRIZE] Плейбук не найден: ${filePath}`);
          throw new Error('Playbook file not found');
        }
  
        const caption = `🎉 Поздравляем! Вы выиграли: *${prizeName}*\n\n📄 Держите ваш файл с лайфхаками!`;
        
        await bot.sendDocument(userId, filePath, { caption, parse_mode: 'Markdown' });
        return true;
    }
    else if (messageType === 'checklist_bonus') {
      messageText = `🎉🎉🎉 *Поздравляем!*\n\n` +
                   `Вы получили все 10 чек-листов!\n\n` +
                   `🎁 Бонус: *+250 A+* начислены на ваш баланс!`;
    } else if (messageType === 'manual_contact') {
      messageText = `🎉 Поздравляем! Вы выиграли: *${prizeName}*\n\n` +
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

// НОВАЯ ФУНКЦИЯ: Проведение автоматического розыгрыша
async function conductMonthlyLottery() {
  console.log('\n====================================');
  console.log('🎰 НАЧАЛО ЕЖЕМЕСЯЧНОГО РОЗЫГРЫША');
  console.log('====================================\n');

  const results = [];
  
  try {
    // Проводим розыгрыши для каждого уровня
    for (const lottery of LOTTERY_LEVELS) {
      console.log(`\n--- Розыгрыш уровня ${lottery.level}+ ---`);
      
      const participantsStmt = db.prepare(`
        SELECT tg_id, first_name, last_name, username, current_month_referrals
        FROM users
        WHERE current_month_referrals >= ? AND bot_started = 1
      `);
      
      const participants = participantsStmt.all(lottery.level);
      
      console.log(`Участников: ${participants.length}, Нужно для розыгрыша: ${lottery.level}`);
      
      if (participants.length === 0) {
        results.push({
          level: lottery.level,
          name: lottery.name,
          status: 'no_participants',
          participants: 0,
          winners: []
        });
        console.log(`❌ Нет участников`);
        continue;
      }
      
      // Выбираем победителей
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
      
      console.log(`✅ Выбрано победителей: ${winners.length}`);
      winners.forEach((w, i) => {
        const name = `${w.first_name}${w.last_name ? ' ' + w.last_name : ''}`;
        console.log(`   ${i + 1}. ${name} (@${w.username || 'нет'}) - ${w.current_month_referrals} рефералов`);
      });
      
      // Отправляем сообщения победителям
      for (const winner of winners) {
        try {
          await bot.sendMessage(
            winner.tg_id,
            `🎉🎉🎉 *ПОЗДРАВЛЯЕМ!* 🎉🎉🎉\n\n` +
            `Вы выиграли в ежемесячном розыгрыше среди пользователей с ${lottery.level}+ приглашениями!\n\n` +
            `🎁 Ваш приз: *${lottery.name}*\n\n` +
            `С вами свяжутся в ближайшее время для организации вручения приза!`,
            { parse_mode: 'Markdown' }
          );
          console.log(`   ✉️ Уведомление отправлено победителю ${winner.tg_id}`);
        } catch (error) {
          console.error(`   ❌ Не удалось уведомить победителя ${winner.tg_id}:`, error.message);
        }
      }
      
      // Небольшая задержка между розыгрышами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Уведомляем админов о результатах
    await notifyAdminsAboutLotteryResults(results);
    
    // Отправляем сводку всем пользователям
    await notifyAllUsersAboutResults(results);
    
    // Сбрасываем месячные счётчики
    await resetMonthlyCounters();
    
    console.log('\n====================================');
    console.log('✅ РОЗЫГРЫШ ЗАВЕРШЁН');
    console.log('====================================\n');
    
  } catch (error) {
    console.error('[LOTTERY] Критическая ошибка при проведении розыгрыша:', error);
    
    // Уведомляем админов об ошибке
    for (const adminId of adminIds) {
      try {
        await bot.sendMessage(
          adminId,
          `❌ *ОШИБКА В РОЗЫГРЫШЕ*\n\n${error.message}`,
          { parse_mode: 'Markdown' }
        );
      } catch (e) {
        console.error('Не удалось уведомить админа об ошибке:', e);
      }
    }
  }
}

// Уведомление админов о результатах
async function notifyAdminsAboutLotteryResults(results) {
  let message = `📊 *ИТОГИ ЕЖЕМЕСЯЧНОГО РОЗЫГРЫША*\n\n`;
  
  for (const result of results) {
    message += `*Уровень ${result.level}+ рефералов*\n`;
    message += `Приз: ${result.name}\n`;
    
    if (result.status === 'no_participants') {
      message += `❌ Недостаточно участников (0)\n\n`;
    } else {
      message += `✅ Участников: ${result.participants}\n`;
      message += `🏆 Победителей: ${result.winners.length}\n\n`;
      
      result.winners.forEach((winner, index) => {
        const name = `${winner.first_name}${winner.last_name ? ' ' + winner.last_name : ''}`;
        const username = winner.username ? `@${winner.username}` : 'нет username';
        message += `${index + 1}. ${name} (${username})\n`;
        message += `   ID: \`${winner.tg_id}\` | Рефералов: ${winner.current_month_referrals}\n`;
      });
      message += '\n';
    }
  }
  
  for (const adminId of adminIds) {
    try {
      await bot.sendMessage(adminId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error(`Не удалось отправить итоги админу ${adminId}:`, error.message);
    }
  }
}

// Уведомление всех пользователей о результатах
async function notifyAllUsersAboutResults(results) {
  console.log('\n--- Отправка сводки всем пользователям ---');
  
  // Получаем всех пользователей, которые запустили бота
  const usersStmt = db.prepare(`
    SELECT tg_id, first_name 
    FROM users 
    WHERE bot_started = 1
  `);
  const users = usersStmt.all();
  
  console.log(`Найдено пользователей для уведомления: ${users.length}`);
  
  // Формируем сообщение
  let message = `🎉 *ИТОГИ ЕЖЕМЕСЯЧНОГО РОЗЫГРЫША*\n\n`;
  
  let hasWinners = false;
  
  for (const result of results) {
    if (result.status === 'no_participants') {
      message += `📋 *${result.level}+ приглашений*\n`;
      message += `❌ Недостаточно участников\n\n`;
    } else {
      hasWinners = true;
      message += `📋 *${result.level}+ приглашений*\n`;
      message += `🎁 Приз: ${result.name}\n`;
      message += `👥 Участников: ${result.participants}\n`;
      message += `🏆 Победители:\n`;
      
      result.winners.forEach((winner, index) => {
        const name = `${winner.first_name}${winner.last_name ? ' ' + winner.last_name : ''}`;
        message += `   ${index + 1}. ${name}\n`;
      });
      message += '\n';
    }
  }
  
  if (!hasWinners) {
    message += `\n💬 В этом месяце не было достаточно участников ни в одном розыгрыше.\n`;
  }
  
  message += `\n🔄 Счётчики обнулены. Новый розыгрыш уже начался!\n`;
  message += `Приглашай друзей и участвуй в следующем месяце! 🚀`;
  
  // Отправляем сообщения порциями (чтобы не заблокировать бота)
  let sent = 0;
  let failed = 0;
  
  for (const user of users) {
    try {
      await bot.sendMessage(user.tg_id, message, { parse_mode: 'Markdown' });
      sent++;
      
      // Задержка чтобы не превысить лимиты Telegram API (30 сообщений в секунду)
      if (sent % 25 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      failed++;
      if (error.response?.body?.error_code === 403) {
        // Пользователь заблокировал бота - это нормально
        console.log(`Пользователь ${user.tg_id} заблокировал бота`);
      } else {
        console.error(`Ошибка отправки пользователю ${user.tg_id}:`, error.message);
      }
    }
  }
  
  console.log(`✅ Отправлено сообщений: ${sent}`);
  console.log(`❌ Не удалось отправить: ${failed}`);
}

// Сброс месячных счётчиков
async function resetMonthlyCounters() {
  console.log('\n--- Сброс месячных счётчиков ---');
  
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const resetStmt = db.prepare(`
    UPDATE users 
    SET current_month_referrals = 0, last_referral_reset = ?
    WHERE current_month_referrals > 0
  `);
  
  const result = resetStmt.run(currentMonth);
  console.log(`✅ Сброшено счётчиков: ${result.changes}`);
}

// Проверка и запуск розыгрыша (проверяем каждый час)
async function checkAndRunLottery() {
  const now = new Date();
  const day = now.getDate();
  const hours = now.getHours();
  
  // Запускаем розыгрыш в первый день месяца в 00:00-00:59
  if (day === 1 && hours === 0) {
    // Проверяем, не запускали ли уже в этом часе
    const lastRunKey = `lottery_run_${now.getFullYear()}_${now.getMonth()}`;
    
    // Используем простую проверку через БД
    const checkStmt = db.prepare(`
      SELECT COUNT(*) as count FROM lotteries 
      WHERE name = ? AND created_at >= datetime('now', '-1 hour')
    `);
    const check = checkStmt.get(lastRunKey);
    
    if (check.count === 0) {
      console.log(`\n🎰 Запуск автоматического розыгрыша (${now.toISOString()})`);
      
      // Создаём запись о запуске розыгрыша
      const insertStmt = db.prepare(`
        INSERT INTO lotteries (name, description, start_date, end_date, required_referrals, status)
        VALUES (?, ?, ?, ?, 1, 'FINISHED')
      `);
      insertStmt.run(
        lastRunKey,
        'Автоматический ежемесячный розыгрыш',
        now.toISOString(),
        now.toISOString(),
      );
      
      await conductMonthlyLottery();
    } else {
      console.log(`Розыгрыш уже был запущен в этом часе`);
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

// ИСПРАВЛЕНО: Проверка и сброс ежемесячных рефералов
async function checkAndResetMonthlyReferrals() {
  try {
    const now = new Date();
    // Формат: YYYY-MM (например, 2024-11)
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Ищем пользователей, у которых last_referral_reset отличается от текущего месяца
    // Или если он NULL, но есть накопленные рефералы (на всякий случай)
    const checkResetStmt = db.prepare(`
      SELECT id 
      FROM users
      WHERE current_month_referrals > 0 
      AND (last_referral_reset IS NULL OR last_referral_reset != ?)
    `);
    
    const usersToReset = checkResetStmt.all(currentMonth);
    
    if (usersToReset.length > 0) {
      console.log(`[LOTTERY] Сброс месячных рефералов для ${usersToReset.length} пользователей (новый месяц: ${currentMonth})`);
      
      const resetStmt = db.prepare(`
        UPDATE users 
        SET current_month_referrals = 0, last_referral_reset = ?
        WHERE id = ?
      `);
      
      const resetTransaction = db.transaction((users) => {
        for (const user of users) {
          resetStmt.run(currentMonth, user.id);
        }
      });
      
      resetTransaction(usersToReset);
    }
  } catch (error) {
    console.error('[LOTTERY] Ошибка при сбросе месячных рефералов:', error);
  }
}

// Запуск фоновых задач
setInterval(checkAndFinishAuctions, 60000); // Каждую минуту
setInterval(checkAndRunLottery, 3600000); // Каждый час - проверка розыгрыша
setInterval(checkAndResetMonthlyReferrals, 3600000); // Каждый час - проверка сброса
console.log('✅ Фоновые задачи запущены (аукционы + розыгрыши).');

// Проверяем сразу при запуске
setTimeout(() => checkAndRunLottery(), 5000);

// ===== КОМАНДЫ БОТА =====

// Команда /start - доступна всем
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
        const updateStmt = db.prepare('UPDATE users SET bot_started = 1 WHERE tg_id = ?');
        updateStmt.run(userId);
        console.log(`[BOT START] Пользователь ${userId} активировал бота`);
      }
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO users (tg_id, username, first_name, last_name, bot_started)
        VALUES (?, ?, ?, ?, 1)
      `);
      insertStmt.run(userId, username, firstName, lastName);
      console.log(`[BOT START] Новый пользователь ${userId} зарегистрирован`);
    }
    
    const welcomeText = `👋 *Добро пожаловать в бота АССИСТ+!*\n\n` +
                   `Я буду присылать тебе уведомления о:\n` +
                   `— выигрышах в рулетке\n` +
                   `— новых розыгрышах\n` +
                   `— важных событиях\n\n` +
                   `Теперь ты можешь полноценно пользоваться нашим приложением 🤍`;
    
    bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('[BOT START] Ошибка при регистрации пользователя:', error);
    bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
  }
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const isAdmin = checkAdmin(msg);
  
  let helpText = `*📖 Помощь - Бот АССИСТ+*\n\n` +
                 `Доступные команды:\n` +
                 `/start - Активировать бота\n` +
                 `/help - Показать эту справку\n`;
  
  if (isAdmin) {
    helpText += `\n*👑 Команды администратора:*\n` +
                `/admin - Панель управления\n` +
                `/lottery - Управление розыгрышами\n` +
                `/participants <уровень> - Список участников (1/5/10/25/50)\n` +
                `/draw <уровень> - Провести розыгрыш вручную\n` +
                `/runlottery - Запустить полный розыгрыш сейчас\n` +
                `/reset_month - Сбросить месячные счетчики`;
  }
  
  bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
});

// Команда /admin - только для админов
bot.onText(/\/admin/, async (msg) => {
  if (!checkAdmin(msg)) {
    bot.sendMessage(msg.chat.id, "⛔️ У вас нет прав для использования этой команды.");
    return;
  }
  
  const chatId = msg.chat.id;
  
  try {
    const statsStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN bot_started = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN current_month_referrals >= 1 THEN 1 ELSE 0 END) as lottery_1,
        SUM(CASE WHEN current_month_referrals >= 5 THEN 1 ELSE 0 END) as lottery_5,
        SUM(CASE WHEN current_month_referrals >= 10 THEN 1 ELSE 0 END) as lottery_10,
        SUM(CASE WHEN current_month_referrals >= 25 THEN 1 ELSE 0 END) as lottery_25,
        SUM(CASE WHEN current_month_referrals >= 50 THEN 1 ELSE 0 END) as lottery_50
      FROM users
    `);
    
    const stats = statsStmt.get();
    
    const message = `*👑 Админ-панель*\n\n` +
                   `📊 *Статистика:*\n` +
                   `Всего пользователей: ${stats.total_users}\n` +
                   `Активировали бота: ${stats.active_users}\n\n` +
                   `🎰 *Участники розыгрышей (в этом месяце):*\n` +
                   `1+ реферал: ${stats.lottery_1} чел.\n` +
                   `5+ рефералов: ${stats.lottery_5} чел.\n` +
                   `10+ рефералов: ${stats.lottery_10} чел.\n` +
                   `25+ рефералов: ${stats.lottery_25} чел.\n` +
                   `50+ рефералов: ${stats.lottery_50} чел.\n\n` +
                   `*Команды:*\n` +
                   `/lottery - Управление розыгрышами\n` +
                   `/participants <уровень> - Список участников\n` +
                   `/runlottery - Запустить полный розыгрыш`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('[ADMIN] Ошибка:', error);
    bot.sendMessage(chatId, '❌ Ошибка при получении статистики');
  }
});

// Команда /participants - список участников розыгрыша
bot.onText(/\/participants (\d+)/, async (msg, match) => {
  if (!checkAdmin(msg)) {
    bot.sendMessage(msg.chat.id, "⛔️ У вас нет прав для использования этой команды.");
    return;
  }
  
  const chatId = msg.chat.id;
  const level = parseInt(match[1]);
  
  if (![1, 5, 10, 25, 50].includes(level)) {
    bot.sendMessage(chatId, `❌ Уровень должен быть одним из: 1, 5, 10, 25, 50`);
    return;
  }
  
  try {
    const participantsStmt = db.prepare(`
      SELECT tg_id, first_name, last_name, username, current_month_referrals, referral_count_subscribed
      FROM users
      WHERE current_month_referrals >= ?
      ORDER BY current_month_referrals DESC
    `);
    
    const participants = participantsStmt.all(level);
    
    if (participants.length === 0) {
      bot.sendMessage(chatId, `Участников с ${level}+ рефералами в этом месяце пока нет.`);
      return;
    }
    
    let message = `*🎰 Участники розыгрыша (${level}+ рефералов в этом месяце):*\n\n`;
    message += `Всего участников: ${participants.length}\n\n`;
    
    participants.forEach((p, index) => {
      const name = `${p.first_name}${p.last_name ? ' ' + p.last_name : ''}`;
      const username = p.username ? `@${p.username}` : 'нет username';
      message += `${index + 1}. ${name} (${username})\n`;
      message += `   В этом месяце: ${p.current_month_referrals} | Всего подписались: ${p.referral_count_subscribed || 0}\n\n`;
    });
    
    if (message.length > 4000) {
      const chunks = message.match(/[\s\S]{1,4000}/g) || [];
      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
      }
    } else {
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('[PARTICIPANTS] Ошибка:', error);
    bot.sendMessage(chatId, '❌ Ошибка при получении списка участников');
  }
});

// Команда /lottery - управление розыгрышами
bot.onText(/\/lottery/, async (msg) => {
  if (!checkAdmin(msg)) {
    bot.sendMessage(msg.chat.id, "⛔️ У вас нет прав для использования этой команды.");
    return;
  }
  
  const chatId = msg.chat.id;
  
  const message = `*🎰 Управление розыгрышами*\n\n` +
                 `Розыгрыши проводятся *автоматически* в начале каждого месяца.\n\n` +
                 `*Уровни призов:*\n` +
                 `• 1+ друг - Чек-лист (до 10 победителей)\n` +
                 `• 5+ друзей - Разбор резюме (1 победитель)\n` +
                 `• 10+ друзей - Книга + рекомендации (1 победитель)\n` +
                 `• 25+ друзей - Мини-разбор (1 победитель)\n` +
                 `• 50+ друзей - Встреча в Сколково (1 победитель)\n\n` +
                 `*Важно:* Учитываются только рефералы *текущего месяца*!\n\n` +
                 `*Команды:*\n` +
                 `/participants <уровень> - Список участников\n` +
                 `/runlottery - Запустить розыгрыш вручную\n` +
                 `/reset_month - Сбросить месячные счетчики`;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// НОВАЯ КОМАНДА: Запуск полного розыгрыша вручную
bot.onText(/\/runlottery/, async (msg) => {
  if (!checkAdmin(msg)) {
    bot.sendMessage(msg.chat.id, "⛔️ У вас нет прав для использования этой команды.");
    return;
  }
  
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '🎰 Запускаю полный розыгрыш...');
  
  await conductMonthlyLottery();
  
  bot.sendMessage(chatId, '✅ Розыгрыш завершён! Проверьте результаты выше.');
});

// Команда /draw - провести розыгрыш одного уровня вручную (оставляем для гибкости)
bot.onText(/\/draw (\d+)/, async (msg, match) => {
  if (!checkAdmin(msg)) {
    bot.sendMessage(msg.chat.id, "⛔️ У вас нет прав для использования этой команды.");
    return;
  }
  
  const chatId = msg.chat.id;
  const level = parseInt(match[1]);
  
  if (![1, 5, 10, 25, 50].includes(level)) {
    bot.sendMessage(chatId, `❌ Уровень должен быть одним из: 1, 5, 10, 25, 50`);
    return;
  }
  
  try {
    const participantsStmt = db.prepare(`
      SELECT tg_id, first_name, last_name, username, current_month_referrals
      FROM users
      WHERE current_month_referrals >= ?
    `);
    
    const participants = participantsStmt.all(level);
    
    if (participants.length === 0) {
      bot.sendMessage(chatId, `❌ Нет участников с ${level}+ рефералами в этом месяце`);
      return;
    }
    
    const prizes = {
      1: 'Глубокий чек-лист от «АССИСТ+»',
      5: 'Разбор резюме и портфолио от команды «АССИСТ+»',
      10: 'Книга + размещение канала в рекомендациях на 30 дней',
      25: 'Закрытый мини-разбор с предпринимателем (онлайн, 60 минут, группа)',
      50: 'Очная встреча в Сколково с секретным гостем'
    };
    
    let winners = [];
    if (level === 1) {
      const maxWinners = Math.min(10, participants.length);
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      winners = shuffled.slice(0, maxWinners);
    } else {
      const winner = participants[Math.floor(Math.random() * participants.length)];
      winners = [winner];
    }
    
    let adminMessage = `🎉 *Розыгрыш завершен!*\n\n` +
                       `Уровень: ${level}+ рефералов\n` +
                       `Приз: ${prizes[level]}\n` +
                       `Участников: ${participants.length}\n\n`;
    
    if (winners.length === 1) {
      const winner = winners[0];
      const winnerName = `${winner.first_name}${winner.last_name ? ' ' + winner.last_name : ''}`;
      const winnerUsername = winner.username ? `@${winner.username}` : 'нет username';
      
      adminMessage += `🏆 *Победитель:*\n` +
                     `${winnerName} (${winnerUsername})\n` +
                     `ID: \`${winner.tg_id}\`\n` +
                     `Рефералов в этом месяце: ${winner.current_month_referrals}`;
    } else {
      adminMessage += `🏆 *Победители (${winners.length}):*\n\n`;
      winners.forEach((winner, index) => {
        const winnerName = `${winner.first_name}${winner.last_name ? ' ' + winner.last_name : ''}`;
        const winnerUsername = winner.username ? `@${winner.username}` : 'нет username';
        adminMessage += `${index + 1}. ${winnerName} (${winnerUsername})\n`;
        adminMessage += `   ID: \`${winner.tg_id}\` | Рефералов: ${winner.current_month_referrals}\n\n`;
      });
    }
    
    bot.sendMessage(chatId, adminMessage, { parse_mode: 'Markdown' });
    
    for (const winner of winners) {
      try {
        await bot.sendMessage(
          winner.tg_id,
          `🎉🎉🎉 *ПОЗДРАВЛЯЕМ!* 🎉🎉🎉\n\n` +
          `Вы выиграли в розыгрыше среди пользователей с ${level}+ приглашениями!\n\n` +
          `🎁 Ваш приз: *${prizes[level]}*\n\n` +
          `С вами свяжутся для организации вручения приза!`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        bot.sendMessage(chatId, `⚠️ Не удалось отправить сообщение победителю (ID: ${winner.tg_id})`);
      }
    }
    
  } catch (error) {
    console.error('[DRAW] Ошибка:', error);
    bot.sendMessage(chatId, '❌ Ошибка при проведении розыгрыша');
  }
});

// Команда /reset_month - сброс месячных счетчиков вручную
bot.onText(/\/reset_month/, async (msg) => {
  if (!checkAdmin(msg)) {
    bot.sendMessage(msg.chat.id, "⛔️ У вас нет прав для использования этой команды.");
    return;
  }
  
  const chatId = msg.chat.id;
  
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const resetStmt = db.prepare(`
      UPDATE users 
      SET current_month_referrals = 0, last_referral_reset = ?
      WHERE current_month_referrals > 0
    `);
    
    const result = resetStmt.run(currentMonth);
    
    bot.sendMessage(
      chatId, 
      `✅ Месячные счетчики сброшены для ${result.changes} пользователей\n` +
      `Дата сброса: ${currentMonth}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('[RESET MONTH] Ошибка:', error);
    bot.sendMessage(chatId, '❌ Ошибка при сбросе счетчиков');
  }
});

export default bot;