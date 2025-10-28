// Функция для уведомления админов о покупке премиум товара (через fetch)
export async function notifyAdminsAboutPurchase(
  userId: number,
  userName: string,
  userUsername: string,
  itemName: string,
  itemCost: number,
  newBalance: number
) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const ADMIN_IDS = process.env.ADMIN_IDS?.split(',').map(id => parseInt(id.trim())) || [];
  
  if (!BOT_TOKEN) {
    console.error('[ERROR] BOT_TOKEN not configured');
    return;
  }

  if (ADMIN_IDS.length === 0) {
    console.warn('[WARN] No admin IDs configured for notifications');
    return;
  }

  const userIdentifier = userUsername ? `@${userUsername}` : `ID: ${userId}`;
  
  const message = `🛍 <b>НОВАЯ ПОКУПКА ПРЕМИУМ ТОВАРА!</b>\n\n` +
                 `👤 <b>Пользователь:</b> ${userName}\n` +
                 `🆔 <b>Telegram:</b> ${userIdentifier}\n` +
                 `📦 <b>Товар:</b> ${itemName}\n` +
                 `💎 <b>Стоимость:</b> ${itemCost.toLocaleString('ru-RU')} А+\n` +
                 `💰 <b>Новый баланс:</b> ${newBalance.toLocaleString('ru-RU')} А+\n\n` +
                 `📞 <b>Действие:</b> Свяжитесь с пользователем для организации созвона.`;

  const promises = ADMIN_IDS.map(async (adminId) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
      }

      console.log(`[INFO] Purchase notification sent to admin ${adminId}`);
    } catch (error) {
      console.error(`[ERROR] Failed to send purchase notification to admin ${adminId}:`, error);
    }
  });

  await Promise.allSettled(promises);
}