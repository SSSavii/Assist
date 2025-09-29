module.exports = {

"[project]/src/app/(main)/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* eslint-disable @typescript-eslint/no-explicit-any */ __turbopack_context__.s({
    "default": (()=>HomePage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
function HomePage() {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [tapsLeft, setTapsLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [logoError, setLogoError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isBalancePressed, setIsBalancePressed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isIOS, setIsIOS] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const DAILY_TAP_LIMIT = 100;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Определяем iOS устройство
        const userAgent = navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            const startappParam = tg.initDataUnsafe?.start_param;
            console.log('startapp from WebApp:', startappParam);
            fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    initData: tg.initData,
                    startapp: startappParam
                })
            }).then((response)=>{
                if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
                return response.json();
            }).then((data)=>{
                if (data.error) {
                    setError(data.error);
                } else {
                    setUser(data);
                    const today = new Date().toISOString().split('T')[0];
                    if (data.last_tap_date === today) {
                        setTapsLeft(Math.max(0, DAILY_TAP_LIMIT - data.daily_taps_count));
                    } else {
                        setTapsLeft(DAILY_TAP_LIMIT);
                    }
                }
            }).catch((err)=>{
                console.error("Auth fetch error:", err);
                setError("Не удалось связаться с сервером.");
            }).finally(()=>setLoading(false));
        } else {
            setError("Пожалуйста, откройте приложение в Telegram.");
            setLoading(false);
        }
    }, []);
    const handleEarnCrystals = ()=>{
        const tg = window.Telegram?.WebApp;
        if (!user || !tg?.initData || tapsLeft <= 0) return;
        setTapsLeft((prev)=>prev - 1);
        setUser((prevUser)=>{
            if (!prevUser) return null;
            return {
                ...prevUser,
                balance_crystals: prevUser.balance_crystals + 1,
                daily_taps_count: prevUser.daily_taps_count + 1
            };
        });
        fetch('/api/tap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                initData: tg.initData
            })
        }).then((response)=>response.json()).then((data)=>{
            if (data.error) {
                console.error('Tap error:', data.error);
                setUser((prevUser)=>{
                    if (!prevUser) return null;
                    const newBalance = (prevUser.balance_crystals || 0) - 1;
                    const newTaps = (prevUser.daily_taps_count || 0) - 1;
                    return {
                        ...prevUser,
                        balance_crystals: newBalance < 0 ? 0 : newBalance,
                        daily_taps_count: newTaps < 0 ? 0 : newTaps
                    };
                });
                if (typeof data.tapsLeft === 'number') {
                    setTapsLeft(data.tapsLeft);
                } else {
                    setTapsLeft((prev)=>prev + 1);
                }
                if (data.error === 'Daily tap limit reached') {
                    tg.showAlert('Плюсы на сегодня закончились! Возвращайся завтра.');
                }
            } else {
                if (typeof data.newBalance === 'number') {
                    setUser((prev)=>prev ? {
                            ...prev,
                            balance_crystals: data.newBalance
                        } : null);
                }
                if (typeof data.tapsLeft === 'number') {
                    setTapsLeft(data.tapsLeft);
                }
            }
        }).catch((err)=>{
            console.error('Tap fetch error:', err);
            setTapsLeft((prev)=>prev + 1);
            setUser((prevUser)=>{
                if (!prevUser) return null;
                return {
                    ...prevUser,
                    balance_crystals: prevUser.balance_crystals - 1,
                    daily_taps_count: prevUser.daily_taps_count - 1
                };
            });
            tg.showAlert('Произошла ошибка сети. Попробуйте еще раз.');
        });
    };
    const handleInviteFriend = ()=>{
        const tg = window.Telegram?.WebApp;
        if (!tg || !user || !user.tg_id) {
            tg?.showAlert('Не удалось создать ссылку. Пожалуйста, перезагрузите страницу.');
            return;
        }
        const botUsername = ("TURBOPACK compile-time value", "my_auction_admin_bot");
        const appName = 'assist_plus';
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        const referralLink = `https://t.me/${botUsername}/${appName}?startapp=ref${user.tg_id}`;
        const shareText = `Привет! Запусти мини-приложение "Ассист+" и получай бонусы!`;
        try {
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
            tg.openTelegramLink(shareUrl);
        } catch (error) {
            console.error('Share error:', error);
            navigator.clipboard.writeText(`${shareText}\n${referralLink}`);
            tg.showAlert('Ссылка скопирована в буфер обмена! Отправь ее другу.');
        }
    };
    const checkTask = (taskId)=>{
        const tg = window.Telegram?.WebApp;
        if (!tg?.initData) return;
        fetch('/api/check-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                initData: tg.initData,
                taskId
            })
        }).then((res)=>res.json()).then((data)=>{
            if (data.success) {
                setUser((prev)=>prev ? {
                        ...prev,
                        balance_crystals: data.newBalance,
                        tasks_completed: {
                            ...prev.tasks_completed,
                            subscribe: taskId === 'subscribe' ? true : prev.tasks_completed?.subscribe || false,
                            vote: taskId === 'vote' ? true : prev.tasks_completed?.vote || false,
                            invite: taskId === 'invite' ? true : prev.tasks_completed?.invite || false
                        }
                    } : null);
                tg.showAlert(data.message || `Награда получена: +${data.reward} плюсов!`);
            } else {
                tg.showAlert(data.message || 'Условия не выполнены.');
            }
        }).catch((err)=>{
            console.error(`Check ${taskId} error:`, err);
            tg.showAlert('Ошибка соединения с сервером.');
        });
    };
    const handleSubscribeToChannel = ()=>{
        const tg = window.Telegram?.WebApp;
        tg?.openTelegramLink('https://t.me/assistplus_business');
    };
    const handleVoteForChannel = ()=>{
        const tg = window.Telegram?.WebApp;
        tg?.openTelegramLink('https://t.me/assistplus_business');
    };
    const [tasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 1,
            points: 100,
            title: "Подпишись на Ассист+",
            checkButtonText: "Проверить",
            actionButtonText: "Подписаться",
            action: handleSubscribeToChannel,
            checkAction: ()=>checkTask('subscribe'),
            isCompleted: user?.tasks_completed?.subscribe || false
        },
        {
            id: 2,
            points: 500,
            title: "Отдай голос",
            description: "на улучшение канала",
            checkButtonText: "Проверить",
            actionButtonText: "Проголосовать",
            action: handleVoteForChannel,
            checkAction: ()=>checkTask('vote'),
            isCompleted: user?.tasks_completed?.vote || false
        },
        {
            id: 3,
            points: 500,
            title: "Пригласи друга",
            checkButtonText: "Проверить",
            actionButtonText: "Пригласить",
            action: handleInviteFriend,
            checkAction: ()=>checkTask('invite'),
            isCompleted: user?.tasks_completed?.invite || false
        }
    ]);
    const handleTaskAction = (taskId, actionType)=>{
        const task = tasks.find((t)=>t.id === taskId);
        if (task) {
            if (actionType === "check") {
                task.checkAction();
            } else {
                task.action();
            }
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "loading-container",
            children: "Загрузка..."
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/page.tsx",
            lineNumber: 282,
            columnNumber: 12
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "error-container",
            children: [
                "Ошибка: ",
                error
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(main)/page.tsx",
            lineNumber: 285,
            columnNumber: 12
        }, this);
    }
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "error-container",
            children: "Не удалось загрузить данные пользователя."
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/page.tsx",
            lineNumber: 288,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
            [
                "ee763c1aba299ccc",
                [
                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                ]
            ]
        ]) + " " + "app-wrapper",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                    [
                        "ee763c1aba299ccc",
                        [
                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                        ]
                    ]
                ]) + " " + "main-container",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                            [
                                "ee763c1aba299ccc",
                                [
                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                ]
                            ]
                        ]) + " " + "logo-section",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                [
                                    "ee763c1aba299ccc",
                                    [
                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                    ]
                                ]
                            ]) + " " + "logo-container",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                        [
                                            "ee763c1aba299ccc",
                                            [
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                            ]
                                        ]
                                    ]) + " " + "logo-wrapper",
                                    children: logoError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                            [
                                                "ee763c1aba299ccc",
                                                [
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                ]
                                            ]
                                        ]) + " " + "logo-text-fallback",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                    [
                                                        "ee763c1aba299ccc",
                                                        [
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                        ]
                                                    ]
                                                ]) + " " + "assist-text",
                                                children: "АССИСТ"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 300,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                    [
                                                        "ee763c1aba299ccc",
                                                        [
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                        ]
                                                    ]
                                                ]) + " " + "plus-text",
                                                children: "+"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 301,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/page.tsx",
                                        lineNumber: 299,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                            [
                                                "ee763c1aba299ccc",
                                                [
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                ]
                                            ]
                                        ]) + " " + "logo-image-container",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                alt: "Ассист+ логотип",
                                                src: "/svg4122-a7pi.svg",
                                                onError: ()=>setLogoError(true),
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                    [
                                                        "ee763c1aba299ccc",
                                                        [
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                        ]
                                                    ]
                                                ]) + " " + "logo-image"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 305,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                alt: "Плюсик",
                                                src: "/svg4122-denw.svg",
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                    [
                                                        "ee763c1aba299ccc",
                                                        [
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                        ]
                                                    ]
                                                ]) + " " + "plus-icon"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 311,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/page.tsx",
                                        lineNumber: 304,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/page.tsx",
                                    lineNumber: 297,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                        [
                                            "ee763c1aba299ccc",
                                            [
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                            ]
                                        ]
                                    ]) + " " + "logo-text-container",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                [
                                                    "ee763c1aba299ccc",
                                                    [
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                    ]
                                                ]
                                            ]) + " " + "logo-subtitle",
                                            children: "между поколениями"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 321,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                [
                                                    "ee763c1aba299ccc",
                                                    [
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                    ]
                                                ]
                                            ]) + " " + "logo-title",
                                            children: "обмен"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 322,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/page.tsx",
                                    lineNumber: 320,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/page.tsx",
                            lineNumber: 296,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 295,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                            [
                                "ee763c1aba299ccc",
                                [
                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                ]
                            ]
                        ]) + " " + "balance-section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: handleEarnCrystals,
                                onMouseDown: ()=>setIsBalancePressed(true),
                                onMouseUp: ()=>setIsBalancePressed(false),
                                onMouseLeave: ()=>setIsBalancePressed(false),
                                onTouchStart: ()=>setIsBalancePressed(true),
                                onTouchEnd: ()=>setIsBalancePressed(false),
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                    [
                                        "ee763c1aba299ccc",
                                        [
                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                        ]
                                    ]
                                ]) + " " + "balance-container",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                        [
                                            "ee763c1aba299ccc",
                                            [
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                            ]
                                        ]
                                    ]) + " " + `balance-shadow-box ${isBalancePressed ? 'pressed' : ''}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            alt: "Кристалл",
                                            src: "/vector3530-fpvf.svg",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                [
                                                    "ee763c1aba299ccc",
                                                    [
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                    ]
                                                ]
                                            ]) + " " + "balance-crystal"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 339,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                [
                                                    "ee763c1aba299ccc",
                                                    [
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                    ]
                                                ]
                                            ]) + " " + "balance-amount",
                                            children: user.balance_crystals
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 344,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/page.tsx",
                                    lineNumber: 338,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 329,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                    [
                                        "ee763c1aba299ccc",
                                        [
                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                        ]
                                    ]
                                ]) + " " + "balance-description",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                            [
                                                "ee763c1aba299ccc",
                                                [
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                ]
                                            ]
                                        ]) + " " + "description-text",
                                        children: [
                                            "Кликай, зарабатывай плюсы, ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                    [
                                                        "ee763c1aba299ccc",
                                                        [
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                        ]
                                                    ]
                                                ])
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 350,
                                                columnNumber: 42
                                            }, this),
                                            "и меняй их в",
                                            " "
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/page.tsx",
                                        lineNumber: 349,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                            [
                                                "ee763c1aba299ccc",
                                                [
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                ]
                                            ]
                                        ]) + " " + "description-bold",
                                        children: "аукционе знакомств"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/page.tsx",
                                        lineNumber: 352,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 348,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 328,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                            [
                                "ee763c1aba299ccc",
                                [
                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                ]
                            ]
                        ]) + " " + "tasks-section",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                [
                                    "ee763c1aba299ccc",
                                    [
                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                    ]
                                ]
                            ]) + " " + "tasks-container",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                        [
                                            "ee763c1aba299ccc",
                                            [
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                            ]
                                        ]
                                    ]) + " " + "tasks-background",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                [
                                                    "ee763c1aba299ccc",
                                                    [
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                    ]
                                                ]
                                            ]) + " " + "tasks-bg-color"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 360,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            alt: "Фоновое изображение",
                                            src: "/svg1642-j9o.svg",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                [
                                                    "ee763c1aba299ccc",
                                                    [
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                    ]
                                                ]
                                            ]) + " " + "tasks-bg-image"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 361,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/page.tsx",
                                    lineNumber: 359,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                        [
                                            "ee763c1aba299ccc",
                                            [
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                            ]
                                        ]
                                    ]) + " " + "tasks-header",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                            [
                                                "ee763c1aba299ccc",
                                                [
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                ]
                                            ]
                                        ]) + " " + "tasks-title",
                                        children: "Задания"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/page.tsx",
                                        lineNumber: 369,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/page.tsx",
                                    lineNumber: 368,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                        [
                                            "ee763c1aba299ccc",
                                            [
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                            ]
                                        ]
                                    ]) + " " + "tasks-list",
                                    children: tasks.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                [
                                                    "ee763c1aba299ccc",
                                                    [
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                    ]
                                                ]
                                            ]) + " " + "task-card",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                        [
                                                            "ee763c1aba299ccc",
                                                            [
                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                            ]
                                                        ]
                                                    ]) + " " + "task-header",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                [
                                                                    "ee763c1aba299ccc",
                                                                    [
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                    ]
                                                                ]
                                                            ]) + " " + "task-content",
                                                            children: task.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                    [
                                                                        "ee763c1aba299ccc",
                                                                        [
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                        ]
                                                                    ]
                                                                ]) + " " + "task-title",
                                                                children: [
                                                                    task.title,
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                            [
                                                                                "ee763c1aba299ccc",
                                                                                [
                                                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                                ]
                                                                            ]
                                                                        ])
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                                        lineNumber: 382,
                                                                        columnNumber: 40
                                                                    }, this),
                                                                    task.description
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                                lineNumber: 381,
                                                                columnNumber: 25
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                    [
                                                                        "ee763c1aba299ccc",
                                                                        [
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                        ]
                                                                    ]
                                                                ]) + " " + "task-title",
                                                                children: task.title
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                                lineNumber: 386,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/page.tsx",
                                                            lineNumber: 379,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                [
                                                                    "ee763c1aba299ccc",
                                                                    [
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                    ]
                                                                ]
                                                            ]) + " " + "task-points",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                        [
                                                                            "ee763c1aba299ccc",
                                                                            [
                                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                            ]
                                                                        ]
                                                                    ]) + " " + "points-text",
                                                                    children: [
                                                                        "+",
                                                                        task.points
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                                    lineNumber: 391,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                        [
                                                                            "ee763c1aba299ccc",
                                                                            [
                                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                            ]
                                                                        ]
                                                                    ]) + " " + "points-icon",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: "/vector4120-sezw.svg",
                                                                        alt: "Кристалл",
                                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                            [
                                                                                "ee763c1aba299ccc",
                                                                                [
                                                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                                ]
                                                                            ]
                                                                        ]) + " " + "points-crystal"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                                        lineNumber: 393,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                                    lineNumber: 392,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(main)/page.tsx",
                                                            lineNumber: 390,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                    lineNumber: 378,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                        [
                                                            "ee763c1aba299ccc",
                                                            [
                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                            ]
                                                        ]
                                                    ]) + " " + "task-actions",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleTaskAction(task.id, "check"),
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                [
                                                                    "ee763c1aba299ccc",
                                                                    [
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                    ]
                                                                ]
                                                            ]) + " " + "task-button check-button",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                    [
                                                                        "ee763c1aba299ccc",
                                                                        [
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                        ]
                                                                    ]
                                                                ]) + " " + "button-text",
                                                                children: task.checkButtonText
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                                lineNumber: 407,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/page.tsx",
                                                            lineNumber: 403,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleTaskAction(task.id, "action"),
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                [
                                                                    "ee763c1aba299ccc",
                                                                    [
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                        isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                        isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                    ]
                                                                ]
                                                            ]) + " " + "task-button action-button",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                                    [
                                                                        "ee763c1aba299ccc",
                                                                        [
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                            isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                            isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                                        ]
                                                                    ]
                                                                ]) + " " + "button-text bold",
                                                                children: task.actionButtonText
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                                lineNumber: 414,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/page.tsx",
                                                            lineNumber: 410,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                    lineNumber: 402,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dynamic([
                                                        [
                                                            "ee763c1aba299ccc",
                                                            [
                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                                                                isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                                                                isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                                                            ]
                                                        ]
                                                    ]) + " " + "task-glow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                    lineNumber: 418,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, task.id, true, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 374,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/page.tsx",
                                    lineNumber: 372,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/page.tsx",
                            lineNumber: 358,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 357,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 293,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BottomNavBar, {}, void 0, false, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 427,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "ee763c1aba299ccc",
                dynamic: [
                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : '',
                    isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : '',
                    isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''
                ],
                children: `.app-wrapper.__jsx-style-dynamic-selector{background-color:#fff;min-height:100vh;position:relative}.main-container.__jsx-style-dynamic-selector{box-sizing:border-box;background-color:#fff;flex-direction:column;align-items:center;gap:20px;width:100%;min-height:812px;padding:40px 0 100px;display:flex;overflow:auto}.logo-section.__jsx-style-dynamic-selector{flex-direction:column;align-self:stretch;align-items:center;gap:10px;display:flex}.logo-container.__jsx-style-dynamic-selector{flex-direction:column;align-items:flex-start;width:216px;height:83px;display:flex;position:relative}.logo-wrapper.__jsx-style-dynamic-selector{width:200px;height:48px;margin-left:12px;position:relative}.logo-image-container.__jsx-style-dynamic-selector{width:100%;height:100%;position:relative}.logo-image.__jsx-style-dynamic-selector{${isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : ''};width:100%;height:100%}.plus-icon.__jsx-style-dynamic-selector{${isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : ''};width:24px;height:24px;position:absolute;top:-15px;right:-15px}.logo-text-fallback.__jsx-style-dynamic-selector{justify-content:center;align-items:center;width:100%;height:100%;display:flex;position:relative}.assist-text.__jsx-style-dynamic-selector{color:#000;font-family:Cera Pro,sans-serif;font-size:24px;font-weight:700}.plus-text.__jsx-style-dynamic-selector{color:red;margin-left:2px;font-family:Cera Pro,sans-serif;font-size:24px;font-weight:700}.logo-text-container.__jsx-style-dynamic-selector{width:220px;height:34px;margin-top:1px;margin-left:-2px;position:relative}.logo-subtitle.__jsx-style-dynamic-selector{text-align:center;color:#000;letter-spacing:-1.26px;white-space:nowrap;font-family:Cera Pro;font-size:18px;font-weight:400;line-height:14.6px;position:absolute;top:15px;left:calc(50% - 45px)}.logo-title.__jsx-style-dynamic-selector{color:#000;text-align:center;height:auto;font-family:Vasek;font-size:48px;font-style:italic;font-weight:400;line-height:81%;position:absolute}.balance-section.__jsx-style-dynamic-selector{flex-direction:column;align-self:stretch;align-items:center;gap:25px;padding:5px 0 20px;display:flex}.balance-container.__jsx-style-dynamic-selector{cursor:pointer;width:142px;height:142px;margin-top:-8px;position:relative}.balance-shadow-box.__jsx-style-dynamic-selector{background:linear-gradient(144deg,#d9d9d9 0%,#cdcdcd 100%);border-radius:30px;justify-content:center;align-items:center;width:142px;height:142px;transition:transform .1s ease-in-out;display:flex;position:absolute;top:0;left:0;box-shadow:5px 5px 10px #00000040,inset 3px 3px 10px #fff,inset -4px -5px 20px #0000004d}.balance-shadow-box.pressed.__jsx-style-dynamic-selector{transform:scale(.98)}.balance-crystal.__jsx-style-dynamic-selector{${isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          ` : ''};width:77px;height:73px}.balance-amount.__jsx-style-dynamic-selector{color:#000;letter-spacing:-.6px;background:#fffc;border:1px solid #b4b4b4;border-radius:20px;padding:6px 12px;font-family:Cera Pro;font-size:20px;font-weight:700;line-height:16.2px;position:absolute;bottom:8px}.balance-description.__jsx-style-dynamic-selector{text-align:center;color:#000;letter-spacing:-.42px;width:253px;height:29px;font-family:Cera Pro;font-size:14px;font-weight:400;line-height:15.4px}.description-text.__jsx-style-dynamic-selector{letter-spacing:-.06px}.description-bold.__jsx-style-dynamic-selector{letter-spacing:-.06px;font-family:Cera Pro;font-weight:700}.tasks-section.__jsx-style-dynamic-selector{flex-direction:column;align-self:stretch;align-items:center;gap:10px;display:flex}.tasks-container.__jsx-style-dynamic-selector{border-radius:0 0 32px 32px;flex-direction:column;align-items:center;gap:25px;width:100%;padding:35px 0 16px;display:flex;position:relative;overflow:hidden}.tasks-background.__jsx-style-dynamic-selector{width:520px;height:1771px;position:absolute;top:0;left:-77px}.tasks-bg-color.__jsx-style-dynamic-selector{background-color:#eaeaea;width:375px;height:1680px;position:absolute;top:91px;left:77px}.tasks-bg-image.__jsx-style-dynamic-selector{${isIOS ? `
            image-rendering: -webkit-optimize-contrast;
          ` : ''};width:375px;height:316px;position:absolute;top:0;left:77px}.tasks-header.__jsx-style-dynamic-selector{z-index:1;justify-content:flex-end;align-items:center;gap:10px;width:100%;padding:5px 24px 0 0;display:flex}.tasks-title.__jsx-style-dynamic-selector{text-align:right;color:#000;letter-spacing:-.96px;white-space:nowrap;margin-top:-1px;font-family:Cera Pro;font-size:32px;font-weight:700;line-height:35.2px}.tasks-list.__jsx-style-dynamic-selector{z-index:1;flex-direction:column;align-items:center;gap:10px;display:inline-flex}.task-card.__jsx-style-dynamic-selector{background:linear-gradient(244deg,#f23939 0%,#db1b1b 100%);border-radius:30px;flex-direction:column;align-items:flex-start;gap:5px;width:343px;padding:20px;display:flex;position:relative;overflow:hidden}.task-header.__jsx-style-dynamic-selector{justify-content:space-between;align-items:flex-start;gap:10px;width:100%;display:flex}.task-content.__jsx-style-dynamic-selector{flex-direction:column;flex:1;justify-content:center;align-items:flex-start;display:flex}.task-title.__jsx-style-dynamic-selector{text-align:left;color:#fff;letter-spacing:-.4px;font-family:Cera Pro;font-size:20px;font-weight:500;line-height:20px}.task-points.__jsx-style-dynamic-selector{flex-shrink:0;align-items:center;gap:10px;display:inline-flex}.points-text.__jsx-style-dynamic-selector{color:#fff;white-space:nowrap;font-family:Cera Pro;font-size:24px;font-weight:700;line-height:24px}.points-icon.__jsx-style-dynamic-selector{background:#fff;border-radius:12.5px;justify-content:center;align-items:center;width:25px;height:25px;display:flex}.points-crystal.__jsx-style-dynamic-selector{${isIOS ? `
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            image-rendering: -webkit-optimize-contrast;
          ` : ''};width:15px;height:15px}.task-actions.__jsx-style-dynamic-selector{justify-content:flex-end;align-items:flex-start;gap:10px;width:100%;padding-top:10px;display:flex}.task-button.__jsx-style-dynamic-selector{cursor:pointer;background:#fff;border:none;border-radius:30px;flex-direction:column;justify-content:center;align-items:center;padding:10px 14px;transition:transform .1s ease-in-out;display:inline-flex}.task-button.__jsx-style-dynamic-selector:active{transform:scale(.98)}.button-text.__jsx-style-dynamic-selector{color:#0d0d0d;letter-spacing:-.8px;white-space:nowrap;font-family:Cera Pro;font-size:16px;font-weight:300;line-height:16px}.button-text.bold.__jsx-style-dynamic-selector{font-weight:500}.task-glow.__jsx-style-dynamic-selector{filter:blur(125px);background:#fffc;border-radius:60px;width:120px;height:120px;position:absolute;top:-43px;right:16px}.loading-container.__jsx-style-dynamic-selector,.error-container.__jsx-style-dynamic-selector{background-color:#fff;justify-content:center;align-items:center;height:100vh;font-family:Cera Pro;display:flex}.loading-container.__jsx-style-dynamic-selector{color:#666}.error-container.__jsx-style-dynamic-selector{color:red;text-align:center;padding:20px}`
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/page.tsx",
        lineNumber: 292,
        columnNumber: 5
    }, this);
}
// components/BottomNavBar.tsx
function BottomNavBar() {
    const navItems = [
        {
            id: "home",
            href: '/',
            label: 'Главная',
            icon: '/vector6430-oh1s.svg'
        },
        {
            id: "shop",
            href: '/auction',
            label: 'Магазин',
            icon: '/vector6430-lih9.svg'
        },
        {
            id: "friends",
            href: '/friends',
            label: 'Друзья',
            icon: '/vector6430-gzd.svg'
        },
        {
            id: "profile",
            href: '/profile',
            label: 'Профиль',
            icon: '/vector6431-qbze.svg'
        }
    ];
    const handlePress = ()=>{
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
    };
    const getIconSize = (itemId)=>{
        switch(itemId){
            case "home":
                return {
                    width: "29.86px",
                    height: "25.57px"
                };
            case "shop":
                return {
                    width: "28px",
                    height: "28px"
                };
            case "friends":
                return {
                    width: "28px",
                    height: "26px"
                };
            case "profile":
                return {
                    width: "28.29px",
                    height: "28.29px"
                };
            default:
                return {
                    width: "28px",
                    height: "24px"
                };
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "jsx-530351eb42ea404c" + " " + "bottom-nav",
        children: [
            navItems.map((item)=>{
                const iconSize = getIconSize(item.id);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: item.href,
                    onClick: handlePress,
                    "aria-label": item.label,
                    className: "jsx-530351eb42ea404c" + " " + "nav-item",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            style: iconSize,
                            alt: item.label,
                            src: item.icon,
                            className: "jsx-530351eb42ea404c"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/page.tsx",
                            lineNumber: 934,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-530351eb42ea404c" + " " + "nav-label",
                            children: item.label
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/page.tsx",
                            lineNumber: 939,
                            columnNumber: 13
                        }, this)
                    ]
                }, item.id, true, {
                    fileName: "[project]/src/app/(main)/page.tsx",
                    lineNumber: 927,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "530351eb42ea404c",
                children: ".bottom-nav.jsx-530351eb42ea404c{z-index:1000;background-color:#262626;border-radius:15px 15px 0 0;justify-content:space-between;align-items:center;height:80px;padding:8px 25px;display:flex;position:fixed;bottom:0;left:0;right:0;overflow:hidden;box-shadow:0 -2px 10px #0000001a}.nav-item.jsx-530351eb42ea404c{flex-direction:column;justify-content:center;align-items:center;gap:8px;width:66px;height:100%;text-decoration:none;transition:opacity .2s;display:flex}.nav-item.jsx-530351eb42ea404c:hover{opacity:.8}.nav-label.jsx-530351eb42ea404c{text-align:center;color:#868686;letter-spacing:-.42px;font-family:Cera Pro,sans-serif;font-size:14px;font-weight:500;line-height:11.3px}.nav-item.active.jsx-530351eb42ea404c .nav-label.jsx-530351eb42ea404c{color:#fff}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/page.tsx",
        lineNumber: 922,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=src_app_%28main%29_page_tsx_d3fff124._.js.map