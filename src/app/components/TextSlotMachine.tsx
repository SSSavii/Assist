'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';

type Prize = { name: string; icon: string };

interface HorizontalTextSlotMachineProps {
    prizes: Prize[];
    winningPrize: Prize | null;
    onSpinEnd: () => void;
    spinId: number; // Добавляем уникальный ID спина
}

const shuffle = (array: Prize[]): Prize[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const REEL_ITEM_WIDTH = 160;
const ANIMATION_DURATION = 6000;
const MIN_SPIN_DISTANCE = 40;

export default function HorizontalTextSlotMachine({ prizes, winningPrize, onSpinEnd, spinId }: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const lastSpinIdRef = useRef<number>(-1);

    useLayoutEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            
            const initialReel = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
            setReelItems(initialReel);
            setIsInitialized(true);
        }
    }, [prizes]);

    useEffect(() => {
        // Проверяем что это новый спин (по ID)
        if (!isInitialized || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        // Запоминаем ID текущего спина
        lastSpinIdRef.current = spinId;
        
        // Создаем новый барабан
        const newReel = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
        
        // Находим индекс выигрышного приза
        const winningIndex = newReel.findIndex(item => item.name === winningPrize.name);
        
        if (winningIndex !== -1) {
            // Гарантируем минимальную дистанцию прокрутки
            const targetIndex = winningIndex < MIN_SPIN_DISTANCE 
                ? winningIndex + MIN_SPIN_DISTANCE 
                : winningIndex;
                
            const safeIndex = targetIndex % newReel.length;
            newReel[safeIndex] = winningPrize;
            
            setReelItems(newReel);
            
            // Вычисляем финальную позицию
            const finalPosition = (containerWidth / 2) - (safeIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
            
            // Запускаем анимацию сразу
            setIsAnimating(true);
            setTransform(`translateX(${finalPosition}px)`);

            // Очищаем предыдущий таймер
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            // Устанавливаем таймер на завершение
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                onSpinEnd();
            }, ANIMATION_DURATION);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [winningPrize, spinId, containerWidth, isInitialized, onSpinEnd, prizes]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-purple-300 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
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
                        <div className="w-full h-4/5 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm px-3">
                            <p className="text-sm font-medium text-center text-gray-800">
                                {prize.name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4/5 bg-purple-500/80 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </div>
    );
}