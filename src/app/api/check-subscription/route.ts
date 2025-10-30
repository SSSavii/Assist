/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1002782276287';
const REFERRAL_REWARD = 500;

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

/**
 * Проверяет, давал ли пользователь буст каналу
 * Использует Telegram Bot API метод getUserChatBoosts
 * Документация: https://core.telegram.org/bots/api#getuserchatboosts
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    
    // Если у пользователя есть хотя бы один активный буст - он проголосовал
    const hasBoosts = data.result?.boosts && data.result.boosts.length > 0;
    
    console.log(`User ${userId} boost check:`, {
      hasBoosts,
      boostCount: data.result?.boosts?.length || 0,
      boosts: data.result?.boosts
    });
    
    return hasBoosts;
  } catch (error) {
    console.error('Error checking user boost:', error);
    return false;
  }
}

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

    const findUserStmt = db.prepare('SELECT * FROM users WHERE tg_id = ?');
    const user = findUserStmt.get(userData.id) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
            
            // Если пользователь был приглашён, обновляем счётчики у пригласившего
            if (user.referred_by_id) {
              try {
                // Проверяем не была ли уже выдана награда
                const checkRewardStmt = db.prepare(`
                  SELECT reward_given, is_subscribed 
                  FROM referral_rewards 
                  WHERE user_id = ? AND referred_user_id = ?
                `);
                const existingReward = checkRewardStmt.get(user.referred_by_id, user.id) as any;
                
                // Только если запись существует и награда еще не выдана
                if (existingReward && !existingReward.is_subscribed) {
                  const transaction = db.transaction(() => {
                    // Увеличиваем счётчик подписавшихся рефералов и начисляем награду
                    const updateReferrerStmt = db.prepare(`
                      UPDATE users 
                      SET referral_count_subscribed = referral_count_subscribed + 1,
                          balance_crystals = balance_crystals + ?
                      WHERE id = ?
                    `);
                    updateReferrerStmt.run(REFERRAL_REWARD, user.referred_by_id);
                    
                    // Обновляем запись в referral_rewards
                    const updateRewardStmt = db.prepare(`
                      UPDATE referral_rewards 
                      SET is_subscribed = 1, 
                          reward_given = 1,
                          subscribed_at = CURRENT_TIMESTAMP,
                          rewarded_at = CURRENT_TIMESTAMP
                      WHERE user_id = ? AND referred_user_id = ?
                    `);
                    updateRewardStmt.run(user.referred_by_id, user.id);
                  });
                  
                  transaction();
                  console.log(`✅ Referrer ${user.referred_by_id} rewarded ${REFERRAL_REWARD} crystals for referral ${user.id} subscription`);
                } else {
                  console.log(`ℹ️ Reward already given or no referral record for user ${user.id}`);
                }
              } catch (error) {
                console.error('❌ Error updating referrer counters:', error);
              }
            }
            
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

          // Используем getUserChatBoosts для проверки буста конкретного пользователя
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

      case 'invite':
        try {
          const invitedUsersStmt = db.prepare(`
            SELECT id, tg_id, subscribed_to_channel 
            FROM users 
            WHERE referred_by_id = ?
          `);
          const invitedUsers = invitedUsersStmt.all(user.id) as Array<{
            id: number;
            tg_id: number;
            subscribed_to_channel: number;
          }>;
          
          if (invitedUsers.length === 0) {
            isCompleted = false;
            message = 'Вы еще никого не пригласили';
            break;
          }
          
          let subscribedCount = 0;
          const updateSubStmt = db.prepare(
            'UPDATE users SET subscribed_to_channel = ? WHERE tg_id = ?'
          );
          
          for (const friend of invitedUsers) {
            if (friend.subscribed_to_channel === 1) {
              subscribedCount++;
              continue;
            }
            
            try {
              const chatMember = await checkChannelSubscription(friend.tg_id);
              const isSubscribed = chatMember?.status === 'member' || 
                                chatMember?.status === 'administrator' || 
                                chatMember?.status === 'creator';
              
              if (isSubscribed) {
                updateSubStmt.run(1, friend.tg_id);
                subscribedCount++;
              }
            } catch (error) {
              console.error(`Error checking subscription for user ${friend.tg_id}:`, error);
            }
          }
          
          console.log(`User ${user.id} has ${subscribedCount} subscribed friends out of ${invitedUsers.length} invited`);
          
          if (subscribedCount === 0) {
            isCompleted = false;
            message = `У вас ${invitedUsers.length} приглашенных, но они еще не подписались на канал`;
            break;
          }
          
          const rewardedCountStmt = db.prepare(`
            SELECT COUNT(*) as count 
            FROM referral_rewards 
            WHERE user_id = ?
          `);
          const rewardedCount = (rewardedCountStmt.get(user.id) as any)?.count || 0;
          
          if (subscribedCount > rewardedCount) {
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
            
            const insertRewardStmt = db.prepare(`
              INSERT OR IGNORE INTO referral_rewards (user_id, referred_user_id) 
              VALUES (?, ?)
            `);
            
            let totalReward = 0;
            for (const friend of unrewardedFriends) {
              insertRewardStmt.run(user.id, friend.id);
              totalReward += TASK_REWARDS.invite;
            }
            
            const updateBalanceStmt = db.prepare(
              'UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?'
            );
            updateBalanceStmt.run(totalReward, user.id);
            
            const taskStmt = db.prepare('SELECT id FROM tasks WHERE task_key = ?');
            const task = taskStmt.get(TASK_KEYS.invite) as any;
            
            if (task) {
              const insertTaskStmt = db.prepare(`
                INSERT OR IGNORE INTO user_tasks (user_id, task_id, status) 
                VALUES (?, ?, 'completed')
              `);
              insertTaskStmt.run(user.id, task.id);
            }
            
            return NextResponse.json({
              success: true,
              message: `🎉 Награда за ${unrewardedFriends.length} друзей: +${totalReward} плюсов!`,
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
        } catch (error) {
          console.error('Invite check error:', error);
          return NextResponse.json({ 
            success: false, 
            message: 'Ошибка проверки приглашений. Попробуйте позже.' 
          });
        }
        break;
    }

    if (isCompleted) {
      const reward = TASK_REWARDS[taskId as keyof TaskRewards];
      
      const updateBalanceStmt = db.prepare('UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?');
      updateBalanceStmt.run(reward, user.id);

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