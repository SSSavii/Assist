import { NextRequest, NextResponse } from 'next/server';
import db from 'wxqryy/lib/db'; 
import { URLSearchParams } from 'url';
import { createHmac } from 'crypto';

const DAILY_TAP_LIMIT = 100;
const TAP_REWARD = 1;

function validateTelegramHash(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;
    params.delete('hash');
    const dataCheckArr: string[] = [];
    const sortedKeys = Array.from(params.keys()).sort();
    sortedKeys.forEach(key => dataCheckArr.push(`${key}=${params.get(key)}`));
    const dataCheckString = dataCheckArr.join('\n');
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const ownHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    return ownHash === hash;
  } catch (error) {
    console.error("Error during hash validation:", error);
    return false;
  }
}
export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    const botToken = process.env.BOT_TOKEN;
    if (!initData || !botToken || !validateTelegramHash(initData, botToken)) {
      return NextResponse.json({ error: 'Invalid hash' }, { status: 403 });
    }
    
    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');

    if (!userData.id) {
      return NextResponse.json({ error: 'User not found in initData' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    const tapTransaction = db.transaction(() => {
      const user = db.prepare('SELECT daily_taps_count, last_tap_date FROM users WHERE tg_id = ?').get(userData.id) as { daily_taps_count: number; last_tap_date: string | null };

      if (!user) {
        return { error: 'User not found in DB', status: 404 };
      }
      
      let currentTaps = user.daily_taps_count;

      if (user.last_tap_date !== today) {
        db.prepare('UPDATE users SET daily_taps_count = 0, last_tap_date = ? WHERE tg_id = ?').run(today, userData.id);
        currentTaps = 0;
      }

      if (currentTaps >= DAILY_TAP_LIMIT) {
        return { error: 'Daily tap limit reached', status: 429, tapsLeft: 0 };
      }

      db.prepare(`
        UPDATE users
        SET balance_crystals = balance_crystals + ?,
            daily_taps_count = daily_taps_count + 1
        WHERE tg_id = ?
      `).run(TAP_REWARD, userData.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newBalance = (db.prepare('SELECT balance_crystals FROM users WHERE tg_id = ?').get(userData.id) as any).balance_crystals;
      return { 
        success: true, 
        newBalance: newBalance,
        tapsLeft: DAILY_TAP_LIMIT - (currentTaps + 1) 
      };
    });

    const result = tapTransaction();
    
    if (result.error) {
        return NextResponse.json({ error: result.error, tapsLeft: result.tapsLeft }, { status: result.status });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('API /api/tap Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}