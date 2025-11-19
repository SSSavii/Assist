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
    const [targetIndex, setTargetIndex] = useState(0);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentSpinIdRef = useRef<number>(-1);
    const isSpinningRef = useRef(false);

    // Измеряем контейнер
    useLayoutEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
        }
    }, []);

    // Подготовка НОВОГО барабана когда приходит новый winningPrize (МЕЖДУ спинами)
    useEffect(() => {
        if (!containerWidth || !winningPrize || isSpinningRef.current) return;
        
        // Быстрое затемнение
        setOpacity(0);
        
        setTimeout(() => {
            // Генерируем новый барабан с выигрышным призом
            const newReel = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
            const newTargetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
            
            if (newTargetIndex < newReel.length) {
                newReel[newTargetIndex] = { ...winningPrize };
            }
            
            // Обновляем барабан в начальной позиции
            setReelItems(newReel);
            setTargetIndex(newTargetIndex);
            setTransform('translateX(0px)');
            setIsAnimating(false);
            
            // Быстрое появление
            setTimeout(() => {
                setOpacity(1);
            }, 50);
            
        }, 100);
        
    }, [winningPrize, prizes, containerWidth]);

    // Запуск анимации при клике на кнопку (изменение spinId)
    useEffect(() => {
        if (!containerWidth || 
            reelItems.length === 0 || 
            spinId === currentSpinIdRef.current ||
            isSpinningRef.current) {
            return;
        }
        
        currentSpinIdRef.current = spinId;
        isSpinningRef.current = true;
        
        const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
        
        // Запускаем анимацию
        setTimeout(() => {
            setIsAnimating(true);
            setTransform(`translateX(${finalPosition}px)`);
            
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                
                setTimeout(() => {
                    isSpinningRef.current = false;
                    onSpinEnd(); // Родитель обновит winningPrize → сработает первый useEffect
                }, POST_ANIMATION_DELAY);
            }, ANIMATION_DURATION);
        }, 50);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [spinId, containerWidth, targetIndex, reelItems.length, onSpinEnd]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                className="absolute top-0 left-0 h-full flex"
                style={{
                    transform: transform,
                    opacity: opacity,
                    transition: isAnimating
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 150ms ease-in-out`
                        : 'opacity 150ms ease-in-out',
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