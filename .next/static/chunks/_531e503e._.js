(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/(main)/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/* eslint-disable @next/next/no-img-element */ /* eslint-disable @typescript-eslint/no-explicit-any */ __turbopack_context__.s({
    "default": (()=>HomePage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
// Добавляем глобальные стили и мета-теги
const GlobalStyles = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                name: "viewport",
                content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
                className: "jsx-5e9b65595eea3bc0"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 10,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "5e9b65595eea3bc0",
                children: '*{box-sizing:border-box;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}html,body{width:100%;height:100%;margin:0;padding:0;overflow-x:hidden}@font-face{font-family:Cera Pro;src:url(/fonts/CeraPro-Regular.woff2)format("woff2"),url(/fonts/CeraPro-Regular.woff)format("woff");font-weight:400;font-style:normal;font-display:swap}@font-face{font-family:Cera Pro;src:url(/fonts/CeraPro-Light.woff2)format("woff2"),url(/fonts/CeraPro-Light.woff)format("woff");font-weight:300;font-style:normal;font-display:swap}@font-face{font-family:Cera Pro;src:url(/fonts/CeraPro-Medium.woff2)format("woff2"),url(/fonts/CeraPro-Medium.woff)format("woff");font-weight:500;font-style:normal;font-display:swap}@font-face{font-family:Cera Pro;src:url(/fonts/CeraPro-Bold.woff2)format("woff2"),url(/fonts/CeraPro-Bold.woff)format("woff");font-weight:700;font-style:normal;font-display:swap}@font-face{font-family:Vasek;src:url(/fonts/Vasek-Italic.woff2)format("woff2"),url(/fonts/Vasek-Italic.woff)format("woff");font-weight:400;font-style:italic;font-display:swap}body{font-family:Cera Pro,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif}'
            }, void 0, false, void 0, this)
        ]
    }, void 0, true);
