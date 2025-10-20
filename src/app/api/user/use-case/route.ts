import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

export async function POST(req: NextRequest) {
  console.log(`\n--- [${new Date().toISOString()}] Received /api/user/use-case request ---`);
  
  try {
    const { initData, caseCost } = await req.json();
    
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

    console.log(`[INFO] Using case for user with tg_id: ${tgUserId}, cost: ${caseCost}`);

    const transaction = db.transaction(() => {
      const userStmt = db.prepare('SELECT id, cases_to_open FROM users WHERE tg_id = ?');
      const user = userStmt.get(tgUserId) as { id: number; cases_to_open: number } | undefined;

      if (!user) {
        throw new Error('User not found');
      }

      if (user.cases_to_open < (caseCost || 1)) {
        throw new Error('Недостаточно кейсов');
      }

      const updateStmt = db.prepare('UPDATE users SET cases_to_open = cases_to_open - ? WHERE id = ?');
      updateStmt.run(caseCost || 1, user.id);

      const newCasesStmt = db.prepare('SELECT cases_to_open FROM users WHERE id = ?');
      const updatedUser = newCasesStmt.get(user.id) as { cases_to_open: number };

      return {
        newCasesCount: updatedUser.cases_to_open
      };
    });

    const result = transaction();
    console.log(`[SUCCESS] Case used successfully. New balance: ${result.newCasesCount}`);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('--- [FATAL ERROR] API /api/user/use-case crashed: ---', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}