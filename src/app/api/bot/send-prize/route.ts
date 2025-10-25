/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramHash } from '@/lib/telegram-auth';
import db from '@/lib/init-database';

// Импортируем функции из бота
let sendPrizeToUser: any;
let notifyAdminsAboutWinning: any;

// Динамический импорт функций бота
const initBotFunctions = async () => {
  if (!sendPrizeToUser) {
    const botModule = await import('@bot/index.js');
    sendPrizeToUser = botModule.sendPrizeToUser;
    notifyAdminsAboutWinning = botModule.notifyAdminsAboutWinning;
  }
};

export async function POST(req: NextRequest) {
  console.log(`\n--- [${new Date().toISOString()}] Received /api/bot/send-prize request ---`);
  
  try {
    await initBotFunctions();
    
    const { initData, prizeName, messageType } = await req.json();
    
    if (!initData) {
      console.error('[ERROR] initData is missing from request body');
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      console.error('[ERROR] BOT_TOKEN is not defined in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValid = validateTelegramHash(initData, botToken);
    if (!isValid) {
      console.warn('[WARN] Hash validation failed. Request rejected.');
      return NextResponse.json({ error: 'Invalid data: hash validation failed' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const tgUserId = userData.id;

    if (!tgUserId) {
      console.error('[ERROR] User ID is missing in initData');
      return NextResponse.json({ error: 'Invalid user data in initData' }, { status: 400 });
    }

    console.log(`[INFO] Sending prize "${prizeName}" to user ${tgUserId} via bot`);

    // Получаем информацию о пользователе из БД
    const userStmt = db.prepare('SELECT id, first_name, last_name, username FROM users WHERE tg_id = ?');
    const user = userStmt.get(tgUserId) as { id: number; first_name: string; last_name?: string; username?: string } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userName = `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`;
    const userUsername = user.username || '';

    // Отправляем приз пользователю
    const result = await sendPrizeToUser(tgUserId, prizeName, messageType);
    
    if (result && result.error === 'bot_not_started') {
      return NextResponse.json({ 
        error: 'Пожалуйста, сначала запустите бота!',
        botNotStarted: true 
      }, { status: 400 });
    }

    // Уведомляем админов о выигрыше (кроме мгновенных призов)
    if (messageType !== 'instant') {
      const prizeType = prizeName.includes('Иван') || prizeName.includes('Антон') ? 'rare' : 'common';
      await notifyAdminsAboutWinning(tgUserId, userName, userUsername, prizeName, prizeType);
    }

    console.log(`[SUCCESS] Prize message sent successfully to user ${tgUserId}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Prize sent successfully'
    });

  } catch (error) {
    console.error('--- [FATAL ERROR] API /api/bot/send-prize crashed: ---', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}