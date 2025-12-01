/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1002782276287';

// ============================================
// КОНФИГУРАЦИЯ НАГРАД
// ============================================
const TASK_REWARDS: Record<string, number> = {
  welcome_bonus: 400,
  subscribe_channel: 100,
  vote_poll: 500,
  invite_1: 500,
  invite_3: 500,
  invite_5: 500,
  invite_10: 500,
};

// Milestone-конфигурация (должна совпадать с auth/route.ts)
const INVITE_MILESTONES = [
  { friends: 1, reward: 500, taskKey: 'invite_1' },
  { friends: 3, reward: 500, taskKey: 'invite_3' },
  { friends: 5, reward: 500, taskKey: 'invite_5' },
  { friends: 10, reward: 500, taskKey: 'invite_10' },
];

// Порядок milestone-заданий для проверки предыдущего
const MILESTONE_ORDER = ['invite_1', 'invite_3', 'invite_5', 'invite_10'];
// ============================================

/**
 * Проверяет, давал ли пользователь буст каналу
 */
async function checkUserBoost(userId: number): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.error('Bot token or channel ID not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUserChatBoosts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHANNEL_ID,
          user_id: userId
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API getUserChatBoosts error:', errorData);
      return false;
    }

    const data = await response.json();
    const hasBoosts = data.result?.boosts && data.result.boosts.length > 0;
    
    console.log(`User ${userId} boost check:`, {
      hasBoosts,
      boostCount: data.result?.boosts?.length || 0
    });
    
    return hasBoosts;
  } catch (error) {
    console.error('Error checking user boost:', error);
    return false;
  }
}

/**
 * Проверяет подписку на канал
 */
