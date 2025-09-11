(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/components/BalanceCard.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>BalanceCard)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const SPARKLE_IMAGE = '/images/one_spark.png';
const CRYSTAL_IMAGE = '/images/134.png';
const ARROW_IMAGE = '/images/picmi2.png';
const random = (min, max)=>Math.floor(Math.random() * (max - min + 1)) + min;
function BalanceCard({ balance, onButtonClick, tapsLeft }) {
    _s();
    const [sparkles, setSparkles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isCoolingDown, setIsCoolingDown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleCrystalClick = ()=>{
        if (isCoolingDown || tapsLeft <= 0) return;
        onButtonClick();
        setIsCoolingDown(true);
        setTimeout(()=>{
            setIsCoolingDown(false);
        }, 50);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BalanceCard.useEffect": ()=>{
            const interval = setInterval({
                "BalanceCard.useEffect.interval": ()=>{
                    const angle = Math.random() * 2 * Math.PI;
                    const maxRadius = 45;
                    const radius = Math.sqrt(Math.random()) * maxRadius;
                    const offsetX = radius * Math.cos(angle);
                    const offsetY = radius * Math.sin(angle);
                    const sparkle = {
                        id: String(Date.now()),
                        top: `calc(50% + ${offsetY}%)`,
                        left: `calc(50% + ${offsetX}%)`,
                        size: random(15, 25),
                        animationDuration: random(2000, 3500)
                    };
                    setSparkles({
                        "BalanceCard.useEffect.interval": (currentSparkles)=>[
                                ...currentSparkles,
                                sparkle
                            ]
                    }["BalanceCard.useEffect.interval"]);
                    setTimeout({
                        "BalanceCard.useEffect.interval": ()=>{
                            setSparkles({
                                "BalanceCard.useEffect.interval": (current)=>current.filter({
                                        "BalanceCard.useEffect.interval": (s)=>s.id !== sparkle.id
                                    }["BalanceCard.useEffect.interval"])
                            }["BalanceCard.useEffect.interval"]);
                        }
                    }["BalanceCard.useEffect.interval"], sparkle.animationDuration);
                }
            }["BalanceCard.useEffect.interval"], 900);
            return ({
                "BalanceCard.useEffect": ()=>clearInterval(interval)
            })["BalanceCard.useEffect"];
        }
    }["BalanceCard.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full bg-white text-white rounded-3xl",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative flex flex-col items-center justify-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative h-50 w-50 flex items-center justify-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleCrystalClick,
                            disabled: tapsLeft <= 0,
                            className: "group rounded-full active:scale-95 transition-transform duration-100 disabled:cursor-not-allowed disabled:opacity-70",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                src: CRYSTAL_IMAGE,
                                alt: "Crystal",
                                width: 200,
                                height: 200,
                                className: "transition-all duration-200",
                                priority: true
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/BalanceCard.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/BalanceCard.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this),
                        sparkles.map(({ id, top, left, size, animationDuration })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: SPARKLE_IMAGE,
                                alt: "",
                                className: "absolute pointer-events-none sparkle-animation invert",
                                style: {
                                    top,
                                    left,
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    animationDuration: `${animationDuration}ms`,
                                    willChange: 'transform, opacity'
                                }
                            }, id, false, {
                                fileName: "[project]/src/app/components/BalanceCard.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/BalanceCard.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-3xl font-bold text-black",
                    children: balance
                }, void 0, false, {
                    fileName: "[project]/src/app/components/BalanceCard.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-[65px] left-1/2 transform translate-x-[35px] pointer-events-none",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        src: ARROW_IMAGE,
                        alt: "Нажми на меня",
                        width: 150,
                        height: 150
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/BalanceCard.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/BalanceCard.tsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/BalanceCard.tsx",
            lineNumber: 64,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/BalanceCard.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
_s(BalanceCard, "/odRHUMr+pVTqsbFQ+fV90Oi1Zg=");
_c = BalanceCard;
var _c;
__turbopack_context__.k.register(_c, "BalanceCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>HomePage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$BalanceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/BalanceCard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function TaskCard({ title, reward, buttonText, checkButtonText, action, checkAction, disabled = false, isCompleted = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${isCompleted ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-2xl flex flex-col w-full`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-extrabold text-sm",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/page.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mt-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center mt-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-bold text-lg",
                                children: [
                                    "+",
                                    reward
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ml-1 h-5 w-5 bg-white",
                                style: {
                                    maskImage: `url('/images/crystal.png')`,
                                    WebkitMaskImage: `url('/images/crystal.png')`,
                                    maskSize: 'contain',
                                    maskRepeat: 'no-repeat'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: action,
                                disabled: disabled || isCompleted,
                                className: "bg-white text-black font-medium py-1 px-2 rounded-full text-xs min-w-[60px] h-8 flex items-center justify-center active:scale-95 disabled:opacity-50",
                                children: buttonText
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: checkAction,
                                disabled: isCompleted,
                                className: "bg-blue-500 text-white font-medium py-1 px-2 rounded-full text-xs min-w-[60px] h-8 flex items-center justify-center active:scale-95 disabled:opacity-50",
                                children: isCompleted ? 'Готово' : checkButtonText
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/page.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c = TaskCard;
function HomePage() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [tapsLeft, setTapsLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const DAILY_TAP_LIMIT = 100;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            const tg = window.Telegram?.WebApp;
            if (tg) {
                tg.ready();
                fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        initData: tg.initData
                    })
                }).then({
                    "HomePage.useEffect": (response)=>{
                        if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
                        return response.json();
                    }
                }["HomePage.useEffect"]).then({
                    "HomePage.useEffect": (data)=>{
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if (data.error) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        if (!tg || !user || !user.id) {
            tg?.showAlert('Не удалось создать ссылку. Пожалуйста, перезагрузите страницу.');
            return;
        }
        const botUsername = ("TURBOPACK compile-time value", "my_auction_admin_bot");
        const botName = ("TURBOPACK compile-time value", "test admin");
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        const referralLink = `https://t.me/${botUsername}/${botName}?startapp=ref_${user.id}`;
        const shareText = `Привет! Присоединяйся к "Ассист+" и получай бонусы. Поможем друг другу найти крутые знакомства и возможности!`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
        tg.openTelegramLink(shareUrl);
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
                        subscribed_to_channel: taskId === 'subscribe' ? true : prev.subscribed_to_channel,
                        voted_for_channel: taskId === 'vote' ? true : prev.voted_for_channel
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
    const tasks = [
        {
            title: 'Подпишись на Ассист+',
            reward: 100,
            buttonText: 'Подписаться',
            checkButtonText: 'Проверить',
            action: handleSubscribeToChannel,
            checkAction: ()=>checkTask('subscribe'),
            isCompleted: user?.subscribed_to_channel
        },
        {
            title: 'Отдай голос на улучшение канала',
            reward: 500,
            buttonText: 'Проголосовать',
            checkButtonText: 'Проверить',
            action: handleVoteForChannel,
            checkAction: ()=>checkTask('vote'),
            isCompleted: user?.voted_for_channel
        },
        {
            title: 'Пригласи друга',
            reward: 500,
            buttonText: 'Пригласить',
            checkButtonText: 'Проверить',
            action: handleInviteFriend,
            checkAction: ()=>checkTask('invite'),
            isCompleted: false // или добавь логику позже
        }
    ];
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center items-center h-screen bg-white text-gray-500",
            children: "Загрузка..."
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/page.tsx",
            lineNumber: 285,
            columnNumber: 12
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-4 text-center text-red-500",
            children: [
                "Ошибка: ",
                error
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(main)/page.tsx",
            lineNumber: 288,
            columnNumber: 12
        }, this);
    }
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-4 text-center text-gray-500",
            children: "Не удалось загрузить данные пользователя."
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/page.tsx",
            lineNumber: 291,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col font-['Unbounded'] items-center text-center text-black bg-white pt-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-6xl font-black mb-2",
                children: [
                    "Ассист",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-red-500",
                        children: "+"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 297,
                        columnNumber: 15
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 296,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-sm px-4 mb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleSubscribeToChannel,
                    className: "w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-2xl text-lg transition-all active:scale-95",
                    children: "Подписаться на канал"
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/page.tsx",
                    lineNumber: 302,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 301,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-sm pb-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$BalanceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    balance: user.balance_crystals,
                    onButtonClick: handleEarnCrystals,
                    tapsLeft: tapsLeft,
                    tapLimit: DAILY_TAP_LIMIT
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/page.tsx",
                    lineNumber: 311,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 310,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-l font-bold pl-4 pr-4 pb-2 max-w-sm",
                children: "Зарабатывай плюсы и меняй их в аукционе знакомств"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 318,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-sm px-4 text-left",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-red-500 font-bold mt-2 text-sm mb-1 ml-2",
                        children: "ЗАДАНИЯ"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 323,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: tasks.map((task, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TaskCard, {
                                ...task
                            }, index, false, {
                                fileName: "[project]/src/app/(main)/page.tsx",
                                lineNumber: 326,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/page.tsx",
                        lineNumber: 324,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/page.tsx",
                lineNumber: 322,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/page.tsx",
        lineNumber: 295,
        columnNumber: 5
    }, this);
}
_s(HomePage, "rBXwBvwnwURHezEpNM22HiNJWgw=");
_c1 = HomePage;
var _c, _c1;
__turbopack_context__.k.register(_c, "TaskCard");
__turbopack_context__.k.register(_c1, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_18ecbd4a._.js.map