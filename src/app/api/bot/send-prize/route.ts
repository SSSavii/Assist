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

// Список чек-листов по порядку
const CHECKLISTS = [
  '7 сервисов.pdf',
  '7 AI для ассистента.pdf',
  '10 ошибок ассистентов.pdf',
  'Как брать обратную связь.pdf',
  'Как пройти собеседование.pdf',
  'Как улучшить свое резюме.pdf',
  'Как_подготовить_информатвную_презентацию.pdf',
  'Работа с подрядчиками.pdf',
  'Топ YouTube каналов.pdf',
  'Топ_книг_для_развития_бизнес_мышления.pdf'
];

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
    const userStmt = db.prepare('SELECT id, first_name, last_name, username, checklists_received FROM users WHERE tg_id = ?');
    const user = userStmt.get(tgUserId) as { id: number; first_name: string; last_name?: string; username?: string; checklists_received: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userName = `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`;
    const userUsername = user.username || '';

    // Обработка чек-листов
    if (prizeName === 'Чек-лист' || messageType === 'checklist') {
      const checklistIndex = user.checklists_received;
      
      if (checklistIndex < CHECKLISTS.length) {
        // Отправляем чек-лист
        const checklistFileName = CHECKLISTS[checklistIndex];
        const result = await sendPrizeToUser(tgUserId, prizeName, 'checklist', checklistFileName);
        
        if (result && result.error === 'bot_not_started') {
          return NextResponse.json({ 
            error: 'Пожалуйста, сначала запустите бота!',
            botNotStarted: true 
          }, { status: 400 });
        }

        // Увеличиваем счетчик чек-листов
        const updateStmt = db.prepare('UPDATE users SET checklists_received = checklists_received + 1 WHERE tg_id = ?');
        updateStmt.run(tgUserId);

        console.log(`[SUCCESS] Checklist ${checklistIndex + 1}/10 sent to user ${tgUserId}`);
      } else {
        // Пользователь получил все 10 чек-листов, даем 250 A+
        const updateBalanceStmt = db.prepare('UPDATE users SET balance_crystals = balance_crystals + 250 WHERE tg_id = ?');
        updateBalanceStmt.run(tgUserId);

        await sendPrizeToUser(tgUserId, '250 A+', 'checklist_bonus');
        
        console.log(`[SUCCESS] All checklists received, 250 A+ awarded to user ${tgUserId}`);
      }
    } else {
      // Обычная обработка других призов
      const result = await sendPrizeToUser(tgUserId, prizeName, messageType);
      
      if (result && result.error === 'bot_not_started') {
        return NextResponse.json({ 
          error: 'Пожалуйста, сначала запустите бота!',
          botNotStarted: true 
        }, { status: 400 });
      }

      // Уведомляем админов о выигрыше (кроме мгновенных призов и чек-листов)
      if (messageType !== 'instant' && messageType !== 'checklist') {
        const prizeType = prizeName.includes('Завтрак') || 
                         prizeName.includes('Индивидуальный разбор') || 
                         prizeName.includes('закрытое мероприятие') ? 'rare' : 'common';
        await notifyAdminsAboutWinning(tgUserId, userName, userUsername, prizeName, prizeType);
      }
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