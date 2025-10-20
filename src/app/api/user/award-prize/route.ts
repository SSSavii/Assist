import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

export async function POST(req: NextRequest) {
  console.log(`\n--- [${new Date().toISOString()}] Received /api/user/award-prize request ---`);
  
  try {
    const { initData, prizeName, prizeType } = await req.json();
    
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

    console.log(`[INFO] Awarding prize "${prizeName}" to user with tg_id: ${tgUserId}`);

    const transaction = db.transaction(() => {
      const userStmt = db.prepare('SELECT id, balance_crystals FROM users WHERE tg_id = ?');
      const user = userStmt.get(tgUserId) as { id: number; balance_crystals: number } | undefined;

      if (!user) {
        throw new Error('User not found');
      }

      let newBalance = user.balance_crystals;

      // Мгновенное начисление призов
      if (prizeType === 'instant') {
        if (prizeName === '1000 A+') {
          const updateStmt = db.prepare('UPDATE users SET balance_crystals = balance_crystals + 1000 WHERE id = ?');
          updateStmt.run(user.id);
          newBalance += 1000;
        }
      }

      return {
        success: true,
        newBalance
      };
    });

    const result = transaction();
    console.log(`[SUCCESS] Prize awarded successfully. New balance: ${result.newBalance}`);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('--- [FATAL ERROR] API /api/user/award-prize crashed: ---', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}