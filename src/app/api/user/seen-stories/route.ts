import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

function parseInitData(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) return null;
    return JSON.parse(decodeURIComponent(userStr));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();
    
    if (!initData) {
      return NextResponse.json({ error: 'No initData' }, { status: 400 });
    }

    const telegramUser = parseInitData(initData);
    if (!telegramUser) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Обновляем флаг в БД
    const stmt = db.prepare(`
      UPDATE users 
      SET has_seen_stories = 1 
      WHERE tg_id = ?
    `);
    
    stmt.run(telegramUser.id);

    console.log(`✅ User ${telegramUser.id} marked stories as seen`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking stories as seen:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}