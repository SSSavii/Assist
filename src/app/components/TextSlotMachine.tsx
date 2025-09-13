'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';

type Prize = { name: string; icon: string };

interface HorizontalTextSlotMachineProps {
    prizes: Prize[];
    winningPrize: Prize | null;
    onSpinEnd: () => void;
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
const ANIMATION_DURATION = 3000;
const MIN_SPIN_DISTANCE = 20; // Минимальное количество элементов для прокрутки

export default function HorizontalTextSlotMachine({ prizes, winningPrize, onSpinEnd }: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const animationRef = useRef<number | null>(null);
    const isSpinningRef = useRef(false);

    useLayoutEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            
            // Инициализируем начальные значения
            const initialReel = Array.from({ length: 10 }, () => shuffle(prizes)).flat();
            setReelItems(initialReel);
            setIsInitialized(true);
        }
    }, [prizes]);

    useEffect(() => {
        if (!isInitialized || !winningPrize || containerWidth === 0 || isSpinningRef.current) return;
        
        isSpinningRef.current = true;
        const newReel = Array.from({ length: 10 }, () => shuffle(prizes)).flat();
        
        // Находим индекс выигрышного приза
        const winningIndex = newReel.findIndex(item => item.name === winningPrize.name);
        
        if (winningIndex !== -1) {
            // Гарантируем минимальную дистанцию прокрутки
            const targetIndex = winningIndex < MIN_SPIN_DISTANCE 
                ? winningIndex + MIN_SPIN_DISTANCE 
                : winningIndex;
                
            // Убедимся, что индекс не превышает длину массива
            const safeIndex = targetIndex % newReel.length;
            newReel[safeIndex] = winningPrize;
            
            setReelItems(newReel);
            
            // Горизонтальное позиционирование
            const finalPosition = (containerWidth / 2) - (safeIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
            
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            
            animationRef.current = requestAnimationFrame(() => {
                setTransform(`translateX(${finalPosition}px)`);
            });

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                onSpinEnd();
                isSpinningRef.current = false;
            }, ANIMATION_DURATION);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [winningPrize, containerWidth, isInitialized, onSpinEnd, prizes]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-purple-300 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
            <div
                className="absolute top-0 left-0 h-full flex"
                style={{
                    transform: transform,
                    transition: winningPrize 
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.1, 0.8, 0.1, 1)`
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