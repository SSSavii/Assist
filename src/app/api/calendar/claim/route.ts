/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramHash } from '@/lib/telegram-auth';
import db from '@/lib/init-database';

// ============================================
// КОНФИГУРАЦИЯ АДВЕНТ-КАЛЕНДАРЯ
// ============================================

// 📁 ЗДЕСЬ НУЖНО ЗАМЕНИТЬ НАЗВАНИЯ ФАЙЛОВ НА РЕАЛЬНЫЕ
// Файлы должны лежать в папке: public/calendar/
const ADVENT_PRIZES: Record<number, { fileName: string; title: string }> = {
  24: { fileName: 'Как_подготовить_информатвную_презентацию.pdf', title: 'Как подготовить информативную презентацию' },
  25: { fileName: 'Подборки_нейросетей_для_работы.pdf', title: 'Подборки нейросетей для работы' },
  26: { fileName: 'advent_day_26.pdf', title: 'Подарок 26 декабря' },
  27: { fileName: 'advent_day_27.pdf', title: 'Подарок 27 декабря' },
  28: { fileName: 'advent_day_28.pdf', title: 'Подарок 28 декабря' },
  29: { fileName: 'advent_day_29.pdf', title: 'Подарок 29 декабря' },
  30: { fileName: 'advent_day_30.pdf', title: 'Подарок 30 декабря' },
};

// Период действия календаря
const CALENDAR_START_DAY = 24;
const CALENDAR_END_DAY = 30;
const CALENDAR_MONTH = 11; // Декабрь (0-indexed)
const CALENDAR_UPDATE_HOUR = 18; // Обновление в 18:00 МСК

// ============================================

// Импортируем функции из бота
let sendCalendarPrize: any;

const initBotFunctions = async () => {
  if (!sendCalendarPrize) {
    const botModule = await import('@bot/index.js');
    sendCalendarPrize = botModule.sendCalendarPrize;
  }
};

// Получение текущей даты по Москве (UTC+3)
function getMoscowDate(): Date {
  const now = new Date();
  const moscowOffset = 3 * 60 * 60 * 1000;
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + moscowOffset);
}

// Получение текущего "календарного дня" с учётом обновления в 18:00
function getCalendarDay(): { day: number; isActive: boolean } {
  const moscow = getMoscowDate();
  const currentDay = moscow.getDate();
  const currentMonth = moscow.getMonth();
  const currentHour = moscow.getHours();

  // Проверяем, что это декабрь
  if (currentMonth !== CALENDAR_MONTH) {
    return { day: 0, isActive: false };
  }

  // Логика:
  // - До 18:00 24 декабря - календарь ещё не начался
  // - С 18:00 24 декабря до 17:59 25 декабря - день 24
  // - С 18:00 25 декабря до 17:59 26 декабря - день 25
  // и т.д.
  // - С 18:00 30 декабря до 17:59 31 декабря - день 30 (последний)
  // - С 18:00 31 декабря - календарь завершён

  // Если текущий час < 18:00, то календарный день = вчера
  // Если текущий час >= 18:00, то календарный день = сегодня
  let calendarDay: number;
  
  if (currentHour >= CALENDAR_UPDATE_HOUR) {
    calendarDay = currentDay;
  } else {
    calendarDay = currentDay - 1;
  }

  // Проверяем границы
  if (calendarDay < CALENDAR_START_DAY) {
    return { day: 0, isActive: false }; // Ещё не начался
  }
  
  if (calendarDay > CALENDAR_END_DAY) {
    return { day: 0, isActive: false }; // Уже закончился
  }

  return { day: calendarDay, isActive: true };
}

// Получение времени до следующего обновления (18:00 МСК)
function getTimeUntilNextUpdate(): number {
  const moscow = getMoscowDate();
  const currentHour = moscow.getHours();
  
  const nextUpdate = new Date(moscow);
  
  if (currentHour >= CALENDAR_UPDATE_HOUR) {
    // Следующее обновление завтра в 18:00
    nextUpdate.setDate(nextUpdate.getDate() + 1);
  }
  
  nextUpdate.setHours(CALENDAR_UPDATE_HOUR, 0, 0, 0);
  
  return nextUpdate.getTime() - moscow.getTime();
}

