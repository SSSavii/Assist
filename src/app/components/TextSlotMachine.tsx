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
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const lastSpinIdRef = useRef<number>(-1);

    // !!! ГЛАВНОЕ ИЗМЕНЕНИЕ !!!
    // Храним "Шаблон начала" (первые 5-7 картинок).
    // Генерируем его ОДИН РАЗ при загрузке и больше никогда не меняем.
    const startPatternRef = useRef<Prize[]>([]);

    // Функция для создания ленты.
    // Она берет startPatternRef + случайный хвост.
    // Благодаря этому начало ленты ВСЕГДА байт-в-байт совпадает с тем, что на экране.
    const generateConsistentReel = (allPrizes: Prize[]) => {
        // Если шаблон пуст (первый запуск), создаем его случайно
        if (startPatternRef.current.length === 0 && allPrizes.length > 0) {
            const randomStart = shuffle(allPrizes).slice(0, 7); // Берем 7 случайных
            // Если призов мало, добиваем дублями
            while (randomStart.length < 7 && allPrizes.length > 0) {
                randomStart.push(allPrizes[randomStart.length % allPrizes.length]);
            }
            startPatternRef.current = randomStart;
        }

        // Строим ленту: [ШАБЛОН] + [СЛУЧАЙНЫЙ ХВОСТ]
        const randomPart = Array.from({ length: 20 }, () => shuffle(allPrizes)).flat();
        return [...startPatternRef.current, ...randomPart];
    };

    // 1. ИНИЦИАЛИЗАЦИЯ
    useLayoutEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            
            if (prizes.length > 0) {
                const initialReel = generateConsistentReel(prizes);
                setReelItems(initialReel);
                setIsInitialized(true);
            }
        }
    }, [prizes]);

    // 2. ЛОГИКА СПИНА
    useEffect(() => {
        if (!isInitialized || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        lastSpinIdRef.current = spinId;
        
        // Генерируем ленту. Начало у неё будет ИДЕНТИЧНО startPatternRef.
        const newReel = generateConsistentReel(prizes);
        
        const targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
        
        if (targetIndex < newReel.length) {
            newReel[targetIndex] = { ...winningPrize };
            
            // Обновляем стейт. 
            // Т.к. первые 7 элементов newReel и текущего reelItems совпадают ссылочно (через Ref),
            // React их не трогает -> Нет мигания.
            setReelItems(newReel);
            
            // СБРОС В НОЛЬ (Мгновенно)
            setIsAnimating(false);
            setTransform('translateX(0px)');

            const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
            
            // ЗАПУСК (С задержкой 50мс для надежности)
            setTimeout(() => {
                setIsAnimating(true);
                setTransform(`translateX(${finalPosition}px)`);

                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                
                timeoutRef.current = setTimeout(() => {
                    setIsAnimating(false);
                    setTimeout(() => {
                        onSpinEnd();
                        // ЗДЕСЬ ВАЖНО:
                        // Когда родитель обновит winningPrize (подготовка к след. игре),
                        // сработает useEffect ниже (пункт 3) и вернет барабан в начало.
                    }, POST_ANIMATION_DELAY);
                }, ANIMATION_DURATION);
            }, 50);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [winningPrize, spinId, containerWidth, isInitialized, onSpinEnd, prizes]);

    // 3. ВОЗВРАТ В НАЧАЛО (ПРИ СМЕНЕ WINNING PRIZE)
    // Это происходит, когда мы закрываем модалку и получаем новый приз для следующей игры.
    useEffect(() => {
        // Если мы не крутимся и есть инициализация
        if (!isAnimating && isInitialized && prizes.length > 0) {
            // Возвращаем барабан к виду "Шаблон + новый хвост"
            const resetReel = generateConsistentReel(prizes);
            setReelItems(resetReel);
            setTransform('translateX(0px)'); 
        }
    }, [winningPrize]); 

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
                        // Index в ключе важен для предотвращения пересоздания DOM элементов
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