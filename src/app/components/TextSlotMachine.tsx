/* eslint-disable @typescript-eslint/no-unused-vars */
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
    const reelRef = useRef<HTMLDivElement>(null);
    
    const [containerWidth, setContainerWidth] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
    // ГЛАВНОЕ: храним массив в ref, а не в state
    const reelItemsRef = useRef<Prize[]>([]);
    
    // Это состояние нужно только чтобы заставить React отрендерить начальный массив
    const [, forceUpdate] = useState(0);
    
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpinIdRef = useRef<number>(-1);

    // 1. ИНИЦИАЛИЗАЦИЯ - создаём случайный массив ОДИН РАЗ
    useLayoutEffect(() => {
        if (containerRef.current && prizes.length > 0 && !isInitialized) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            
            // Генерируем случайный массив в ref
            reelItemsRef.current = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
            
            setIsInitialized(true);
            forceUpdate(prev => prev + 1); // Заставляем React отрендерить
        }
    }, [prizes, isInitialized]);

    // 2. СПИН
    useEffect(() => {
        if (!isInitialized || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId ||
            !reelRef.current) {
            return;
        }
        
        lastSpinIdRef.current = spinId;
        
        const targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
        
        // КЛЮЧЕВОЙ МОМЕНТ: Меняем элемент в ref напрямую
        // React НЕ знает об этом изменении = НЕТ перерисовки DOM!
        if (targetIndex < reelItemsRef.current.length) {
            const imgElement = reelRef.current.children[targetIndex]?.querySelector('img');
            if (imgElement) {
                // Меняем только src и alt у существующего DOM элемента
                imgElement.src = winningPrize.icon;
                imgElement.alt = winningPrize.name;
            }
        }
        
        // Сбрасываем позицию
        if (reelRef.current) {
            reelRef.current.style.transition = 'none';
            reelRef.current.style.transform = 'translateX(0px)';
        }
        
        const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
        
        // Запускаем анимацию
        setTimeout(() => {
            if (reelRef.current) {
                setIsAnimating(true);
                reelRef.current.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
                reelRef.current.style.transform = `translateX(${finalPosition}px)`;
            }

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                
                setTimeout(() => {
                    onSpinEnd();
                    
                    // Возврат в начало
                    setTimeout(() => {
                        if (reelRef.current) {
                            reelRef.current.style.transition = 'none';
                            reelRef.current.style.transform = 'translateX(0px)';
                        }
                    }, 300);
                }, POST_ANIMATION_DELAY);
            }, ANIMATION_DURATION);
        }, 50);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [winningPrize, spinId, containerWidth, isInitialized, onSpinEnd]);

    if (!isInitialized) {
        return (
            <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-400">Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                ref={reelRef}
                className="absolute top-0 left-0 h-full flex"
                style={{
                    transform: 'translateX(0px)',
                    transition: 'none',
                }}
            >
                {reelItemsRef.current.map((prize, index) => (
                    <div 
                        key={index}
                        className="h-full flex items-center justify-center p-2 flex-shrink-0" 
                        style={{ width: REEL_ITEM_WIDTH }}
                    >
                        <div className="w-full h-4/5 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-visible relative">
                            {prize.icon && (
                                <div className="w-full h-full flex items-center justify-center" style={{ transform: 'scale(1.25)' }}>
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