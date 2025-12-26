/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1002782276287';

// ============================================
// КОНФИГУРАЦИЯ РЕФЕРАЛЬНОЙ СИСТЕМЫ
// ============================================
const REFERRAL_CONFIG = {
  REWARD_PER_REFERRAL: 500,
  REQUIRE_SUBSCRIPTION: false,
};

// Milestone-конфигурация
const INVITE_MILESTONES = [
  { friends: 1, reward: 500, taskKey: 'invite_1' },
  { friends: 3, reward: 500, taskKey: 'invite_3' },
  { friends: 5, reward: 500, taskKey: 'invite_5' },
  { friends: 10, reward: 500, taskKey: 'invite_10' },
];

// ============================================
// КОНФИГУРАЦИЯ АДВЕНТ-КАЛЕНДАРЯ
// ============================================
const CALENDAR_START_DAY = 24;
const CALENDAR_END_DAY = 30;
const CALENDAR_MONTH = 11; // Декабрь (0-indexed)
const CALENDAR_UPDATE_HOUR = 18; // Обновление в 18:00 МСК

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

  if (currentMonth !== CALENDAR_MONTH) {
    return { day: 0, isActive: false };
  }

  // Логика:
  // - До 18:00 24 декабря - календарь ещё не начался
  // - С 18:00 24 декабря до 17:59 25 декабря - день 24
  // - С 18:00 25 декабря до 17:59 26 декабря - день 25
  // и т.д.

  let calendarDay: number;
  
  if (currentHour >= CALENDAR_UPDATE_HOUR) {
    calendarDay = currentDay;
  } else {
    calendarDay = currentDay - 1;
  }

  if (calendarDay < CALENDAR_START_DAY) {
    return { day: 0, isActive: false };
  }
  
  if (calendarDay > CALENDAR_END_DAY) {
    return { day: 0, isActive: false };
  }

  return { day: calendarDay, isActive: true };
}

// Получение времени до следующего обновления (18:00 МСК)
function getTimeUntilNextUpdate(): number {
  const moscow = getMoscowDate();
  const currentHour = moscow.getHours();
  
  const nextUpdate = new Date(moscow);
  
  if (currentHour >= CALENDAR_UPDATE_HOUR) {
    nextUpdate.setDate(nextUpdate.getDate() + 1);
  }
  
  nextUpdate.setHours(CALENDAR_UPDATE_HOUR, 0, 0, 0);
  
  return nextUpdate.getTime() - moscow.getTime();
}
// ============================================

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
  subscribed_to_channel: number;
  boost_count_before: number;
  photo_url: string | null;
  bot_started: number;
  referral_count: number;
  referral_count_subscribed: number;
  current_month_referrals: number;
  bio: string | null;
  awards: string | null;
  has_seen_stories: number;
}

interface CompletedTask {
  task_key: string;
  reward_crystals: number;
  completed_at: string;
}

interface CalendarStatus {
  isActive: boolean;
  currentDay: number | null;
  claimedToday: boolean;
  claimedDays: number[];
  timeUntilNext: number;
}

interface AuthResponse {
  id: number;
  tg_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  balance_crystals: number;
  last_tap_date: string | null;
  daily_taps_count: number;
  cases_to_open: number;
  created_at: string;
  last_login_at: string;
  subscribed_to_channel?: boolean;
  voted_for_channel?: boolean;
  bot_started?: boolean;
  referral_count: number;
  referral_count_subscribed?: number;
  current_month_referrals?: number;
  bio?: string;
  awards?: string;
  completed_tasks: CompletedTask[];
  invite_milestones: typeof INVITE_MILESTONES;
  has_spun_before: boolean;
  calendar: CalendarStatus;
  has_seen_stories: boolean;
}

async function checkChannelSubscription(userId: number) {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.warn('Bot token or channel ID not configured for subscription check');
    return null;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        user_id: userId
      })
    });

    if (!response.ok) {
      console.error('Telegram API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return null;
  }
}

