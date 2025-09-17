import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

interface SaveWinningRequest {
  initData: string;
  prizeName: string;
  prizeType: string;
}

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { initData, prizeName, prizeType } = await req.json() as SaveWinningRequest;
    
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
    const userData = JSON.parse(params.get('user') || '{}') as TelegramUser;
    const tgUserId = userData.id;

    if (!tgUserId) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Находим пользователя
    const userStmt = db.prepare('SELECT id FROM users WHERE tg_id = ?');
    const user = userStmt.get(tgUserId) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Сохраняем выигрыш
    const insertStmt = db.prepare(`
      INSERT INTO case_winnings (user_id, prize_name, won_at)
      VALUES (?, ?, datetime('now'))
    `);
    
    insertStmt.run(user.id, prizeName);
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving winning:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message }, 
      { status: 500 }
    );
  }
}