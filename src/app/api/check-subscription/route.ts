/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_USERNAME = '@assistplus_business'; // Убедитесь, что начинается с @

interface TaskRewards {
  subscribe: number;
  vote: number;
  invite: number;
}

const TASK_REWARDS: TaskRewards = {
  subscribe: 100,
  vote: 500,
  invite: 500
};

const TASK_KEYS = {
  subscribe: 'subscribe_channel',
  vote: 'vote_poll',
  invite: 'invite_friend'
};

export async function POST(req: NextRequest) {
  try {
    const { initData, taskId } = await req.json();

    if (!initData) {
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    if (!taskId || !['subscribe', 'vote', 'invite'].includes(taskId)) {
      return NextResponse.json({ error: 'Valid taskId is required' }, { status: 400 });
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

    if (!userData.id) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Находим пользователя
    const findUserStmt = db.prepare('SELECT * FROM users WHERE tg_id = ?');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = findUserStmt.get(userData.id) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Проверяем, выполнена ли уже задача
    const checkTaskStmt = db.prepare(`
      SELECT 1 FROM user_tasks ut 
      JOIN tasks t ON ut.task_id = t.id 
      WHERE ut.user_id = ? AND t.task_key = ?
    `);
    
    const taskCompleted = checkTaskStmt.get(user.id, TASK_KEYS[taskId as keyof typeof TASK_KEYS]);

    if (taskCompleted) {
      return NextResponse.json({ 
        success: false, 
        message: 'Задание уже выполнено' 
      });
    }

    let isCompleted = false;
    let message = '';

    switch (taskId) {
      case 'subscribe':
        // Проверка подписки на канал
        try {
          const chatMember = await checkChannelSubscription(userData.id);
          isCompleted = chatMember?.status === 'member' || chatMember?.status === 'administrator' || chatMember?.status === 'creator';
          message = isCompleted ? 'Подписка подтверждена!' : 'Вы не подписаны на канал';
        } catch (error) {
          console.error('Subscription check error:', error);
          return NextResponse.json({ 
            success: false, 
            message: 'Ошибка проверки подписки. Попробуйте позже.' 
          });
        }
        break;

      case 'vote':
        // Для голосования пока возвращаем false - нужно реализовать проверку
        isCompleted = false;
        message = 'Проверка голосования временно недоступна';
        break;

      case 'invite':
        // Проверка приглашенных друзей
        const invitedFriendsStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE referred_by_id = ?');
        const invitedCount = (invitedFriendsStmt.get(user.id) as any)?.count || 0;
        isCompleted = invitedCount > 0;
        message = isCompleted ? `Вы пригласили ${invitedCount} друзей!` : 'Вы еще никого не пригласили';
        break;
    }

    if (isCompleted) {
      // Награждаем пользователя
      const reward = TASK_REWARDS[taskId as keyof TaskRewards];
      
      const updateBalanceStmt = db.prepare('UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?');
      updateBalanceStmt.run(reward, user.id);

      // Отмечаем задачу как выполненную
      const taskStmt = db.prepare('SELECT id FROM tasks WHERE task_key = ?');
      const task = taskStmt.get(TASK_KEYS[taskId as keyof typeof TASK_KEYS]) as any;
      
      if (task) {
        const insertTaskStmt = db.prepare(`
          INSERT OR IGNORE INTO user_tasks (user_id, task_id, status) 
          VALUES (?, ?, 'completed')
        `);
        insertTaskStmt.run(user.id, task.id);
      }

      return NextResponse.json({
        success: true,
        message: `Награда получена: +${reward} плюсов!`,
        reward: reward,
        newBalance: user.balance_crystals + reward
      });
    } else {
      return NextResponse.json({
        success: false,
        message: message
      });
    }

  } catch (error) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Функция проверки подписки на канал
async function checkChannelSubscription(userId: number) {
  if (!BOT_TOKEN || !CHANNEL_USERNAME) {
    throw new Error('Bot token or channel username not configured');
  }

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: CHANNEL_USERNAME,
      user_id: userId
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}