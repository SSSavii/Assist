import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'main.db');
const db = new Database(dbPath, { verbose: console.log });

// Устанавливаем правильные права доступа для БД
try {
  if (fs.existsSync(dbPath)) {
    fs.chmodSync(dbPath, 0o666);
    console.log('✅ Права доступа к базе данных установлены (666)');
  }
} catch (error) {
  console.warn('⚠️ Не удалось установить права доступа:', error);
}

// Создание таблицы пользователей
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tg_id INTEGER NOT NULL UNIQUE,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    referred_by_id INTEGER,
    balance_crystals INTEGER NOT NULL DEFAULT 0,
    last_tap_date TEXT,
    daily_taps_count INTEGER NOT NULL DEFAULT 0,
    bio TEXT,
    awards TEXT,
    cases_to_open INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscribed_to_channel INTEGER DEFAULT 0,
    boost_count_before INTEGER DEFAULT 0,
    photo_url TEXT,
    bot_started INTEGER DEFAULT 0,
    referral_count INTEGER DEFAULT 0,
    referral_count_subscribed INTEGER DEFAULT 0,
    current_month_referrals INTEGER DEFAULT 0,
    last_referral_reset TEXT,
    checklists_received INTEGER DEFAULT 0,
    FOREIGN KEY (referred_by_id) REFERENCES users(id)
  )
`);

// Добавляем поле checklists_received если его нет
try {
  db.exec(`ALTER TABLE users ADD COLUMN checklists_received INTEGER DEFAULT 0`);
  console.log('✅ Добавлено поле checklists_received');
} catch {
  // Поле уже существует
}

// Добавляем поле has_seen_stories если его нет
try {
  db.exec(`ALTER TABLE users ADD COLUMN has_seen_stories INTEGER DEFAULT 0`);
  console.log('✅ Добавлено поле has_seen_stories');
} catch {
  // Поле уже существует
}

// Таблица лотов (аукционы)
db.exec(`
  CREATE TABLE IF NOT EXISTS Lots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    photoUrl TEXT,
    city TEXT,
    age INTEGER,
    start_price INTEGER NOT NULL DEFAULT 0,
    min_bid_step INTEGER NOT NULL DEFAULT 100,
    current_price INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    expires_at TEXT NOT NULL,
    winner_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id)
  )
