/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import TelegramBot from 'node-telegram-bot-api';
import db from '../src/lib/init-database.ts';

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
export async function sendPrizeToUser(userId, prizeName, messageType) {
  try {
    let messageText = '';
    
    if (messageType === 'checklist') {
      messageText = `🎉 Поздравляем! Вы выиграли: *${prizeName}*\n\n📚 Ваши чек-листы будут отправлены в ближайшее время.`;
    } else if (messageType === 'manual_contact') {
      messageText = `🎉 Поздравляем! Вы выиграли: *${prizeName}*\n\n✨ С вами свяжутся в ближайшее время для организации вашего приза!`;
    }

    await bot.sendMessage(userId, messageText, { parse_mode: 'Markdown' });
    return true;
  } catch (error) {
    console.error(`[SEND PRIZE] Ошибка отправки приза пользователю ${userId}:`, error);
    if (error.response?.body?.error_code === 403) {
      return { error: 'bot_not_started' };
    }
    throw error;
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

// Проверка и сброс ежемесячных рефералов
async function checkAndResetMonthlyReferrals() {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const checkResetStmt = db.prepare(`
      SELECT id, tg_id, first_name, last_name, username, current_month_referrals, last_referral_reset
      FROM users
      WHERE current_month_referrals > 0 
      AND (last_referral_reset IS NULL OR last_referral_reset < ?)
    `);
    
    const usersToReset = checkResetStmt.all(`${currentMonth}-01`);
    
    if (usersToReset.length > 0) {
      console.log(`[LOTTERY] Сброс месячных рефералов для ${usersToReset.length} пользователей`);
      
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
setInterval(checkAndResetMonthlyReferrals, 3600000); // Каждый час
console.log('✅ Фоновые задачи запущены.');

// ===== КОМАНДЫ БОТА =====

// Команда /start - доступна всем
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || '';
  const firstName = msg.from.first_name || 'Пользователь';
  const lastName = msg.from.last_name || '';
  
  try {
    // Регистрируем пользователя в БД
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
    
    const welcomeText = `👋 *Добро пожаловать в бота "Ассист+"!*\n\n` +
                       `Я буду отправлять вам уведомления о:\n` +
                       `🎁 Выигрышах в рулетке\n` +
                       `🎉 Розыгрышах призов\n` +
                       `📢 Важных событиях\n\n` +
                       `Теперь вы можете участвовать в розыгрышах и получать призы!`;
    
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
  
  let helpText = `*📖 Помощь - Бот "Ассист+"*\n\n` +
                 `Доступные команды:\n` +
                 `/start - Активировать бота\n` +
                 `/help - Показать эту справку\n`;
  
  if (isAdmin) {
    helpText += `\n*👑 Команды администратора:*\n` +
                `/admin - Панель управления\n` +
                `/lottery - Управление розыгрышами\n` +
                `/participants <10|20|30> - Список участников\n` +
                `/draw <10|20|30> - Провести розыгрыш`;
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
        SUM(CASE WHEN current_month_referrals >= 10 THEN 1 ELSE 0 END) as lottery_10,
        SUM(CASE WHEN current_month_referrals >= 20 THEN 1 ELSE 0 END) as lottery_20,
        SUM(CASE WHEN current_month_referrals >= 30 THEN 1 ELSE 0 END) as lottery_30
      FROM users
    `);
    
    const stats = statsStmt.get();
    
    const message = `*👑 Админ-панель*\n\n` +
                   `📊 *Статистика:*\n` +
                   `Всего пользователей: ${stats.total_users}\n` +
                   `Активировали бота: ${stats.active_users}\n\n` +
                   `🎰 *Участники розыгрышей:*\n` +
                   `10+ рефералов: ${stats.lottery_10} чел.\n` +
                   `20+ рефералов: ${stats.lottery_20} чел.\n` +
                   `30+ рефералов: ${stats.lottery_30} чел.\n\n` +
                   `*Команды:*\n` +
                   `/lottery - Управление розыгрышами\n` +
                   `/participants <уровень> - Список участников (10/20/30)\n` +
                   `/draw <уровень> - Провести розыгрыш`;
    
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
  
  if (![10, 20, 30].includes(level)) {
    bot.sendMessage(chatId, '❌ Уровень должен быть 10, 20 или 30');
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
      bot.sendMessage(chatId, `Участников с ${level}+ рефералами пока нет.`);
      return;
    }
    
    let message = `*🎰 Участники розыгрыша (${level}+ рефералов):*\n\n`;
    
    participants.forEach((p, index) => {
      const name = `${p.first_name}${p.last_name ? ' ' + p.last_name : ''}`;
      const username = p.username ? `@${p.username}` : 'нет username';
      message += `${index + 1}. ${name} (${username})\n`;
      message += `   Рефералов: ${p.current_month_referrals} (подписались: ${p.referral_count_subscribed})\n\n`;
    });
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
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
                 `Розыгрыши проводятся ежемесячно для пользователей, пригласивших:\n` +
                 `• 10+ друзей (1-й уровень)\n` +
                 `• 20+ друзей (2-й уровень)\n` +
                 `• 30+ друзей (3-й уровень)\n\n` +
                 `*Команды:*\n` +
                 `/participants <10|20|30> - Список участников\n` +
                 `/draw <10|20|30> - Провести розыгрыш\n` +
                 `/reset_month - Сбросить месячные счетчики`;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Команда /draw - провести розыгрыш
bot.onText(/\/draw (\d+)/, async (msg, match) => {
  if (!checkAdmin(msg)) {
    bot.sendMessage(msg.chat.id, "⛔️ У вас нет прав для использования этой команды.");
    return;
  }
  
  const chatId = msg.chat.id;
  const level = parseInt(match[1]);
  
  if (![10, 20, 30].includes(level)) {
    bot.sendMessage(chatId, '❌ Уровень должен быть 10, 20 или 30');
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
      bot.sendMessage(chatId, `❌ Нет участников с ${level}+ рефералами`);
      return;
    }
    
    // Случайный выбор победителя
    const winner = participants[Math.floor(Math.random() * participants.length)];
    const winnerName = `${winner.first_name}${winner.last_name ? ' ' + winner.last_name : ''}`;
    const winnerUsername = winner.username ? `@${winner.username}` : 'нет username';
    
    // Уведомление админам
    const adminMessage = `🎉 *Розыгрыш завершен!*\n\n` +
                        `Уровень: ${level}+ рефералов\n` +
                        `Участников: ${participants.length}\n\n` +
                        `🏆 *Победитель:*\n` +
                        `${winnerName} (${winnerUsername})\n` +
                        `ID: \`${winner.tg_id}\`\n` +
                        `Рефералов: ${winner.current_month_referrals}`;
    
    bot.sendMessage(chatId, adminMessage, { parse_mode: 'Markdown' });
    
    // Уведомление победителю
    try {
      await bot.sendMessage(
        winner.tg_id,
        `🎉🎉🎉 *ПОЗДРАВЛЯЕМ!* 🎉🎉🎉\n\n` +
        `Вы выиграли в розыгрыше среди пользователей с ${level}+ приглашениями!\n\n` +
        `С вами свяжутся для вручения приза!`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      bot.sendMessage(chatId, `⚠️ Не удалось отправить сообщение победителю`);
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
      `✅ Месячные счетчики сброшены для ${result.changes} пользователей`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('[RESET MONTH] Ошибка:', error);
    bot.sendMessage(chatId, '❌ Ошибка при сбросе счетчиков');
  }
});

export default bot;