import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface SpendCrystalsRequest {
  initData: string;
  amount: number;
}

export async function POST(req: NextRequest) {
  console.log(`\n--- [${new Date().toISOString()}] Received /api/user/spend-crystals request ---`);
  
  try {
    const { initData, amount } = await req.json() as SpendCrystalsRequest;

    if (!initData) {
      console.error('[ERROR] initData is missing from request body');
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      console.error('[ERROR] Invalid amount');
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
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
    const userData = JSON.parse(params.get('user') || '{}') as TelegramUser;
    const tgUserId = userData.id;

    if (!tgUserId) {
      console.error('[ERROR] User ID is missing in initData');
      return NextResponse.json({ error: 'Invalid user data in initData' }, { status: 400 });
    }

    console.log(`[INFO] Spending ${amount} crystals for user tg_id: ${tgUserId}`);

    const transaction = db.transaction(() => {
      // Получаем пользователя
      const userStmt = db.prepare('SELECT id, balance_crystals FROM users WHERE tg_id = ?');
      const user = userStmt.get(tgUserId) as { id: number; balance_crystals: number } | undefined;

      if (!user) {
        throw new Error('User not found');
      }

      if (user.balance_crystals < amount) {
        throw new Error(`Insufficient balance: required ${amount}, available ${user.balance_crystals}`);
      }

      const newBalance = user.balance_crystals - amount;

      // Обновляем баланс
      const updateStmt = db.prepare(`
        UPDATE users 
        SET balance_crystals = ? 
        WHERE id = ?
      `);
      updateStmt.run(newBalance, user.id);

      return { 
        success: true,
        newBalance 
      };
    });

    const result = transaction();
    console.log(`[SUCCESS] Crystals spent successfully. New balance: ${result.newBalance}`);
    
    return NextResponse.json(result);

  } catch (error) {
    if ((error as Error).message.startsWith('Insufficient balance')) {
      console.error('[ERROR]', (error as Error).message);
      return NextResponse.json({ 
        error: (error as Error).message 
      }, { status: 400 });
    }

    if ((error as Error).message === 'User not found') {
      console.error('[ERROR] User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.error('--- [FATAL ERROR] API /api/user/spend-crystals crashed: ---', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message }, 
      { status: 500 }
    );
  }
}