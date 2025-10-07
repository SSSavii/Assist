/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1002782276287'; // ID канала из ссылки на буст

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
          isCompleted = chatMember?.status === 'member' || 
                       chatMember?.status === 'administrator' || 
                       chatMember?.status === 'creator';
          
          if (isCompleted) {
            // Обновляем статус подписки в БД
            const updateSubStmt = db.prepare(
              'UPDATE users SET subscribed_to_channel = 1 WHERE id = ?'
            );
            updateSubStmt.run(user.id);
            message = 'Подписка подтверждена!';
          } else {
            message = 'Вы не подписаны на канал';
          }
        } catch (error) {
          console.error('Subscription check error:', error);
          return NextResponse.json({ 
            success: false, 
            message: 'Ошибка проверки подписки. Попробуйте позже.' 
          });
        }
        break;

      case 'vote':
        // Проверка буста канала
        try {
          // Сначала проверяем подписку
          const chatMember = await checkChannelSubscription(userData.id);
          const isSubscribed = chatMember?.status === 'member' || 
                              chatMember?.status === 'administrator' || 
                              chatMember?.status === 'creator';
          
          if (!isSubscribed) {
            return NextResponse.json({ 
              success: false, 
              message: 'Сначала подпишитесь на канал' 
            });
          }

          // Получаем текущее количество бустов
          const currentBoostCount = await getChannelBoostCount();
          
          if (currentBoostCount === null) {
            return NextResponse.json({ 
              success: false, 
              message: 'Не удалось получить информацию о бустах' 
            });
          }

          // Проверяем, увеличилось ли количество бустов
          if (user.boost_count_before > 0 && currentBoostCount > user.boost_count_before) {
            isCompleted = true;
            message = 'Спасибо за поддержку канала!';
          } else {
            isCompleted = false;
            message = 'Буст не обнаружен. Попробуйте еще раз через несколько секунд.';
          }
        } catch (error) {
          console.error('Vote check error:', error);
          return NextResponse.json({ 
            success: false, 
            message: 'Ошибка проверки. Попробуйте позже.' 
          });
        }
        break;

      case 'invite':
        // Проверка приглашенных друзей, которые подписаны на канал
        const invitedSubscribedStmt = db.prepare(`
          SELECT COUNT(*) as count 
          FROM users 
          WHERE referred_by_id = ? 
          AND subscribed_to_channel = 1
        `);
        const subscribedCount = (invitedSubscribedStmt.get(user.id) as any)?.count || 0;
        
        if (subscribedCount === 0) {
          isCompleted = false;
          message = 'Ваши друзья должны подписаться на канал';
          break;
        }
        
        // Проверяем, за скольких друзей уже начислены бонусы
        const rewardedCountStmt = db.prepare(`
          SELECT COUNT(*) as count 
          FROM referral_rewards 
          WHERE user_id = ?
        `);
        const rewardedCount = (rewardedCountStmt.get(user.id) as any)?.count || 0;
        
        // Если есть новые подписанные друзья, за которых не начислены бонусы
        if (subscribedCount > rewardedCount) {
          // Получаем список друзей, за которых еще не начислены бонусы
          const unrewardedFriendsStmt = db.prepare(`
            SELECT u.id 
            FROM users u
            WHERE u.referred_by_id = ? 
            AND u.subscribed_to_channel = 1
            AND u.id NOT IN (
              SELECT referred_user_id 
              FROM referral_rewards 
              WHERE user_id = ?
            )
          `);
          const unrewardedFriends = unrewardedFriendsStmt.all(user.id, user.id) as any[];
          
          // Начисляем бонусы за каждого нового друга
          const insertRewardStmt = db.prepare(`
            INSERT OR IGNORE INTO referral_rewards (user_id, referred_user_id) 
            VALUES (?, ?)
          `);
          
          let totalReward = 0;
          for (const friend of unrewardedFriends) {
            insertRewardStmt.run(user.id, friend.id);
            totalReward += TASK_REWARDS.invite;
          }
          
          // Обновляем баланс
          const updateBalanceStmt = db.prepare(
            'UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?'
          );
          updateBalanceStmt.run(totalReward, user.id);
          
          // Отмечаем задачу как выполненную
          const taskStmt = db.prepare('SELECT id FROM tasks WHERE task_key = ?');
          const task = taskStmt.get(TASK_KEYS.invite) as any;
          
          if (task) {
            const insertTaskStmt = db.prepare(`
              INSERT OR IGNORE INTO user_tasks (user_id, task_id, status) 
              VALUES (?, ?, 'completed')
            `);
            insertTaskStmt.run(user.id, task.id);
          }
          
          // Возвращаем результат сразу
          return NextResponse.json({
            success: true,
            message: `Награда за ${unrewardedFriends.length} друзей: +${totalReward} плюсов!`,
            reward: totalReward,
            newBalance: user.balance_crystals + totalReward,
            friendsCount: subscribedCount
          });
        } else {
          isCompleted = false;
          message = subscribedCount > 0 
            ? `У вас ${subscribedCount} подписанных друзей. Награда уже получена!`
            : 'Пригласите друзей и попросите их подписаться на канал';
        }
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
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error('Bot token or channel ID not configured');
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
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error checking subscription:', error);
    throw error;
  }
}

// Функция получения количества бустов канала
async function getChannelBoostCount(): Promise<number | null> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error('Bot token or channel ID not configured');
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHANNEL_ID
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return null;
    }

    const data = await response.json();
    // Возвращаем количество бустов, если доступно
    return data.result?.boost_count || 0;
  } catch (error) {
    console.error('Error getting boost count:', error);
    return null;
  }
}