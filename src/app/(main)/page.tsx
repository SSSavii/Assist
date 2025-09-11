'use client';

import { useState, useEffect } from 'react';
import BalanceCard from 'wxqryy/app/components/BalanceCard';

type UserProfile = {
  id: number;
  balance_crystals: number;
  cases_to_open: number;
  daily_taps_count: number;
  last_tap_date: string | null;
  subscribed_to_channel?: boolean;
  voted_for_channel?: boolean;
};

interface TaskCardProps {
  title: string;
  reward: number;
  buttonText: string;
  checkButtonText: string;
  action: () => void;
  checkAction: () => void;
  disabled?: boolean;
  isCompleted?: boolean;
}

function TaskCard({ 
  title, 
  reward, 
  buttonText, 
  checkButtonText, 
  action, 
  checkAction, 
  disabled = false, 
  isCompleted = false 
}: TaskCardProps) {
  return (
    <div className={`${isCompleted ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-2xl flex flex-col w-full`}>
      <div>
        <p className="font-extrabold text-sm">{title}</p> 
      </div>
      <div className="flex justify-between items-center mt-1.5"> 
        <div className="flex items-center mt-2">
          <span className="font-bold text-lg">+{reward}</span>
          <div 
            className="ml-1 h-5 w-5 bg-white"
            style={{
              maskImage: `url('/images/crystal.png')`,
              WebkitMaskImage: `url('/images/crystal.png')`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
            }}
          />
        </div>

        <div className="flex gap-1">
          <button 
            onClick={action}
            disabled={disabled || isCompleted}
            className="bg-white text-black font-medium py-1 px-2 rounded-full text-xs min-w-[60px] h-8 flex items-center justify-center active:scale-95 disabled:opacity-50"
          >
            {buttonText}
          </button>

          <button 
            onClick={checkAction}
            disabled={isCompleted}
            className="bg-blue-500 text-white font-medium py-1 px-2 rounded-full text-xs min-w-[60px] h-8 flex items-center justify-center active:scale-95 disabled:opacity-50"
          >
            {isCompleted ? 'Готово' : checkButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tapsLeft, setTapsLeft] = useState(0);
  const DAILY_TAP_LIMIT = 100;

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      })
      .then(response => {
        if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
        return response.json();
      })
      .then((data: UserProfile) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((data as any).error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setError((data as any).error);
        } else {
          setUser(data);
          const today = new Date().toISOString().split('T')[0];
          if (data.last_tap_date === today) {
            setTapsLeft(Math.max(0, DAILY_TAP_LIMIT - data.daily_taps_count));
          } else {
            setTapsLeft(DAILY_TAP_LIMIT);
          }
        }
      })
      .catch(err => {
        console.error("Auth fetch error:", err);
        setError("Не удалось связаться с сервером.");
      })
      .finally(() => setLoading(false));
    } else {
      setError("Пожалуйста, откройте приложение в Telegram.");
      setLoading(false);
    }
  }, []);

  const handleEarnCrystals = () => {
    const tg = window.Telegram?.WebApp;
    if (!user || !tg?.initData || tapsLeft <= 0) return;
    setTapsLeft(prev => prev - 1);
    setUser(prevUser => {
        if (!prevUser) return null;
        return {
            ...prevUser,
            balance_crystals: prevUser.balance_crystals + 1,
            daily_taps_count: prevUser.daily_taps_count + 1
        };
    });

    fetch('/api/tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('Tap error:', data.error);
        
        setUser(prevUser => {
            if (!prevUser) return null;
            const newBalance = (prevUser.balance_crystals || 0) - 1;
            const newTaps = (prevUser.daily_taps_count || 0) - 1;
            return {
                ...prevUser,
                balance_crystals: newBalance < 0 ? 0 : newBalance,
                daily_taps_count: newTaps < 0 ? 0 : newTaps
            };
        });
        
        if (typeof data.tapsLeft === 'number') {
            setTapsLeft(data.tapsLeft);
        } else {
            setTapsLeft(prev => prev + 1);
        }
        
        if (data.error === 'Daily tap limit reached') {
            tg.showAlert('Плюсы на сегодня закончились! Возвращайся завтра.');
        }

      } else {
        if (typeof data.newBalance === 'number') {
            setUser(prev => prev ? { ...prev, balance_crystals: data.newBalance } : null);
        }
        if (typeof data.tapsLeft === 'number') {
            setTapsLeft(data.tapsLeft);
        }
      }
    })
    .catch(err => {
      console.error('Tap fetch error:', err);
      setTapsLeft(prev => prev + 1);
      setUser(prevUser => {
          if (!prevUser) return null;
          return {
              ...prevUser,
              balance_crystals: prevUser.balance_crystals - 1,
              daily_taps_count: prevUser.daily_taps_count - 1
          };
      });
      tg.showAlert('Произошла ошибка сети. Попробуйте еще раз.');
    });
};
  
  const handleInviteFriend = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !user || !user.id) {
        tg?.showAlert('Не удалось создать ссылку. Пожалуйста, перезагрузите страницу.');
        return;
    }
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
    if (!botUsername || !botName) {
        console.error("Bot username or app name is not set in .env.local");
        tg?.showAlert('Ошибка конфигурации приложения.');
        return;
    }
    const referralLink = `https://t.me/${botUsername}/${botName}?startapp=ref_${user.id}`;
    const shareText = `Привет! Присоединяйся к "Ассист+" и получай бонусы. Поможем друг другу найти крутые знакомства и возможности!`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    tg.openTelegramLink(shareUrl);
  };

