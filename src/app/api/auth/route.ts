/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const REFERRAL_BONUS = 500;
const CHANNEL_ID = '-1002782276287'; // ID вашего канала

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
  tasks_completed: {
    subscribe: boolean;
    vote: boolean;
    invite: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { initData, startapp } = await req.json();

    if (!initData) {
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!validateTelegramHash(initData, botToken)) {
      return NextResponse.json({ error: 'Invalid Telegram hash' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Используем переданный startapp или извлекаем из initData
    let startParam = startapp; // Приоритет у переданного параметра
    
    if (!startParam) {
      // Пытаемся извлечь из initData разными способами
      startParam = params.get('startapp') || params.get('start_param') || params.get('start');
      
      // Дополнительная попытка извлечь из объекта initDataUnsafe
      try {
        const initDataObj = Object.fromEntries(params.entries());
        if (initDataObj.startapp && !startParam) {
          startParam = initDataObj.startapp;
        }
        if (initDataObj.start_param && !startParam) {
          startParam = initDataObj.start_param;
        }
      } catch (e) {
        console.log('Error parsing startapp from initData:', e);
      }
    }

    console.log('=== AUTH DEBUG ===');
    console.log('User ID:', userData.id);
    console.log('Start param received:', startapp);
    console.log('Start param from initData:', startParam);
    console.log('All initData params:', Object.fromEntries(params.entries()));

    if (!userData.id) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Проверяем выполненные задачи пользователя
    const checkTasksStmt = db.prepare(`
      SELECT t.task_key 
      FROM user_tasks ut 
      JOIN tasks t ON ut.task_id = t.id 
      WHERE ut.user_id = (SELECT id FROM users WHERE tg_id = ?)
    `);

    // Находим или создаем пользователя
    const findUserStmt = db.prepare(`
      SELECT * FROM users WHERE tg_id = ?
    `);
    
    let user = findUserStmt.get(userData.id) as UserFromDB | undefined;

    // ОБРАБОТКА РЕФЕРАЛЬНОЙ ССЫЛКИ ДАЖЕ ДЛЯ СУЩЕСТВУЮЩИХ ПОЛЬЗОВАТЕЛЕЙ
    let referredById = null;
    if (startParam && startParam.startsWith('ref')) {
      const referrerIdStr = startParam.replace(/^ref_?/, '');
      const referrerTgId = parseInt(referrerIdStr, 10);
      
      console.log('Referrer TG ID from param:', referrerTgId);
      console.log('Current user TG ID:', userData.id);
      console.log('Is self-referral:', referrerTgId === userData.id);
      
      if (!isNaN(referrerTgId) && referrerTgId > 0 && referrerTgId !== userData.id) {
        const referrerStmt = db.prepare('SELECT id FROM users WHERE tg_id = ?');
        const referrer = referrerStmt.get(referrerTgId) as { id: number } | undefined;
        
        console.log('Found referrer:', referrer);
        
        if (referrer) {
          referredById = referrer.id;
          
          // Награда реферу будет начислена при проверке задания invite_friend
          // только если приглашенный подпишется на канал
          if (user && user.referred_by_id === null) {
            console.log('🔗 Linking existing user to referrer:', referredById);
          } else if (!user) {
            console.log('🆕 New user will be created with referrer:', referredById);
          } else {
            console.log('ℹ️ User already has a referrer');
          }
        } else {
          console.log('❌ Referrer not found in database');
        }
      }
    }

    if (user) {
      // ОБНОВЛЯЕМ СУЩЕСТВУЮЩЕГО ПОЛЬЗОВАТЕЛЯ - УСТАНАВЛИВАЕМ referred_by_id ЕСЛИ НУЖНО
      const updateStmt = db.prepare(`
        UPDATE users 
        SET username = ?, first_name = ?, last_name = ?, 
            last_login_at = CURRENT_TIMESTAMP,
            referred_by_id = COALESCE(referred_by_id, ?) -- Устанавливаем если еще не установлен
        WHERE tg_id = ?
      `);
      updateStmt.run(
        userData.username, 
        userData.first_name, 
        userData.last_name, 
        referredById, // Устанавливаем реферера если он есть
        userData.id
      );
      user = findUserStmt.get(userData.id) as UserFromDB;
      console.log('✅ Existing user updated, referred_by_id:', user?.referred_by_id);
    } else {
      // Создаем нового пользователя с рефералом
      const insertStmt = db.prepare(`
        INSERT INTO users (tg_id, username, first_name, last_name, referred_by_id, balance_crystals)
        VALUES (?, ?, ?, ?, ?, 400)
      `);
      
      console.log('Creating user with referred_by_id:', referredById);
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = insertStmt.run(
        userData.id,
        userData.username,
        userData.first_name,
        userData.last_name,
        referredById
      );

      user = findUserStmt.get(userData.id) as UserFromDB;
      console.log('🆕 New user created with ID:', user?.id, 'referred_by_id:', user?.referred_by_id);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ПРОВЕРКА ПОДПИСКИ НА КАНАЛ
    try {
      const subscriptionStatus = await checkChannelSubscription(userData.id);
      const isSubscribed = subscriptionStatus === true;
      
      // Обновляем статус подписки в БД
      const updateSubStmt = db.prepare(
        'UPDATE users SET subscribed_to_channel = ? WHERE tg_id = ?'
      );
      updateSubStmt.run(isSubscribed ? 1 : 0, userData.id);
      
      // Обновляем объект user
      user.subscribed_to_channel = isSubscribed ? 1 : 0;
      
      console.log('📢 Channel subscription status:', isSubscribed);
    } catch (error) {
      console.error('Subscription check error:', error);
      // Продолжаем работу даже если проверка подписки не удалась
    }

    // Получаем выполненные задачи
    const completedTasks = checkTasksStmt.all(user.id) as { task_key: string }[];
    const completedTaskKeys = completedTasks.map(task => task.task_key);

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
      tasks_completed: {
        subscribe: completedTaskKeys.includes('subscribe_channel'),
        vote: completedTaskKeys.includes('vote_poll'),
        invite: completedTaskKeys.includes('invite_friend')
      }
    };

    console.log('=== FINAL USER DATA ===');
    console.log('User ID:', user.id);
    console.log('Referred by:', user.referred_by_id);
    console.log('Balance:', user.balance_crystals);
    console.log('Subscribed to channel:', user.subscribed_to_channel);
    console.log('Tasks completed:', response.tasks_completed);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Функция проверки подписки на канал
async function checkChannelSubscription(userId: number): Promise<boolean> {
  const botToken = process.env.BOT_TOKEN;
  
  if (!botToken || !CHANNEL_ID) {
    console.error('Bot token or channel ID not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember`, {
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
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    const data = await response.json();
    const status = data.result?.status;
    
    // Проверяем статус членства
    const isSubscribed = status === 'member' || 
                        status === 'administrator' || 
                        status === 'creator';
    
    return isSubscribed;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}