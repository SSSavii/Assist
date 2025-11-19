/* eslint-disable prefer-const */
'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';

type Prize = { name: string; icon: string };

interface HorizontalTextSlotMachineProps {
    prizes: Prize[];
    winningPrize: Prize | null;
    onSpinEnd: () => void;
    spinId: number;
}

// Функция перемешивания для случайной части
const shuffle = (array: Prize[]): Prize[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[j], newArray[i]] = [newArray[i], newArray[j]];
    }
    return newArray;
};

// --- НОВАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ---
// Создает ленту, где начало всегда фиксировано и разнообразно
const generateDiverseStartReel = (allPrizes: Prize[]): Prize[] => {
    if (allPrizes.length === 0) return [];

    // 1. Формируем "Фасад" (первые 5 видимых элементов).
    // Вместо первых подряд (0,1,2,3,4) берем с шагом (0, 3, 6...), 
    // чтобы на экране сразу были призы разной редкости/вида.
    const fixedStart: Prize[] = [];
    const step = Math.max(1, Math.floor(allPrizes.length / 5)) || 1; // Вычисляем шаг
    
    for (let i = 0; i < 5; i++) {
        // Используем модуль %, чтобы ходить по кругу, если призов мало
        const index = (i * step) % allPrizes.length;
        fixedStart.push(allPrizes[index]);
    }

    // 2. Остальная часть - полная случайность (20 полных наборов призов)
    const randomPart = Array.from({ length: 20 }, () => shuffle(allPrizes)).flat();

    // 3. Склеиваем: Красивый старт + Случайное продолжение
    return [...fixedStart, ...randomPart];
};
// -------------------------------

const REEL_ITEM_WIDTH = 115;
const ANIMATION_DURATION = 6000; 
const MIN_SPIN_DISTANCE = 40; 
const POST_ANIMATION_DELAY = 1000;

export default function HorizontalTextSlotMachine({ prizes, winningPrize, onSpinEnd, spinId }: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    
    // transform хранит текущее смещение
    const [transform, setTransform] = useState('translateX(0px)');
    // isAnimating управляет CSS transition (плавностью)
    const [isAnimating, setIsAnimating] = useState(false);
    
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpinIdRef = useRef<number>(spinId);

    // 1. Инициализация размеров
    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    // 2. ЛОГИКА СБРОСА (Срабатывает при загрузке или смене winningPrize)
    // Это происходит "МЕЖДУ" спинами. Здесь мы готовим барабан к новому запуску.
    useEffect(() => {
        if (prizes.length === 0) return;

        // МГНОВЕННЫЙ СБРОС:
        // 1. Отключаем анимацию
        setIsAnimating(false);
        // 2. Возвращаем каретку в начало (0px)
        setTransform('translateX(0px)');
        
        // 3. Генерируем новую ленту.
        // Благодаря generateDiverseStartReel, начало ленты будет выглядеть ТОЧНО ТАК ЖЕ,
        // как и в предыдущем спине. Визуально картинка не дернется.
        let newReel = generateDiverseStartReel(prizes);

        // 4. Если есть выигрыш, подменяем его где-то далеко справа (невидимо для юзера)
        if (winningPrize) {
            const targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
            if (targetIndex < newReel.length) {
                newReel[targetIndex] = { ...winningPrize };
                // Сохраняем обновленный массив
                setReelItems(newReel);
                
                // Сохраняем индекс цели в data-атрибут или просто замыканием в следующем эффекте
                // Но здесь мы просто подготовили стейт.
            } else {
                setReelItems(newReel);
            }
        } else {
            setReelItems(newReel);
        }
        
        // Очищаем старые таймеры, если вдруг они остались
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

    }, [winningPrize, prizes]); // Зависимость только от данных, не от клика

    // 3. ЛОГИКА СПИНА (Срабатывает при нажатии "Крутить", когда меняется spinId)
    useEffect(() => {
        // Если ID не менялся или ширина не готова — не крутим
        if (spinId === lastSpinIdRef.current || containerWidth === 0 || !winningPrize) {
            return; 
        }
        lastSpinIdRef.current = spinId;

        // Находим индекс выигрыша в текущем массиве reelItems
        // Поскольку мы используем объекты, ищем последнее вхождение похожего объекта в диапазоне выигрыша
        // Или проще: мы знаем логику генерации, выигрыш лежит где-то после MIN_SPIN_DISTANCE
        
        // Поиск индекса выигрыша (ищем с конца или в целевой зоне)
        const targetIndex = reelItems.findIndex((p, i) => 
            i >= MIN_SPIN_DISTANCE && p.name === winningPrize.name
        );

        if (targetIndex !== -1) {
            // Вычисляем позицию так, чтобы приз встал ровно по центру
            const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);

            // ЗАПУСК:
            // 1. Включаем плавность
            setIsAnimating(true);
            
            // 2. Задаем конечную точку (небольшая задержка для надежности рендера)
            requestAnimationFrame(() => {
                 setTransform(`translateX(${finalPosition}px)`);
            });

            // 3. Ждем окончания
            timeoutRef.current = setTimeout(() => {
                // Анимация закончилась
                // Ждем 1 секунду паузы
                setTimeout(() => {
                    onSpinEnd(); 
                    // После этого вызова родитель должен поменять winningPrize
                    // или открыть модалку. Когда модалка закроется и придет новый winningPrize,
                    // сработает useEffect №2 и вернет всё в начало.
                }, POST_ANIMATION_DELAY);
            }, ANIMATION_DURATION);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [spinId, containerWidth, winningPrize, reelItems, onSpinEnd]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                className="absolute top-0 left-0 h-full flex"
                style={{
                    transform: transform,
                    // Transition активен ТОЛЬКО во время спина.
                    // При сбросе (isAnimating = false) движение происходит мгновенно.
                    transition: isAnimating
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : 'none',
                }}
            >
                {/* Если items еще нет, показываем пустые слоты, но generateDiverseStartReel работает быстро */}
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
                                        draggable={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Декорации */}
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4/5 bg-red-600 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full shadow" />
        </div>
    );
}