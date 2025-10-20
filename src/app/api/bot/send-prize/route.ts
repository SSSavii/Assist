/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramHash } from '@/lib/telegram-auth';

export async function POST(req: NextRequest) {
  console.log(`\n--- [${new Date().toISOString()}] Received /api/bot/send-prize request ---`);
  
  try {
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

    let messageText = '';
    let fileUrl = '';

    if (messageType === 'checklist') {
      messageText = `🎉 Поздравляем! Вы выиграли: ${prizeName}\n\nВаши чек-листы прикреплены к этому сообщению.`;
      // TODO: Добавьте логику для прикрепления файлов чек-листов
      fileUrl = 'https://example.com/checklists.pdf'; // Замените на реальный URL
    } else if (messageType === 'manual_contact') {
      messageText = `🎉 Поздравляем! Вы выиграли: ${prizeName}\n\n✨ С вами свяжутся в ближайшее время для организации вашего приза!`;
    }

    // Отправка сообщения через Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: tgUserId,
        text: messageText,
        parse_mode: 'HTML'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ERROR] Failed to send message via Telegram:', errorData);
      
      // Проверка, запущен ли бот пользователем
      if (errorData.description?.includes('bot was blocked') || 
          errorData.description?.includes('user is deactivated') ||
          errorData.description?.includes('chat not found')) {
        return NextResponse.json({ 
          error: 'Пожалуйста, сначала запустите бота!',
          botNotStarted: true 
        }, { status: 400 });
      }
      
      throw new Error('Failed to send Telegram message');
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