/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useRef, useLayoutEffect, useMemo } from 'react';

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
    
    // --- ЖЕЛЕЗОБЕТОННОЕ НАЧАЛО ---
    // Мы вычисляем "frozenStart" только ОДИН РАЗ.
    // Даже если prizes изменятся, это начало останется старым, чтобы не было скачков.
    const [frozenStart, setFrozenStart] = useState<Prize[]>([]);

    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);
    
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpinIdRef = useRef<number>(spinId);

    // 1. ИНИЦИАЛИЗАЦИЯ ЗАМОРОЖЕННОГО НАЧАЛА
    useLayoutEffect(() => {
        if (prizes.length > 0 && frozenStart.length === 0) {
            // Берем случайные 7 картинок для старта
            const start = shuffle(prizes).slice(0, 7);
            // Если мало призов, дополняем
            while (start.length < 7 && prizes.length > 0) {
                start.push(prizes[start.length % prizes.length]);
            }
            setFrozenStart(start);
        }
    }, [prizes]); // Зависит от prizes, но внутри проверка length === 0, так что сработает 1 раз

    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    // ФУНКЦИЯ-КОНСТРУКТОР ЛЕНТЫ
    // Всегда приклеивает frozenStart в начало
    const buildReel = (startItems: Prize[], allPrizes: Prize[]) => {
        const randomPart = Array.from({ length: 25 }, () => shuffle(allPrizes)).flat();
        return [...startItems, ...randomPart];
    };

    // 2. СОЗДАНИЕ ПЕРВОЙ ЛЕНТЫ (как только frozenStart готов)
    useEffect(() => {
        if (frozenStart.length > 0 && reelItems.length === 0) {
            const initialReel = buildReel(frozenStart, prizes);
            setReelItems(initialReel);
        }
    }, [frozenStart, prizes]);

    // 3. ЛОГИКА СПИНА
    useEffect(() => {
        // Базовые проверки
        if (frozenStart.length === 0 || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        lastSpinIdRef.current = spinId;

        // СТРОИМ ЛЕНТУ ДЛЯ СПИНА
        // 1. Начало берем из frozenStart (оно 100% совпадает с тем, что на экране)
        // 2. Хвост случайный
        const spinReel = buildReel(frozenStart, prizes);
        
        // Вставляем выигрыш далеко вправо
        const targetIndex = 45 + Math.floor(Math.random() * 5); // 45-50
        if (targetIndex < spinReel.length) {
            spinReel[targetIndex] = { ...winningPrize };
        }

        // СБРОС
        // Мы подменяем массив. Но так как первые 7 элементов (frozenStart) идентичны,
        // React не перерисует их, и визуального скачка не будет.
        setIsAnimating(false);
        setReelItems(spinReel);
        setTransform('translateX(0px)');

        const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);

        // ЗАПУСК
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
        }, 50); // 50мс задержка для отрисовки DOM

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [spinId, containerWidth, winningPrize, frozenStart, onSpinEnd, prizes]);

    // 4. ЛОГИКА ВОЗВРАТА (После спина)
    useEffect(() => {
        // Если winningPrize изменился (или стал null), и мы не крутимся сейчас...
        // Возвращаем барабан в начало.
        // Снова используем frozenStart, чтобы вернуться к знакомой картинке.
        if (frozenStart.length > 0 && !isAnimating) {
             // При желании здесь можно сгенерировать НОВЫЙ frozenStart, если ты хочешь разнообразия 
             // после каждого раунда. Но пока оставим старый для стабильности.
             setTransform('translateX(0px)');
             // Опционально: обновить хвост
             const resetReel = buildReel(frozenStart, prizes);
             setReelItems(resetReel);
        }
    }, [winningPrize]); // Реагируем на смену приза (подготовку к новому раунду)

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
                        // Важно: используем index в ключе, чтобы React не пытался умничать с перемещением элементов
                        key={`${index}-${prize.name}`} 
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