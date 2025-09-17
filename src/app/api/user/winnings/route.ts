import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

export async function POST(req: NextRequest) {
  console.log(`\n--- [${new Date().toISOString()}] Received /api/user/winnings request ---`);
  
  try {
    const { initData } = await req.json();
    
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

    console.log(`[INFO] Fetching winnings for user with tg_id: ${tgUserId}`);

    const userStmt = db.prepare('SELECT id FROM users WHERE tg_id = ?');
    const user = userStmt.get(tgUserId) as { id: number } | undefined;

    if (!user) {
      console.error(`[ERROR] User with tg_id ${tgUserId} not found in database`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const winningsStmt = db.prepare(`
      SELECT 
        cw.id,
        cw.prize_name,
        cw.won_at,
        CASE 
          WHEN cw.prize_name IN ('Онлайн-мини-разбор с Иваном', 'Приоритетное место в мини-разборе у Ивана', 
                                'Ответ Ивана голосом на ваш вопрос', 'Звонок 1 на 1 с Антоном Орешкиным') 
          THEN 'rare' 
          ELSE 'common' 
        END as prize_type
      FROM case_winnings cw
      WHERE cw.user_id = ?
      ORDER BY cw.won_at DESC
      LIMIT 50
    `);

    const winnings = winningsStmt.all(user.id) as Array<{
      id: number;
      prize_name: string;
      won_at: string;
      prize_type: 'rare' | 'common';
    }>;

    console.log(`[SUCCESS] Found ${winnings.length} winnings for user ${user.id}`);
    return NextResponse.json(winnings);

  } catch (error) {
    console.error('--- [FATAL ERROR] API /api/user/winnings crashed: ---', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message }, 
      { status: 500 }
    );
  }
}