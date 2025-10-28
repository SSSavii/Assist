import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramHash } from '@/lib/telegram-auth';

const BOT_TOKEN = process.env.BOT_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();
    
    const botToken = process.env.BOT_TOKEN;
    if (!botToken || !validateTelegramHash(initData, botToken)) {
      return NextResponse.json({ error: 'Invalid' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const userId = userData.id;

    if (!userId || !BOT_TOKEN) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Отправляем приветственное сообщение
    const message = `👋 Добро пожаловать в бот АССИСТ+!\n\nТеперь вы можете получать призы из магазина!`;
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Start user error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}