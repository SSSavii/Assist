import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database'; // Импортируем из общего модуля
import { URLSearchParams } from 'url';
import { createHmac } from 'crypto';

const REFERRAL_BONUS = 500; 

// Добавляем отсутствующий интерфейс
interface UserFromDB {
  id: number;
  tg_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  referred_by_id: number | null;
  balance_crystals: number;
  last_tap_date: string | null;
  daily_taps_count: number;
  cases_to_open: number;
  created_at: string;
  last_login_at: string;
}

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
  console.log(`\n\n--- [${new Date().toISOString()}] Received /api/auth request ---`);
  try {
    const { initData } = await req.json();
    console.log('[STEP 1] Received initData:', !!initData);

    if (!initData) {
      console.error('[FAIL] initData is missing from request body.');
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    console.log('[STEP 2] BOT_TOKEN loaded from .env:', !!botToken);
    if (!botToken) {
      console.error('CRITICAL: BOT_TOKEN is not defined in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValid = validateTelegramHash(initData, botToken);
    console.log('[STEP 3] Hash validation result:', isValid);
    if (!isValid) {
      console.warn('[FAIL] Hash validation failed. Request rejected.');
      return NextResponse.json({ error: 'Invalid data: hash validation failed' }, { status: 403 });
    }

    console.log('[SUCCESS] Hash validation passed. Processing data...');
    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const startParam = params.get('start_param');

    if (!userData.id) {
        console.error('[FAIL] User data or user ID is missing in initData.');
        return NextResponse.json({ error: 'Invalid user data in initData' }, { status: 400 });
    }
    console.log(`[INFO] Processing user with tg_id: ${userData.id}`);

    let finalUser: UserFromDB | undefined;
    const findUserStmt = db.prepare('SELECT * FROM users WHERE tg_id = ?');
    const existingUser = findUserStmt.get(userData.id) as UserFromDB | undefined;

    if (existingUser) {
      console.log(`[DB LOGIC] User ${userData.id} FOUND. Updating...`);
      const updateUserStmt = db.prepare(`
        UPDATE users
        SET username = ?, first_name = ?, last_name = ?, last_login_at = CURRENT_TIMESTAMP
        WHERE tg_id = ?
      `);
      updateUserStmt.run(userData.username, userData.first_name, userData.last_name, userData.id);
      finalUser = findUserStmt.get(userData.id) as UserFromDB;
      console.log(`[DB LOGIC] User ${userData.id} UPDATED.`);

    } else {
      console.log(`[DB LOGIC] User ${userData.id} NOT FOUND. Creating...`);
      let referredById: number | null = null;
      
      if (startParam && startParam.startsWith('ref_')) {
        const refIdStr = startParam.split('_')[1];
        const refId = parseInt(refIdStr, 10);
        
        if (!isNaN(refId)) {
          const findReferrerStmt = db.prepare('SELECT id FROM users WHERE id = ?');
          const referrer = findReferrerStmt.get(refId) as { id: number } | undefined;
          
          if (referrer) {
            referredById = referrer.id;
        
            const rewardTransaction = db.transaction(() => {
                db.prepare('UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?').run(REFERRAL_BONUS, referredById);
                  
                db.prepare('UPDATE users SET cases_to_open = cases_to_open + 1 WHERE id = ?').run(referredById);
            });

            try {
                rewardTransaction();
                console.log(`[REFERRAL] Rewarded user ${referredById} with ${REFERRAL_BONUS} crystals and 1 case.`);
            } catch (e) {
                console.error(`[ERROR] Failed to reward user ${referredById}. Error:`, e);
            }
          } else {
             console.log(`[REFERRAL] Invalid referrer ID '${refIdStr}' in start_param. No referrer found.`);
          }
        }
      }

      const insertUserStmt = db.prepare(`
        INSERT INTO users (tg_id, username, first_name, last_name, referred_by_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = insertUserStmt.run(userData.id, userData.username, userData.first_name, userData.last_name, referredById);
      console.log(`[DB LOGIC] New user CREATED with rowid: ${result.lastInsertRowid}`);
      
      const findNewUserStmt = db.prepare('SELECT * FROM users WHERE id = ?');
      finalUser = findNewUserStmt.get(result.lastInsertRowid) as UserFromDB;
    }
    
    console.log('[SUCCESS] Sending final user data to client:', finalUser);
    return NextResponse.json(finalUser);

  } catch (error) {
    console.error('--- [FATAL ERROR] API /api/auth crashed inside try...catch block: ---');
    if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
    } else {
        console.error('An unknown error occurred:', error);
    }
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}