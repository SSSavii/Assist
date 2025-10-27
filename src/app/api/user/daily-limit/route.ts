import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const DAILY_CASE_LIMIT = 5;

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface DailyLimitRequest {
  initData: string;
  action: 'check' | 'use';
}

export async function POST(req: NextRequest) {
  console.log(`\n--- [${new Date().toISOString()}] Received /api/user/daily-limit request ---`);
  
  try {
    const { initData, action } = await req.json() as DailyLimitRequest;

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
    const userData = JSON.parse(params.get('user') || '{}') as TelegramUser;
    const tgUserId = userData.id;

    if (!tgUserId) {
      console.error('[ERROR] User ID is missing in initData');
      return NextResponse.json({ error: 'Invalid user data in initData' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    console.log(`[INFO] Daily limit ${action} for user tg_id: ${tgUserId}, date: ${today}`);

    // Получаем пользователя из БД
    const userStmt = db.prepare('SELECT id FROM users WHERE tg_id = ?');
    const user = userStmt.get(tgUserId) as { id: number } | undefined;

    if (!user) {
      console.error(`[ERROR] User with tg_id ${tgUserId} not found in database`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'check') {
      // Проверяем текущий лимит
      const limitStmt = db.prepare(`
        SELECT count, max_limit 
        FROM daily_limits 
        WHERE user_id = ? AND limit_type = 'cases' AND date = ?
      `);
      const limit = limitStmt.get(user.id, today) as { count: number; max_limit: number } | undefined;

      const remaining = limit 
        ? Math.max(0, limit.max_limit - limit.count)
        : DAILY_CASE_LIMIT;

      console.log(`[SUCCESS] Daily limit check: used ${limit?.count || 0}, remaining ${remaining}`);

      return NextResponse.json({ 
        remaining,
        used: limit?.count || 0,
        maxLimit: DAILY_CASE_LIMIT
      });
    }

    if (action === 'use') {
      // Используем одну попытку
      const transaction = db.transaction(() => {
        const limitStmt = db.prepare(`
          SELECT count, max_limit 
          FROM daily_limits 
          WHERE user_id = ? AND limit_type = 'cases' AND date = ?
        `);
        const limit = limitStmt.get(user.id, today) as { count: number; max_limit: number } | undefined;

        if (limit) {
          if (limit.count >= limit.max_limit) {
            throw new Error('Daily limit reached');
          }

          const updateStmt = db.prepare(`
            UPDATE daily_limits 
            SET count = count + 1 
            WHERE user_id = ? AND limit_type = 'cases' AND date = ?
          `);
          updateStmt.run(user.id, today);

          return { 
            remaining: limit.max_limit - limit.count - 1,
            used: limit.count + 1
          };
        } else {
          const insertStmt = db.prepare(`
            INSERT INTO daily_limits (user_id, limit_type, date, count, max_limit)
            VALUES (?, 'cases', ?, 1, ?)
          `);
          insertStmt.run(user.id, today, DAILY_CASE_LIMIT);

          return { 
            remaining: DAILY_CASE_LIMIT - 1,
            used: 1
          };
        }
      });

      const result = transaction();
      console.log(`[SUCCESS] Daily limit used: remaining ${result.remaining}`);
      
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    if ((error as Error).message === 'Daily limit reached') {
      console.error('[ERROR] Daily limit reached');
      return NextResponse.json({ 
        error: 'Достигнут дневной лимит открытий кейсов' 
      }, { status: 400 });
    }
    
    console.error('--- [FATAL ERROR] API /api/user/daily-limit crashed: ---', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message }, 
      { status: 500 }
    );
  }
}