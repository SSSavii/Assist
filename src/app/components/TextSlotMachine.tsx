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

// КОНСТАНТЫ
const REEL_ITEM_WIDTH = 115;
const ANIMATION_DURATION = 6000;
const POST_ANIMATION_DELAY = 1000;
const MIN_INDEX = 40; // Минимальный индекс выигрыша
const MAX_INDEX = 49; // Максимальный индекс выигрыша

export default function HorizontalTextSlotMachine({ 
    prizes, 
    winningPrize, 
    onSpinEnd, 
    spinId 
}: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Состояния
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false); // Управляет transition
    const [containerWidth, setContainerWidth] = useState(0);

    // Refs для хранения данных без лишних ререндеров
    const targetIndexRef = useRef<number>(0);
    const lastSpinIdRef = useRef<number>(spinId);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 1. ИНИЦИАЛИЗАЦИЯ РАЗМЕРА КОНТЕЙНЕРА
    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
        // Обработчик ресайза для точности центрирования
        const handleResize = () => {
            if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 2. ЛОГИКА СБРОСА И ПОДГОТОВКИ (При загрузке или смене winningPrize)
    // Это происходит МЕЖДУ спинами или при первом входе
    useEffect(() => {
        if (!winningPrize || prizes.length === 0) return;

        // Генерируем барабан (20 циклов)
        const baseReel = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
        
        // Выбираем позицию выигрыша (40-49)
        const randomTargetIndex = Math.floor(Math.random() * (MAX_INDEX - MIN_INDEX + 1)) + MIN_INDEX;
        
        // Вставляем выигрышный приз жестко в эту позицию
        if (randomTargetIndex < baseReel.length) {
            baseReel[randomTargetIndex] = { ...winningPrize };
        }

        // Сохраняем индекс, куда нужно будет крутить
        targetIndexRef.current = randomTargetIndex;

        // ОБНОВЛЯЕМ СОСТОЯНИЕ (Мгновенный сброс)
        setReelItems(baseReel);
        setIsAnimating(false); // Отключаем анимацию для мгновенного возврата
        setTransform('translateX(0px)'); // Возвращаем в начало

    }, [winningPrize, prizes]); // Зависимость только от выигрыша (и призов)

    // 3. ЛОГИКА ЗАПУСКА СПИНА (При смене spinId)
    useEffect(() => {
        // Пропускаем первый рендер или если spinId не изменился
        if (spinId === lastSpinIdRef.current) return;
        lastSpinIdRef.current = spinId;

        if (containerWidth === 0) return;

        // Расчет конечной позиции, чтобы приз был ровно по центру
        // (Половина контейнера) - (Позиция начала элемента) - (Половина ширины элемента)
        const destination = (containerWidth / 2) - (targetIndexRef.current * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);

        // ЗАПУСК АНИМАЦИИ
        // 1. Включаем CSS transition
        setIsAnimating(true);
        
        // 2. Задаем конечную координату (это запустит движение)
        // Небольшая задержка requestAnimationFrame не обязательна, так как isAnimating переключает класс
        // Но для надежности React батчинга используем setTimeout 50ms
        setTimeout(() => {
            setTransform(`translateX(${destination}px)`);
        }, 50);

        // 3. Таймер остановки
        if (timerRef.current) clearTimeout(timerRef.current);
        
        timerRef.current = setTimeout(() => {
            // Анимация закончилась (физически)
            // Ждем 1 секунду перед показом результата
            setTimeout(() => {
                onSpinEnd();
            }, POST_ANIMATION_DELAY);
        }, ANIMATION_DURATION);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [spinId, containerWidth, onSpinEnd]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                className="absolute top-0 left-0 h-full flex will-change-transform"
                style={{
                    transform: transform,
                    // Transition применяется ТОЛЬКО когда isAnimating = true (во время спина).
                    // Когда winningPrize меняется, isAnimating = false, и барабан возвращается в 0px мгновенно.
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
            {/* Декоративные элементы (градиенты и линия) */}
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4/5 bg-red-600 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md" />
        </div>
    );
}