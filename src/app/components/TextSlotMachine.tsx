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
    
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);
    
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpinIdRef = useRef<number>(spinId);

    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    // --- ШАГ 1: ГЕНЕРАЦИЯ БАРАБАНА ---
    // Мы создаем функцию, которая ВСЕГДА ставит первые 5 призов из списка в начало.
    // Остальное - случайно.
    const generateReel = () => {
        if (prizes.length === 0) return [];
        
        // 1. Берем первые 5 штук жестко (чтобы начало всегда совпадало)
        const fixedStart = prizes.slice(0, 5);
        
        // 2. Если призов меньше 5, добиваем повторами
        while (fixedStart.length < 5 && prizes.length > 0) {
            fixedStart.push(prizes[fixedStart.length % prizes.length]);
        }

        // 3. Генерируем длинный хвост (20 повторов перемешанных)
        const randomPart = Array.from({ length: 20 }, () => shuffle(prizes)).flat();

        return [...fixedStart, ...randomPart];
    };

    // При загрузке страницы создаем ленту
    useEffect(() => {
        if (prizes.length > 0) {
            setReelItems(generateReel());
        }
    }, [prizes]);

    // --- ЛОГИКА СПИНА ---
    useEffect(() => {
        if (spinId === lastSpinIdRef.current || !winningPrize || containerWidth === 0) return;
        lastSpinIdRef.current = spinId;

        // 1. Генерируем новую ленту (начало у нее будет ТАКОЕ ЖЕ, как сейчас на экране)
        const newReel = generateReel();
        
        // 2. Вставляем выигрыш далеко вправо (позиция 40-50)
        const targetIndex = 40 + Math.floor(Math.random() * 10);
        if (targetIndex < newReel.length) {
            newReel[targetIndex] = { ...winningPrize };
        }

        // 3. СБРОС: Ставим новую ленту и возвращаем в 0px
        // Так как начало ленты идентично предыдущей, глаз не заметит подмены.
        setIsAnimating(false);
        setReelItems(newReel);
        setTransform('translateX(0px)');

        // 4. ЗАПУСК: Рассчитываем, куда ехать
        const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);

        // Даем браузеру 50мс отрисовать "Сброс", потом включаем анимацию
        setTimeout(() => {
            setIsAnimating(true);
            setTransform(`translateX(${finalPosition}px)`);
        }, 50);

        // 5. ЗАВЕРШЕНИЕ
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsAnimating(false); // Выключаем плавность после остановки
            setTimeout(() => {
                onSpinEnd();
            }, POST_ANIMATION_DELAY);
        }, ANIMATION_DURATION);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [spinId, containerWidth, winningPrize, prizes, onSpinEnd]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                className="absolute top-0 left-0 h-full flex"
                style={{
                    transform: transform,
                    // Плавность работает только когда isAnimating = true
                    transition: isAnimating
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : 'none',
                }}
            >
                {reelItems.map((prize, index) => (
                    <div
                        key={`${index}-${prize.name}`}
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