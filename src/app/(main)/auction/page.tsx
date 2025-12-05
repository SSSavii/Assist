/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- КОМПОНЕНТ РУЛЕТКИ (ВСТАВЛЕН СЮДА ДЛЯ УДОБСТВА) ---

type ReelPrize = { name: string; icon: string };

interface HorizontalTextSlotMachineProps {
    prizes: ReelPrize[];
    winningPrize: ReelPrize | null;
    onSpinEnd: () => void;
    spinId: number;
}

const shuffle = (array: ReelPrize[]): ReelPrize[] => {
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

function HorizontalTextSlotMachine({ prizes, winningPrize, onSpinEnd, spinId }: HorizontalTextSlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    
    const [reelItems, setReelItems] = useState<ReelPrize[]>([]);
    
    const [transform, setTransform] = useState('translateX(0px)');
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpinIdRef = useRef<number>(-1);

    useLayoutEffect(() => {
        if (containerRef.current && prizes.length > 0 && reelItems.length === 0) {
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            
            const initialReel = Array.from({ length: 200 }, () => shuffle(prizes)).flat();
            setReelItems(initialReel);
        }
    }, [prizes]);

    useEffect(() => {
        if (reelItems.length === 0 || 
            !winningPrize || 
            containerWidth === 0 || 
            lastSpinIdRef.current === spinId) {
            return;
        }
        
        lastSpinIdRef.current = spinId;
        
        let targetIndex = reelItems.findIndex((item, idx) => 
            idx >= MIN_SPIN_DISTANCE && item.name === winningPrize.name
        );
        
        if (targetIndex === -1) {
            targetIndex = MIN_SPIN_DISTANCE + Math.floor(Math.random() * 20);
        }
        
        const finalPosition = (containerWidth / 2) - (targetIndex * REEL_ITEM_WIDTH) - (REEL_ITEM_WIDTH / 2);
        
        setIsAnimating(false);
        setTransform('translateX(0px)');
        
        setTimeout(() => {
            setIsAnimating(true);
            setTransform(`translateX(${finalPosition}px)`);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                
                setTimeout(() => {
                    onSpinEnd();
                }, POST_ANIMATION_DELAY);
            }, ANIMATION_DURATION);
        }, 50);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [winningPrize, spinId, containerWidth, reelItems, onSpinEnd]);

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

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ---

const GlobalStyles = () => (
  <>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    
    {/* Preload шрифтов */}
    <link
      rel="preload"
      href="/fonts/CeraPro-Regular.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
    <link
      rel="preload"
      href="/fonts/CeraPro-Medium.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
    <link
      rel="preload"
      href="/fonts/CeraPro-Bold.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
    
    {/* Preload иконки кристаллов */}
    <link
      rel="preload"
      href="/images/322.png"
      as="image"
      fetchPriority="high"
    />
    
    {/* Preload изображений призов (удалены 3000 и 2000) */}
    <link rel="preload" href="/prizes/closed-event.png" as="image" />
    <link rel="preload" href="/prizes/individual-60min.png" as="image" />
    <link rel="preload" href="/prizes/breakfast.png" as="image" />
    <link rel="preload" href="/prizes/entrepreneur-analysis.png" as="image" />
    <link rel="preload" href="/prizes/lifehacks.png" as="image" />
    <link rel="preload" href="/prizes/lottery-10min.png" as="image" />
    <link rel="preload" href="/prizes/weekly-call.png" as="image" />
    <link rel="preload" href="/prizes/1000-aplus.png" as="image" />
    <link rel="preload" href="/prizes/resume.png" as="image" />
    <link rel="preload" href="/prizes/500-aplus.png" as="image" />
    <link rel="preload" href="/prizes/team-analysis.png" as="image" />
    <link rel="preload" href="/prizes/checklist.png" as="image" />
    <link rel="preload" href="/prizes/100-aplus.png" as="image" />
    <link rel="preload" href="/prizes/250-aplus.png" as="image" />
    
    <style jsx global>{`
      * {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Regular.woff2') format('woff2'),
             url('/fonts/CeraPro-Regular.woff') format('woff');
        font-weight: 400;
        font-style: normal;
        font-display: block;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Light.woff2') format('woff2'),
             url('/fonts/CeraPro-Light.woff') format('woff');
        font-weight: 300;
        font-style: normal;
        font-display: block;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Medium.woff2') format('woff2'),
             url('/fonts/CeraPro-Medium.woff') format('woff');
        font-weight: 500;
        font-style: normal;
        font-display: block;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Bold.woff2') format('woff2'),
             url('/fonts/CeraPro-Bold.woff') format('woff');
        font-weight: 700;
        font-style: normal;
        font-display: block;
      }
      
      body {
        font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
    `}</style>
  </>
);

type Prize = {
  name: string;
  type: 'impossible' | 'very_rare' | 'rare' | 'common' | 'excellent';
  probability: number;
  canWin: boolean;
  deliveryType: 'instant' | 'bot_message' | 'manual';
  image: string;
};

const ALL_PRIZES: Prize[] = [
  // Нереальный шанс
  { name: 'Приглашение на закрытое мероприятие', type: 'impossible', probability: 0, canWin: false, deliveryType: 'manual', image: '/prizes/closed-event.png' },
  { name: 'Индивидуальный разбор от предпринимателя (60 минут)', type: 'impossible', probability: 0, canWin: false, deliveryType: 'manual', image: '/prizes/individual-60min.png' },
  { name: 'Завтрак с предпринимателем', type: 'impossible', probability: 0, canWin: false, deliveryType: 'manual', image: '/prizes/breakfast.png' },
  
  // Очень маленький шанс
  { name: 'Разбор 1 запроса от предпринимателя с выручкой от 100 млн рублей в год', type: 'very_rare', probability: 0.167, canWin: true, deliveryType: 'manual', image: '/prizes/entrepreneur-analysis.png' },
  { name: 'Пакет практических лайфхаков', type: 'very_rare', probability: 0.167, canWin: true, deliveryType: 'bot_message', image: '/prizes/lifehacks.png' },
  
  // Маленький шанс
  { name: 'Участие в розыгрыше на 10-ти минутный онлайн-мини-разбор', type: 'rare', probability: 0.5, canWin: true, deliveryType: 'manual', image: '/prizes/lottery-10min.png' },
  { name: 'Участие в еженедельном созвоне с БА', type: 'rare', probability: 0.5, canWin: true, deliveryType: 'manual', image: '/prizes/weekly-call.png' },
  { name: '1000 A+', type: 'rare', probability: 8.5, canWin: true, deliveryType: 'instant', image: '/prizes/1000-aplus.png' },
  { name: 'Разбор вашего резюме', type: 'rare', probability: 0.5, canWin: true, deliveryType: 'manual', image: '/prizes/resume.png' },
  
  // Хороший шанс
  { name: '500 A+', type: 'common', probability: 25.5, canWin: true, deliveryType: 'instant', image: '/prizes/500-aplus.png' },
  { name: 'Разбор запроса от команды', type: 'common', probability: 5, canWin: true, deliveryType: 'manual', image: '/prizes/team-analysis.png' },
  
  // Отличный шанс
  { name: 'Чек-лист', type: 'excellent', probability: 18.17, canWin: true, deliveryType: 'bot_message', image: '/prizes/checklist.png' },
  { name: '100 A+', type: 'excellent', probability: 18.17, canWin: true, deliveryType: 'instant', image: '/prizes/100-aplus.png' },
  { name: '250 A+', type: 'excellent', probability: 18.16, canWin: true, deliveryType: 'instant', image: '/prizes/250-aplus.png' },
];

interface UserProfile {
  id: number;
  tg_id: number;
  balance_crystals: number;
  cases_to_open: number;
  bot_started?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  has_spun_before?: boolean;
}

interface DailyLimit {
  remaining: number;
  used: number;
  maxLimit: number;
}

const CASE_COST = 500;
const PREMIUM_ITEM_COST = 40000;

// Функция предзагрузки изображений
const preloadImages = (imageUrls: string[]): Promise<void[]> => {
  const promises = imageUrls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new window.Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve даже при ошибке, чтобы не блокировать загрузку
    });
  });
  return Promise.all(promises);
};