export async function POST(req: NextRequest) {
  console.log(`\n--- [${new Date().toISOString()}] Calendar claim request ---`);
  
  try {
    await initBotFunctions();
    
    const { initData } = await req.json();
    
    if (!initData) {
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValid = validateTelegramHash(initData, botToken);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Telegram hash' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const tgUserId = userData.id;

    if (!tgUserId) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Получаем пользователя из БД
    const userStmt = db.prepare('SELECT id, first_name, last_name, username FROM users WHERE tg_id = ?');
    const user = userStmt.get(tgUserId) as { 
      id: number; 
      first_name: string; 
      last_name?: string; 
      username?: string;
    } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Получаем текущий календарный день
    const { day: calendarDay, isActive } = getCalendarDay();
    const currentYear = getMoscowDate().getFullYear();

    console.log(`[CALENDAR] Calendar day: ${calendarDay}, isActive: ${isActive}`);

    // Проверяем, что календарь активен
    if (!isActive) {
      return NextResponse.json({ 
        error: 'Календарь недоступен',
        calendarNotActive: true 
      }, { status: 400 });
    }

    // Проверяем, есть ли приз на этот день
    const todayPrize = ADVENT_PRIZES[calendarDay];
    if (!todayPrize) {
      return NextResponse.json({ 
        error: 'Приз на этот день не найден',
      }, { status: 400 });
    }

    // Проверяем, не получал ли уже сегодня
    const checkClaimStmt = db.prepare(`
      SELECT id FROM calendar_claims 
      WHERE user_id = ? AND day = ? AND year = ?
    `);
    const existingClaim = checkClaimStmt.get(user.id, calendarDay, currentYear);

    if (existingClaim) {
      return NextResponse.json({ 
        error: 'Вы уже получили подарок сегодня!',
        alreadyClaimed: true,
        timeUntilNext: getTimeUntilNextUpdate()
      }, { status: 400 });
    }

    // Отправляем приз через бота
    console.log(`[CALENDAR] Sending prize "${todayPrize.title}" to user ${tgUserId}`);
    
    const result = await sendCalendarPrize(tgUserId, todayPrize.fileName, todayPrize.title);
    
    if (result && result.error === 'bot_not_started') {
      return NextResponse.json({ 
        error: 'Пожалуйста, сначала запустите бота @my_auction_admin_bot',
        botNotStarted: true 
      }, { status: 400 });
    }

    if (result && result.error === 'file_not_found') {
      console.error(`[CALENDAR] File not found: ${todayPrize.fileName}`);
      return NextResponse.json({ 
        error: 'Файл приза не найден. Обратитесь к администратору.',
      }, { status: 500 });
    }

    // Записываем получение приза
    const insertClaimStmt = db.prepare(`
      INSERT INTO calendar_claims (user_id, day, year, prize_file)
      VALUES (?, ?, ?, ?)
    `);
    insertClaimStmt.run(user.id, calendarDay, currentYear, todayPrize.fileName);

    console.log(`[CALENDAR] ✅ Prize claimed by user ${tgUserId} for day ${calendarDay}`);

    return NextResponse.json({ 
      success: true,
      message: 'Подарок отправлен!',
      day: calendarDay,
      prizeTitle: todayPrize.title,
      timeUntilNext: getTimeUntilNextUpdate(),
      claimedToday: true
    });

  } catch (error) {
    console.error('[CALENDAR] Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// GET запрос для получения статуса календаря
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tgId = url.searchParams.get('tgId');

    if (!tgId) {
      return NextResponse.json({ error: 'tgId is required' }, { status: 400 });
    }

    // Получаем пользователя
    const userStmt = db.prepare('SELECT id FROM users WHERE tg_id = ?');
    const user = userStmt.get(parseInt(tgId)) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Получаем текущий календарный день
    const { day: calendarDay, isActive } = getCalendarDay();
    const currentYear = getMoscowDate().getFullYear();

    if (!isActive) {
      return NextResponse.json({ 
        isActive: false,
        currentDay: null,
        claimedToday: false,
        claimedDays: [],
        timeUntilNext: 0
      });
    }

    // Проверяем, получен ли приз сегодня
    const checkClaimStmt = db.prepare(`
      SELECT id FROM calendar_claims 
      WHERE user_id = ? AND day = ? AND year = ?
    `);
    const todayClaim = checkClaimStmt.get(user.id, calendarDay, currentYear);

    // Получаем все полученные призы
    const claimsStmt = db.prepare(`
      SELECT day FROM calendar_claims 
      WHERE user_id = ? AND year = ?
      ORDER BY day
    `);
    const claims = claimsStmt.all(user.id, currentYear) as { day: number }[];
    const claimedDays = claims.map(c => c.day);

    return NextResponse.json({
      isActive: true,
      currentDay: calendarDay,
      claimedToday: !!todayClaim,
      claimedDays,
      timeUntilNext: getTimeUntilNextUpdate(),
      todayPrize: ADVENT_PRIZES[calendarDay]?.title || null
    });

  } catch (error) {
    console.error('[CALENDAR STATUS] Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}