`);

// Таблица ставок в аукционе
db.exec(`
  CREATE TABLE IF NOT EXISTS Bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lot_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lot_id) REFERENCES Lots(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Таблица выигрышей из кейсов (рулетка)
db.exec(`
  CREATE TABLE IF NOT EXISTS case_winnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prize_name TEXT NOT NULL,
    prize_type TEXT DEFAULT 'common',
    delivery_type TEXT DEFAULT 'instant',
    delivered INTEGER DEFAULT 0,
    won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// ============================================
// ТАБЛИЦА ИСТОРИЙ/ОТВЕТОВ ПОЛЬЗОВАТЕЛЕЙ
// ============================================
db.exec(`
  CREATE TABLE IF NOT EXISTS user_stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task_key TEXT NOT NULL,
    story_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Создаём индекс для быстрого поиска
db.exec(`CREATE INDEX IF NOT EXISTS idx_user_stories_user ON user_stories(user_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_user_stories_task ON user_stories(task_key)`);

console.log('✅ Таблица user_stories готова');
// ============================================
// ТАБЛИЦА АДВЕНТ-КАЛЕНДАРЯ
// ============================================
db.exec(`
  CREATE TABLE IF NOT EXISTS calendar_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    day INTEGER NOT NULL,
    year INTEGER NOT NULL,
    prize_file TEXT NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day, year),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Создаём индекс для быстрого поиска
db.exec(`CREATE INDEX IF NOT EXISTS idx_calendar_claims_user ON calendar_claims(user_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_calendar_claims_day ON calendar_claims(day, year)`);

console.log('✅ Таблица calendar_claims готова');
// ============================================
// МИГРАЦИЯ ТАБЛИЦЫ TASKS БЕЗ ПОТЕРИ ДАННЫХ
// ============================================

console.log('🔄 Проверка и миграция таблицы tasks...');

// Проверяем, существует ли таблица tasks
const tableExists = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name='tasks'
`).get();

if (tableExists) {
  console.log('📋 Таблица tasks существует, проверяем структуру...');
  
  // Проверяем, есть ли CHECK constraint
  const tableInfo = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'`).get() as { sql: string };
  const hasCheckConstraint = tableInfo.sql.includes('CHECK');
  
  if (hasCheckConstraint) {
    console.log('⚠️ Обнаружен CHECK constraint, выполняем безопасную миграцию...');
    
    try {
      db.transaction(() => {
        // 1. Сохраняем существующие данные
        console.log('  1️⃣ Сохранение существующих данных...');
        db.exec(`
          CREATE TEMPORARY TABLE tasks_backup AS 
          SELECT * FROM tasks
        `);
        
        // 2. Сохраняем данные user_tasks
        console.log('  2️⃣ Сохранение связей user_tasks...');
        const userTasksExists = db.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name='user_tasks'
        `).get();
        
        if (userTasksExists) {
          db.exec(`
            CREATE TEMPORARY TABLE user_tasks_backup AS 
            SELECT * FROM user_tasks
          `);
          db.exec(`DROP TABLE user_tasks`);
        }
        
        // 3. Удаляем старую таблицу
        console.log('  3️⃣ Удаление старой структуры...');
        db.exec(`DROP TABLE tasks`);
        
        // 4. Создаём новую таблицу БЕЗ CHECK constraint
        console.log('  4️⃣ Создание новой структуры без ограничений...');
        db.exec(`
          CREATE TABLE tasks (
            id INTEGER PRIMARY KEY,
            task_key TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            description TEXT,
            reward_crystals INTEGER DEFAULT 0,
            task_type TEXT DEFAULT 'manual',
            milestone_required INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1
          )
        `);
        
        // 5. Восстанавливаем данные
        console.log('  5️⃣ Восстановление данных...');
        const backupCount = db.prepare('SELECT COUNT(*) as cnt FROM tasks_backup').get() as { cnt: number };
        if (backupCount.cnt > 0) {
          db.exec(`
            INSERT INTO tasks 
            SELECT * FROM tasks_backup
          `);
          console.log(`  ✅ Восстановлено ${backupCount.cnt} существующих заданий`);
        }
        
        // 6. Восстанавливаем user_tasks
        if (userTasksExists) {
          console.log('  6️⃣ Восстановление user_tasks...');
          db.exec(`
            CREATE TABLE user_tasks (
              user_id INTEGER NOT NULL,
              task_id INTEGER NOT NULL,
              status TEXT NOT NULL DEFAULT 'completed',
              completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (user_id, task_id),
              FOREIGN KEY(user_id) REFERENCES users(id),
              FOREIGN KEY(task_id) REFERENCES tasks(id)
            )
          `);
          
          const userTasksCount = db.prepare('SELECT COUNT(*) as cnt FROM user_tasks_backup').get() as { cnt: number };
          if (userTasksCount.cnt > 0) {
            db.exec(`
              INSERT INTO user_tasks 
              SELECT * FROM user_tasks_backup
            `);
            console.log(`  ✅ Восстановлено ${userTasksCount.cnt} выполненных заданий пользователей`);
          }
        }
        
        // 7. Удаляем временные таблицы
        db.exec(`DROP TABLE IF EXISTS tasks_backup`);
        db.exec(`DROP TABLE IF EXISTS user_tasks_backup`);
        
        console.log('✅ Миграция выполнена успешно!');
      })();
    } catch (error) {
      console.error('❌ Ошибка при миграции:', error);
      // Пытаемся откатить изменения
      db.exec(`DROP TABLE IF EXISTS tasks_backup`);
      db.exec(`DROP TABLE IF EXISTS user_tasks_backup`);
    }
  } else {
    console.log('✅ CHECK constraint отсутствует, миграция не требуется');
  }
} else {
  // Таблицы нет - создаём новую
  console.log('📋 Создание таблицы tasks...');
  db.exec(`
    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY,
      task_key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      reward_crystals INTEGER DEFAULT 0,
      task_type TEXT DEFAULT 'manual',
      milestone_required INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);
}

// ============================================
// ДОБАВЛЕНИЕ ВСЕХ НЕОБХОДИМЫХ ЗАДАНИЙ
// ============================================

console.log('📋 Добавление/обновление заданий...');

const insertOrUpdateTask = db.prepare(`
  INSERT OR REPLACE INTO tasks (id, task_key, title, description, reward_crystals, task_type, milestone_required, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const tasksToInsert = [
  {
    id: 1,
    task_key: 'welcome_bonus',
    title: 'Приветственный бонус',
    description: 'Получи стартовые плюсы',
    reward_crystals: 400,
    task_type: 'welcome',
    milestone_required: 0,
    is_active: 1
  },
  {
    id: 2,
    task_key: 'subscribe_channel',
    title: 'Подпишись на АССИСТ+',
    description: 'Подпишись на наш канал и получи бонус',
    reward_crystals: 100,
    task_type: 'manual',
    milestone_required: 0,
    is_active: 1
  },
  {
    id: 3,
    task_key: 'vote_poll',
    title: 'Отдай голос на улучшение канала',
    description: 'Проголосуй за улучшение канала',
    reward_crystals: 500,
    task_type: 'manual',
    milestone_required: 0,
    is_active: 1
  },
  {
    id: 4,
    task_key: 'invite_1',
    title: 'Пригласи 1 друга',
    description: 'Пригласи друга и получи бонус',
    reward_crystals: 500,
    task_type: 'milestone',
    milestone_required: 1,
    is_active: 1
  },
  {
    id: 5,
    task_key: 'invite_3',
    title: 'Пригласи 3 друзей',
    description: 'Пригласи 3 друзей и получи бонус',
    reward_crystals: 500,
    task_type: 'milestone',
    milestone_required: 3,
    is_active: 1
  },
  {
    id: 6,
    task_key: 'invite_5',
    title: 'Пригласи 5 друзей',
    description: 'Пригласи 5 друзей и получи бонус',
    reward_crystals: 500,
    task_type: 'milestone',
    milestone_required: 5,
    is_active: 1
  },
  {
    id: 7,
    task_key: 'invite_10',
    title: 'Пригласи 10 друзей',
    description: 'Пригласи 10 друзей и получи бонус',
    reward_crystals: 500,
    task_type: 'milestone',
    milestone_required: 10,
    is_active: 1
  },
  {
    id: 8,
    task_key: 'share_mistake',
    title: 'Расскажи о своей ошибке',
    description: 'Поделись своим опытом и получи бонус',
    reward_crystals: 500,
    task_type: 'story',
    milestone_required: 0,
    is_active: 1
  }
];

// Выполняем вставку в транзакции
const insertTasksTransaction = db.transaction(() => {
  for (const task of tasksToInsert) {
    try {
      // Проверяем, существует ли задание
      const existing = db.prepare('SELECT id, reward_crystals FROM tasks WHERE task_key = ?').get(task.task_key) as { id: number, reward_crystals: number } | undefined;
      
      if (existing) {
        console.log(`  📝 Обновление задания: ${task.task_key} (текущая награда: ${existing.reward_crystals})`);
      } else {
        console.log(`  ✅ Добавление нового задания: ${task.task_key} (награда: ${task.reward_crystals})`);
      }
      
      insertOrUpdateTask.run(
        task.id,
        task.task_key,
        task.title,
        task.description,
        task.reward_crystals,
        task.task_type,
        task.milestone_required,
        task.is_active
      );
    } catch (error) {
      console.error(`  ❌ Ошибка при обработке задания ${task.task_key}:`, error);
      throw error;
    }
  }
});

try {
  insertTasksTransaction();
  console.log('✅ Все задания успешно обработаны');
} catch (error) {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при добавлении заданий:', error);
}

// Проверяем результат
const checkTasksStmt = db.prepare('SELECT COUNT(*) as count FROM tasks');
const tasksCount = checkTasksStmt.get() as { count: number };
console.log(`📊 Итого заданий в БД: ${tasksCount.count}`);

if (tasksCount.count < 8) {
  console.error(`⚠️ Внимание: ожидалось минимум 8 заданий, в БД: ${tasksCount.count}`);
}

// Показываем все задания
const allTasksStmt = db.prepare('SELECT id, task_key, task_type, reward_crystals FROM tasks ORDER BY id');
const allTasks = allTasksStmt.all();
console.log('📋 Список всех заданий:');
console.table(allTasks);

// Таблица выполненных пользователем заданий
db.exec(`
  CREATE TABLE IF NOT EXISTS user_tasks (
    user_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, task_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(task_id) REFERENCES tasks(id)
  )
`);

// Таблица реферальных наград (для автоматических +500)
db.exec(`
  CREATE TABLE IF NOT EXISTS referral_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    referred_user_id INTEGER NOT NULL,
    is_subscribed INTEGER DEFAULT 0,
    reward_given INTEGER DEFAULT 0,
    subscribed_at TIMESTAMP,
    rewarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, referred_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (referred_user_id) REFERENCES users(id)
  )
`);

// Таблица розыгрышей
db.exec(`
  CREATE TABLE IF NOT EXISTS lotteries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    prize_description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    winner_id INTEGER,
    required_referrals INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id)
  )
`);

// Таблица участников розыгрышей
db.exec(`
  CREATE TABLE IF NOT EXISTS lottery_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lottery_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    referrals_count INTEGER NOT NULL,
    qualified INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lottery_id, user_id),
    FOREIGN KEY (lottery_id) REFERENCES lotteries(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Таблица истории покупок
db.exec(`
  CREATE TABLE IF NOT EXISTS purchase_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_type TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_description TEXT,
    price_crystals INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'completed',
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Таблица товаров в магазине
db.exec(`
  CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price_crystals INTEGER NOT NULL,
    item_type TEXT NOT NULL,
    delivery_type TEXT DEFAULT 'instant',
    is_available INTEGER DEFAULT 1,
    stock_quantity INTEGER DEFAULT -1,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Вставка базовых товаров (если их нет)
const insertShopItem = db.prepare(`
  INSERT OR IGNORE INTO shop_items (id, name, description, price_crystals, item_type, delivery_type, stock_quantity)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

try {
  db.transaction(() => {
    insertShopItem.run(
      1,
      'Созвон с кумиром',
      '30 минут личного общения',
      10000,
      'premium_item',
      'manual',
      -1
    );
  })();
  console.log('✅ Товары магазина проверены');
} catch (error) {
  console.error('⚠️ Ошибка при добавлении товаров:', error);
}

// Таблица для навигационных пунктов
db.exec(`
  CREATE TABLE IF NOT EXISTS navigation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Таблица для отслеживания ежедневных лимитов
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    limit_type TEXT NOT NULL,
    date TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    max_limit INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, limit_type, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Создание индексов для оптимизации
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_tg_id ON users(tg_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_case_winnings_user ON case_winnings(user_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_lottery_entries_lottery ON lottery_entries(lottery_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_lottery_entries_user ON lottery_entries(user_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_purchase_history_user ON purchase_history(user_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_daily_limits_user_date ON daily_limits(user_id, date)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_user_tasks_user ON user_tasks(user_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_key ON tasks(task_key)`);

// Финальная статистика
const userCount = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt;
const userTasksCount = (db.prepare('SELECT COUNT(*) as cnt FROM user_tasks').get() as { cnt: number }).cnt;
const storiesCount = (db.prepare('SELECT COUNT(*) as cnt FROM user_stories').get() as { cnt: number }).cnt;

console.log('');
console.log('====================================');
console.log('✅ База данных успешно обновлена!');
console.log('====================================');
console.log('');
console.log('📊 Статистика БД:');
console.log(`   👥 Пользователей: ${userCount}`);
console.log(`   📋 Заданий: ${tasksCount.count}`);
console.log(`   ✅ Выполнено заданий: ${userTasksCount}`);
console.log(`   📝 Историй пользователей: ${storiesCount}`);
console.log('');
console.log('🏗️ Структура БД включает:');
console.log('   ✅ Пользователи (users) - сохранены');
console.log('   ✅ Задания (tasks) - обновлены');
console.log('   ✅ Выполненные задания (user_tasks) - сохранены');
console.log('   ✅ Истории пользователей (user_stories) - NEW');
console.log('   ✅ Реферальные награды (referral_rewards)');
console.log('   ✅ Аукционы (Lots, Bids)');
console.log('   ✅ Рулетка (case_winnings)');
console.log('   ✅ Розыгрыши (lotteries, lottery_entries)');
console.log('   ✅ Магазин (shop_items, purchase_history)');
console.log('   ✅ Навигация (navigation_items)');
console.log('   ✅ Лимиты (daily_limits)');
console.log('   ✅ Онбординг-сторис (has_seen_stories)');
console.log('');
console.log('💎 Система наград готова к работе!');
console.log('');

export default db;