const checkTask = (taskId: 'subscribe' | 'vote' | 'invite') => {
  const tg = window.Telegram?.WebApp;
  if (!tg?.initData) return;

  fetch('/api/check-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData: tg.initData, taskId }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                balance_crystals: data.newBalance,
                subscribed_to_channel: taskId === 'subscribe' ? true : prev.subscribed_to_channel,
                voted_for_channel: taskId === 'vote' ? true : prev.voted_for_channel,
              }
            : null
        );
        tg.showAlert(data.message || `Награда получена: +${data.reward} плюсов!`);
      } else {
        tg.showAlert(data.message || 'Условия не выполнены.');
      }
    })
    .catch((err) => {
      console.error(`Check ${taskId} error:`, err);
      tg.showAlert('Ошибка соединения с сервером.');
    });
};

  const handleSubscribeToChannel = () => {
    const tg = window.Telegram?.WebApp;
    tg?.openTelegramLink('https://t.me/assistplus_business');
  };

  const handleVoteForChannel = () => {
    const tg = window.Telegram?.WebApp;
    tg?.openTelegramLink('https://t.me/assistplus_business');
  };

  const tasks = [
  { 
    title: 'Подпишись на Ассист+', 
    reward: 100, 
    buttonText: 'Подписаться',
    checkButtonText: 'Проверить',
    action: handleSubscribeToChannel,
    checkAction: () => checkTask('subscribe'),
    isCompleted: user?.subscribed_to_channel
  },
  { 
    title: 'Отдай голос на улучшение канала', 
    reward: 500, 
    buttonText: 'Проголосовать',
    checkButtonText: 'Проверить',
    action: handleVoteForChannel,
    checkAction: () => checkTask('vote'),
    isCompleted: user?.voted_for_channel
  },
  { 
    title: 'Пригласи друга', 
    reward: 500, 
    buttonText: 'Пригласить',
    checkButtonText: 'Проверить',
    action: handleInviteFriend,
    checkAction: () => checkTask('invite'), // пока не реализовано — можно оставить заглушку
    isCompleted: false // или добавь логику позже
  },
];

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-white text-gray-500">Загрузка...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  }
  if (!user) {
    return <div className="p-4 text-center text-gray-500">Не удалось загрузить данные пользователя.</div>;
  }

  return (
    <div className="flex flex-col font-['Unbounded'] items-center text-center text-black bg-white pt-2">
      <h1 className="text-6xl font-black mb-2">
        Ассист<span className="text-red-500">+</span>
      </h1>
      
      {/* Кнопка подписаться на канал */}
      <div className="w-full max-w-sm px-4 mb-4">
        <button 
          onClick={handleSubscribeToChannel}
          className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-2xl text-lg transition-all active:scale-95"
        >
          Подписаться на канал
        </button>
      </div>

      <div className="w-full max-w-sm pb-2">
        <BalanceCard
          balance={user.balance_crystals}
          onButtonClick={handleEarnCrystals}
          tapsLeft={tapsLeft}
          tapLimit={DAILY_TAP_LIMIT}
        />
      </div>
      <p className="text-l font-bold pl-4 pr-4 pb-2 max-w-sm">
        Зарабатывай плюсы и меняй их в аукционе знакомств
      </p>
      
      <div className="w-full max-w-sm px-4 text-left">
        <h2 className="text-red-500 font-bold mt-2 text-sm mb-1 ml-2">ЗАДАНИЯ</h2>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <TaskCard key={index} {...task} />
          ))}
        </div>
      </div>
    </div>
  );
}