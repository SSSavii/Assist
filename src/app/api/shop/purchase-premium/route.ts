/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_IDS = process.env.ADMIN_IDS?.split(',').map(id => parseInt(id.trim())) || [];

export async function POST(req: NextRequest) {
  try {
    const { initData, itemName, itemCost } = await req.json();

    if (!initData || !itemName || !itemCost) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!validateTelegramHash(initData, botToken)) {
      return NextResponse.json({ error: 'Invalid Telegram hash' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');

    if (!userData.id) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Проверяем баланс и списываем кристаллы
    const findUserStmt = db.prepare('SELECT * FROM users WHERE tg_id = ?');
    const user = findUserStmt.get(userData.id) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.balance_crystals < itemCost) {
      return NextResponse.json({ 
        error: `Недостаточно плюсов. У вас: ${user.balance_crystals}, требуется: ${itemCost}` 
      }, { status: 400 });
    }

    // Списываем плюсы
    const newBalance = user.balance_crystals - itemCost;
    const updateBalanceStmt = db.prepare(
      'UPDATE users SET balance_crystals = ? WHERE tg_id = ?'
    );
    updateBalanceStmt.run(newBalance, userData.id);

    // Отправляем уведомление админам
    if (BOT_TOKEN && ADMIN_IDS.length > 0) {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      const userIdentifier = user.username ? `@${user.username}` : `ID: ${userData.id}`;
      
      const message = `🛍 НОВАЯ ПОКУПКА!\n\n` +
                     `👤 Пользователь: ${fullName}\n` +
                     `🆔 ${userIdentifier}\n` +
                     `📦 Товар: ${itemName}\n` +
                     `💎 Стоимость: ${itemCost.toLocaleString('ru-RU')} А+\n` +
                     `💰 Новый баланс: ${newBalance.toLocaleString('ru-RU')} А+\n\n` +
                     `📞 Свяжитесь с пользователем для организации созвона.`;

      for (const adminId of ADMIN_IDS) {
        try {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: adminId,
              text: message,
              parse_mode: 'HTML'
            })
          });
        } catch (error) {
          console.error(`Failed to notify admin ${adminId}:`, error);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      newBalance,
      message: 'Покупка успешно совершена'
    });

  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 });
  }
}