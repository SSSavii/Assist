import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'main.db');
const db = new Database(dbPath, { verbose: console.log });

// Устанавливаем правильные права доступа для БД
try {
  if (fs.existsSync(dbPath)) {
    fs.chmodSync(dbPath, 0o666); // rw-rw-rw-
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
    balance_crystals INTEGER NOT NULL DEFAULT 400,
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
    FOREIGN KEY (referred_by_id) REFERENCES users(id)
  )
`);

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
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('DRAFT', 'ACTIVE', 'FINISHED', 'CANCELLED')),
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

// Таблица заданий
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    task_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    reward_crystals INTEGER DEFAULT 0,
    task_type TEXT DEFAULT 'manual' CHECK(task_type IN ('manual', 'auto', 'referral')),
    is_active INTEGER DEFAULT 1
  )
`);

// Вставка базовых заданий
const insertTask = db.prepare(`
  INSERT OR IGNORE INTO tasks (id, task_key, title, description, reward_crystals, task_type)
  VALUES (@id, @task_key, @title, @description, @reward_crystals, @task_type)
`);

db.transaction(() => {
  insertTask.run({ 
    id: 1, 
    task_key: 'subscribe_channel', 
    title: 'Подпишись на Ассист+', 
    description: 'Подпишись на наш канал и получи бонус',
    reward_crystals: 100,
    task_type: 'manual'
  });
  insertTask.run({ 
    id: 2, 
    task_key: 'vote_poll', 
    title: 'Отдай голос на улучшение канала', 
    description: 'Проголосуй за улучшение канала',
    reward_crystals: 500,
    task_type: 'manual'
  });
  insertTask.run({ 
    id: 3, 
    task_key: 'invite_friend', 
    title: 'Пригласи друга', 
    description: 'Пригласи друга и получи бонус после его подписки',
    reward_crystals: 500,
    task_type: 'referral'
  });
})();

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

// Таблица реферальных наград
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
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'FINISHED', 'CANCELLED')),
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
    item_type TEXT NOT NULL CHECK(item_type IN ('premium_item', 'case', 'crystals', 'other')),
    item_name TEXT NOT NULL,
    item_description TEXT,
    price_crystals INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
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
    item_type TEXT NOT NULL CHECK(item_type IN ('premium_item', 'case', 'crystals', 'other')),
    delivery_type TEXT DEFAULT 'instant' CHECK(delivery_type IN ('instant', 'bot_message', 'manual')),
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
  VALUES (@id, @name, @description, @price_crystals, @item_type, @delivery_type, @stock_quantity)
`);

db.transaction(() => {
  insertShopItem.run({
    id: 1,
    name: 'Созвон с кумиром',
    description: '30 минут личного общения',
    price_crystals: 10000,
    item_type: 'premium_item',
    delivery_type: 'manual',
    stock_quantity: -1
  });
})();

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
    limit_type TEXT NOT NULL CHECK(limit_type IN ('taps', 'cases', 'referrals')),
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

console.log('✅ Все таблицы базы данных успешно инициализированы');
console.log('📊 Структура БД обновлена для поддержки:');
console.log('   - Системы рулетки с типами доставки призов');
console.log('   - Реферальной системы с подписками');
console.log('   - Системы розыгрышей (10/20/30 приглашений)');
console.log('   - Истории покупок');
console.log('   - Магазина товаров');
console.log('   - Ежедневных лимитов');
console.log('   - Проверки запуска бота');

export default db;