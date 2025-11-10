/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';

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

const REEL_ITEM_WIDTH = 120;
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

    // Инициализация барабана один раз
    useLayoutEffect(() => {
        if (containerRef.current && prizes.length > 0) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            
            // Создаем большой начальный барабан
            const initialReel = Array.from({ length: 30 }, () => shuffle(prizes)).flat();
            setReelItems(initialReel);
            
            // Устанавливаем начальную позицию в центр
            const initialPosition = (width / 2) - (10 * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
            setTransform(`translateX(${initialPosition}px)`);
            
            setIsInitialized(true);
        }
    }, [prizes]);

    useEffect(() => {
        if (!isInitialized || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        console.log('Starting spin with prize:', winningPrize.name);
        lastSpinIdRef.current = spinId;
        
        // НЕ пересоздаем барабан! Используем существующий
        // Находим место для выигрышного приза
        const currentReelCopy = [...reelItems];
        
        // Ищем индекс далеко впереди для плавной анимации
        const targetIndex = Math.floor(currentReelCopy.length * 0.7) + Math.floor(Math.random() * 10);
        
        // Вставляем выигрышный приз
        if (targetIndex < currentReelCopy.length) {
            currentReelCopy[targetIndex] = winningPrize;
            setReelItems(currentReelCopy);
        }
        
        // Ждем, пока React отрисует обновленный барабан
        setTimeout(() => {
            // Вычисляем финальную позицию
            const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
            
            console.log('Animating to position:', finalPosition);
            
            // Запускаем анимацию
            setIsAnimating(true);
            setTransform(`translateX(${finalPosition}px)`);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                console.log('Spin ended');
                onSpinEnd();
            }, ANIMATION_DURATION);
        }, 50); // Даем 50ms на отрисовку

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [winningPrize, spinId, containerWidth, isInitialized, onSpinEnd, prizes, reelItems]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                className="absolute top-0 left-0 h-full flex items-center"
                style={{
                    transform: transform,
                    transition: isAnimating
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : 'none',
                }}
            >
                {reelItems.map((prize, index) => (
                    <div
                        key={`prize-${index}`}
                        className="h-full flex items-center justify-center flex-shrink-0"
                        style={{ width: REEL_ITEM_WIDTH, padding: '8px' }}
                    >
                        <div className="w-full h-full flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl shadow-md overflow-hidden relative">
                            {prize.icon ? (
                                <div className="relative w-full h-full p-2">
                                    <Image 
                                        src={prize.icon} 
                                        alt={prize.name}
                                        fill
                                        style={{ 
                                            objectFit: 'contain',
                                            padding: '4px'
                                        }}
                                        sizes="120px"
                                        priority={index < 20}
                                    />
                                </div>
                            ) : (
                                <div className="text-xs text-center p-2">{prize.name}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Градиенты по бокам */}
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            
            {/* Красная линия-индикатор */}
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4/5 bg-red-600 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg" />
        </div>
    );
}