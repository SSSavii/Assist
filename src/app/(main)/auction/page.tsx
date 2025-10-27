/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import HorizontalTextSlotMachine from '@/app/components/TextSlotMachine';

const GlobalStyles = () => (
  <>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Light.woff2') format('woff2'),
             url('/fonts/CeraPro-Light.woff') format('woff');
        font-weight: 300;
        font-style: normal;
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Medium.woff2') format('woff2'),
             url('/fonts/CeraPro-Medium.woff') format('woff');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Bold.woff2') format('woff2'),
             url('/fonts/CeraPro-Bold.woff') format('woff');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
      
      body {
        font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
    `}</style>
  </>
);

type Prize = {
  name: string;
  type: 'rare' | 'common';
  canWin: boolean;
  deliveryType: 'instant' | 'bot_message' | 'manual';
};

const ALL_PRIZES: Prize[] = [
  { name: 'Онлайн-мини-разбор с Иваном', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: 'Приоритетное место в мини-разборе у Ивана', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: 'Участие в розыгрыше завтрака с Иваном', type: 'rare', canWin: false, deliveryType: 'manual' },
  { name: 'Ответ Ивана голосом на ваш вопрос', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: 'Звонок 1 на 1 с Антоном Орешкиным', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: '3 чек-листа', type: 'common', canWin: true, deliveryType: 'bot_message' },
  { name: 'Участие в созвоне Антона Орешкина с БА', type: 'common', canWin: true, deliveryType: 'manual' },
  { name: '1000 A+', type: 'common', canWin: true, deliveryType: 'instant' },
  { name: 'Разбор вашего резюме', type: 'common', canWin: true, deliveryType: 'manual' }
];

interface UserProfile {
  id: number;
  tg_id: number;
  balance_crystals: number;
  cases_to_open: number;
  bot_started?: boolean;
}

interface DailyLimit {
  remaining: number;
  used: number;
  maxLimit: number;
}

const CASE_COST = 500;

export default function ShopPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [spinKey, setSpinKey] = useState(0);
  const hasSpunRef = useRef(false);
  const isProcessingPrizeRef = useRef(false);

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
    const random = Math.random();
    const availablePrizes = random < 0.2 
      ? ALL_PRIZES.filter(p => p.type === 'rare' && p.canWin)
      : ALL_PRIZES.filter(p => p.type === 'common' && p.canWin);

    return availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
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
          if (prize.name === '1000 A+') {
            setUser(prev => prev ? {
              ...prev,
              balance_crystals: data.newBalance || (prev.balance_crystals + 1000)
            } : null);
            
            tg.showAlert(`🎉 Поздравляем! Вы выиграли: ${prize.name}\n\n✨ Плюсы начислены на ваш баланс!`);
          }
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
        
        tg.showAlert(`🎉 Поздравляем! Вы выиграли: ${prize.name}\n\n📬 Приз отправлен вам в бот!`);
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
    setWinningPrize(null);
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
    
    setTimeout(() => {
      setIsSpinning(false);
      hasSpunRef.current = false;
    }, 500);
  };

  const handleOpenBot = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    const botUsername = 'my_auction_admin_bot';
    tg?.openTelegramLink(`https://t.me/${botUsername}`);
  };

  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white"><p>Загрузка...</p></div>;
  }

  // Вычисляем disabled для кнопки крутилки
  const isSpinDisabled = isSpinning || 
                         !user || 
                         (user?.balance_crystals ?? 0) < CASE_COST || 
                         (dailyLimit?.remaining ?? 0) <= 0;

  // Вычисляем disabled для кнопки покупки
  const isBuyDisabled = !user || (user?.balance_crystals ?? 0) < 10000;

  return (
    <div className="flex flex-col min-h-screen font-sans items-center px-4 pt-6 pb-4 text-center text-black bg-gray-50">
      <GlobalStyles />
      
      {/* Заголовок магазина */}
      <div className="w-full mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Магазин
        </h1>
        <p className="text-gray-600">
          Обменивай свои плюсы на интересные товары!
        </p>
      </div>
      
      {/* Предупреждение о боте */}
      {!user?.bot_started && (
        <button 
          onClick={handleOpenBot}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 border-red-600 text-white p-4 mb-5 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
        >
          <p className="font-bold">Внимание!</p>
          <p className="underline">Запустите бота для получения призов</p>
        </button>
      )}

      {/* Блок с балансом */}
      <div className="w-full grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {dailyLimit?.remaining || 0}/{dailyLimit?.maxLimit || 5}
          </div>
          <div className="text-sm text-gray-600">Осталось<br/>открытий</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {user?.balance_crystals?.toLocaleString('ru-RU') || 0}
          </div>
          <div className="text-sm text-gray-600">Текущий<br/>баланс</div>
        </div>
      </div>

      {/* Слот-машина */}
      <div className="w-full bg-white rounded-xl shadow-sm p-4 mb-5">
        <div className="h-64 mb-4">
          <HorizontalTextSlotMachine
            key={spinKey}
            spinId={spinKey}
            prizes={ALL_PRIZES.map(p => ({ name: p.name, icon: '' }))}
            winningPrize={winningPrize ? { name: winningPrize.name, icon: '' } : null}
            onSpinEnd={handleSpinEnd}
          />
        </div>
        
        <button 
          onClick={handleSpin}
          disabled={isSpinDisabled}
          className="w-full h-14 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold rounded-xl 
          transition-all
          shadow-[0_4px_0_0_rgba(220,38,38,0.6)] 
          active:translate-y-1 active:shadow-[0_1px_0_0_rgba(220,38,38,0.6)]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0"
        >
          {isSpinning ? 'Крутится...' : `Крутить`}
        </button>
        
        <div className="text-sm text-red-600 font-medium mt-2">
          Крутить стоит {CASE_COST} А+
        </div>
      </div>

      {/* Товар - созвон */}
      <div className="w-full bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-bold mb-4">Премиум товар</h2>
        
        <div className="flex justify-between items-center py-3">
          <div className="text-left">
            <div className="font-medium">Созвон с кумиром</div>
            <div className="text-sm text-gray-500">30 минут личного общения</div>
          </div>
          <div className="flex items-center">
            <span className="text-red-600 font-bold mr-3">10,000 плюсов</span>
            <button 
              disabled={isBuyDisabled}
              className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Купить
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-5 rounded">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}