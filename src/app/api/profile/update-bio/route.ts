import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db'; // Используем наше синглтон-подключение
import { URLSearchParams } from 'url';
import { createHmac } from 'crypto';

// Функцию валидации нужно либо импортировать, либо скопировать
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
        const { initData, bio } = await req.json();
        
        const botToken = process.env.BOT_TOKEN;
        if (!initData || !botToken || !validateTelegramHash(initData, botToken)) {
            return NextResponse.json({ error: 'Invalid hash' }, { status: 403 });
        }

        if (typeof bio !== 'string') {
            return NextResponse.json({ error: 'Bio must be a string' }, { status: 400 });
        }

        const params = new URLSearchParams(initData);
        const userData = JSON.parse(params.get('user') || '{}');

        if (!userData.id) {
            return NextResponse.json({ error: 'User not found in initData' }, { status: 400 });
        }
        
        // Обновляем описание пользователя в базе данных
        const stmt = db.prepare('UPDATE users SET bio = ? WHERE tg_id = ?');
        const result = stmt.run(bio, userData.id);

        if (result.changes === 0) {
            return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API /api/profile/update-bio Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}