(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/(main)/profile/edit-awards/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>EditAwardsPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function EditAwardsPage() {
    _s();
    const [awards, setAwards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [initialAwards, setInitialAwards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const awardsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(awards);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditAwardsPage.useEffect": ()=>{
            awardsRef.current = awards;
        }
    }["EditAwardsPage.useEffect"], [
        awards
    ]);
    const handleSave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EditAwardsPage.useCallback[handleSave]": ()=>{
            const tg = window.Telegram?.WebApp;
            if (!tg || !tg.initData) {
                setError("Не удалось получить данные для сохранения.");
                return;
            }
            tg.offEvent('mainButtonClicked', handleSave);
            tg.MainButton.showProgress();
            fetch('/api/profile/update-awards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    initData: tg.initData,
                    awards: awardsRef.current
                })
            }).then({
                "EditAwardsPage.useCallback[handleSave]": (response)=>{
                    if (!response.ok) throw new Error('Не удалось сохранить достижения');
                    return response.json();
                }
            }["EditAwardsPage.useCallback[handleSave]"]).then({
                "EditAwardsPage.useCallback[handleSave]": (data)=>{
                    if (data.success) {
                        tg.MainButton.hideProgress();
                        router.push('/profile');
                    } else {
                        throw new Error(data.error || 'Произошла неизвестная ошибка');
                    }
                }
            }["EditAwardsPage.useCallback[handleSave]"]).catch({
                "EditAwardsPage.useCallback[handleSave]": (err)=>{
                    setError(err.message);
                    tg.MainButton.hideProgress();
                    tg.onEvent('mainButtonClicked', handleSave);
                }
            }["EditAwardsPage.useCallback[handleSave]"]);
        }
    }["EditAwardsPage.useCallback[handleSave]"], [
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditAwardsPage.useEffect": ()=>{
            const tg = window.Telegram?.WebApp;
            if (tg) {
                const onBackClick = {
                    "EditAwardsPage.useEffect.onBackClick": ()=>router.back()
                }["EditAwardsPage.useEffect.onBackClick"];
                tg.BackButton.show();
                tg.MainButton.setText('Сохранить');
                tg.onEvent('backButtonClicked', onBackClick);
                tg.onEvent('mainButtonClicked', handleSave);
                fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        initData: tg.initData
                    })
                }).then({
                    "EditAwardsPage.useEffect": (res)=>res.json()
                }["EditAwardsPage.useEffect"]).then({
                    "EditAwardsPage.useEffect": (data)=>{
                        if (data.awards) {
                            setAwards(data.awards);
                            setInitialAwards(data.awards);
                        }
                    }
                }["EditAwardsPage.useEffect"]).catch({
                    "EditAwardsPage.useEffect": ()=>setError("Не удалось загрузить текущие достижения.")
                }["EditAwardsPage.useEffect"]).finally({
                    "EditAwardsPage.useEffect": ()=>setLoading(false)
                }["EditAwardsPage.useEffect"]);
                return ({
                    "EditAwardsPage.useEffect": ()=>{
                        tg.MainButton.hideProgress();
                        tg.BackButton.hide();
                        tg.MainButton.hide();
                        tg.offEvent('backButtonClicked', onBackClick);
                        tg.offEvent('mainButtonClicked', handleSave);
                    }
                })["EditAwardsPage.useEffect"];
            }
        }
    }["EditAwardsPage.useEffect"], [
        handleSave,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditAwardsPage.useEffect": ()=>{
            const tg = window.Telegram?.WebApp;
            if (tg) {
                if (!tg.MainButton.isProgressVisible) {
                    if (awards !== initialAwards && awards.trim() !== '') {
                        tg.MainButton.show();
                    } else {
                        tg.MainButton.hide();
                    }
                }
            }
        }
    }["EditAwardsPage.useEffect"], [
        awards,
        initialAwards
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-4 text-center text-gray-500",
            children: "Загрузка..."
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/profile/edit-awards/page.tsx",
            lineNumber: 104,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 flex flex-col p-4 pt-4 bg-white gap-4 z-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-xl font-bold text-black flex-shrink-0",
                children: "Ваши достижения"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/profile/edit-awards/page.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-red-500 flex-shrink-0",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/profile/edit-awards/page.tsx",
                lineNumber: 111,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                value: awards,
                onChange: (e)=>setAwards(e.target.value),
                placeholder: "Расскажите о своих достижениях...",
                className: "w-full flex-grow p-3 bg-gray-100 text-black rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/profile/edit-awards/page.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/profile/edit-awards/page.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
_s(EditAwardsPage, "Mv5K2C7pGAZq+FjCdPBexqa9Z5c=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = EditAwardsPage;
var _c;
__turbopack_context__.k.register(_c, "EditAwardsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_%28main%29_profile_edit-awards_page_tsx_31fa4330._.js.map