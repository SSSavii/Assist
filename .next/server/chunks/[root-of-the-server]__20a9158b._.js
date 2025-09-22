module.exports = {

"[project]/.next-internal/server/app/api/check-subscription/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/better-sqlite3 [external] (better-sqlite3, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("better-sqlite3", () => require("better-sqlite3"));

module.exports = mod;
}}),
"[externals]/path [external] (path, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}}),
"[project]/src/lib/init-database.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/better-sqlite3 [external] (better-sqlite3, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const dbPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'main.db');
const db = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$29$__["default"](dbPath, {
    verbose: console.log
});
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
    voted INTEGER DEFAULT 0
  )
`);
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
db.transaction(()=>{
    insertTask.run({
        id: 1,
        task_key: 'subscribe_channel',
        title: 'Подпишись на Ассист+',
        reward_crystals: 100
    });
    insertTask.run({
        id: 2,
        task_key: 'vote_poll',
        title: 'Отдай голос на улучшение канала',
        reward_crystals: 500
    });
    insertTask.run({
        id: 3,
        task_key: 'invite_friend',
        title: 'Пригласи друга',
        reward_crystals: 500
    });
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
const __TURBOPACK__default__export__ = db;
}}),
"[externals]/crypto [external] (crypto, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}}),
"[externals]/url [external] (url, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}}),
"[project]/src/lib/telegram-auth.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "validateTelegramHash": (()=>validateTelegramHash)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
;
;
function validateTelegramHash(initData, botToken) {
    try {
        const params = new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URLSearchParams"](initData);
        const hash = params.get('hash');
        if (!hash) return false;
        params.delete('hash');
        const dataCheckArr = [];
        const sortedKeys = Array.from(params.keys()).sort();
        sortedKeys.forEach((key)=>dataCheckArr.push(`${key}=${params.get(key)}`));
        const dataCheckString = dataCheckArr.join('\n');
        const secretKey = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHmac"])('sha256', 'WebAppData').update(botToken).digest();
        const ownHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHmac"])('sha256', secretKey).update(dataCheckString).digest('hex');
        return ownHash === hash;
    } catch (error) {
        console.error("Error during hash validation:", error);
        return false;
    }
}
}}),
"[project]/src/app/api/check-subscription/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* eslint-disable @typescript-eslint/no-explicit-any */ __turbopack_context__.s({
    "POST": (()=>POST)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/init-database.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/telegram-auth.ts [app-route] (ecmascript)");
;
;
;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_USERNAME = '@assistplus_business'; // Убедитесь, что начинается с @
const TASK_REWARDS = {
    subscribe: 100,
    vote: 500,
    invite: 500
};
const TASK_KEYS = {
    subscribe: 'subscribe_channel',
    vote: 'vote_poll',
    invite: 'invite_friend'
};
async function POST(req) {
    try {
        const { initData, taskId } = await req.json();
        if (!initData) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'initData is required'
            }, {
                status: 400
            });
        }
        if (!taskId || ![
            'subscribe',
            'vote',
            'invite'
        ].includes(taskId)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Valid taskId is required'
            }, {
                status: 400
            });
        }
        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Server configuration error'
            }, {
                status: 500
            });
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateTelegramHash"])(initData, botToken)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid Telegram hash'
            }, {
                status: 403
            });
        }
        const params = new URLSearchParams(initData);
        const userData = JSON.parse(params.get('user') || '{}');
        if (!userData.id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid user data'
            }, {
                status: 400
            });
        }
        // Находим пользователя
        const findUserStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare('SELECT * FROM users WHERE tg_id = ?');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = findUserStmt.get(userData.id);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User not found'
            }, {
                status: 404
            });
        }
        // Проверяем, выполнена ли уже задача
        const checkTaskStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare(`
      SELECT 1 FROM user_tasks ut 
      JOIN tasks t ON ut.task_id = t.id 
      WHERE ut.user_id = ? AND t.task_key = ?
    `);
        const taskCompleted = checkTaskStmt.get(user.id, TASK_KEYS[taskId]);
        if (taskCompleted) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'Задание уже выполнено'
            });
        }
        let isCompleted = false;
        let message = '';
        switch(taskId){
            case 'subscribe':
                // Проверка подписки на канал
                try {
                    const chatMember = await checkChannelSubscription(userData.id);
                    isCompleted = chatMember?.status === 'member' || chatMember?.status === 'administrator' || chatMember?.status === 'creator';
                    message = isCompleted ? 'Подписка подтверждена!' : 'Вы не подписаны на канал';
                } catch (error) {
                    console.error('Subscription check error:', error);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
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
                const invitedFriendsStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare('SELECT COUNT(*) as count FROM users WHERE referred_by_id = ?');
                const invitedCount = invitedFriendsStmt.get(user.id)?.count || 0;
                isCompleted = invitedCount > 0;
                message = isCompleted ? `Вы пригласили ${invitedCount} друзей!` : 'Вы еще никого не пригласили';
                break;
        }
        if (isCompleted) {
            // Награждаем пользователя
            const reward = TASK_REWARDS[taskId];
            const updateBalanceStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare('UPDATE users SET balance_crystals = balance_crystals + ? WHERE id = ?');
            updateBalanceStmt.run(reward, user.id);
            // Отмечаем задачу как выполненную
            const taskStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare('SELECT id FROM tasks WHERE task_key = ?');
            const task = taskStmt.get(TASK_KEYS[taskId]);
            if (task) {
                const insertTaskStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare(`
          INSERT OR IGNORE INTO user_tasks (user_id, task_id, status) 
          VALUES (?, ?, 'completed')
        `);
                insertTaskStmt.run(user.id, task.id);
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: `Награда получена: +${reward} плюсов!`,
                reward: reward,
                newBalance: user.balance_crystals + reward
            });
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: message
            });
        }
    } catch (error) {
        console.error('Check subscription error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
// Функция проверки подписки на канал
async function checkChannelSubscription(userId) {
    if (!BOT_TOKEN || !CHANNEL_USERNAME) {
        throw new Error('Bot token or channel username not configured');
    }
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__20a9158b._.js.map