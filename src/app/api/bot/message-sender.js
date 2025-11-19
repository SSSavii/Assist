import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import fs from 'fs';

// Создаём бота БЕЗ polling (только для отправки сообщений)
class MessageSender {
  constructor(token) {
    // ВАЖНО: polling: false - бот только отправляет, не слушает
    this.bot = new TelegramBot(token, { polling: false });
    this.token = token;
  }

  // Отправка обычного сообщения
  async sendMessage(chatId, text, options = {}) {
    try {
      await this.bot.sendMessage(chatId, text, options);
      return { success: true };
    } catch (error) {
      console.error(`[MESSAGE SENDER] Ошибка отправки сообщения ${chatId}:`, error.message);
      if (error.response?.body?.error_code === 403) {
        return { success: false, error: 'bot_blocked' };
      }
      return { success: false, error: error.message };
    }
  }

  // Отправка документа
  async sendDocument(chatId, filePath, options = {}) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found: ' + filePath);
      }
      await this.bot.sendDocument(chatId, filePath, options);
      return { success: true };
    } catch (error) {
      console.error(`[MESSAGE SENDER] Ошибка отправки документа ${chatId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Отправка фото
  async sendPhoto(chatId, photo, options = {}) {
    try {
      await this.bot.sendPhoto(chatId, photo, options);
      return { success: true };
    } catch (error) {
      console.error(`[MESSAGE SENDER] Ошибка отправки фото ${chatId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Массовая рассылка с защитой от лимитов
  async bulkSend(users, message, options = {}) {
    let sent = 0;
    let failed = 0;
    const results = [];

    for (const user of users) {
      const result = await this.sendMessage(user.tg_id, message, options);
      
      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      results.push({
        userId: user.tg_id,
        ...result
      });

      // Задержка для соблюдения лимитов Telegram (30 сообщений в секунду)
      if (sent % 25 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      sent,
      failed,
      results
    };
  }
}

export default MessageSender;