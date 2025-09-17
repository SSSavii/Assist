(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/components/TextSlotMachine.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>HorizontalTextSlotMachine)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
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
const REEL_ITEM_WIDTH = 160;
const ANIMATION_DURATION = 3000;
const MIN_SPIN_DISTANCE = 20; // Минимальное количество элементов для прокрутки
function HorizontalTextSlotMachine({ prizes, winningPrize, onSpinEnd }) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [containerWidth, setContainerWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [reelItems, setReelItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [transform, setTransform] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('translateX(0px)');
    const timeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isInitialized, setIsInitialized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const animationRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isSpinningRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "HorizontalTextSlotMachine.useLayoutEffect": ()=>{
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                setContainerWidth(width);
                // Инициализируем начальные значения
                const initialReel = Array.from({
                    length: 10
                }, {
                    "HorizontalTextSlotMachine.useLayoutEffect.initialReel": ()=>shuffle(prizes)
                }["HorizontalTextSlotMachine.useLayoutEffect.initialReel"]).flat();
                setReelItems(initialReel);
                setIsInitialized(true);
            }
        }
    }["HorizontalTextSlotMachine.useLayoutEffect"], [
        prizes
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HorizontalTextSlotMachine.useEffect": ()=>{
            if (!isInitialized || !winningPrize || containerWidth === 0 || isSpinningRef.current) return;
            isSpinningRef.current = true;
            const newReel = Array.from({
                length: 10
            }, {
                "HorizontalTextSlotMachine.useEffect.newReel": ()=>shuffle(prizes)
            }["HorizontalTextSlotMachine.useEffect.newReel"]).flat();
            // Находим индекс выигрышного приза
            const winningIndex = newReel.findIndex({
                "HorizontalTextSlotMachine.useEffect.winningIndex": (item)=>item.name === winningPrize.name
            }["HorizontalTextSlotMachine.useEffect.winningIndex"]);
            if (winningIndex !== -1) {
                // Гарантируем минимальную дистанцию прокрутки
                const targetIndex = winningIndex < MIN_SPIN_DISTANCE ? winningIndex + MIN_SPIN_DISTANCE : winningIndex;
                // Убедимся, что индекс не превышает длину массива
                const safeIndex = targetIndex % newReel.length;
                newReel[safeIndex] = winningPrize;
                setReelItems(newReel);
                // Горизонтальное позиционирование
                const finalPosition = containerWidth / 2 - safeIndex * REEL_ITEM_WIDTH - REEL_ITEM_WIDTH / 2;
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
                animationRef.current = requestAnimationFrame({
                    "HorizontalTextSlotMachine.useEffect": ()=>{
                        setTransform(`translateX(${finalPosition}px)`);
                    }
                }["HorizontalTextSlotMachine.useEffect"]);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout({
                    "HorizontalTextSlotMachine.useEffect": ()=>{
                        onSpinEnd();
                        isSpinningRef.current = false;
                    }
                }["HorizontalTextSlotMachine.useEffect"], ANIMATION_DURATION);
            }
            return ({
                "HorizontalTextSlotMachine.useEffect": ()=>{
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    if (animationRef.current) cancelAnimationFrame(animationRef.current);
                }
            })["HorizontalTextSlotMachine.useEffect"];
        }
    }["HorizontalTextSlotMachine.useEffect"], [
        winningPrize,
        containerWidth,
        isInitialized,
        onSpinEnd,
        prizes
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative w-full h-full overflow-hidden border-2 border-purple-300 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 left-0 h-full flex",
                style: {
                    transform: transform,
                    transition: winningPrize ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.1, 0.8, 0.1, 1)` : 'none'
                },
                children: reelItems.map((prize, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full flex items-center justify-center p-2 flex-shrink-0",
                        style: {
                            width: REEL_ITEM_WIDTH
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full h-4/5 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm px-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-center text-gray-800",
                                children: prize.name
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/TextSlotMachine.tsx",
                                lineNumber: 111,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/TextSlotMachine.tsx",
                            lineNumber: 110,
                            columnNumber: 25
                        }, this)
                    }, `${prize.name}-${index}`, false, {
                        fileName: "[project]/src/app/components/TextSlotMachine.tsx",
                        lineNumber: 105,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/components/TextSlotMachine.tsx",
                lineNumber: 95,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/components/TextSlotMachine.tsx",
                lineNumber: 118,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/components/TextSlotMachine.tsx",
                lineNumber: 119,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-1/2 left-1/2 w-0.5 h-4/5 bg-purple-500/80 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full"
            }, void 0, false, {
                fileName: "[project]/src/app/components/TextSlotMachine.tsx",
                lineNumber: 120,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/TextSlotMachine.tsx",
        lineNumber: 94,
        columnNumber: 9
    }, this);
}
_s(HorizontalTextSlotMachine, "1fP0P/VVfTSwhYgoFFaSM3NuILE=");
_c = HorizontalTextSlotMachine;
var _c;
__turbopack_context__.k.register(_c, "HorizontalTextSlotMachine");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/auction/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ShopPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$TextSlotMachine$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/TextSlotMachine.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
// Все возможные призы (точные из вашего списка)
const ALL_PRIZES = [
    // Редкие призы (малый шанс)
    {
        name: 'Онлайн-мини-разбор с Иваном',
        type: 'rare',
        canWin: true
    },
    {
        name: 'Приоритетное место в мини-разборе у Ивана',
        type: 'rare',
        canWin: true
    },
    {
        name: 'Участие в розыгрыше завтрака с Иваном',
        type: 'rare',
        canWin: false
    },
    {
        name: 'Ответ Ивана голосом на ваш вопрос',
        type: 'rare',
        canWin: true
    },
    {
        name: 'Звонок 1 на 1 с Антоном Орешкиным',
        type: 'rare',
        canWin: true
    },
    // Обычные призы (хороший шанс)
    {
        name: '3 чек-листа',
        type: 'common',
        canWin: true
    },
    {
        name: 'Участие в созвоне Антона Орешкина с БА',
        type: 'common',
        canWin: true
    },
    {
        name: '1000 A+',
        type: 'common',
        canWin: true
    },
    {
        name: 'Разбор вашего резюме',
        type: 'common',
        canWin: true
    }
];
function ShopPage() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSpinning, setIsSpinning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [winningPrize, setWinningPrize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [spinKey, setSpinKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showPrizeAlert, setShowPrizeAlert] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const hasSpunRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ShopPage.useEffect": ()=>{
            const tg = window.Telegram?.WebApp;
            if (!tg) {
                setError("Telegram WebApp не найден. Откройте приложение в Telegram.");
                setIsLoading(false);
                return;
            }
            tg.ready();
            // ВРЕМЕННО: симулируем данные пользователя для разработки
            const mockUser = {
                id: 1,
                balance_pluses: 455,
                cases_to_open: 5
            };
            setUser(mockUser);
            setIsLoading(false);
        }
    }["ShopPage.useEffect"], []);
    // Функция для получения случайного приза с учетом вероятности
    const getRandomPrize = ()=>{
        const random = Math.random();
        // Фильтруем призы, которые могут выпасть
        const availablePrizes = random < 0.2 ? ALL_PRIZES.filter((p)=>p.type === 'rare' && p.canWin) : ALL_PRIZES.filter((p)=>p.type === 'common' && p.canWin);
        return availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
    };
    // Функция для сохранения выигрыша в базу данных
    const saveWinningToDatabase = async (prize)=>{
        try {
            const tg = window.Telegram?.WebApp;
            if (!tg) return;
            const response = await fetch('/api/user/save-winning', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    initData: tg.initData,
                    prizeName: prize.name,
                    prizeType: prize.type
                })
            });
            if (!response.ok) {
                console.error('Failed to save winning to database');
            }
        } catch (error) {
            console.error('Error saving winning:', error);
        }
    };
    const handleSpin = async ()=>{
        if (isSpinning || hasSpunRef.current) return;
        setIsSpinning(true);
        setError('');
        setWinningPrize(null);
        setShowPrizeAlert(false);
        hasSpunRef.current = true;
        try {
            window.Telegram?.WebApp?.HapticFeedback.impactOccurred('light');
            // ВРЕМЕННО: симулируем запрос к серверу для разработки
            await new Promise((resolve)=>setTimeout(resolve, 1000));
            // Определяем выигрыш
            const prize = getRandomPrize();
            setWinningPrize(prize);
            setSpinKey((prev)=>prev + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            setIsSpinning(false);
            hasSpunRef.current = false;
            window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('error');
        }
    };
    const handleSpinEnd = ()=>{
        if (winningPrize && !showPrizeAlert) {
            setShowPrizeAlert(true);
            window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
            window.Telegram?.WebApp.showAlert(`Поздравляем! Вы выиграли: ${winningPrize.name}`);
            // СОХРАНЯЕМ ВЫИГРЫШ В БАЗУ ДАННЫХ
            saveWinningToDatabase(winningPrize);
        // В реальном приложении здесь нужно обновить баланс пользователя
        // setUser(prev => prev ? { ...prev, cases_to_open: prev.cases_to_open - 1 } : null);
        }
        setIsSpinning(false);
        hasSpunRef.current = false;
    };
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 flex items-center justify-center bg-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Загрузка..."
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/auction/page.tsx",
                lineNumber: 145,
                columnNumber: 85
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/auction/page.tsx",
            lineNumber: 145,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col min-h-screen font-sans items-center px-4 pt-6 pb-4 text-center text-black bg-gray-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold mb-2",
                        children: "Магазин"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: "Обменивай свои плюсы на интересные товары!"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/auction/page.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full bg-white rounded-xl shadow-sm p-5 mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700 mb-4",
                        children: [
                            "У вас доступно ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: [
                                    user?.cases_to_open || 0,
                                    " кейсов"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/auction/page.tsx",
                                lineNumber: 164,
                                columnNumber: 26
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-700",
                        children: [
                            "Баланс: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: [
                                    user?.balance_pluses || 0,
                                    " плюсов"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/auction/page.tsx",
                                lineNumber: 167,
                                columnNumber: 19
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/auction/page.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full bg-white rounded-xl shadow-sm p-4 mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-64 mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$TextSlotMachine$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            prizes: ALL_PRIZES.map((p)=>({
                                    name: p.name,
                                    icon: ''
                                })),
                            winningPrize: winningPrize ? {
                                name: winningPrize.name,
                                icon: ''
                            } : null,
                            onSpinEnd: handleSpinEnd
                        }, spinKey, false, {
                            fileName: "[project]/src/app/(main)/auction/page.tsx",
                            lineNumber: 174,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSpin,
                        disabled: isSpinning,
                        className: "w-full h-14 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white text-lg font-bold rounded-xl  transition-all shadow-[0_4px_0_0_rgba(91,33,182,0.6)]  active:translate-y-1 active:shadow-[0_1px_0_0_rgba(91,33,182,0.6)] disabled:opacity-50 disabled:cursor-not-allowed",
                        children: isSpinning ? 'Крутится...' : `Крутить (${user?.cases_to_open || 0} шт.)`
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-purple-600 font-medium mt-2",
                        children: "Крутить стоит 1 кейс"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/auction/page.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full bg-white rounded-xl shadow-sm p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold mb-4",
                        children: "Премиум товар"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-medium",
                                        children: "Созвон с кумиром"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                                        lineNumber: 205,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-500",
                                        children: "30 минут личного общения"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                                        lineNumber: 206,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/auction/page.tsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-purple-600 font-bold mr-3",
                                        children: "10,000 плюсов"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                                        lineNumber: 209,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        disabled: !user || user.balance_pluses < 10000,
                                        className: "bg-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
                                        children: "Купить"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                                        lineNumber: 210,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/auction/page.tsx",
                                lineNumber: 208,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/auction/page.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/auction/page.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/auction/page.tsx",
        lineNumber: 149,
        columnNumber: 5
    }, this);
}
_s(ShopPage, "D8cnDhTOYdiMBJsEjCipmtYdybQ=");
_c = ShopPage;
var _c;
__turbopack_context__.k.register(_c, "ShopPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_c3010cf1._.js.map