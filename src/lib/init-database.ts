/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Таблица заданий (БЕЗ CHECK constraint - валидация на уровне приложения)
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
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

console.log('📋 Таблица tasks готова, начинаем добавление заданий...');

// ============================================
// ВСТАВКА ЗАДАНИЙ С ГАРАНТИЕЙ ВЫПОЛНЕНИЯ
// ============================================

const insertTask = db.prepare(`
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
  }
];

// Выполняем вставку в транзакции
const insertTasksTransaction = db.transaction(() => {
  for (const task of tasksToInsert) {
    try {
      const result = insertTask.run(
        task.id,
        task.task_key,
        task.title,
        task.description,
        task.reward_crystals,
        task.task_type,
        task.milestone_required,
        task.is_active
      );
      console.log(`  ✅ Задание добавлено: ${task.task_key} (id=${task.id}, reward=${task.reward_crystals})`);
    } catch (error) {
      console.error(`  ❌ Ошибка при добавлении задания ${task.task_key}:`, error);
      throw error; // Откатываем всю транзакцию при ошибке
    }
  }
});

try {
  insertTasksTransaction();
  console.log('✅ Все задания успешно добавлены в транзакции');
} catch (error) {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при добавлении заданий:', error);
}

// Проверяем результат
const checkTasksStmt = db.prepare('SELECT COUNT(*) as count FROM tasks');
const tasksCount = checkTasksStmt.get() as { count: number };
console.log(`📊 Проверка: всего заданий в БД = ${tasksCount.count}`);

if (tasksCount.count < 7) {
  console.error('❌ ВНИМАНИЕ: Не все задания добавлены! Ожидалось 7, получено:', tasksCount.count);
  console.error('Список заданий в БД:');
  const allTasksStmt = db.prepare('SELECT id, task_key, reward_crystals FROM tasks ORDER BY id');
  const allTasks = allTasksStmt.all();
  console.table(allTasks);
}

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

// Вставка базовых товаров
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
  console.log('✅ Товары магазина добавлены');
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

console.log('');
console.log('====================================');
console.log('✅ База данных полностью инициализирована');
console.log('====================================');
console.log('');
console.log('📊 Структура БД включает:');
console.log('   ✅ Пользователи (users)');
console.log('   ✅ Задания (tasks) - ' + tasksCount.count + ' шт.');
console.log('   ✅ Выполненные задания (user_tasks)');
console.log('   ✅ Реферальные награды (referral_rewards)');
console.log('   ✅ Аукционы (Lots, Bids)');
console.log('   ✅ Рулетка (case_winnings)');
console.log('   ✅ Розыгрыши (lotteries, lottery_entries)');
console.log('   ✅ Магазин (shop_items, purchase_history)');
console.log('   ✅ Навигация (navigation_items)');
console.log('   ✅ Лимиты (daily_limits)');
console.log('');
console.log('💎 Система наград:');
console.log('   - Приветственный бонус: +400 плюсов');
console.log('   - Подписка на канал: +100 плюсов');
console.log('   - Голосование/буст: +500 плюсов');
console.log('   - За каждого реферала: +500 плюсов (автоматически)');
console.log('   - Milestone 1 друг: +500 плюсов');
console.log('   - Milestone 3 друга: +500 плюсов');
console.log('   - Milestone 5 друзей: +500 плюсов');
console.log('   - Milestone 10 друзей: +500 плюсов');
console.log('');

export default db;