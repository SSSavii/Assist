/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1002782276287';

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

    if (!validateTelegramHash(initData, botToken)) {
      return NextResponse.json({ error: 'Invalid Telegram hash' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');

    if (!userData.id) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Получаем текущее количество бустов
    const boostCount = await getChannelBoostCount();

    if (boostCount === null) {
      return NextResponse.json({ 
        success: false, 
        message: 'Не удалось получить информацию о канале' 
      });
    }

    // Сохраняем количество бустов для пользователя
    const updateStmt = db.prepare(
      'UPDATE users SET boost_count_before = ? WHERE tg_id = ?'
    );
    updateStmt.run(boostCount, userData.id);

    return NextResponse.json({
      success: true,
      boostCount: boostCount
    });

  } catch (error) {
    console.error('Save boost count error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getChannelBoostCount(): Promise<number | null> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error('Bot token or channel ID not configured');
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHANNEL_ID
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return null;
    }

    const data = await response.json();
    return data.result?.boost_count || 0;
  } catch (error) {
    console.error('Error getting boost count:', error);
    return null;
  }
}