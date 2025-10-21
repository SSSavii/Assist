/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import HorizontalTextSlotMachine from '@/app/components/TextSlotMachine';

type Prize = {
  name: string;
  type: 'rare' | 'common';
  canWin: boolean;
  deliveryType: 'instant' | 'bot_message' | 'manual';
};

const ALL_PRIZES: Prize[] = [
  // Редкие призы (малый шанс)
  { name: 'Онлайн-мини-разбор с Иваном', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: 'Приоритетное место в мини-разборе у Ивана', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: 'Участие в розыгрыше завтрака с Иваном', type: 'rare', canWin: false, deliveryType: 'manual' },
  { name: 'Ответ Ивана голосом на ваш вопрос', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: 'Звонок 1 на 1 с Антоном Орешкиным', type: 'rare', canWin: true, deliveryType: 'manual' },

  // Обычные призы (хороший шанс)
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

const CASE_COST = 1;

export default function ShopPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
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

    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Не удалось загрузить данные пользователя');
      return response.json();
    })
    .then(data => {
      if (data && data.error) {
        throw new Error(data.error);
      }
      setUser(data);
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
        // Мгновенное начисление (например, плюсы)
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
            
            // Показываем уведомление для мгновенных призов
            tg.showAlert(`🎉 Поздравляем! Вы выиграли: ${prize.name}\n\n✨ Плюсы начислены на ваш баланс!`);
          }
        }
      } else if (prize.deliveryType === 'bot_message') {
        // Отправка через бота (чек-листы и т.д.)
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
        // Ручная обработка (встречи, созвоны)
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

      // Сохраняем выигрыш в базу данных
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

  // Проверка наличия кейсов
  if (isSpinning || hasSpunRef.current || !user || user.cases_to_open <= 0) {
    if (user && user.cases_to_open <= 0) {
      tg?.showAlert('У вас недостаточно кейсов для прокрутки!');
    }
    return;
  }

  setIsSpinning(true);
  setError('');
  setWinningPrize(null); // ВАЖНО: сбрасываем приз перед новым спином
  hasSpunRef.current = true;
  isProcessingPrizeRef.current = false;

  try {
    tg?.HapticFeedback.impactOccurred('light');

    // Уменьшаем количество кейсов
    const response = await fetch('/api/user/use-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initData: tg?.initData,
        caseCost: CASE_COST
      }),
    });

    if (!response.ok) {
      throw new Error('Не удалось использовать кейс');
    }

    const data = await response.json();
    
    setUser(prev => prev ? { 
      ...prev, 
      cases_to_open: data.newCasesCount
    } : null);

    await new Promise(resolve => setTimeout(resolve, 100)); // Небольшая задержка
    
    const prize = getRandomPrize();
    setSpinKey(prev => prev + 1); // Сначала меняем ключ
    setWinningPrize(prize); // Потом устанавливаем приз
    
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    setIsSpinning(false);
    hasSpunRef.current = false;
    tg?.HapticFeedback.notificationOccurred('error');
    tg?.showAlert('Произошла ошибка. Попробуйте еще раз.');
  }
};

  const handleSpinEnd = () => {
    if (winningPrize && !isProcessingPrizeRef.current) {
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
      
      // Начисляем приз только после фактического выпадения
      handlePrizeDelivery(winningPrize);
    }
    
    // Сбрасываем состояние после окончания анимации
    setTimeout(() => {
      setIsSpinning(false);
      hasSpunRef.current = false;
    }, 500);
  };

  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white"><p>Загрузка...</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans items-center px-4 pt-6 pb-4 text-center text-black bg-gray-50">
      {/* Заголовок магазина */}
      <div className="w-full mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Магазин
        </h1>
        <p className="text-gray-600">
          Обменивай свои плюсы на интересные товары!
        </p>
      </div>
      
      {/* Блок с балансом */}
      <div className="w-full bg-white rounded-xl shadow-sm p-5 mb-5">
        <div className="text-gray-700 mb-4">
          У вас доступно <span className="font-semibold">{user?.cases_to_open || 0} кейсов</span>
        </div>
        <div className="text-gray-700">
          Баланс: <span className="font-semibold">
            {user?.balance_crystals?.toLocaleString('ru-RU') || 0} плюсов
          </span>
        </div>
      </div>

      {/* Предупреждение о боте - оставляем для визуала */}
      {!user?.bot_started && (
        <div className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-5 rounded">
          <p className="font-bold">Внимание!</p>
          <p>Запустите бота для получения призов</p>
        </div>
      )}

      {/* Слот-машина */}
      <div className="w-full bg-white rounded-xl shadow-sm p-4 mb-5">
        <div className="h-64 mb-4">
          <HorizontalTextSlotMachine
            key={spinKey}
            spinId={spinKey} // Передаем spinKey как spinId
            prizes={ALL_PRIZES.map(p => ({ name: p.name, icon: '' }))}
            winningPrize={winningPrize ? { name: winningPrize.name, icon: '' } : null}
            onSpinEnd={handleSpinEnd}
          />
        </div>
        
        <button 
          onClick={handleSpin}
          disabled={isSpinning || !user || user.cases_to_open <= 0}
          className="w-full h-14 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white text-lg font-bold rounded-xl 
          transition-all
          shadow-[0_4px_0_0_rgba(91,33,182,0.6)] 
          active:translate-y-1 active:shadow-[0_1px_0_0_rgba(91,33,182,0.6)]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0"
        >
          {isSpinning ? 'Крутится...' : `Крутить (${user?.cases_to_open || 0} шт.)`}
        </button>
        
        <div className="text-sm text-purple-600 font-medium mt-2">
          Крутить стоит {CASE_COST} кейс
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
            <span className="text-purple-600 font-bold mr-3">10,000 плюсов</span>
            <button 
              disabled={!user || user.balance_crystals < 10000}
              className="bg-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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