import { NextRequest, NextResponse } from 'next/server';
import { URLSearchParams } from 'url';
import { createHmac } from 'crypto';
import db from '@/lib/db';

const PRIZES = [
    { name: 'Чек-лист', chance: 91, type: 'checklist' },
    ...Array.from({ length: 9 }, (_, i) => ({
        name: `Подарок ${i + 1}`,
        chance: 1,
        type: 'generic'
    }))
];

function determinePrize(): { name: string, type: string, amount?: number } {
    const totalChance = PRIZES.reduce((sum, p) => sum + p.chance, 0);
    let randomPoint = Math.random() * totalChance;

    for (const prize of PRIZES) {
        if (randomPoint < prize.chance) {
            return prize;
        }
        randomPoint -= prize.chance;
    }
    return PRIZES[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateTelegramHash(initData: string, botToken: string): { isValid: boolean, user?: any } {
    try {
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        if (!hash) return { isValid: false };

        const user = JSON.parse(params.get('user') || '{}');
        params.delete('hash');

        const dataCheckArr = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`);

        const dataCheckString = dataCheckArr.join('\n');
        const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
        const ownHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        return { isValid: ownHash === hash, user };
    } catch (error) {
        console.error("Error during hash validation:", error);
        return { isValid: false };
    }
}


export async function POST(request: NextRequest) {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
        console.error('CRITICAL: BOT_TOKEN is not defined in environment variables.');
        return NextResponse.json({ error: 'Ошибка конфигурации сервера' }, { status: 500 });
    }

    try {
        const { initData } = await request.json();
        if (!initData) {
            return NextResponse.json({ error: 'initData is required' }, { status: 400 });
        }

        const { isValid, user: tgUser } = validateTelegramHash(initData, botToken);
        if (!isValid || !tgUser?.id) {
            return NextResponse.json({ error: 'Неверные данные: проверка подлинности не удалась' }, { status: 403 });
        }
        
        const transaction = db.transaction(() => {
            const userFromDb = db.prepare('SELECT id, cases_to_open FROM users WHERE tg_id = ?').get(tgUser.id) as { id: number; cases_to_open: number } | undefined;

            if (!userFromDb || userFromDb.cases_to_open < 1) {
                return { error: 'У вас нет доступных кейсов для открытия.', status: 403 };
            }

            db.prepare('UPDATE users SET cases_to_open = cases_to_open - 1 WHERE id = ?').run(userFromDb.id);

            const wonPrize = determinePrize();
            if (wonPrize.type === 'crystals' && wonPrize.amount) {
                db.prepare('UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?').run(wonPrize.amount, userFromDb.id);
            }
            
            db.prepare('INSERT INTO case_winnings (user_id, prize_name) VALUES (?, ?)')
                .run(userFromDb.id, wonPrize.name);

            return { prizeName: wonPrize.name };
        });

        const result = transaction();

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: result.status || 400 });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Case open error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}