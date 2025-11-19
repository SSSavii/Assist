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
const MIN_SPIN_DISTANCE = 40; // Минимальное расстояние прокрутки
const POST_ANIMATION_DELAY = 1000;

export default function HorizontalTextSlotMachine({ prizes, winningPrize, onSpinEnd, spinId }: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    
    // Состояния
    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Refs для хранения состояния между рендерами без перерисовки
    const lastSpinIdRef = useRef<number>(spinId);
    const lastWinnerIndexRef = useRef<number>(-1); // Храним индекс, на котором остановились в прошлый раз
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoadRef = useRef(true);

    // 1. Инициализация ширины контейнера
    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
            const handleResize = () => setContainerWidth(containerRef.current?.offsetWidth || 0);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    // 2. ПЕРВАЯ ЗАГРУЗКА: Генерируем полностью случайный стартовый набор
    // Это решает проблему №1: "при каждом заходе они случайные"
    useEffect(() => {
        if (prizes.length > 0 && isFirstLoadRef.current) {
            // Создаем случайную ленту для старта
            const randomStart = Array.from({ length: 25 }, () => shuffle(prizes)).flat();
            setReelItems(randomStart);
            // Ставим в позицию 0
            setTransform('translateX(0px)');
            
            // Запоминаем, что первый старт прошел.
            // Для логики "старта" считаем, что мы стоим на 2-м элементе (чтобы был запас слева)
            lastWinnerIndexRef.current = 2; 
            isFirstLoadRef.current = false;
        }
    }, [prizes]);

    // 3. ЛОГИКА СПИНА: Единственное место, где меняется лента
    useEffect(() => {
        // Проверяем условия запуска
        if (spinId === lastSpinIdRef.current || !winningPrize || containerWidth === 0 || prizes.length === 0) {
            return;
        }
        
        lastSpinIdRef.current = spinId;

        // --- ЭТАП А: ПОДГОТОВКА БЕСШОВНОГО СТАРТА ---
        
        // 1. Определяем, какие картинки должны быть в начале новой ленты.
        // Мы берем "победителя прошлого раунда" и его соседей (2 слева, 2 справа).
        // Если это самый первый спин, берем просто начало текущего массива.
        
        let startSequence: Prize[] = [];
        const prevIndex = lastWinnerIndexRef.current;

        if (prevIndex !== -1 && reelItems.length > prevIndex) {
            // Безопасно берем срез. Если prevIndex < 2 (начало массива), берем с 0.
            const safeStartIndex = Math.max(0, prevIndex - 2);
            // Нам нужно 5 элементов для "фасада"
            startSequence = reelItems.slice(safeStartIndex, safeStartIndex + 5);
            
            // Если вдруг массив кончился (редкий кейс), дополняем рандомом
            while (startSequence.length < 5) {
                startSequence.push(prizes[Math.floor(Math.random() * prizes.length)]);
            }
        } else {
            // Фолбэк (на всякий случай)
            startSequence = reelItems.slice(0, 5);
        }

        // 2. Генерируем новую ленту: [Старый_Хвост] + [Много_Новых_Случайных]
        const randomPart = Array.from({ length: 20 }, () => shuffle(prizes)).flat();
        const newReel = [...startSequence, ...randomPart];

        // 3. Вставляем НОВЫЙ выигрышный приз
        // Выбираем позицию где-то далеко (от 40 до 50)
        const targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 10);
        if (targetIndex < newReel.length) {
            newReel[targetIndex] = { ...winningPrize };
        }

        // 4. ВЫЧИСЛЯЕМ КООРДИНАТЫ СБРОСА (МАТЕМАТИКА БЕСШОВНОСТИ)
        // В новой ленте `newReel` элемент с индексом 2 - это тот, на котором мы "стояли" до нажатия.
        // (Потому что мы взяли срез [prev-2, prev-1, PREV, prev+1, prev+2])
        // Нам нужно мгновенно переместить ленту так, чтобы index 2 оказался ровно по центру.
        
        const resetPosition = (containerWidth / 2) - (2 * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
        const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);

        // --- ЭТАП Б: ВЫПОЛНЕНИЕ ---

        // Шаг 1: Мгновенный сброс (Reset)
        setIsAnimating(false);           // Отключаем CSS transition
        setReelItems(newReel);           // Подменяем массив данных
        setTransform(`translateX(${resetPosition}px)`); // Ставим в точку старта (визуально она совпадает с тем, где мы были)
        
        // Запоминаем новый индекс победы для СЛЕДУЮЩЕГО раза
        lastWinnerIndexRef.current = targetIndex;

        // Шаг 2: Запуск анимации (через микро-задержку, чтобы React успел отрисовать DOM)
        requestAnimationFrame(() => {
            // Двойной rAF нужен для гарантии применения CSS (браузерный рендеринг)
            requestAnimationFrame(() => {
                setIsAnimating(true); // Включаем плавность
                setTransform(`translateX(${finalPosition}px)`); // Поехали!
            });
        });

        // Шаг 3: Завершение
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            // Анимация закончена
            setTimeout(() => {
                onSpinEnd();
                // ВАЖНО: Мы НЕ сбрасываем ленту здесь. Мы оставляем её как есть.
                // Сброс произойдет только в начале СЛЕДУЮЩЕГО спина (Этап А).
            }, POST_ANIMATION_DELAY);
        }, ANIMATION_DURATION);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };

    }, [spinId, containerWidth, winningPrize, prizes, onSpinEnd]); // Зависимости настроены так, чтобы срабатывать только при смене spinId

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden border-2 border-red-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                className="absolute top-0 left-0 h-full flex"
                style={{
                    transform: transform,
                    // Transition включаем только когда isAnimating = true.
                    // В момент нажатия кнопки (сброс) он выключается, поэтому подмена незаметна.
                    transition: isAnimating
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : 'none',
                }}
            >
                {reelItems.map((prize, index) => (
                    <div
                        // Используем index в ключе, так как элементы дублируются, и нам важен порядок DOM
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
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4/5 bg-red-600 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </div>
    );
}