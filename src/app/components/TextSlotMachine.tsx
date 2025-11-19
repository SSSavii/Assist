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
const POST_ANIMATION_DELAY = 1000;

export default function HorizontalTextSlotMachine({ prizes, winningPrize, onSpinEnd, spinId }: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);
    
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpinIdRef = useRef<number>(-1);

    // ИЗМЕНЕНИЕ: Сохраняем один "Статичный" перемешанный набор призов при входе.
    // Он будет служить источником для "неизменяемого начала".
    const [staticPrizes, setStaticPrizes] = useState<Prize[]>([]);

    // 1. При загрузке один раз перемешиваем призы и запоминаем их навсегда для этой сессии.
    useLayoutEffect(() => {
        if (prizes.length > 0 && staticPrizes.length === 0) {
            setStaticPrizes(shuffle(prizes));
        }
    }, [prizes]); // staticPrizes не добавляем в зависимости, чтобы не зациклить

    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    // ФУНКЦИЯ ГЕНЕРАЦИИ (Вернулись к логике Версии 1, но используем sourceArray)
    const generateReel = (sourceArray: Prize[]) => {
        if (sourceArray.length === 0) return [];

        // Берем первые 5 элементов ИЗ НАШЕГО СТАТИЧНОГО СПИСКА.
        // Так как staticPrizes не меняется, эти 5 элементов ВСЕГДА будут одними и теми же.
        const fixedStart = sourceArray.slice(0, 5);

        // Добиваем до 5, если мало призов
        while (fixedStart.length < 5 && sourceArray.length > 0) {
            fixedStart.push(sourceArray[fixedStart.length % sourceArray.length]);
        }

        // Хвост генерируем случайно каждый раз
        const randomPart = Array.from({ length: 20 }, () => shuffle(sourceArray)).flat();

        return [...fixedStart, ...randomPart];
    };

    // 2. Инициализация барабана (как только staticPrizes готов)
    useEffect(() => {
        if (staticPrizes.length > 0 && reelItems.length === 0) {
            setReelItems(generateReel(staticPrizes));
        }
    }, [staticPrizes]);

    // 3. ЛОГИКА СПИНА
    useEffect(() => {
        // Ждем, пока будет готов staticPrizes, ширина и т.д.
        if (staticPrizes.length === 0 || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        lastSpinIdRef.current = spinId;

        // Генерируем новую ленту, используя staticPrizes.
        // Начало будет ГАРАНТИРОВАННО таким же, как сейчас на экране.
        const newReel = generateReel(staticPrizes);
        
        // Вставляем выигрыш (далеко справа)
        const targetIndex = 40 + Math.floor(Math.random() * 10);
        if (targetIndex < newReel.length) {
            newReel[targetIndex] = { ...winningPrize };
        }

        // СБРОС (Визуально незаметен, т.к. newReel[0..4] === reelItems[0..4])
        setIsAnimating(false);
        setReelItems(newReel);
        setTransform('translateX(0px)');

        const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);

        // Запуск через 50мс
        setTimeout(() => {
            setIsAnimating(true);
            setTransform(`translateX(${finalPosition}px)`);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                setTimeout(() => {
                    onSpinEnd();
                }, POST_ANIMATION_DELAY);
            }, ANIMATION_DURATION);
        }, 50);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [spinId, containerWidth, winningPrize, staticPrizes, onSpinEnd]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                className="absolute top-0 left-0 h-full flex"
                style={{
                    transform: transform,
                    transition: isAnimating
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : 'none',
                }}
            >
                {reelItems.map((prize, index) => (
                    <div
                        key={`${prize.name}-${index}`}
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