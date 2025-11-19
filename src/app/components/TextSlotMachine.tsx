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
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
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
    const [finalPosition, setFinalPosition] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const lastSpinIdRef = useRef<number>(-1);
    const lastWinningPrizeRef = useRef<Prize | null>(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            setIsInitialized(true);
        }
    }, []);

    // Эффект 1: Подготовка барабана когда приходит новый winningPrize
    useEffect(() => {
        if (!isInitialized || !containerWidth || !winningPrize) return;
        
        // Проверяем, изменился ли выигрышный приз
        if (lastWinningPrizeRef.current?.name === winningPrize.name && 
            lastWinningPrizeRef.current?.icon === winningPrize.icon) {
            return; // Тот же приз, ничего не делаем
        }
        
        lastWinningPrizeRef.current = winningPrize;
        
        // Генерируем НОВЫЙ барабан с выигрышным призом
        const newReel = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
        const targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
        
        if (targetIndex < newReel.length) {
            newReel[targetIndex] = { ...winningPrize };
            
            // Вычисляем конечную позицию для анимации
            const calculatedFinalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
            
            // Устанавливаем новый барабан БЕЗ анимации
            setIsAnimating(false);
            setReelItems(newReel);
            setTransform('translateX(0px)'); // Барабан в начальной позиции
            setFinalPosition(calculatedFinalPosition); // Сохраняем конечную позицию
        }
    }, [winningPrize, prizes, containerWidth, isInitialized]);

    // Эффект 2: Запуск анимации когда меняется spinId (клик на кнопку)
    useEffect(() => {
        if (!isInitialized || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId ||
            reelItems.length === 0) {
            return;
        }
        
        lastSpinIdRef.current = spinId;
        
        // Запускаем ТОЛЬКО анимацию (барабан уже готов!)
        requestAnimationFrame(() => {
            setIsAnimating(true);
            setTransform(`translateX(${finalPosition}px)`);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                
                setTimeout(() => {
                    onSpinEnd(); // Родитель обновит winningPrize → сработает Эффект 1
                }, POST_ANIMATION_DELAY);
            }, ANIMATION_DURATION);
        });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [spinId, isInitialized, winningPrize, containerWidth, finalPosition, reelItems.length, onSpinEnd]);

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