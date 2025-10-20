module.exports = {

"[project]/.next-internal/server/app/api/auth/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

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
    subscribed_to_channel INTEGER DEFAULT 0,
    boost_count_before INTEGER DEFAULT 0,
    photo_url TEXT
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
db.exec(`
  CREATE TABLE IF NOT EXISTS referral_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    referred_user_id INTEGER NOT NULL,
    rewarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, referred_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (referred_user_id) REFERENCES users(id)
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
"[project]/src/app/api/auth/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* eslint-disable @typescript-eslint/no-unused-vars */ __turbopack_context__.s({
    "POST": (()=>POST)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/init-database.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/telegram-auth.ts [app-route] (ecmascript)");
;
;
;
const REFERRAL_BONUS = 500;
async function POST(req) {
    try {
        const body = await req.json();
        const { initData, startapp } = body;
        console.log('=== AUTH REQUEST ===');
        console.log('initData exists:', !!initData);
        console.log('initData length:', initData?.length || 0);
        console.log('startapp:', startapp);
        if (!initData) {
            console.error('❌ initData is missing');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'initData is required'
            }, {
                status: 400
            });
        }
        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            console.error('❌ BOT_TOKEN not configured');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Server configuration error'
            }, {
                status: 500
            });
        }
        console.log('Validating hash...');
        const isValid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateTelegramHash"])(initData, botToken);
        console.log('Hash valid:', isValid);
        if (!isValid) {
            console.error('❌ Invalid hash');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid Telegram hash'
            }, {
                status: 403
            });
        }
        const params = new URLSearchParams(initData);
        const userParam = params.get('user');
        console.log('User param:', userParam);
        if (!userParam) {
            console.error('❌ No user in initData');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No user data in initData'
            }, {
                status: 400
            });
        }
        const userData = JSON.parse(userParam);
        console.log('=== USER DATA ===');
        console.log('User ID:', userData.id);
        console.log('Username:', userData.username);
        console.log('First name:', userData.first_name);
        console.log('Photo URL:', userData.photo_url);
        let startParam = startapp;
        if (!startParam) {
            startParam = params.get('startapp') || params.get('start_param') || params.get('start');
            try {
                const initDataObj = Object.fromEntries(params.entries());
                if (initDataObj.startapp && !startParam) {
                    startParam = initDataObj.startapp;
                }
                if (initDataObj.start_param && !startParam) {
                    startParam = initDataObj.start_param;
                }
            } catch (e) {
                console.log('Error parsing startapp:', e);
            }
        }
        console.log('Start param:', startParam);
        if (!userData.id) {
            console.error('❌ No user ID');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid user data'
            }, {
                status: 400
            });
        }
        const checkTasksStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare(`
      SELECT t.task_key 
      FROM user_tasks ut 
      JOIN tasks t ON ut.task_id = t.id 
      WHERE ut.user_id = (SELECT id FROM users WHERE tg_id = ?)
    `);
        const findUserStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare(`
      SELECT * FROM users WHERE tg_id = ?
    `);
        let user = findUserStmt.get(userData.id);
        let referredById = null;
        if (startParam && startParam.startsWith('ref')) {
            const referrerIdStr = startParam.replace(/^ref_?/, '');
            const referrerTgId = parseInt(referrerIdStr, 10);
            console.log('Referrer TG ID:', referrerTgId);
            console.log('Current user TG ID:', userData.id);
            if (!isNaN(referrerTgId) && referrerTgId > 0 && referrerTgId !== userData.id) {
                const referrerStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare('SELECT id FROM users WHERE tg_id = ?');
                const referrer = referrerStmt.get(referrerTgId);
                if (referrer) {
                    referredById = referrer.id;
                    console.log('✅ Found referrer:', referredById);
                } else {
                    console.log('❌ Referrer not found');
                }
            }
        }
        if (user) {
            const updateStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare(`
        UPDATE users 
        SET username = ?, first_name = ?, last_name = ?, photo_url = ?,
            last_login_at = CURRENT_TIMESTAMP,
            referred_by_id = COALESCE(referred_by_id, ?)
        WHERE tg_id = ?
      `);
            updateStmt.run(userData.username, userData.first_name, userData.last_name, userData.photo_url || null, referredById, userData.id);
            user = findUserStmt.get(userData.id);
            console.log('✅ User updated');
        } else {
            const insertStmt = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$init$2d$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].prepare(`
        INSERT INTO users (tg_id, username, first_name, last_name, photo_url, referred_by_id, balance_crystals)
        VALUES (?, ?, ?, ?, ?, ?, 400)
      `);
            insertStmt.run(userData.id, userData.username, userData.first_name, userData.last_name, userData.photo_url || null, referredById);
            user = findUserStmt.get(userData.id);
            console.log('✅ New user created');
        }
        if (!user) {
            console.error('❌ User not found after create/update');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User not found'
            }, {
                status: 404
            });
        }
        const completedTasks = checkTasksStmt.all(user.id);
        const completedTaskKeys = completedTasks.map((task)=>task.task_key);
        const response = {
            id: user.id,
            tg_id: user.tg_id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            balance_crystals: user.balance_crystals,
            last_tap_date: user.last_tap_date,
            daily_taps_count: user.daily_taps_count,
            cases_to_open: user.cases_to_open,
            created_at: user.created_at,
            last_login_at: user.last_login_at,
            subscribed_to_channel: user.subscribed_to_channel === 1,
            voted_for_channel: user.boost_count_before > 0,
            tasks_completed: {
                subscribe: completedTaskKeys.includes('subscribe_channel'),
                vote: completedTaskKeys.includes('vote_poll'),
                invite: completedTaskKeys.includes('invite_friend')
            }
        };
        console.log('=== SUCCESS ===');
        console.log('User ID:', user.id);
        console.log('TG ID:', user.tg_id);
        console.log('Balance:', user.balance_crystals);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error('❌ Auth error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error',
            details: String(error)
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__2928ec21._.js.map