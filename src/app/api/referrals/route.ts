import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { URLSearchParams } from 'url';
import { createHmac } from 'crypto';

const db = new Database('./main.db');

function validateTelegramHash(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;
    params.delete('hash');
    const dataCheckArr: string[] = [];
    params.sort();
    params.forEach((val, key) => dataCheckArr.push(`${key}=${val}`));
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

    if (!initData || !botToken) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!validateTelegramHash(initData, botToken)) {
      return NextResponse.json({ error: 'Invalid hash' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    if (!userData.id) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    const findUserStmt = db.prepare('SELECT id FROM users WHERE tg_id = ?');
    const currentUser = findUserStmt.get(userData.id) as { id: number } | undefined;

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found in DB' }, { status: 404 });
    }

    // ИЗМЕНЕНО: добавлено photo_url в SELECT
    const findReferralsStmt = db.prepare('SELECT id, tg_id, first_name, last_name, photo_url FROM users WHERE referred_by_id = ? ORDER BY created_at DESC');
    const referrals = findReferralsStmt.all(currentUser.id);

    return NextResponse.json(referrals);

  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}