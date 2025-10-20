import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramHash } from '@/lib/telegram-auth';

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();
    
    if (!initData) {
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValid = validateTelegramHash(initData, botToken);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const tgUserId = userData.id;

    // Проверяем через Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/getChat`;
    
    const response = await fetch(`${telegramApiUrl}?chat_id=${tgUserId}`);
    const data = await response.json();

    const botStarted = response.ok && data.ok;

    return NextResponse.json({ 
      botStarted
    });

  } catch (error) {
    console.error('Check bot error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}