async function checkChannelSubscription(userId: number) {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error('Bot token or channel ID not configured');
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

/**
 * Проверяет, выполнено ли задание
 */
function isTaskCompleted(userId: number, taskKey: string): boolean {
  const stmt = db.prepare(`
    SELECT 1 FROM user_tasks ut 
    JOIN tasks t ON ut.task_id = t.id 
    WHERE ut.user_id = ? AND t.task_key = ?
  `);
  return !!stmt.get(userId, taskKey);
}

/**
 * Записывает выполненное задание и начисляет награду
 */
function completeTaskAndReward(userId: number, taskKey: string): { success: boolean; reward: number; newBalance: number; error?: string } {
  try {
    console.log(`[REWARD] Starting for user ${userId}, task ${taskKey}`);
    
    // Получаем задание
    const taskStmt = db.prepare('SELECT id, reward_crystals FROM tasks WHERE task_key = ?');
    const task = taskStmt.get(taskKey) as { id: number; reward_crystals: number } | undefined;
    
    if (!task) {
      console.error(`[REWARD] Task not found: ${taskKey}`);
      return { success: false, reward: 0, newBalance: 0, error: 'Task not found' };
    }

    console.log(`[REWARD] Task found: id=${task.id}, reward=${task.reward_crystals}`);

    // Проверяем, не выполнено ли уже
    if (isTaskCompleted(userId, taskKey)) {
      console.log(`[REWARD] Task already completed`);
      return { success: false, reward: 0, newBalance: 0, error: 'Already completed' };
    }

    const reward = task.reward_crystals;

    // Выполняем транзакцию
    const executeReward = db.transaction(() => {
      // Записываем выполненное задание
      const insertTaskStmt = db.prepare(`
        INSERT INTO user_tasks (user_id, task_id, status, completed_at) 
        VALUES (?, ?, 'completed', CURRENT_TIMESTAMP)
      `);
      const insertResult = insertTaskStmt.run(userId, task.id);
      console.log(`[REWARD] Insert task result:`, insertResult);

      // Начисляем награду
      const updateBalanceStmt = db.prepare(
        'UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?'
      );
      const updateResult = updateBalanceStmt.run(reward, userId);
      console.log(`[REWARD] Update balance result:`, updateResult);

      if (updateResult.changes === 0) {
        throw new Error('User not found or balance not updated');
      }
    });

    // Выполняем транзакцию
    executeReward();

    // Получаем новый баланс
    const userStmt = db.prepare('SELECT balance_crystals FROM users WHERE id = ?');
    const user = userStmt.get(userId) as { balance_crystals: number } | undefined;

    if (!user) {
      console.error(`[REWARD] User not found after update: ${userId}`);
      return { success: false, reward: 0, newBalance: 0, error: 'User not found after update' };
    }

    console.log(`[REWARD] Success! New balance: ${user.balance_crystals}`);
    return { success: true, reward, newBalance: user.balance_crystals };
    
  } catch (error) {
    console.error(`[REWARD] Error:`, error);
    return { 
      success: false, 
      reward: 0, 
      newBalance: 0, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Получает предыдущий milestone для проверки очерёдности
 */
function getPreviousMilestoneKey(taskKey: string): string | null {
  const index = MILESTONE_ORDER.indexOf(taskKey);
  if (index <= 0) return null;
  return MILESTONE_ORDER[index - 1];
}

export async function POST(req: NextRequest) {
  try {
    const { initData, taskId } = await req.json();

    console.log(`[CHECK] Request for taskId: ${taskId}`);

    if (!initData) {
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    const validTaskIds = [
      'welcome_bonus',
      'subscribe',
      'vote',
      'invite_1',
      'invite_3',
      'invite_5',
      'invite_10'
    ];

    if (!taskId || !validTaskIds.includes(taskId)) {
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

    const findUserStmt = db.prepare('SELECT * FROM users WHERE tg_id = ?');
    const user = findUserStmt.get(userData.id) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`[CHECK] User found: id=${user.id}, tg_id=${user.tg_id}`);

    // Маппинг taskId на task_key
    const taskKeyMap: Record<string, string> = {
      'welcome_bonus': 'welcome_bonus',
      'subscribe': 'subscribe_channel',
      'vote': 'vote_poll',
      'invite_1': 'invite_1',
      'invite_3': 'invite_3',
      'invite_5': 'invite_5',
      'invite_10': 'invite_10',
    };

    const taskKey = taskKeyMap[taskId];

    // Проверяем, не выполнено ли уже
    if (isTaskCompleted(user.id, taskKey)) {
      console.log(`[CHECK] Task already completed: ${taskKey}`);
      return NextResponse.json({ 
        success: false, 
        message: 'Задание уже выполнено' 
      });
    }

    let isCompleted = false;
    let message = '';

    switch (taskId) {
      // ============================================
      // ПРИВЕТСТВЕННЫЙ БОНУС
      // ============================================
      case 'welcome_bonus': {
        // Просто выдаём награду без проверок
        isCompleted = true;
        message = 'Добро пожаловать! Получи свой стартовый бонус!';
        console.log(`[CHECK] Welcome bonus - auto approved`);
        break;
      }

      // ============================================
      // ПОДПИСКА НА КАНАЛ
      // ============================================
      case 'subscribe': {
        try {
          const chatMember = await checkChannelSubscription(userData.id);
          isCompleted = chatMember?.status === 'member' || 
                       chatMember?.status === 'administrator' || 
                       chatMember?.status === 'creator';
          
          if (isCompleted) {
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
      }

      // ============================================
      // ГОЛОСОВАНИЕ/БУСТ
      // ============================================
      case 'vote': {
        try {
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

          const hasBoost = await checkUserBoost(userData.id);
          
          if (hasBoost) {
            isCompleted = true;
            message = 'Спасибо за поддержку канала!';
          } else {
            isCompleted = false;
            message = 'Буст не обнаружен. Проголосуйте за канал и попробуйте снова через несколько секунд.';
          }
        } catch (error) {
          console.error('Vote check error:', error);
          return NextResponse.json({ 
            success: false, 
            message: 'Ошибка проверки. Попробуйте позже.' 
          });
        }
        break;
      }

      // ============================================
      // MILESTONE-ЗАДАНИЯ ПРИГЛАШЕНИЙ
      // ============================================
      case 'invite_1':
      case 'invite_3':
      case 'invite_5':
      case 'invite_10': {
        // Находим конфигурацию milestone
        const milestone = INVITE_MILESTONES.find(m => m.taskKey === taskId);
        if (!milestone) {
          return NextResponse.json({ 
            success: false, 
            message: 'Задание не найдено' 
          });
        }

        // Проверяем, выполнен ли предыдущий milestone
        const previousTaskKey = getPreviousMilestoneKey(taskId);
        if (previousTaskKey && !isTaskCompleted(user.id, previousTaskKey)) {
          return NextResponse.json({ 
            success: false, 
            message: 'Сначала получите награду за предыдущее задание' 
          });
        }

        // Проверяем количество рефералов
        const referralCount = user.referral_count || 0;
        
        console.log(`[CHECK] Milestone ${taskId}: user has ${referralCount}, needs ${milestone.friends}`);
        
        if (referralCount >= milestone.friends) {
          isCompleted = true;
          message = `Отлично! Ты пригласил ${milestone.friends} ${milestone.friends === 1 ? 'друга' : 'друзей'}!`;
        } else {
          const remaining = milestone.friends - referralCount;
          message = `Нужно ещё ${remaining} ${remaining === 1 ? 'друг' : 'друзей'}. У тебя ${referralCount} из ${milestone.friends}.`;
        }
        break;
      }
    }

    // Если задание выполнено — записываем и начисляем
    if (isCompleted) {
      console.log(`[CHECK] Task completed, rewarding...`);
      const result = completeTaskAndReward(user.id, taskKey);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `${message} +${result.reward} плюсов!`,
          reward: result.reward,
          newBalance: result.newBalance,
          taskKey: taskKey
        });
      } else {
        console.error(`[CHECK] Reward failed:`, result.error);
        return NextResponse.json({
          success: false,
          message: `Ошибка при начислении награды: ${result.error || 'Неизвестная ошибка'}`
        });
      }
    } else {
      console.log(`[CHECK] Task not completed: ${message}`);
      return NextResponse.json({
        success: false,
        message: message
      });
    }

  } catch (error) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}