export default function ShopPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const hasSpunRef = useRef(false);
  const isProcessingPrizeRef = useRef(false);
  const [isFirstSpin, setIsFirstSpin] = useState(true);

  // Предзагрузка всех изображений
  useEffect(() => {
    const imagesToPreload = [
      '/images/322.png',
      ...ALL_PRIZES.map(prize => prize.image)
    ];

    preloadImages(imagesToPreload).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError("Telegram WebApp не найден. Откройте приложение в Telegram.");
      setIsLoading(false);
      return;
    }

    tg.ready();

    Promise.all([
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      }).then(response => {
        if (!response.ok) throw new Error('Не удалось загрузить данные пользователя');
        return response.json();
      }),
      
      fetch('/api/user/daily-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          initData: tg.initData,
          action: 'check'
        }),
      }).then(response => {
        if (!response.ok) throw new Error('Не удалось загрузить лимиты');
        return response.json();
      })
    ])
    .then(([userData, limitData]) => {
      if (userData && userData.error) {
        throw new Error(userData.error);
      }
      setUser(userData);
      setDailyLimit(limitData);
      setIsFirstSpin(!userData.has_spun_before);
    })
    .catch(err => {
      console.error("Shop page fetch error:", err);
      setError(err.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, []);

  const getRandomPrize = (): Prize => {
    // Если это первый спин - гарантированно выдаём плейбук
    if (isFirstSpin) {
      const playbook = ALL_PRIZES.find(p => p.name === 'Пакет практических лайфхаков');
      if (playbook) {
        console.log('[FIRST SPIN] Guaranteed prize: Пакет практических лайфхаков');
        return playbook;
      }
    }
    
    // Обычная логика для последующих спинов
    const winnablePrizes = ALL_PRIZES.filter(p => p.canWin);
    const totalProbability = winnablePrizes.reduce((sum, prize) => sum + prize.probability, 0);
    
    let random = Math.random() * totalProbability;
    
    for (const prize of winnablePrizes) {
      random -= prize.probability;
      if (random <= 0) {
        return prize;
      }
    }
    
    return winnablePrizes[winnablePrizes.length - 1];
  };

  const handlePrizeDelivery = async (prize: Prize) => {
    const tg = window.Telegram?.WebApp;
    if (!tg || isProcessingPrizeRef.current) return;

    isProcessingPrizeRef.current = true;

    try {
      if (prize.deliveryType === 'instant') {
        const response = await fetch('/api/user/award-prize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initData: tg.initData,
            prizeName: prize.name,
            prizeType: 'instant'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          setUser(prev => prev ? {
            ...prev,
            balance_crystals: data.newBalance
          } : null);
          
          tg.showAlert(`🎉 Поздравляем! Вы выиграли: ${prize.name}\n\n✨ Плюсы начислены на ваш баланс!`);
        }
      } else if (prize.deliveryType === 'bot_message') {
        await fetch('/api/bot/send-prize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initData: tg.initData,
            prizeName: prize.name,
            messageType: 'checklist'
          }),
        });
        
        if (prize.name === 'Чек-лист') {
          tg.showAlert(`🎉 Поздравляем! Вы выиграли чек-лист!\n\n📬 Проверьте бота - чек-лист отправлен!`);
        } else if (prize.name === 'Пакет практических лайфхаков') {
          tg.showAlert(`🎉 Поздравляем! Вы выиграли пакет практических лайфхаков!\n\n📬 Проверьте бота - материалы отправлены!`);
        } else {
          tg.showAlert(`🎉 Поздравляем! Вы выиграли: ${prize.name}\n\n📬 Приз отправлен вам в бот!`);
        }
      } else if (prize.deliveryType === 'manual') {
        await fetch('/api/bot/send-prize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initData: tg.initData,
            prizeName: prize.name,
            messageType: 'manual_contact'
          }),
        });
        
        tg.showAlert(`🎉 Поздравляем! Вы выиграли: ${prize.name}\n\n📞 С вами свяжутся в ближайшее время!`);
      }

      await fetch('/api/user/save-winning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          prizeName: prize.name,
          prizeType: prize.type,
          deliveryType: prize.deliveryType
        }),
      });

    } catch (error) {
      console.error('Error delivering prize:', error);
      tg.showAlert('❌ Произошла ошибка при начислении приза. Обратитесь в поддержку.');
    } finally {
      isProcessingPrizeRef.current = false;
    }
  };

  const handleSpin = async () => {
    const tg = window.Telegram?.WebApp;

    if (isSpinning || hasSpunRef.current || !user) return;

    if (!user.bot_started) {
      tg?.showAlert('⚠️ Сначала запустите бота для получения призов!\n\nНажмите на красную кнопку выше.');
      return;
    }

    if (user.balance_crystals < CASE_COST) {
      tg?.showAlert(`У вас недостаточно плюсов! Требуется: ${CASE_COST} А+`);
      return;
    }

    if (dailyLimit && dailyLimit.remaining <= 0) {
      tg?.showAlert(`Вы достигли дневного лимита открытий кейсов!\nОсталось попыток сегодня: 0/${dailyLimit.maxLimit}`);
      return;
    }

    setIsSpinning(true);
    setError('');
    hasSpunRef.current = true;
    isProcessingPrizeRef.current = false;

    try {
      tg?.HapticFeedback.impactOccurred('light');

      const spendResponse = await fetch('/api/user/spend-crystals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg?.initData,
          amount: CASE_COST
        }),
      });

      if (!spendResponse.ok) {
        const errorData = await spendResponse.json();
        throw new Error(errorData.error || 'Не удалось списать плюсы');
      }

      const spendData = await spendResponse.json();

      const limitResponse = await fetch('/api/user/daily-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg?.initData,
          action: 'use'
        }),
      });

      if (!limitResponse.ok) {
        throw new Error('Не удалось использовать попытку');
      }

      const limitData = await limitResponse.json();
      
      setUser(prev => prev ? { 
        ...prev, 
        balance_crystals: spendData.newBalance
      } : null);

      setDailyLimit({
        remaining: limitData.remaining,
        used: limitData.used,
        maxLimit: dailyLimit?.maxLimit || 5
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      const prize = getRandomPrize();
      setSpinKey(prev => prev + 1);
      setWinningPrize(prize);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsSpinning(false);
      hasSpunRef.current = false;
      tg?.HapticFeedback.notificationOccurred('error');
      tg?.showAlert(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте еще раз.');
    }
  };

  const handleSpinEnd = () => {
    if (winningPrize && !isProcessingPrizeRef.current) {
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
      handlePrizeDelivery(winningPrize);
    }
    
    // После первого спина сбрасываем флаг
    if (isFirstSpin) {
      setIsFirstSpin(false);
    }
    
    setTimeout(() => {
      setIsSpinning(false);
      hasSpunRef.current = false;
    }, 500);
  };

  const handleOpenBot = async () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }

    try {
      const response = await fetch('/api/bot/start-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg?.initData }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, bot_started: true } : null);
      }
    } catch (error) {
      console.error('Error notifying bot:', error);
    }

    const botUsername = 'my_auction_admin_bot';
    tg?.openTelegramLink(`https://t.me/${botUsername}`);
  };

  const handlePurchasePremiumItem = async () => {
    const tg = window.Telegram?.WebApp;
    
    if (isPurchasing || !user) return;

    if (user.balance_crystals < PREMIUM_ITEM_COST) {
      tg?.showAlert(`У вас недостаточно плюсов!\nТребуется: ${PREMIUM_ITEM_COST.toLocaleString('ru-RU')} А+`);
      return;
    }

    setIsPurchasing(true);

    try {
      tg?.HapticFeedback.impactOccurred('medium');

      const response = await fetch('/api/shop/purchase-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg?.initData,
          itemName: 'Созвон с кумиром',
          itemCost: PREMIUM_ITEM_COST
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось совершить покупку');
      }

      const data = await response.json();

      setUser(prev => prev ? {
        ...prev,
        balance_crystals: data.newBalance
      } : null);

      tg?.HapticFeedback.notificationOccurred('success');
      tg?.showAlert('🎉 Покупка успешно совершена!\n\n📞 Администратор свяжется с вами в ближайшее время для организации созвона.');

    } catch (err) {
      console.error('Purchase error:', err);
      tg?.HapticFeedback.notificationOccurred('error');
      tg?.showAlert(err instanceof Error ? err.message : 'Произошла ошибка при покупке. Попробуйте еще раз.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleShowPrizes = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    router.push('/auction/prizes');
  };

  // Показываем загрузку пока не загрузились данные И изображения
  if (isLoading || !imagesLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #FFFFFF;
            font-family: 'Cera Pro', sans-serif;
            color: #666666;
            gap: 16px;
          }
          
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #EA0000;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isSpinDisabled = isSpinning || 
                         !user || 
                         !user.bot_started ||
                         (user?.balance_crystals ?? 0) < CASE_COST || 
                         (dailyLimit?.remaining ?? 0) <= 0;

  const isBuyDisabled = isPurchasing || !user || (user?.balance_crystals ?? 0) < PREMIUM_ITEM_COST;

  return (
    <>
      <GlobalStyles />
      <div className="shop-wrapper">
        <main className="shop-container">
          <div className="shop-header">
            <h1 className="shop-title">Магазин</h1>
            <p className="shop-subtitle">
              Обменивай свои плюсы на интересные товары!
            </p>
          </div>
          
          {!user?.bot_started && (
            <button onClick={handleOpenBot} className="bot-warning">
              <p className="warning-title">Внимание!</p>
              <p className="warning-text">Запустите бота для получения призов и возможности крутить рулетку</p>
            </button>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dailyLimit?.remaining || 0}/{dailyLimit?.maxLimit || 5}</div>
              <div className="stat-label">Осталось<br/>открытий</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{user?.balance_crystals?.toLocaleString('ru-RU') || 0}</div>
              <div className="stat-label">Текущий<br/>баланс</div>
            </div>
          </div>

          <div className="slot-section">
            <div className="slot-machine">
              <HorizontalTextSlotMachine
                key={spinKey}
                spinId={spinKey}
                prizes={ALL_PRIZES.map(p => ({ name: p.name, icon: p.image }))}
                winningPrize={winningPrize ? { name: winningPrize.name, icon: winningPrize.image } : null}
                onSpinEnd={handleSpinEnd}
              />
            </div>
            
            <button 
              onClick={handleSpin}
              disabled={isSpinDisabled}
              className="spin-button"
            >
              {isSpinning ? 'Крутится...' : `Крутить`}
            </button>
            
            <button 
              onClick={handleShowPrizes}
              className="prizes-link"
            >
              Возможные призы
            </button>
            
            <div className="spin-cost">
              Крутить стоит {CASE_COST} А+
            </div>
          </div>

          <div className="products-container">
            <div className="premium-section">
              <h2 className="premium-title">Премиум товар</h2>
              
              <div className="product-item">
                <div className="product-text">
                  <div className="product-name">Созвон с кумиром</div>
                  <div className="product-description">Мы организуем для вас встречу с предпринимателем или человеком, с которым вы хотите пообщаться</div>
                </div>
                
                <div className="purchase-section">
                  <button 
                    onClick={handlePurchasePremiumItem}
                    disabled={isBuyDisabled}
                    className="buy-button"
                  >
                    {isPurchasing ? 'Покупка...' : 'Купить'}
                  </button>
                  
                  <div className="price-section">
                    <span className="price-value">{PREMIUM_ITEM_COST.toLocaleString('ru-RU')}</span>
                    <div className="crystal-icon">
                      <Image 
                        src="/images/322.png" 
                        alt="Crystal" 
                        width={25} 
                        height={25}
                        priority
                        style={{ 
                          filter: 'drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.25))'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </main>

        <style jsx>{`
          .shop-wrapper {
            position: relative;
            min-height: 100vh;
            min-height: -webkit-fill-available;
            background-color: #FFFFFF;
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 80px;
          }

          .shop-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 16px 100px;
            gap: 16px;
            width: 100%;
            min-height: 100vh;
            box-sizing: border-box;
          }

          .shop-header {
            width: 100%;
            max-width: 343px;
            text-align: center;
            margin-bottom: 8px;
          }

          .shop-title {
            margin: 0 0 8px 0;
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 700;
            font-size: 28px;
            line-height: 110%;
            color: #000000;
          }

          .shop-subtitle {
            margin: 0;
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 16px;
            line-height: 120%;
            color: #666666;
          }

          .bot-warning {
            width: 100%;
            max-width: 343px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border: 2px solid #D72525;
            color: white;
            padding: 16px;
            border-radius: 16px;
            cursor: pointer;
            transition: opacity 0.2s;
            border: none;
          }

          .bot-warning:active {
            opacity: 0.9;
          }

          .warning-title {
            margin: 0 0 4px 0;
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 16px;
          }

          .warning-text {
            margin: 0;
            font-family: 'Cera Pro', sans-serif;
            font-weight: 400;
            font-size: 14px;
            text-decoration: underline;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            width: 100%;
            max-width: 343px;
          }

          .stat-card {
            background: #F1F1F1;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
          }

          .stat-value {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 32px;
            line-height: 100%;
            color: #EA0000;
            margin-bottom: 8px;
          }

          .stat-label {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 400;
            font-size: 14px;
            line-height: 110%;
            color: #000000;
          }

          .slot-section {
            width: 100%;
            max-width: 343px;
            background: #F1F1F1;
            border-radius: 16px;
            padding: 16px;
          }

          .slot-machine {
            height: 180px;
            margin-bottom: 16px;
          }

          .spin-button {
            width: 100%;
            height: 56px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            color: white;
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 18px;
            border: none;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.1s;
            box-shadow: 0 4px 0 0 rgba(220, 38, 38, 0.6);
            margin-bottom: 12px;
          }

          .spin-button:active:not(:disabled) {
            transform: translateY(2px);
            box-shadow: 0 2px 0 0 rgba(220, 38, 38, 0.6);
          }

          .spin-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .prizes-link {
            width: 100%;
            background: transparent;
            border: none;
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            text-align: center;
            letter-spacing: -0.05em;
            text-decoration-line: underline;
            color: #000000;
            cursor: pointer;
            padding: 8px 0;
            margin-bottom: 4px;
            transition: opacity 0.2s;
            -webkit-tap-highlight-color: transparent;
          }

          .prizes-link:active {
            opacity: 0.7;
          }

          .spin-cost {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 500;
            font-size: 14px;
            text-align: center;
            color: #EA0000;
          }

          .products-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0px;
            gap: 10px;
            width: 100%;
            max-width: 343px;
            flex: none;
            order: 5;
            flex-grow: 0;
          }

          .premium-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 16px;
            gap: 16px;
            width: 100%;
            background: #F1F1F1;
            border-radius: 16px;
            flex: none;
            order: 0;
            flex-grow: 0;
            box-sizing: border-box;
          }

          .premium-title {
            margin: 0;
            width: 100%;
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 24px;
            line-height: 100%;
            leading-trim: both;
            text-edge: cap;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .product-item {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 4px 0px;
            gap: 16px;
            width: 100%;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          .product-text {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 4px;
            flex: 1;
            order: 0;
            flex-grow: 1;
          }

          .product-name {
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            letter-spacing: -0.05em;
            color: #000000;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          .product-description {
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 300;
            font-size: 16px;
            line-height: 110%;
            letter-spacing: -0.02em;
            color: #000000;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          .purchase-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            padding: 0px;
            gap: 8px;
            flex: none;
            order: 1;
            flex-grow: 0;
          }

          .buy-button {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 8px 32px;
            gap: 10px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 30px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            border: none;
            cursor: pointer;
            transition: opacity 0.2s;
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            text-align: center;
            letter-spacing: -0.05em;
            color: #FFFFFF;
          }

          .buy-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .buy-button:active:not(:disabled) {
            opacity: 0.9;
          }

          .price-section {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0px;
            gap: 10px;
            flex: none;
            order: 1;
            flex-grow: 0;
          }

          .price-value {
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            display: flex;
            align-items: center;
            text-align: center;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .crystal-icon {
            width: 25px;
            height: 25px;
            flex: none;
            order: 1;
            flex-grow: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .error-message {
            width: 100%;
            max-width: 343px;
            background: #FEE2E2;
            border-left: 4px solid #DC2626;
            color: #991B1B;
            padding: 16px;
            border-radius: 8px;
          }

          .error-message p {
            margin: 0;
            font-family: 'Cera Pro', sans-serif;
            font-size: 14px;
          }

          @media (max-width: 375px) {
            .shop-title {
              font-size: 24px;
            }

            .premium-title {
              font-size: 20px;
            }
          }

          @supports (-webkit-touch-callout: none) {
            .shop-wrapper {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}