// Функция получения статуса календаря для пользователя
function getCalendarStatus(userId: number): CalendarStatus {
  const { day: calendarDay, isActive } = getCalendarDay();
  const currentYear = getMoscowDate().getFullYear();

  if (!isActive) {
    return {
      isActive: false,
      currentDay: null,
      claimedToday: false,
      claimedDays: [],
      timeUntilNext: 0
    };
  }

  // Проверяем, получен ли приз сегодня
  const checkClaimStmt = db.prepare(`
    SELECT id FROM calendar_claims 
    WHERE user_id = ? AND day = ? AND year = ?
  `);
  const todayClaim = checkClaimStmt.get(userId, calendarDay, currentYear);

  // Получаем все полученные призы
  const claimsStmt = db.prepare(`
    SELECT day FROM calendar_claims 
    WHERE user_id = ? AND year = ?
    ORDER BY day
  `);
  const claims = claimsStmt.all(userId, currentYear) as { day: number }[];
  const claimedDays = claims.map(c => c.day);

  return {
    isActive: true,
    currentDay: calendarDay,
    claimedToday: !!todayClaim,
    claimedDays,
    timeUntilNext: getTimeUntilNextUpdate()
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initData, startapp } = body;

    console.log('=== AUTH REQUEST ===');
    console.log('initData exists:', !!initData);
    console.log('startapp:', startapp);

    if (!initData) {
      console.error('❌ initData is missing');
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      console.error('❌ BOT_TOKEN not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log('Validating hash...');
    const isValid = validateTelegramHash(initData, botToken);
    console.log('Hash valid:', isValid);

    if (!isValid) {
      console.error('❌ Invalid hash');
      return NextResponse.json({ error: 'Invalid Telegram hash' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    
    if (!userParam) {
      console.error('❌ No user in initData');
      return NextResponse.json({ error: 'No user data in initData' }, { status: 400 });
    }

    const userData = JSON.parse(userParam);
    
    console.log('=== USER DATA ===');
    console.log('User ID:', userData.id);
    console.log('Username:', userData.username);
    console.log('First name:', userData.first_name);

    let startParam = startapp;
    
    if (!startParam) {
      startParam = params.get('startapp') || params.get('start_param') || params.get('start');
    }

    console.log('Start param:', startParam);

    if (!userData.id) {
      console.error('❌ No user ID');
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    const findUserStmt = db.prepare(`SELECT * FROM users WHERE tg_id = ?`);
    let user = findUserStmt.get(userData.id) as UserFromDB | undefined;

    let referredById: number | null = null;
    let isNewUser = false;

    // Парсим реферальную ссылку
    if (startParam && startParam.startsWith('ref')) {
      const referrerIdStr = startParam.replace(/^ref_?/, '');
      const referrerTgId = parseInt(referrerIdStr, 10);
      
      console.log('Referrer TG ID:', referrerTgId);
      console.log('Current user TG ID:', userData.id);
      
      if (!isNaN(referrerTgId) && referrerTgId > 0 && referrerTgId !== userData.id) {
        const referrerStmt = db.prepare('SELECT id FROM users WHERE tg_id = ?');
        const referrer = referrerStmt.get(referrerTgId) as { id: number } | undefined;
        
        if (referrer) {
          referredById = referrer.id;
          console.log('✅ Found referrer:', referredById);
        } else {
          console.log('❌ Referrer not found');
        }
      }
    }

    if (user) {
      // Обновляем существующего пользователя
      const updateStmt = db.prepare(`
        UPDATE users 
        SET username = ?, first_name = ?, last_name = ?, photo_url = ?,
            last_login_at = CURRENT_TIMESTAMP,
            referred_by_id = COALESCE(referred_by_id, ?)
        WHERE tg_id = ?
      `);
      updateStmt.run(
        userData.username, 
        userData.first_name, 
        userData.last_name,
        userData.photo_url || null,
        referredById,
        userData.id
      );
      user = findUserStmt.get(userData.id) as UserFromDB;
      console.log('✅ User updated');
    } else {
      // Создаём нового пользователя с балансом 0
      isNewUser = true;
      const insertStmt = db.prepare(`
        INSERT INTO users (tg_id, username, first_name, last_name, photo_url, referred_by_id, balance_crystals, has_seen_stories)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0)
      `);
      
      insertStmt.run(
        userData.id,
        userData.username,
        userData.first_name,
        userData.last_name,
        userData.photo_url || null,
        referredById
      );

      user = findUserStmt.get(userData.id) as UserFromDB;
      
      if (!user) {
        console.error('❌ Failed to create user');
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      
      console.log('✅ New user created with balance 0');
      
      // Обновляем счётчики у пригласившего и начисляем автоматическую награду
      if (referredById) {
        try {
          let shouldReward = true;
          
          if (REFERRAL_CONFIG.REQUIRE_SUBSCRIPTION) {
            const chatMember = await checkChannelSubscription(userData.id);
            const isSubscribed = chatMember?.status === 'member' || 
                                chatMember?.status === 'administrator' || 
                                chatMember?.status === 'creator';
            shouldReward = isSubscribed;
            
            if (isSubscribed) {
              const updateNewUserStmt = db.prepare(`
                UPDATE users SET subscribed_to_channel = 1 WHERE id = ?
              `);
              updateNewUserStmt.run(user.id);
            }
            
            console.log(`[REFERRAL] New user ${userData.id} subscription: ${isSubscribed}`);
          }
          
          const transaction = db.transaction(() => {
            const updateReferrerStmt = db.prepare(`
              UPDATE users 
              SET referral_count = referral_count + 1,
                  current_month_referrals = current_month_referrals + 1,
                  referral_count_subscribed = referral_count_subscribed + CASE WHEN ? THEN 1 ELSE 0 END,
                  balance_crystals = balance_crystals + CASE WHEN ? THEN ? ELSE 0 END
              WHERE id = ?
            `);
            updateReferrerStmt.run(
              shouldReward ? 1 : 0, 
              shouldReward ? 1 : 0, 
              REFERRAL_CONFIG.REWARD_PER_REFERRAL, 
              referredById
            );
            
            const insertRewardStmt = db.prepare(`
              INSERT OR IGNORE INTO referral_rewards (
                user_id, 
                referred_user_id, 
                is_subscribed, 
                reward_given,
                subscribed_at,
                rewarded_at
              )
              VALUES (?, ?, ?, ?, ?, ?)
            `);
            insertRewardStmt.run(
              referredById, 
              user!.id, 
              shouldReward ? 1 : 0,
              shouldReward ? 1 : 0,
              shouldReward ? new Date().toISOString() : null,
              shouldReward ? new Date().toISOString() : null
            );
          });
          
          transaction();
          
          if (shouldReward) {
            console.log(`✅ Referrer ${referredById} rewarded ${REFERRAL_CONFIG.REWARD_PER_REFERRAL} crystals for referral ${user.id}`);
          } else {
            console.log(`✅ Referral counted for ${referredById}, but no reward (subscription required)`);
          }
        } catch (error) {
          console.error('❌ Error updating referral counters:', error);
        }
      }
    }

    if (!user) {
      console.error('❌ User not found after create/update');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Загружаем выполненные задания с деталями
    const completedTasksStmt = db.prepare(`
      SELECT t.task_key, t.reward_crystals, ut.completed_at
      FROM user_tasks ut 
      JOIN tasks t ON ut.task_id = t.id 
      WHERE ut.user_id = ?
      ORDER BY ut.completed_at DESC
    `);
    const completedTasks = completedTasksStmt.all(user.id) as CompletedTask[];

    // Проверяем, крутил ли пользователь рулетку раньше
    const spinCountStmt = db.prepare(`SELECT COUNT(*) as count FROM case_winnings WHERE user_id = ?`);
    const spinCountResult = spinCountStmt.get(user.id) as { count: number };
    const hasSpunBefore = spinCountResult.count > 0;

    // Получаем статус календаря
    const calendarStatus = getCalendarStatus(user.id);

    const response: AuthResponse = {
      id: user.id,
      tg_id: user.tg_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      balance_crystals: user.balance_crystals,
      last_tap_date: user.last_tap_date,
      daily_taps_count: user.daily_taps_count,
      cases_to_open: user.cases_to_open,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
      subscribed_to_channel: user.subscribed_to_channel === 1,
      voted_for_channel: user.boost_count_before > 0,
      bot_started: user.bot_started === 1,
      referral_count: user.referral_count || 0,
      referral_count_subscribed: user.referral_count_subscribed || 0,
      current_month_referrals: user.current_month_referrals || 0,
      bio: user.bio || '',
      awards: user.awards || '',
      completed_tasks: completedTasks,
      invite_milestones: INVITE_MILESTONES,
      has_spun_before: hasSpunBefore,
      calendar: calendarStatus,
      has_seen_stories: user.has_seen_stories === 1,
    };

    console.log('=== SUCCESS ===');
    console.log('User ID:', user.id);
    console.log('TG ID:', user.tg_id);
    console.log('Balance:', user.balance_crystals);
    console.log('Has seen stories:', user.has_seen_stories === 1);
    console.log('Calendar active:', calendarStatus.isActive);
    console.log('Calendar day:', calendarStatus.currentDay);
    console.log('Calendar claimed today:', calendarStatus.claimedToday);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}