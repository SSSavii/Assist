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

// ИЗМЕНЕНО: Уменьшаем расстояние между карточками
const REEL_ITEM_WIDTH = 95; // было 120
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
        if (!isInitialized || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        lastSpinIdRef.current = spinId;
        
        const newReel = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
        const targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
        
        if (targetIndex < newReel.length) {
            newReel[targetIndex] = { ...winningPrize };
            
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
                        /* ИЗМЕНЕНО: уменьшили padding с p-2 до p-1 */
                        className="h-full flex items-center justify-center p-1 flex-shrink-0"
                        style={{ width: REEL_ITEM_WIDTH }}
                    >
                        {/* ИЗМЕНЕНО: 
                            - высота с h-4/5 на h-[96%] (почти полная)
                            - убрали padding p-1, оставили только overflow-hidden
                        */}
                        <div className="w-full h-[96%] flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            {prize.icon && (
                                <img 
                                    src={prize.icon} 
                                    alt={prize.name}
                                    /* ИЗМЕНЕНО: 
                                       - добавили max-w-full max-h-full для адаптивности
                                       - object-contain сохраняет пропорции
                                    */
                                    className="max-w-full max-h-full object-contain"
                                    loading="eager"
                                />
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