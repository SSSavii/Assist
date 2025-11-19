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

// --- ВЕРСИЯ 1: ИЗМЕНЕНА ТОЛЬКО ГЕНЕРАЦИЯ ---
// Эта функция берет первые 5 призов как есть, а остальные перемешивает.
const generateSemiFixedReel = (allPrizes: Prize[]) => {
    if (allPrizes.length === 0) return [];
    
    // 1. Берем "Фасад" - первые 5 штук (чтобы визуально начало не менялось)
    const fixedStart = allPrizes.slice(0, 5); 
    
    // Если призов меньше 5, добиваем до 5 (на всякий случай)
    while (fixedStart.length < 5 && allPrizes.length > 0) {
        fixedStart.push(allPrizes[fixedStart.length % allPrizes.length]);
    }

    // 2. Остальное - как раньше, мешаем 20 раз
    const randomPart = Array.from({ length: 20 }, () => shuffle(allPrizes)).flat();
    
    return [...fixedStart, ...randomPart];
};

// Константы из твоего кода
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

    // Инициализация (как в оригинале)
    useLayoutEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            
            // ИЗМЕНЕНИЕ: Используем нашу функцию с фиксированным началом
            const initialReel = generateSemiFixedReel(prizes);
            setReelItems(initialReel);
            setIsInitialized(true);
        }
    }, [prizes]);

    // Логика спина (как в оригинале)
    useEffect(() => {
        // Проверки из твоего кода
        if (!isInitialized || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        lastSpinIdRef.current = spinId;
        
        // ИЗМЕНЕНИЕ: Генерируем новую ленту, но начало у неё такое же (первые 5 призов)
        const newReel = generateSemiFixedReel(prizes);
        
        const targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
        
        if (targetIndex < newReel.length) {
            // Вставляем выигрыш
            newReel[targetIndex] = { ...winningPrize };
            
            // Обновляем массив (визуально начало не изменится, так как оно фиксировано)
            setReelItems(newReel);
            
            const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
            
            // Таймер запуска анимации (как в оригинале - 100мс)
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