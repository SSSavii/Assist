import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'main.db');
const db = new Database(dbPath, { verbose: console.log });

// Создание таблиц (если ещё не созданы)
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
    subscribed INTEGER DEFAULT 0,
    voted INTEGER DEFAULT 0,
    FOREIGN KEY (referred_by_id) REFERENCES users(id)
  )
`);
// Явно добавляем колонки, если их нет
try {
  db.exec("ALTER TABLE users ADD COLUMN subscribed INTEGER DEFAULT 0;");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
  // Колонка уже существует — это нормально
}

try {
  db.exec("ALTER TABLE users ADD COLUMN voted INTEGER DEFAULT 0;");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
  // Колонка уже существует — это нормально
}

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

db.exec(`
  CREATE TABLE IF NOT EXISTS case_winnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prize_name TEXT NOT NULL,
    won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    task_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    reward_crystals INTEGER DEFAULT 0
  )
`);

// Вставка задач (если ещё не вставлены)
const insertTask = db.prepare(`
  INSERT OR IGNORE INTO tasks (id, task_key, title, reward_crystals)
  VALUES (@id, @task_key, @title, @reward_crystals)
`);

db.transaction(() => {
  insertTask.run({ id: 1, task_key: 'subscribe_channel', title: 'Подпишись на Ассист+', reward_crystals: 100 });
  insertTask.run({ id: 2, task_key: 'vote_poll', title: 'Отдай голос на улучшение канала', reward_crystals: 500 });
  insertTask.run({ id: 3, task_key: 'invite_friend_assistant', title: 'Пригласи друга, который хочет стать бизнес-ассистентом', reward_crystals: 500 });
})();

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

console.log('✅ Все таблицы базы данных успешно инициализированы');

export default db;