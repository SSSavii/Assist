// app/api/check-subscription/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { URLSearchParams } from 'url';
import { createHmac } from 'crypto';
import axios from 'axios';

import db from '@/lib/init-database';
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_USERNAME = '@assistplus_business'; // Должно начинаться с @

function validateTelegramHash(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;
    params.delete('hash');
    const dataCheckArr: string[] = [];
    const sortedKeys = Array.from(params.keys()).sort();
    sortedKeys.forEach((key) => {
      dataCheckArr.push(`${key}=${params.get(key)}`);
    });
    const dataCheckString = dataCheckArr.join('\n');
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const ownHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    return ownHash === hash;
  } catch (error) {
    console.error('Hash validation error:', error);
    return false;
  }
}

async function isUserSubscribed(userId: number): Promise<boolean> {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`,
      {
        params: {
          chat_id: CHANNEL_USERNAME,
          user_id: userId,
        },
      }
    );

    const status = response.data.result?.status;
    return ['member', 'administrator', 'creator'].includes(status);
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { initData, taskId } = await req.json();

    if (!initData || !BOT_TOKEN) {
      return NextResponse.json({ success: false, message: 'Ошибка конфигурации' }, { status: 500 });
    }

    if (!validateTelegramHash(initData, BOT_TOKEN)) {
      return NextResponse.json({ success: false, message: 'Неверные данные' }, { status: 403 });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const userId = userData.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Не удалось определить пользователя' }, { status: 400 });
    }

    // Определяем задачу
    let taskKey: string;
    let reward: number;

    if (taskId === 'subscribe') {
      taskKey = 'subscribe_channel';
      reward = 100;
    } else if (taskId === 'vote') {
      taskKey = 'vote_poll';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      reward = 500;
    } else {
      return NextResponse.json({ success: false, message: 'Неизвестная задача' }, { status: 400 });
    }

    // Проверяем, есть ли такая задача в БД
    const taskStmt = db.prepare('SELECT id, reward_crystals FROM tasks WHERE task_key = ?');
    const task = taskStmt.get(taskKey) as { id: number; reward_crystals: number } | undefined;

    if (!task) {
      return NextResponse.json({ success: false, message: 'Задача не найдена' }, { status: 404 });
    }

    // Проверяем, уже ли выполнено
    const userTaskStmt = db.prepare('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ?');
    const userTask = userTaskStmt.get(userId, task.id);

    if (userTask) {
      return NextResponse.json({ success: false, message: 'Награда уже получена' });
    }

    // Проверяем подписку
    const isSubscribed = await isUserSubscribed(userId);
    if (!isSubscribed) {
      return NextResponse.json({ success: false, message: 'Вы не подписаны на канал.' });
    }

    // Всё ок — начисляем награду
    const userStmt = db.prepare('SELECT balance_crystals FROM users WHERE tg_id = ?');
    const user = userStmt.get(userId) as { balance_crystals: number } | undefined;

    if (!user) {
      return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 404 });
    }

    const newBalance = user.balance_crystals + task.reward_crystals;

    const insertUserTask = db.prepare('INSERT INTO user_tasks (user_id, task_id, status) VALUES (?, ?, "completed")');
    const updateUserBalance = db.prepare('UPDATE users SET balance_crystals = ? WHERE tg_id = ?');

    db.transaction(() => {
      insertUserTask.run(userId, task.id);
      updateUserBalance.run(newBalance, userId);
    })();

    return NextResponse.json({
      success: true,
      newBalance,
      message: `Задание выполнено! Получено +${task.reward_crystals} плюсов.`,
    });
  } catch (error) {
    console.error('Error in /api/check-subscription:', error);
    return NextResponse.json({ success: false, message: 'Ошибка сервера' }, { status: 500 });
  }
}