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

    // ИЗМЕНЕНИЕ 1: Храним "Лицо" слота (первые 5 картинок) в рефе, чтобы оно не менялось во время сессии
    const startSequenceRef = useRef<Prize[]>([]);

    // Функция генерации ленты. Теперь она принимает фиксированное начало как аргумент.
    const generateReelWithFixedStart = (startSequence: Prize[], allPrizes: Prize[]) => {
        // 1. Берем наше запомненное начало
        const fixedStart = [...startSequence];
        
        // 2. Остальное - случайная каша
        const randomPart = Array.from({ length: 20 }, () => shuffle(allPrizes)).flat();
        
        return [...fixedStart, ...randomPart];
    };

    useLayoutEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            
            // ИЗМЕНЕНИЕ 2: Если "Лицо" еще не выбрано - выбираем 5 случайных призов
            if (startSequenceRef.current.length === 0 && prizes.length > 0) {
                // Перемешиваем копию призов и берем первые 5
                const randomStart = shuffle(prizes).slice(0, 5);
                // Если призов очень мало (меньше 5), дублируем их
                while (randomStart.length < 5 && prizes.length > 0) {
                     randomStart.push(prizes[randomStart.length % prizes.length]);
                }
                startSequenceRef.current = randomStart;
            }

            // Создаем первую ленту с этим случайным началом
            if (startSequenceRef.current.length > 0) {
                const initialReel = generateReelWithFixedStart(startSequenceRef.current, prizes);
                setReelItems(initialReel);
                setIsInitialized(true);
            }
        }
    }, [prizes]);

    useEffect(() => {
        if (!isInitialized || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        lastSpinIdRef.current = spinId;
        
        // ИЗМЕНЕНИЕ 3: Генерируем новую ленту, используя ТО ЖЕ САМОЕ начало, что и при загрузке
        const newReel = generateReelWithFixedStart(startSequenceRef.current, prizes);
        
        const targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
        
        if (targetIndex < newReel.length) {
            // Вставляем выигрыш
            newReel[targetIndex] = { ...winningPrize };
            
            // Обновляем стейт (визуально ничего не дернется, так как начало startSequenceRef неизменно)
            setReelItems(newReel);
            
            const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
            
            setTimeout(() => {
                setIsAnimating(true);
                setTransform(`translateX(${finalPosition}px)`);

                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                
                timeoutRef.current = setTimeout(() => {
                    setIsAnimating(false);
                    setTimeout(() => {
                        onSpinEnd();
                    }, POST_ANIMATION_DELAY);
                }, ANIMATION_DURATION);
            }, 100);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [winningPrize, spinId, containerWidth, isInitialized, onSpinEnd, prizes]);

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