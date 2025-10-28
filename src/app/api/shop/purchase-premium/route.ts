/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_IDS = process.env.ADMIN_IDS?.split(',').map(id => parseInt(id.trim())) || [];

// Внутренняя функция (НЕ экспортируется!)
async function notifyAdminsAboutPurchase(
  userId: number,
  userName: string,
  userUsername: string,
  itemName: string,
  itemCost: number,
  newBalance: number
) {
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

export async function POST(req: NextRequest) {
  console.log(`\n--- [${new Date().toISOString()}] Received /api/shop/purchase-premium request ---`);
  
  try {
    const { initData, itemName, itemCost } = await req.json();

    if (!initData || !itemName || !itemCost) {
      console.error('[ERROR] Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      console.error('[ERROR] BOT_TOKEN not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValid = validateTelegramHash(initData, botToken);
    if (!isValid) {
      console.warn('[WARN] Invalid Telegram hash');
      return NextResponse.json({ error: 'Invalid Telegram hash' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const tgUserId = userData.id;

    if (!tgUserId) {
      console.error('[ERROR] Invalid user data');
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Получаем пользователя из БД
    const findUserStmt = db.prepare('SELECT * FROM users WHERE tg_id = ?');
    const user = findUserStmt.get(tgUserId) as any;

    if (!user) {
      console.error('[ERROR] User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Проверяем баланс
    if (user.balance_crystals < itemCost) {
      console.warn(`[WARN] Insufficient balance for user ${tgUserId}`);
      return NextResponse.json({ 
        error: `Недостаточно плюсов. У вас: ${user.balance_crystals}, требуется: ${itemCost}` 
      }, { status: 400 });
    }

    // Списываем плюсы
    const newBalance = user.balance_crystals - itemCost;
    const updateBalanceStmt = db.prepare(
      'UPDATE users SET balance_crystals = ? WHERE tg_id = ?'
    );
    updateBalanceStmt.run(newBalance, tgUserId);

    console.log(`[INFO] Deducted ${itemCost} crystals from user ${tgUserId}. New balance: ${newBalance}`);

    // Формируем данные для уведомления
    const userName = `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`;
    const userUsername = user.username || '';

    // Уведомляем админов о покупке
    try {
      await notifyAdminsAboutPurchase(tgUserId, userName, userUsername, itemName, itemCost, newBalance);
      console.log(`[SUCCESS] Admins notified about purchase by user ${tgUserId}`);
    } catch (error) {
      console.error('[ERROR] Failed to notify admins:', error);
      // Продолжаем выполнение, даже если уведомление не отправилось
    }

    return NextResponse.json({ 
      success: true, 
      newBalance,
      message: 'Покупка успешно совершена'
    });

  } catch (error) {
    console.error('--- [FATAL ERROR] API /api/shop/purchase-premium crashed: ---', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 });
  }
}