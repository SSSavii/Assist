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
const POST_ANIMATION_DELAY = 1000;

export default function HorizontalTextSlotMachine({ prizes, winningPrize, onSpinEnd, spinId }: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    
    // Текущее состояние ленты на экране
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);
    
    // ХРАНИЛИЩЕ "МАСТЕР-ЛЕНТЫ"
    // Это та лента, которую мы сгенерировали при входе. Мы будем всегда возвращаться к ней.
    const [masterReel, setMasterReel] = useState<Prize[]>([]);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpinIdRef = useRef<number>(-1);

    // 1. ИНИЦИАЛИЗАЦИЯ (Один раз при загрузке)
    useLayoutEffect(() => {
        if (prizes.length > 0 && masterReel.length === 0) {
            // Генерируем длинную ленту (25 циклов, чтобы хватило с запасом)
            const initialReel = Array.from({ length: 25 }, () => shuffle(prizes)).flat();
            
            // Сохраняем её в "Мастер" и сразу показываем на экране
            setMasterReel(initialReel);
            setReelItems(initialReel);
        }
    }, [prizes]); // masterReel в зависимости не добавляем, чтобы не пересоздавать

    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    // 2. ЛОГИКА СБРОСА (Возврат в начало)
    // Если winningPrize меняется (например, мы закрыли модалку и готовимся к новой игре),
    // мы возвращаем барабан к состоянию "Мастер-ленты".
    useEffect(() => {
        if (masterReel.length > 0) {
            // Мгновенно возвращаем всё как было при загрузке
            setIsAnimating(false);
            setTransform('translateX(0px)');
            setReelItems(masterReel); 
        }
    }, [winningPrize, masterReel]); 

    // 3. ЛОГИКА СПИНА
    useEffect(() => {
        if (masterReel.length === 0 || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        lastSpinIdRef.current = spinId;

        // --- САМОЕ ВАЖНОЕ ---
        // Мы НЕ генерируем новую ленту. Мы берем копию Мастер-ленты.
        const spinReel = [...masterReel];
        
        // Выбираем индекс для победы (40-50)
        const targetIndex = 40 + Math.floor(Math.random() * 10);
        
        // Подменяем ТОЛЬКО один элемент далеко справа.
        // Первые 40 элементов остаются ИДЕНТИЧНЫМИ тем, что сейчас на экране.
        if (targetIndex < spinReel.length) {
            spinReel[targetIndex] = { ...winningPrize };
        }

        // Обновляем состояние.
        // React увидит, что первые элементы не изменились, и не будет их трогать.
        // Скачка быть не должно.
        setIsAnimating(false);
        setReelItems(spinReel);
        setTransform('translateX(0px)');

        const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);

        // Запускаем анимацию с микро-задержкой
        setTimeout(() => {
            setIsAnimating(true);
            setTransform(`translateX(${finalPosition}px)`);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                setTimeout(() => {
                    onSpinEnd();
                    // После этого вызова, когда родитель обновит данные, 
                    // сработает useEffect №2 и вернет барабан к masterReel.
                }, POST_ANIMATION_DELAY);
            }, ANIMATION_DURATION);
        }, 50);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [spinId, containerWidth, winningPrize, masterReel, onSpinEnd]);

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
                        key={`${index}-${prize.name}`} // Используем index, так как порядок жестко зафиксирован
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