_c = GlobalStyles;
function HomePage() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [tapsLeft, setTapsLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [logoError, setLogoError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isBalancePressed, setIsBalancePressed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [deviceInfo, setDeviceInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        isIOS: false,
        isMobile: false,
        pixelRatio: 1,
        viewportWidth: 375,
        viewportHeight: 812
    });
    const DAILY_TAP_LIMIT = 100;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            // Определяем устройство и параметры экрана
            const userAgent = navigator.userAgent.toLowerCase();
            const isIOS = /iphone|ipad|ipod/.test(userAgent);
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
            const pixelRatio = window.devicePixelRatio || 1;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            setDeviceInfo({
                isIOS,
                isMobile,
                pixelRatio,
                viewportWidth,
                viewportHeight
            });
            // Устанавливаем размер viewport для Telegram WebApp
            const tg = window.Telegram?.WebApp;
            if (tg) {
                tg.ready();
                tg.expand(); // Разворачиваем приложение на весь экран
                // Отключаем свайп для закрытия
                tg.disableVerticalSwipes();
                // Отключаем bounce эффект на iOS
                if (isIOS) {
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                    document.body.style.height = '100%';
                    document.body.style.overflow = 'hidden';
                }
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
                }).then({
                    "HomePage.useEffect": (response)=>{
                        if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
                        return response.json();
                    }
                }["HomePage.useEffect"]).then({
                    "HomePage.useEffect": (data)=>{
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
                    }
                }["HomePage.useEffect"]).catch({
                    "HomePage.useEffect": (err)=>{
                        console.error("Auth fetch error:", err);
                        setError("Не удалось связаться с сервером.");
                    }
                }["HomePage.useEffect"]).finally({
                    "HomePage.useEffect": ()=>setLoading(false)
                }["HomePage.useEffect"]);
            } else {
                setError("Пожалуйста, откройте приложение в Telegram.");
                setLoading(false);
            }
        }
    }["HomePage.useEffect"], []);
    const handleEarnCrystals = ()=>{
        const tg = window.Telegram?.WebApp;
        if (!user || !tg?.initData || tapsLeft <= 0) return;
        // Добавляем тактильную обратную связь
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
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
    const [tasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 1,
            points: 100,
            title: "Подпишись на Ассист+",
            checkButtonText: "Проверить",
            actionButtonText: "Подписаться",
            action: handleSubscribeToChannel,
            checkAction: {
                "HomePage.useState": ()=>checkTask('subscribe')
            }["HomePage.useState"],
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
            checkAction: {
                "HomePage.useState": ()=>checkTask('vote')
            }["HomePage.useState"],
            isCompleted: user?.tasks_completed?.vote || false
        },
        {
            id: 3,
            points: 500,
            title: "Пригласи друга",
            checkButtonText: "Проверить",
            actionButtonText: "Пригласить",
            action: handleInviteFriend,
            checkAction: {
                "HomePage.useState": ()=>checkTask('invite')
            }["HomePage.useState"],
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "loading-container",
            children: "Загрузка..."
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/page.tsx",
            lineNumber: 393,
            columnNumber: 12
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "error-container",
            children: [
                "Ошибка: ",
                error
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(main)/page.tsx",
            lineNumber: 396,
            columnNumber: 12
        }, this);
    }
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "error-container",
            children: "Не удалось загрузить данные пользователя."
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/page.tsx",
            lineNumber: 399,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GlobalStyles, {}, void 0, false, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 404,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-8322e1bf3099cc3b" + " " + "app-wrapper",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "jsx-8322e1bf3099cc3b" + " " + "main-container",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                                className: "jsx-8322e1bf3099cc3b" + " " + "logo-section",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-8322e1bf3099cc3b" + " " + "logo-container",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8322e1bf3099cc3b" + " " + "logo-wrapper",
                                            children: logoError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8322e1bf3099cc3b" + " " + "logo-text-fallback",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-8322e1bf3099cc3b" + " " + "assist-text",
                                                        children: "АССИСТ"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                        lineNumber: 413,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-8322e1bf3099cc3b" + " " + "plus-text",
                                                        children: "+"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                        lineNumber: 414,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8322e1bf3099cc3b" + " " + "logo-image-container",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        alt: "Ассист+ логотип",
                                                        src: "/svg4122-a7pi.svg",
                                                        onError: ()=>setLogoError(true),
                                                        className: "jsx-8322e1bf3099cc3b" + " " + "logo-image"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                        lineNumber: 418,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        alt: "Плюсик",
                                                        src: "/svg4122-denw.svg",
                                                        className: "jsx-8322e1bf3099cc3b" + " " + "plus-icon"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 417,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 410,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8322e1bf3099cc3b" + " " + "logo-text-container",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-8322e1bf3099cc3b" + " " + "logo-subtitle",
                                                    children: "между поколениями"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                    lineNumber: 434,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-8322e1bf3099cc3b" + " " + "logo-title",
                                                    children: "обмен"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                    lineNumber: 435,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 433,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/page.tsx",
                                    lineNumber: 409,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 408,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "jsx-8322e1bf3099cc3b" + " " + "balance-section",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: handleEarnCrystals,
                                        onMouseDown: ()=>setIsBalancePressed(true),
                                        onMouseUp: ()=>setIsBalancePressed(false),
                                        onMouseLeave: ()=>setIsBalancePressed(false),
                                        onTouchStart: ()=>setIsBalancePressed(true),
                                        onTouchEnd: ()=>setIsBalancePressed(false),
                                        className: "jsx-8322e1bf3099cc3b" + " " + "balance-container",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8322e1bf3099cc3b" + " " + `balance-shadow-box ${isBalancePressed ? 'pressed' : ''}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                alt: "Кристалл",
                                                src: "/images/134.png",
                                                className: "jsx-8322e1bf3099cc3b" + " " + "balance-crystal"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 452,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 451,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/page.tsx",
                                        lineNumber: 442,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-8322e1bf3099cc3b" + " " + "balance-amount",
                                        children: user.balance_crystals
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/page.tsx",
                                        lineNumber: 460,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-8322e1bf3099cc3b" + " " + "balance-description",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-8322e1bf3099cc3b" + " " + "description-text",
                                                children: [
                                                    "Кликай, зарабатывай плюсы, ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                        className: "jsx-8322e1bf3099cc3b"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                        lineNumber: 464,
                                                        columnNumber: 44
                                                    }, this),
                                                    "и меняй их в",
                                                    " "
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 463,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-8322e1bf3099cc3b" + " " + "description-bold",
                                                children: "аукционе знакомств"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 466,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/page.tsx",
                                        lineNumber: 462,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 441,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "jsx-8322e1bf3099cc3b" + " " + "tasks-section",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-8322e1bf3099cc3b" + " " + "tasks-container",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8322e1bf3099cc3b" + " " + "tasks-background",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-8322e1bf3099cc3b" + " " + "tasks-bg-color"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                    lineNumber: 474,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    alt: "Фоновое изображение",
                                                    src: "/svg1642-j9o.svg",
                                                    className: "jsx-8322e1bf3099cc3b" + " " + "tasks-bg-image"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                    lineNumber: 475,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 473,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8322e1bf3099cc3b" + " " + "tasks-header",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "jsx-8322e1bf3099cc3b" + " " + "tasks-title",
                                                children: "Задания"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                lineNumber: 483,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 482,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8322e1bf3099cc3b" + " " + "tasks-list",
                                            children: tasks.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                                    className: "jsx-8322e1bf3099cc3b" + " " + "task-card",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-8322e1bf3099cc3b" + " " + "task-header",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-8322e1bf3099cc3b" + " " + "task-content",
                                                                    children: task.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-8322e1bf3099cc3b" + " " + "task-title",
                                                                        children: [
                                                                            task.title,
                                                                            " ",
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                                                className: "jsx-8322e1bf3099cc3b"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                                                lineNumber: 496,
                                                                                columnNumber: 42
                                                                            }, this),
                                                                            task.description
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                                        lineNumber: 495,
                                                                        columnNumber: 27
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-8322e1bf3099cc3b" + " " + "task-title",
                                                                        children: task.title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                                        lineNumber: 500,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                                    lineNumber: 493,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-8322e1bf3099cc3b" + " " + "task-points",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-8322e1bf3099cc3b" + " " + "points-text",
                                                                            children: [
                                                                                "+",
                                                                                task.points
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/(main)/page.tsx",
                                                                            lineNumber: 505,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-8322e1bf3099cc3b" + " " + "points-icon",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                src: "/vector4120-sezw.svg",
                                                                                alt: "Кристалл",
                                                                                className: "jsx-8322e1bf3099cc3b" + " " + "points-crystal"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(main)/page.tsx",
                                                                                lineNumber: 507,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(main)/page.tsx",
                                                                            lineNumber: 506,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                                    lineNumber: 504,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(main)/page.tsx",
                                                            lineNumber: 492,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-8322e1bf3099cc3b" + " " + "task-actions",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>handleTaskAction(task.id, "check"),
                                                                    className: "jsx-8322e1bf3099cc3b" + " " + "task-button check-button",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-8322e1bf3099cc3b" + " " + "button-text",
                                                                        children: task.checkButtonText
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                                        lineNumber: 521,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                                    lineNumber: 517,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>handleTaskAction(task.id, "action"),
                                                                    className: "jsx-8322e1bf3099cc3b" + " " + "task-button action-button",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-8322e1bf3099cc3b" + " " + "button-text bold",
                                                                        children: task.actionButtonText
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(main)/page.tsx",
                                                                        lineNumber: 528,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                                    lineNumber: 524,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(main)/page.tsx",
                                                            lineNumber: 516,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-8322e1bf3099cc3b" + " " + "task-glow"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/page.tsx",
                                                            lineNumber: 532,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, task.id, true, {
                                                    fileName: "[project]/src/app/(main)/page.tsx",
                                                    lineNumber: 488,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/page.tsx",
                                            lineNumber: 486,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/page.tsx",
                                    lineNumber: 472,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 471,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 406,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BottomNavBar, {}, void 0, false, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 541,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        id: "8322e1bf3099cc3b",
                        children: ".app-wrapper.jsx-8322e1bf3099cc3b{min-height:100vh;background-color:#fff;width:100%;max-width:100vw;min-height:-webkit-fill-available;position:relative;overflow-x:hidden}.main-container.jsx-8322e1bf3099cc3b{width:100%;min-height:100vh;box-sizing:border-box;background-color:#fff;flex-direction:column;align-items:center;gap:8px;min-height:-webkit-fill-available;padding:25px 0 70px;display:flex;overflow:auto}.logo-section.jsx-8322e1bf3099cc3b{flex-direction:column;align-self:stretch;align-items:center;gap:6px;display:flex}.logo-container.jsx-8322e1bf3099cc3b{flex-direction:column;align-items:flex-start;width:173px;height:66px;display:flex;position:relative}.logo-wrapper.jsx-8322e1bf3099cc3b{width:160px;height:38px;margin-left:10px;position:relative}.logo-image-container.jsx-8322e1bf3099cc3b{width:100%;height:100%;position:relative}.logo-image.jsx-8322e1bf3099cc3b{object-fit:contain;-webkit-backface-visibility:hidden;width:100%;height:100%;transform:translateZ(0)}.plus-icon.jsx-8322e1bf3099cc3b{object-fit:contain;-webkit-backface-visibility:hidden;width:19px;height:19px;position:absolute;top:-12px;right:-12px;transform:translateZ(0)}.logo-text-fallback.jsx-8322e1bf3099cc3b{justify-content:center;align-items:center;width:100%;height:100%;display:flex;position:relative}.assist-text.jsx-8322e1bf3099cc3b{color:#000;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:19px;font-weight:700}.plus-text.jsx-8322e1bf3099cc3b{color:red;margin-left:2px;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:19px;font-weight:700}.logo-text-container.jsx-8322e1bf3099cc3b{width:176px;height:27px;margin-top:1px;margin-left:-2px;position:relative}.logo-subtitle.jsx-8322e1bf3099cc3b{text-align:center;color:#000;letter-spacing:-1px;white-space:nowrap;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:400;line-height:11.7px;position:absolute;top:12px;left:calc(50% - 36px)}.logo-title.jsx-8322e1bf3099cc3b{color:#000;text-align:center;height:auto;font-family:Vasek,Georgia,serif;font-size:38px;font-style:italic;font-weight:400;line-height:81%;position:absolute}.balance-section.jsx-8322e1bf3099cc3b{flex-direction:column;align-self:stretch;align-items:center;gap:15px;padding:5px 0 12px;display:flex}.balance-container.jsx-8322e1bf3099cc3b{cursor:pointer;-webkit-tap-highlight-color:transparent;width:114px;height:114px;margin-top:-6px;position:relative}.balance-shadow-box.jsx-8322e1bf3099cc3b{background:linear-gradient(144deg,#d9d9d9 0%,#cdcdcd 100%);border-radius:24px;justify-content:center;align-items:center;width:114px;height:114px;transition:transform .1s ease-in-out;display:flex;position:absolute;top:0;left:0;box-shadow:4px 4px 8px #00000040,inset 3px 3px 8px #fff,inset -3px -4px 16px #0000004d}.balance-shadow-box.pressed.jsx-8322e1bf3099cc3b{transform:scale(.98)}.balance-crystal.jsx-8322e1bf3099cc3b{object-fit:contain;-webkit-backface-visibility:hidden;width:62px;height:58px;transform:translateZ(0)}.balance-amount.jsx-8322e1bf3099cc3b{color:#000;letter-spacing:-.6px;background:#fffc;border:1px solid #b4b4b4;border-radius:20px;margin-top:-5px;padding:6px 12px;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:20px;font-weight:700;line-height:16.2px}.balance-description.jsx-8322e1bf3099cc3b{text-align:center;color:#000;letter-spacing:-.34px;width:202px;margin:0;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:400;line-height:12.3px}.description-text.jsx-8322e1bf3099cc3b{letter-spacing:-.05px}.description-bold.jsx-8322e1bf3099cc3b{letter-spacing:-.05px;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-weight:700}.tasks-section.jsx-8322e1bf3099cc3b{flex-direction:column;align-self:stretch;align-items:center;gap:6px;width:100%;display:flex}.tasks-container.jsx-8322e1bf3099cc3b{flex-direction:column;align-items:center;gap:16px;width:100vw;margin-left:-16px;margin-right:-16px;padding:28px 0 12px;display:flex;position:relative;overflow:hidden}.tasks-background.jsx-8322e1bf3099cc3b{width:100%;height:100%;position:absolute;top:0;bottom:0;left:0}.tasks-bg-color.jsx-8322e1bf3099cc3b{background-color:#eaeaea;width:100%;height:100%;position:absolute;top:73px;left:0}.tasks-bg-image.jsx-8322e1bf3099cc3b{object-fit:cover;width:100%;max-width:100vw;height:253px;position:absolute;top:0;left:50%;transform:translate(-50%)}.tasks-header.jsx-8322e1bf3099cc3b{z-index:1;justify-content:flex-end;align-items:center;gap:6px;width:100%;max-width:100vw;padding:4px 19px 0 0;display:flex}.tasks-title.jsx-8322e1bf3099cc3b{text-align:right;color:#000;letter-spacing:-.77px;white-space:nowrap;margin:0;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:26px;font-weight:700;line-height:28px}.tasks-list.jsx-8322e1bf3099cc3b{z-index:1;box-sizing:border-box;flex-direction:column;align-items:center;gap:8px;width:100%;padding:0 16px;display:inline-flex}.task-card.jsx-8322e1bf3099cc3b{background:linear-gradient(244deg,#f23939 0%,#db1b1b 100%);border-radius:24px;flex-direction:column;align-items:flex-start;gap:4px;width:100%;max-width:calc(100vw - 32px);padding:16px;display:flex;position:relative;overflow:hidden}.task-header.jsx-8322e1bf3099cc3b{justify-content:space-between;align-items:flex-start;gap:8px;width:100%;display:flex}.task-content.jsx-8322e1bf3099cc3b{flex-direction:column;flex:1;justify-content:center;align-items:flex-start;display:flex}.task-title.jsx-8322e1bf3099cc3b{text-align:left;color:#fff;letter-spacing:-.32px;margin:0;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:16px;font-weight:500;line-height:16px}.task-points.jsx-8322e1bf3099cc3b{flex-shrink:0;align-items:center;gap:8px;display:inline-flex}.points-text.jsx-8322e1bf3099cc3b{color:#fff;white-space:nowrap;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:19px;font-weight:700;line-height:19px}.points-icon.jsx-8322e1bf3099cc3b{background:#fff;border-radius:10px;justify-content:center;align-items:center;width:20px;height:20px;display:flex}.points-crystal.jsx-8322e1bf3099cc3b{object-fit:contain;width:12px;height:12px}.task-actions.jsx-8322e1bf3099cc3b{justify-content:flex-end;align-items:flex-start;gap:8px;width:100%;padding-top:8px;display:flex}.task-button.jsx-8322e1bf3099cc3b{cursor:pointer;-webkit-tap-highlight-color:transparent;background:#fff;border:none;border-radius:24px;flex-direction:column;justify-content:center;align-items:center;padding:8px 11px;transition:transform .1s ease-in-out;display:inline-flex}.task-button.jsx-8322e1bf3099cc3b:active{transform:scale(.98)}.button-text.jsx-8322e1bf3099cc3b{color:#0d0d0d;letter-spacing:-.64px;white-space:nowrap;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;font-weight:300;line-height:13px}.button-text.bold.jsx-8322e1bf3099cc3b{font-weight:500}.task-glow.jsx-8322e1bf3099cc3b{filter:blur(100px);pointer-events:none;background:#fffc;border-radius:48.5px;width:97px;height:97px;position:absolute;top:-35px;right:13px}.loading-container.jsx-8322e1bf3099cc3b,.error-container.jsx-8322e1bf3099cc3b{height:100vh;background-color:#fff;justify-content:center;align-items:center;height:-webkit-fill-available;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;display:flex}.loading-container.jsx-8322e1bf3099cc3b{color:#666}.error-container.jsx-8322e1bf3099cc3b{color:red;text-align:center;padding:20px}@media (width<=375px){.main-container.jsx-8322e1bf3099cc3b{padding:20px 0 0}.task-card.jsx-8322e1bf3099cc3b{padding:13px}.task-title.jsx-8322e1bf3099cc3b{font-size:14px}.points-text.jsx-8322e1bf3099cc3b{font-size:18px}}@media (-webkit-device-pixel-ratio>=2),(resolution>=192dpi){.logo-image.jsx-8322e1bf3099cc3b,.plus-icon.jsx-8322e1bf3099cc3b,.balance-crystal.jsx-8322e1bf3099cc3b,.points-crystal.jsx-8322e1bf3099cc3b,.tasks-bg-image.jsx-8322e1bf3099cc3b{image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges}}@supports (-webkit-touch-callout:none){.app-wrapper.jsx-8322e1bf3099cc3b,.main-container.jsx-8322e1bf3099cc3b{min-height:-webkit-fill-available}}"
                    }, void 0, false, void 0, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 405,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(HomePage, "Tls2LC2iuJTtEoGJ4gSPwldlTmk=");
_c1 = HomePage;
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
                    width: "23.89px",
                    height: "20.46px"
                };
            case "shop":
                return {
                    width: "22.4px",
                    height: "22.4px"
                };
            case "friends":
                return {
                    width: "22.4px",
                    height: "20.8px"
                };
            case "profile":
                return {
                    width: "22.63px",
                    height: "22.63px"
                };
            default:
                return {
                    width: "22.4px",
                    height: "19.2px"
                };
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "jsx-6e692d0a0d237cbe" + " " + "bottom-nav",
        children: [
            navItems.map((item)=>{
                const iconSize = getIconSize(item.id);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: item.href,
                    onClick: handlePress,
                    "aria-label": item.label,
                    className: "jsx-6e692d0a0d237cbe" + " " + "nav-item",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            style: {
                                ...iconSize,
                                objectFit: 'contain'
                            },
                            alt: item.label,
                            src: item.icon,
                            className: "jsx-6e692d0a0d237cbe"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/page.tsx",
                            lineNumber: 1096,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-6e692d0a0d237cbe" + " " + "nav-label",
                            children: item.label
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/page.tsx",
                            lineNumber: 1104,
                            columnNumber: 13
                        }, this)
                    ]
                }, item.id, true, {
                    fileName: "[project]/src/app/(main)/page.tsx",
                    lineNumber: 1089,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "6e692d0a0d237cbe",
                children: ".bottom-nav.jsx-6e692d0a0d237cbe{z-index:1000;box-sizing:border-box;background-color:#262626;border-radius:15px 15px 0 0;justify-content:space-between;align-items:center;height:80px;padding:8px 25px;display:flex;position:fixed;bottom:0;left:0;right:0;overflow:hidden;box-shadow:0 -2px 10px #0000001a}.nav-item.jsx-6e692d0a0d237cbe{-webkit-tap-highlight-color:transparent;flex-direction:column;justify-content:center;align-items:center;gap:6px;width:53px;height:100%;text-decoration:none;transition:opacity .2s;display:flex}.nav-item.jsx-6e692d0a0d237cbe:hover{opacity:.8}.nav-label.jsx-6e692d0a0d237cbe{text-align:center;color:#868686;letter-spacing:-.34px;font-family:Cera Pro,-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:500;line-height:9px}.nav-item.active.jsx-6e692d0a0d237cbe .nav-label.jsx-6e692d0a0d237cbe{color:#fff}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/page.tsx",
        lineNumber: 1084,
        columnNumber: 5
    }, this);
}
_c2 = BottomNavBar;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "GlobalStyles");
__turbopack_context__.k.register(_c1, "HomePage");
__turbopack_context__.k.register(_c2, "BottomNavBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/node_modules/next/dist/compiled/client-only/index.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[project]/node_modules/styled-jsx/dist/index/index.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
__turbopack_context__.r("[project]/node_modules/next/dist/compiled/client-only/index.js [app-client] (ecmascript)");
var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : {
        'default': e
    };
}
var React__default = /*#__PURE__*/ _interopDefaultLegacy(React);
/*
Based on Glamor's sheet
https://github.com/threepointone/glamor/blob/667b480d31b3721a905021b26e1290ce92ca2879/src/sheet.js
*/ function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
var isProd = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] !== "undefined" && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env && ("TURBOPACK compile-time value", "development") === "production";
var isString = function(o) {
    return Object.prototype.toString.call(o) === "[object String]";
};
var StyleSheet = /*#__PURE__*/ function() {
    function StyleSheet(param) {
        var ref = param === void 0 ? {} : param, _name = ref.name, name = _name === void 0 ? "stylesheet" : _name, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? isProd : _optimizeForSpeed;
        invariant$1(isString(name), "`name` must be a string");
        this._name = name;
        this._deletedRulePlaceholder = "#" + name + "-deleted-rule____{}";
        invariant$1(typeof optimizeForSpeed === "boolean", "`optimizeForSpeed` must be a boolean");
        this._optimizeForSpeed = optimizeForSpeed;
        this._serverSheet = undefined;
        this._tags = [];
        this._injected = false;
        this._rulesCount = 0;
        var node = typeof window !== "undefined" && document.querySelector('meta[property="csp-nonce"]');
        this._nonce = node ? node.getAttribute("content") : null;
    }
    var _proto = StyleSheet.prototype;
    _proto.setOptimizeForSpeed = function setOptimizeForSpeed(bool) {
        invariant$1(typeof bool === "boolean", "`setOptimizeForSpeed` accepts a boolean");
        invariant$1(this._rulesCount === 0, "optimizeForSpeed cannot be when rules have already been inserted");
        this.flush();
        this._optimizeForSpeed = bool;
        this.inject();
    };
    _proto.isOptimizeForSpeed = function isOptimizeForSpeed() {
        return this._optimizeForSpeed;
    };
    _proto.inject = function inject() {
        var _this = this;
        invariant$1(!this._injected, "sheet already injected");
        this._injected = true;
        if (typeof window !== "undefined" && this._optimizeForSpeed) {
            this._tags[0] = this.makeStyleTag(this._name);
            this._optimizeForSpeed = "insertRule" in this.getSheet();
            if (!this._optimizeForSpeed) {
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn("StyleSheet: optimizeForSpeed mode not supported falling back to standard mode.");
                }
                this.flush();
                this._injected = true;
            }
            return;
        }
        this._serverSheet = {
            cssRules: [],
            insertRule: function(rule, index) {
                if (typeof index === "number") {
                    _this._serverSheet.cssRules[index] = {
                        cssText: rule
                    };
                } else {
                    _this._serverSheet.cssRules.push({
                        cssText: rule
                    });
                }
                return index;
            },
            deleteRule: function(index) {
                _this._serverSheet.cssRules[index] = null;
            }
        };
    };
    _proto.getSheetForTag = function getSheetForTag(tag) {
        if (tag.sheet) {
            return tag.sheet;
        }
        // this weirdness brought to you by firefox
        for(var i = 0; i < document.styleSheets.length; i++){
            if (document.styleSheets[i].ownerNode === tag) {
                return document.styleSheets[i];
            }
        }
    };
    _proto.getSheet = function getSheet() {
        return this.getSheetForTag(this._tags[this._tags.length - 1]);
    };
    _proto.insertRule = function insertRule(rule, index) {
        invariant$1(isString(rule), "`insertRule` accepts only strings");
        if (typeof window === "undefined") {
            if (typeof index !== "number") {
                index = this._serverSheet.cssRules.length;
            }
            this._serverSheet.insertRule(rule, index);
            return this._rulesCount++;
        }
        if (this._optimizeForSpeed) {
            var sheet = this.getSheet();
            if (typeof index !== "number") {
                index = sheet.cssRules.length;
            }
            // this weirdness for perf, and chrome's weird bug
            // https://stackoverflow.com/questions/20007992/chrome-suddenly-stopped-accepting-insertrule
            try {
                sheet.insertRule(rule, index);
            } catch (error) {
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn("StyleSheet: illegal rule: \n\n" + rule + "\n\nSee https://stackoverflow.com/q/20007992 for more info");
                }
                return -1;
            }
        } else {
            var insertionPoint = this._tags[index];
            this._tags.push(this.makeStyleTag(this._name, rule, insertionPoint));
        }
        return this._rulesCount++;
    };
    _proto.replaceRule = function replaceRule(index, rule) {
        if (this._optimizeForSpeed || typeof window === "undefined") {
            var sheet = typeof window !== "undefined" ? this.getSheet() : this._serverSheet;
            if (!rule.trim()) {
                rule = this._deletedRulePlaceholder;
            }
            if (!sheet.cssRules[index]) {
                // @TBD Should we throw an error?
                return index;
            }
            sheet.deleteRule(index);
            try {
                sheet.insertRule(rule, index);
            } catch (error) {
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn("StyleSheet: illegal rule: \n\n" + rule + "\n\nSee https://stackoverflow.com/q/20007992 for more info");
                }
                // In order to preserve the indices we insert a deleteRulePlaceholder
                sheet.insertRule(this._deletedRulePlaceholder, index);
            }
        } else {
            var tag = this._tags[index];
            invariant$1(tag, "old rule at index `" + index + "` not found");
            tag.textContent = rule;
        }
        return index;
    };
    _proto.deleteRule = function deleteRule(index) {
        if (typeof window === "undefined") {
            this._serverSheet.deleteRule(index);
            return;
        }
        if (this._optimizeForSpeed) {
            this.replaceRule(index, "");
        } else {
            var tag = this._tags[index];
            invariant$1(tag, "rule at index `" + index + "` not found");
            tag.parentNode.removeChild(tag);
            this._tags[index] = null;
        }
    };
    _proto.flush = function flush() {
        this._injected = false;
        this._rulesCount = 0;
        if (typeof window !== "undefined") {
            this._tags.forEach(function(tag) {
                return tag && tag.parentNode.removeChild(tag);
            });
            this._tags = [];
        } else {
            // simpler on server
            this._serverSheet.cssRules = [];
        }
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        if (typeof window === "undefined") {
            return this._serverSheet.cssRules;
        }
        return this._tags.reduce(function(rules, tag) {
            if (tag) {
                rules = rules.concat(Array.prototype.map.call(_this.getSheetForTag(tag).cssRules, function(rule) {
                    return rule.cssText === _this._deletedRulePlaceholder ? null : rule;
                }));
            } else {
                rules.push(null);
            }
            return rules;
        }, []);
    };
    _proto.makeStyleTag = function makeStyleTag(name, cssString, relativeToTag) {
        if (cssString) {
            invariant$1(isString(cssString), "makeStyleTag accepts only strings as second parameter");
        }
        var tag = document.createElement("style");
        if (this._nonce) tag.setAttribute("nonce", this._nonce);
        tag.type = "text/css";
        tag.setAttribute("data-" + name, "");
        if (cssString) {
            tag.appendChild(document.createTextNode(cssString));
        }
        var head = document.head || document.getElementsByTagName("head")[0];
        if (relativeToTag) {
            head.insertBefore(tag, relativeToTag);
        } else {
            head.appendChild(tag);
        }
        return tag;
    };
    _createClass(StyleSheet, [
        {
            key: "length",
            get: function get() {
                return this._rulesCount;
            }
        }
    ]);
    return StyleSheet;
}();
function invariant$1(condition, message) {
    if (!condition) {
        throw new Error("StyleSheet: " + message + ".");
    }
}
function hash(str) {
    var _$hash = 5381, i = str.length;
    while(i){
        _$hash = _$hash * 33 ^ str.charCodeAt(--i);
    }
    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */ return _$hash >>> 0;
}
var stringHash = hash;
var sanitize = function(rule) {
    return rule.replace(/\/style/gi, "\\/style");
};
var cache = {};
/**
 * computeId
 *
 * Compute and memoize a jsx id from a basedId and optionally props.
 */ function computeId(baseId, props) {
    if (!props) {
        return "jsx-" + baseId;
    }
    var propsToString = String(props);
    var key = baseId + propsToString;
    if (!cache[key]) {
        cache[key] = "jsx-" + stringHash(baseId + "-" + propsToString);
    }
    return cache[key];
}
/**
 * computeSelector
 *
 * Compute and memoize dynamic selectors.
 */ function computeSelector(id, css) {
    var selectoPlaceholderRegexp = /__jsx-style-dynamic-selector/g;
    // Sanitize SSR-ed CSS.
    // Client side code doesn't need to be sanitized since we use
    // document.createTextNode (dev) and the CSSOM api sheet.insertRule (prod).
    if (typeof window === "undefined") {
        css = sanitize(css);
    }
    var idcss = id + css;
    if (!cache[idcss]) {
        cache[idcss] = css.replace(selectoPlaceholderRegexp, id);
    }
    return cache[idcss];
}
function mapRulesToStyle(cssRules, options) {
    if (options === void 0) options = {};
    return cssRules.map(function(args) {
        var id = args[0];
        var css = args[1];
        return /*#__PURE__*/ React__default["default"].createElement("style", {
            id: "__" + id,
            // Avoid warnings upon render with a key
            key: "__" + id,
            nonce: options.nonce ? options.nonce : undefined,
            dangerouslySetInnerHTML: {
                __html: css
            }
        });
    });
}
var StyleSheetRegistry = /*#__PURE__*/ function() {
    function StyleSheetRegistry(param) {
        var ref = param === void 0 ? {} : param, _styleSheet = ref.styleSheet, styleSheet = _styleSheet === void 0 ? null : _styleSheet, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? false : _optimizeForSpeed;
        this._sheet = styleSheet || new StyleSheet({
            name: "styled-jsx",
            optimizeForSpeed: optimizeForSpeed
        });
        this._sheet.inject();
        if (styleSheet && typeof optimizeForSpeed === "boolean") {
            this._sheet.setOptimizeForSpeed(optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    }
    var _proto = StyleSheetRegistry.prototype;
    _proto.add = function add(props) {
        var _this = this;
        if (undefined === this._optimizeForSpeed) {
            this._optimizeForSpeed = Array.isArray(props.children);
            this._sheet.setOptimizeForSpeed(this._optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        if (typeof window !== "undefined" && !this._fromServer) {
            this._fromServer = this.selectFromServer();
            this._instancesCounts = Object.keys(this._fromServer).reduce(function(acc, tagName) {
                acc[tagName] = 0;
                return acc;
            }, {});
        }
        var ref = this.getIdAndRules(props), styleId = ref.styleId, rules = ref.rules;
        // Deduping: just increase the instances count.
        if (styleId in this._instancesCounts) {
            this._instancesCounts[styleId] += 1;
            return;
        }
        var indices = rules.map(function(rule) {
            return _this._sheet.insertRule(rule);
        }) // Filter out invalid rules
        .filter(function(index) {
            return index !== -1;
        });
        this._indices[styleId] = indices;
        this._instancesCounts[styleId] = 1;
    };
    _proto.remove = function remove(props) {
        var _this = this;
        var styleId = this.getIdAndRules(props).styleId;
        invariant(styleId in this._instancesCounts, "styleId: `" + styleId + "` not found");
        this._instancesCounts[styleId] -= 1;
        if (this._instancesCounts[styleId] < 1) {
            var tagFromServer = this._fromServer && this._fromServer[styleId];
            if (tagFromServer) {
                tagFromServer.parentNode.removeChild(tagFromServer);
                delete this._fromServer[styleId];
            } else {
                this._indices[styleId].forEach(function(index) {
                    return _this._sheet.deleteRule(index);
                });
                delete this._indices[styleId];
            }
            delete this._instancesCounts[styleId];
        }
    };
    _proto.update = function update(props, nextProps) {
        this.add(nextProps);
        this.remove(props);
    };
    _proto.flush = function flush() {
        this._sheet.flush();
        this._sheet.inject();
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        var fromServer = this._fromServer ? Object.keys(this._fromServer).map(function(styleId) {
            return [
                styleId,
                _this._fromServer[styleId]
            ];
        }) : [];
        var cssRules = this._sheet.cssRules();
        return fromServer.concat(Object.keys(this._indices).map(function(styleId) {
            return [
                styleId,
                _this._indices[styleId].map(function(index) {
                    return cssRules[index].cssText;
                }).join(_this._optimizeForSpeed ? "" : "\n")
            ];
        }) // filter out empty rules
        .filter(function(rule) {
            return Boolean(rule[1]);
        }));
    };
    _proto.styles = function styles(options) {
        return mapRulesToStyle(this.cssRules(), options);
    };
    _proto.getIdAndRules = function getIdAndRules(props) {
        var css = props.children, dynamic = props.dynamic, id = props.id;
        if (dynamic) {
            var styleId = computeId(id, dynamic);
            return {
                styleId: styleId,
                rules: Array.isArray(css) ? css.map(function(rule) {
                    return computeSelector(styleId, rule);
                }) : [
                    computeSelector(styleId, css)
                ]
            };
        }
        return {
            styleId: computeId(id),
            rules: Array.isArray(css) ? css : [
                css
            ]
        };
    };
    /**
   * selectFromServer
   *
   * Collects style tags from the document with id __jsx-XXX
   */ _proto.selectFromServer = function selectFromServer() {
        var elements = Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]'));
        return elements.reduce(function(acc, element) {
            var id = element.id.slice(2);
            acc[id] = element;
            return acc;
        }, {});
    };
    return StyleSheetRegistry;
}();
function invariant(condition, message) {
    if (!condition) {
        throw new Error("StyleSheetRegistry: " + message + ".");
    }
}
var StyleSheetContext = /*#__PURE__*/ React.createContext(null);
StyleSheetContext.displayName = "StyleSheetContext";
function createStyleRegistry() {
    return new StyleSheetRegistry();
}
function StyleRegistry(param) {
    var configuredRegistry = param.registry, children = param.children;
    var rootRegistry = React.useContext(StyleSheetContext);
    var ref = React.useState({
        "StyleRegistry.useState[ref]": function() {
            return rootRegistry || configuredRegistry || createStyleRegistry();
        }
    }["StyleRegistry.useState[ref]"]), registry = ref[0];
    return /*#__PURE__*/ React__default["default"].createElement(StyleSheetContext.Provider, {
        value: registry
    }, children);
}
function useStyleRegistry() {
    return React.useContext(StyleSheetContext);
}
// Opt-into the new `useInsertionEffect` API in React 18, fallback to `useLayoutEffect`.
// https://github.com/reactwg/react-18/discussions/110
var useInsertionEffect = React__default["default"].useInsertionEffect || React__default["default"].useLayoutEffect;
var defaultRegistry = typeof window !== "undefined" ? createStyleRegistry() : undefined;
function JSXStyle(props) {
    var registry = defaultRegistry ? defaultRegistry : useStyleRegistry();
    // If `registry` does not exist, we do nothing here.
    if (!registry) {
        return null;
    }
    if (typeof window === "undefined") {
        registry.add(props);
        return null;
    }
    useInsertionEffect({
        "JSXStyle.useInsertionEffect": function() {
            registry.add(props);
            return ({
                "JSXStyle.useInsertionEffect": function() {
                    registry.remove(props);
                }
            })["JSXStyle.useInsertionEffect"];
        // props.children can be string[], will be striped since id is identical
        }
    }["JSXStyle.useInsertionEffect"], [
        props.id,
        String(props.dynamic)
    ]);
    return null;
}
JSXStyle.dynamic = function(info) {
    return info.map(function(tagInfo) {
        var baseId = tagInfo[0];
        var props = tagInfo[1];
        return computeId(baseId, props);
    }).join(" ");
};
exports.StyleRegistry = StyleRegistry;
exports.createStyleRegistry = createStyleRegistry;
exports.style = JSXStyle;
exports.useStyleRegistry = useStyleRegistry;
}}),
"[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/styled-jsx/dist/index/index.js [app-client] (ecmascript)").style;
}}),
}]);

//# sourceMappingURL=_531e503e._.js.map