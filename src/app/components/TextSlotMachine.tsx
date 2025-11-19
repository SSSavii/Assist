'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';

type Prize = { name: string; icon: string };

interface HorizontalTextSlotMachineProps {
    prizes: Prize[];
    winningPrize: Prize | null;
    onSpinEnd: () => void;
    spinId: number;
}

const shuffle = (array: Prize[]): Prize[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[j], newArray[i]] = [newArray[i], newArray[j]];
    }
    return newArray;
};

const REEL_ITEM_WIDTH = 115;
const ANIMATION_DURATION = 6000;
const MIN_SPIN_DISTANCE = 40; 
const POST_ANIMATION_DELAY = 1000;

export default function HorizontalTextSlotMachine({ prizes, winningPrize, onSpinEnd, spinId }: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Храним ID последнего спина, чтобы не запускать дважды
    const lastSpinIdRef = useRef<number>(spinId);
    // Храним индекс элемента, который сейчас ПО ЦЕНТРУ
    const lastWinnerIndexRef = useRef<number>(2); // По умолчанию 2 (середина начального массива из 5)
    
    const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. НАСТРОЙКА ШИРИНЫ И НАЧАЛЬНОГО ПОЛОЖЕНИЯ
    useLayoutEffect(() => {
        if (!containerRef.current || prizes.length === 0) return;

        const updateSize = () => {
            if(containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
        };
        updateSize();
        window.addEventListener('resize', updateSize);

        // Генерируем случайный старт один раз при загрузке
        if (reelItems.length === 0) {
            const initialReel = Array.from({ length: 10 }, () => shuffle(prizes)).flat();
            setReelItems(initialReel);
            
            // Сразу выставляем позицию так, чтобы элемент [2] был по центру.
            // Это наша "Точка отсчета" для будущих спинов.
            const centerIndex = 2;
            lastWinnerIndexRef.current = centerIndex;
            const width = containerRef.current.offsetWidth;
            const initialPos = (width / 2) - (centerIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
            
            setTransform(`translateX(${initialPos}px)`);
        }

        return () => window.removeEventListener('resize', updateSize);
    }, [prizes]);

    // 2. ЛОГИКА СПИНА
    useEffect(() => {
        // Проверки: ширина есть? приз есть? это новый спин?
        if (containerWidth === 0 || !winningPrize || spinId === lastSpinIdRef.current) {
            return;
        }
        
        lastSpinIdRef.current = spinId;

        // --- ЭТАП 1: ПОДГОТОВКА "МОСТА" (БЕСШОВНОСТЬ) ---
        
        // Берем индекс, на котором мы остановились в прошлый раз (или 2 при старте)
        const prevIndex = lastWinnerIndexRef.current;
        
        // Нам нужно взять кусок массива вокруг этого индекса (например, 2 слева и 2 справа)
        // чтобы пользователь увидел ТО ЖЕ САМОЕ начало.
        let startBridge: Prize[] = [];
        
        // Защита от выхода за границы массива
        if (reelItems.length > 0) {
            const safeStart = Math.max(0, prevIndex - 2);
            const safeEnd = Math.min(reelItems.length, safeStart + 5);
            startBridge = reelItems.slice(safeStart, safeEnd);
        }
        
        // Если вдруг массив пуст или ошибка, заполняем рандомом (фоллбэк)
        if (startBridge.length < 5) {
            startBridge = [...startBridge, ...prizes.slice(0, 5 - startBridge.length)];
        }

        // Создаем новую ленту: [МОСТ] + [КУЧА НОВЫХ ПРИЗОВ]
        const randomPart = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
        const newReel = [...startBridge, ...randomPart];
        
        // Вставляем выигрыш
        const targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
        if (targetIndex < newReel.length) {
            newReel[targetIndex] = { ...winningPrize };
        }

        // --- ЭТАП 2: МГНОВЕННЫЙ СБРОС (RESET) ---

        // В новой ленте наш старый центр (который был prevIndex) теперь находится
        // под индексом 2 (так как мы взяли срез начиная с prevIndex-2).
        const resetIndex = 2; 
        const resetPos = (containerWidth / 2) - (resetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);

        const finalPos = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);

        // 1. Выключаем анимацию и подменяем ленту
        setIsAnimating(false);
        setReelItems(newReel);
        setTransform(`translateX(${resetPos}px)`); // Ставим в "старую" позицию

        // --- ЭТАП 3: ЗАПУСК АНИМАЦИИ С ЗАДЕРЖКОЙ ---
        
        // Ждем 50мс, чтобы браузер успел отрисовать новую ленту в стартовой позиции.
        // Если не подождать, браузер "проглотит" смену координат и анимации не будет.
        setTimeout(() => {
            setIsAnimating(true); // Включаем плавность
            setTransform(`translateX(${finalPos}px)`); // Поехали к выигрышу!
            
            // Запоминаем, где мы остановимся, для СЛЕДУЮЩЕГО раза
            lastWinnerIndexRef.current = targetIndex;
        }, 50);

        // --- ЭТАП 4: ЗАВЕРШЕНИЕ ---
        if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
        
        spinTimeoutRef.current = setTimeout(() => {
            setTimeout(() => {
                onSpinEnd();
            }, POST_ANIMATION_DELAY);
        }, ANIMATION_DURATION + 50); // +50мс учитываем задержку старта

        return () => {
            if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
        };

    }, [spinId, containerWidth, winningPrize, prizes, onSpinEnd]); 
    // reelItems удален из зависимостей, чтобы не триггерить повторно при setReelItems

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                className="absolute top-0 left-0 h-full flex"
                style={{
                    transform: transform,
                    // Transition включается только через 50мс после сброса
                    transition: isAnimating
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : 'none',
                }}
            >
                {reelItems.map((prize, index) => (
                    <div
                        key={`${index}-${prize.name}`} // Индекс в ключе обязателен для правильного переиспользования DOM
                        className="h-full flex items-center justify-center p-2 flex-shrink-0"
                        style={{ width: REEL_ITEM_WIDTH }}
                    >
                        <div className="w-full h-4/5 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-visible relative">
                            {prize.icon && (
                                <div 
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ transform: 'scale(1.25)' }}
                                >
                                    <img 
                                        src={prize.icon} 
                                        alt={prize.name}
                                        className="max-w-full max-h-full object-contain"
                                        loading="eager"
                                        draggable={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4/5 bg-red-600 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </div>
    );
}