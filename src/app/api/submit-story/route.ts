import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/init-database';
import { validateTelegramHash } from '@/lib/telegram-auth';

const MIN_STORY_LENGTH = 15;

export async function POST(req: NextRequest) {
  try {
    const { initData, taskKey, text } = await req.json();

    console.log(`[SUBMIT STORY] Request for taskKey: ${taskKey}`);

    if (!initData) {
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    if (!taskKey || !text) {
      return NextResponse.json({ error: 'taskKey and text are required' }, { status: 400 });
    }

    // Проверяем минимальную длину
    const trimmedText = text.trim();
    if (trimmedText.length < MIN_STORY_LENGTH) {
      return NextResponse.json({ 
        success: false, 
        message: `Минимум ${MIN_STORY_LENGTH} символов. Сейчас: ${trimmedText.length}` 
      });
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

    // Получаем пользователя
    const findUserStmt = db.prepare('SELECT id FROM users WHERE tg_id = ?');
    const user = findUserStmt.get(userData.id) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Проверяем, не отправлял ли уже историю для этого задания
    const existingStoryStmt = db.prepare(`
      SELECT id FROM user_stories WHERE user_id = ? AND task_key = ?
    `);
    const existingStory = existingStoryStmt.get(user.id, taskKey);

    if (existingStory) {
      return NextResponse.json({ 
        success: false, 
        message: 'Вы уже отправили свою историю' 
      });
    }

    // Сохраняем историю
    const insertStoryStmt = db.prepare(`
      INSERT INTO user_stories (user_id, task_key, story_text)
      VALUES (?, ?, ?)
    `);
    insertStoryStmt.run(user.id, taskKey, trimmedText);

    console.log(`[SUBMIT STORY] Story saved for user ${user.id}, taskKey: ${taskKey}`);

    return NextResponse.json({
      success: true,
      message: 'История сохранена! Теперь нажмите "Проверить" для получения награды.'
    });

  } catch (error) {
    console.error('Submit story error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}