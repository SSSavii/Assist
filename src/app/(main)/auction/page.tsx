'use client';

import { useState, useEffect, useRef } from 'react';
import HorizontalTextSlotMachine from '@/app/components/TextSlotMachine';

type Prize = { 
  name: string; 
  type: 'rare' | 'common';
  canWin: boolean;
};

// Все возможные призы (точные из вашего списка)
const ALL_PRIZES: Prize[] = [
  // Редкие призы (малый шанс)
  { name: 'Онлайн-мини-разбор с Иваном', type: 'rare', canWin: true },
  { name: 'Приоритетное место в мини-разборе у Ивана', type: 'rare', canWin: true },
  { name: 'Участие в розыгрыше завтрака с Иваном', type: 'rare', canWin: false }, // Невыпадаемый приз
  { name: 'Ответ Ивана голосом на ваш вопрос', type: 'rare', canWin: true },
  { name: 'Звонок 1 на 1 с Антоном Орешкиным', type: 'rare', canWin: true },
  
  // Обычные призы (хороший шанс)
  { name: '3 чек-листа', type: 'common', canWin: true },
  { name: 'Участие в созвоне Антона Орешкина с БА', type: 'common', canWin: true },
  { name: '1000 A+', type: 'common', canWin: true },
  { name: 'Разбор вашего резюме', type: 'common', canWin: true }
];

interface UserProfile {
  id: number;
  balance_pluses: number;
  cases_to_open: number;
}

export default function ShopPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [spinKey, setSpinKey] = useState(0);
  const [showPrizeAlert, setShowPrizeAlert] = useState(false);
  const hasSpunRef = useRef(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError("Telegram WebApp не найден. Откройте приложение в Telegram.");
      setIsLoading(false);
      return;
    }

    tg.ready();
    // ВРЕМЕННО: симулируем данные пользователя для разработки
    const mockUser: UserProfile = {
      id: 1,
      balance_pluses: 455,
      cases_to_open: 5
    };
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  // Функция для получения случайного приза с учетом вероятности
  const getRandomPrize = (): Prize => {
    const random = Math.random();
    
    // Фильтруем призы, которые могут выпасть
    const availablePrizes = random < 0.2 
      ? ALL_PRIZES.filter(p => p.type === 'rare' && p.canWin)
      : ALL_PRIZES.filter(p => p.type === 'common' && p.canWin);
    
    return availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
  };

  const handleSpin = async () => {
    if (isSpinning || hasSpunRef.current) return;

    setIsSpinning(true);
    setError('');
    setWinningPrize(null);
    setShowPrizeAlert(false);
    hasSpunRef.current = true;

    try {
      window.Telegram?.WebApp?.HapticFeedback.impactOccurred('light');

      // ВРЕМЕННО: симулируем запрос к серверу для разработки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Определяем выигрыш
      const prize = getRandomPrize();
      setWinningPrize(prize);
      setSpinKey(prev => prev + 1);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsSpinning(false);
      hasSpunRef.current = false;
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('error');
    }
  };

  const handleSpinEnd = () => {
    if (winningPrize && !showPrizeAlert) {
      setShowPrizeAlert(true);
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
      window.Telegram?.WebApp.showAlert(`Поздравляем! Вы выиграли: ${winningPrize.name}`);
      
      // В реальном приложении здесь нужно обновить баланс пользователя
      // setUser(prev => prev ? { ...prev, cases_to_open: prev.cases_to_open - 1 } : null);
    }
    setIsSpinning(false);
    hasSpunRef.current = false;
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
          Баланс: <span className="font-semibold">{user?.balance_pluses || 0} плюсов</span>
        </div>
      </div>

      {/* Слот-машина */}
      <div className="w-full bg-white rounded-xl shadow-sm p-4 mb-5">
        <div className="h-64 mb-4">
          <HorizontalTextSlotMachine
            key={spinKey}
            prizes={ALL_PRIZES.map(p => ({ name: p.name, icon: '' }))}
            winningPrize={winningPrize ? { name: winningPrize.name, icon: '' } : null}
            onSpinEnd={handleSpinEnd}
          />
        </div>
        
        <button 
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full h-14 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white text-lg font-bold rounded-xl 
          transition-all
          shadow-[0_4px_0_0_rgba(91,33,182,0.6)] 
          active:translate-y-1 active:shadow-[0_1px_0_0_rgba(91,33,182,0.6)]
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? 'Крутится...' : `Крутить (${user?.cases_to_open || 0} шт.)`}
        </button>
        
        <div className="text-sm text-purple-600 font-medium mt-2">
          Крутить стоит 1 кейс
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
              disabled={!user || user.balance_pluses < 10000}
              className="bg-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Купить
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}