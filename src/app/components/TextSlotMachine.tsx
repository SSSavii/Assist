/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useRef, useLayoutEffect, useMemo } from 'react';

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
const MIN_INDEX = 40; 
const MAX_INDEX = 49;

export default function HorizontalTextSlotMachine({ 
    prizes, 
    winningPrize, 
    onSpinEnd, 
    spinId 
}: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    
    // Состояния для отображения
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);

    // Храним целевой индекс (где лежит приз) между рендерами
    const targetIndexRef = useRef<number>(45); 
    const lastSpinIdRef = useRef<number>(spinId);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. СЛЕЖЕНИЕ ЗА РАЗМЕРОМ (чтобы знать центр)
    useLayoutEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // 2. ГЛАВНАЯ ЛОГИКА: ПОДГОТОВКА БАРАБАНА
    // Запускается при загрузке страницы ИЛИ когда родитель меняет winningPrize (готовит следующий раунд)
    useEffect(() => {
        if (!winningPrize || prizes.length === 0) return;

        // Сразу отключаем анимацию и сбрасываем в ноль
        setIsAnimating(false);
        setTransform('translateX(0px)');

        // Генерируем массив призов
        const baseReel = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
        
        // Выбираем случайное место для победы (40-49)
        const randomTargetIndex = Math.floor(Math.random() * (MAX_INDEX - MIN_INDEX + 1)) + MIN_INDEX;
        targetIndexRef.current = randomTargetIndex;

        // "Подкладываем" выигрышный приз в нужное место ЗАРАНЕЕ
        // Это происходит в момент подготовки, пользователь этого не замечает
        if (randomTargetIndex < baseReel.length) {
            baseReel[randomTargetIndex] = { ...winningPrize };
        }

        setReelItems(baseReel);
        
        // Важно: очищаем таймеры предыдущих спинов, если они были
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

    }, [winningPrize, prizes]); // Зависит ТОЛЬКО от смены приза

    // 3. ЛОГИКА АНИМАЦИИ: ТОЛЬКО ДВИЖЕНИЕ
    // Запускается, когда пользователь нажал кнопку (изменился spinId)
    useEffect(() => {
        // Игнорируем первый рендер или если ID не поменялся
        if (spinId === lastSpinIdRef.current) return;
        lastSpinIdRef.current = spinId;

        if (containerWidth === 0) return;

        // Включаем плавность
        setIsAnimating(true);

        // Вычисляем, куда ехать, основываясь на заранее сохраненном targetIndexRef
        const destination = (containerWidth / 2) - (targetIndexRef.current * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
        
        // Небольшой таймаут (50мс), чтобы браузер успел применить transition: transform...
        // перед тем как менять само значение transform
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTransform(`translateX(${destination}px)`);
            });
        });

        // Таймер завершения
        timeoutRef.current = setTimeout(() => {
            // Анимация закончилась визуально
            setTimeout(() => {
                onSpinEnd();
            }, POST_ANIMATION_DELAY);
        }, ANIMATION_DURATION);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [spinId, containerWidth, onSpinEnd]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Слой с лентой */}
            <div
                className="absolute top-0 left-0 h-full flex will-change-transform"
                style={{
                    transform: transform,
                    // Transition включен ТОЛЬКО когда isAnimating=true. 
                    // В момент сброса (смена winningPrize) он выключен, поэтому сброс мгновенный.
                    transition: isAnimating
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : 'none',
                }}
            >
                {/* Если массив пуст (первые миллисекунды), рендерим заглушки, чтобы не было пустоты */}
                {(reelItems.length > 0 ? reelItems : Array.from({ length: 10 }).map((_, i) => prizes[i % prizes.length] || { name: '', icon: '' })).map((prize, index) => (
                    <div
                        key={`${index}-${prize.name}`} // Используем index как часть ключа, так как элементы могут повторяться
                        className="h-full flex items-center justify-center p-2 flex-shrink-0"
                        style={{ width: REEL_ITEM_WIDTH }}
                    >
                        <div className="w-full h-4/5 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-visible relative">
                            {prize && prize.icon && (
                                <div 
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ transform: 'scale(1.25)' }}
                                >
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

            {/* Градиенты по краям */}
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            
            {/* Центральная линия */}
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4/5 bg-red-600 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md" />
        </div>
    );
}