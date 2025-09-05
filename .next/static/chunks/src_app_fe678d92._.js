(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/components/SlotMachine.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>SlotMachine)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const shuffle = (array)=>{
    const newArray = [
        ...array
    ];
    for(let i = newArray.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [
            newArray[j],
            newArray[i]
        ];
    }
    return newArray;
};
const REEL_ITEM_HEIGHT = 160;
const IMAGE_SIZE = 112;
const ANIMATION_DURATION = 5000;
function SlotMachine({ prizes, winningPrize, onSpinEnd }) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [containerHeight, setContainerHeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [reelItems, setReelItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [transform, setTransform] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('translateY(0px)');
    const timeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "SlotMachine.useLayoutEffect": ()=>{
            if (containerRef.current) {
                setContainerHeight(containerRef.current.offsetHeight);
            }
        }
    }["SlotMachine.useLayoutEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SlotMachine.useEffect": ()=>{
            if (winningPrize && containerHeight > 0) {
                const newReel = Array.from({
                    length: 10
                }, {
                    "SlotMachine.useEffect.newReel": ()=>shuffle(prizes)
                }["SlotMachine.useEffect.newReel"]).flat();
                const winningIndex = newReel.length - prizes.length * 2;
                newReel[winningIndex] = winningPrize;
                setReelItems(newReel);
                const finalPosition = containerHeight / 2 - winningIndex * REEL_ITEM_HEIGHT - REEL_ITEM_HEIGHT / 2;
                requestAnimationFrame({
                    "SlotMachine.useEffect": ()=>{
                        setTransform(`translateY(${finalPosition}px)`);
                    }
                }["SlotMachine.useEffect"]);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(onSpinEnd, ANIMATION_DURATION);
            } else {
                const initialReel = Array.from({
                    length: 10
                }, {
                    "SlotMachine.useEffect.initialReel": ()=>shuffle(prizes)
                }["SlotMachine.useEffect.initialReel"]).flat();
                setReelItems(initialReel);
            }
            return ({
                "SlotMachine.useEffect": ()=>{
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }
            })["SlotMachine.useEffect"];
        }
    }["SlotMachine.useEffect"], [
        winningPrize,
        containerHeight
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative w-full h-full overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 left-0 w-full",
                style: {
                    transform: transform,
                    transition: transform !== 'translateY(0px)' ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)` : 'none'
                },
                children: reelItems.map((prize, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full flex flex-col items-center justify-center p-2",
                        style: {
                            height: REEL_ITEM_HEIGHT
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                src: prize.icon,
                                alt: prize.name,
                                width: IMAGE_SIZE,
                                height: IMAGE_SIZE,
                                className: "object-contain",
                                priority: true
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/SlotMachine.tsx",
                                lineNumber: 84,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-base text-gray-800 font-bold text-center",
                                children: prize.name
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/SlotMachine.tsx",
                                lineNumber: 92,
                                columnNumber: 25
                            }, this)
                        ]
                    }, `${prize.name}-${index}`, true, {
                        fileName: "[project]/src/app/components/SlotMachine.tsx",
                        lineNumber: 79,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/components/SlotMachine.tsx",
                lineNumber: 69,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/components/SlotMachine.tsx",
                lineNumber: 98,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/components/SlotMachine.tsx",
                lineNumber: 99,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-1/2 left-4 right-4 h-0.5 bg-red-500/80 z-20 -translate-y-1/2 rounded-full"
            }, void 0, false, {
                fileName: "[project]/src/app/components/SlotMachine.tsx",
                lineNumber: 100,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/SlotMachine.tsx",
        lineNumber: 68,
        columnNumber: 9
    }, this);
}
_s(SlotMachine, "5bjwclgjGYwfe90QF+f2AkkX9yY=");
_c = SlotMachine;
var _c;
__turbopack_context__.k.register(_c, "SlotMachine");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/cases/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>CasesPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$SlotMachine$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/SlotMachine.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const ALL_PRIZES = [
    {
        name: 'Чек-лист',
        icon: '/images/checklist.png'
    },
    ...Array.from({
        length: 9
    }, (_, i)=>({
            name: `Подарок ${i + 1}`,
            icon: '/images/gift.png'
        }))
];
function CasesPage() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSpinning, setIsSpinning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [winningPrize, setWinningPrize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [spinKey, setSpinKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CasesPage.useEffect": ()=>{
            const tg = window.Telegram?.WebApp;
            if (!tg) {
                setError("Telegram WebApp не найден. Откройте приложение в Telegram.");
                setIsLoading(false);
                return;
            }
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
                "CasesPage.useEffect": (res)=>res.ok ? res.json() : Promise.reject('Ошибка при загрузке профиля.')
            }["CasesPage.useEffect"]).then({
                "CasesPage.useEffect": (data)=>{
                    if (data.error) throw new Error(data.error);
                    setUser(data);
                }
            }["CasesPage.useEffect"]).catch({
                "CasesPage.useEffect": (err)=>setError(err instanceof Error ? err.message : "Не удалось связаться с сервером.")
            }["CasesPage.useEffect"]).finally({
                "CasesPage.useEffect": ()=>setIsLoading(false)
            }["CasesPage.useEffect"]);
        }
    }["CasesPage.useEffect"], []);
    const handleSpin = async ()=>{
        if (isSpinning || !user || user.cases_to_open < 1) return;
        setSpinKey((prevKey)=>prevKey + 1);
        setIsSpinning(true);
        setError('');
        setWinningPrize(null);
        try {
            window.Telegram?.WebApp?.HapticFeedback.impactOccurred('light');
            const response = await fetch('/api/cases/open', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    initData: window.Telegram?.WebApp.initData
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Ошибка при открытии кейса');
            const wonPrize = ALL_PRIZES.find((p)=>p.name === result.prizeName);
            if (wonPrize) {
                setUser((prev)=>prev ? {
                        ...prev,
                        cases_to_open: prev.cases_to_open - 1
                    } : null);
                setWinningPrize(wonPrize);
            } else {
                throw new Error('Получен неизвестный приз от сервера.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            setIsSpinning(false);
            window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('error');
        }
    };
    const handleSpinEnd = ()=>{
        if (winningPrize) {
            window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
            window.Telegram?.WebApp.showAlert(`Поздравляем! Вы выиграли: ${winningPrize.name}`);
        }
        setIsSpinning(false);
    };
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 flex items-center justify-center bg-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Загрузка..."
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/cases/page.tsx",
                lineNumber: 91,
                columnNumber: 89
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/cases/page.tsx",
            lineNumber: 91,
            columnNumber: 16
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 flex flex-col items-center p-6 pb-28 bg-white z-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-3xl font-bold mb-4 text-black flex-shrink-0",
                children: "Откройте кейс"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/cases/page.tsx",
                lineNumber: 96,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full flex-grow flex flex-col",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$SlotMachine$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    prizes: ALL_PRIZES,
                    winningPrize: winningPrize,
                    onSpinEnd: handleSpinEnd
                }, spinKey, false, {
                    fileName: "[project]/src/app/(main)/cases/page.tsx",
                    lineNumber: 101,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/cases/page.tsx",
                lineNumber: 100,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full mt-auto pt-6 flex-shrink-0",
                children: [
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-red-500 text-center mb-2",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/cases/page.tsx",
                        lineNumber: 110,
                        columnNumber: 27
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSpin,
                        disabled: isSpinning || isLoading || !user || user.cases_to_open < 1,
                        className: "w-full h-16 bg-red-500 text-white font-bold text-lg rounded-2xl transition-transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:scale-100",
                        children: isSpinning ? 'Крутится...' : `Крутить (${user?.cases_to_open || 0} шт.)`
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/cases/page.tsx",
                        lineNumber: 111,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/cases/page.tsx",
                lineNumber: 109,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/cases/page.tsx",
        lineNumber: 95,
        columnNumber: 9
    }, this);
}
_s(CasesPage, "wqhOlDyGTq6QbdmDPasSIDFOYUI=");
_c = CasesPage;
var _c;
__turbopack_context__.k.register(_c, "CasesPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_fe678d92._.js.map