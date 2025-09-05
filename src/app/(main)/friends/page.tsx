'use client';

import { useState, useEffect } from 'react';
import Avatar from '../../components/Avatar';
import Image from 'next/image';

type UserProfile = {
  id: number;
  balance_crystals: number;
};

type Referral = {
  id: number;
  first_name: string;
  last_name: string | null;
};
const MY_ICON_PATH = '/images/134.png';

export default function FriendsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const initData = tg.initData;
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      })
      .then(response => {
        if (!response.ok) throw new Error(`Ошибка аутентификации: ${response.statusText}`);
        return response.json();
      })
      .then(userData => {
        if (userData && userData.error) {
          throw new Error(userData.error);
        }
        setUser(userData);
        return fetch('/api/referrals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
      })
      .then(response => {
        if (response) {
          if (!response.ok) throw new Error(`Ошибка загрузки друзей: ${response.statusText}`);
          return response.json();
        }
      })
      .then(referralsData => {
        if (referralsData) {
          setReferrals(referralsData);
        }
      })
      .catch(err => {
        console.error("Fetch error on friends page:", err);
        setError(err.message || "Не удалось загрузить данные.");
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
        setError("Telegram WebApp не найден. Откройте приложение в Telegram.");
        setLoading(false);
    }
  }, []);

  const handleInviteClick = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !user || !user.id) {
        console.error("User data or Telegram WebApp is not available.");
        tg?.showAlert('Не удалось создать ссылку. Попробуйте перезагрузить страницу.');
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

  const iconMaskStyle = (iconPath: string) => ({
    maskImage: `url(${iconPath})`,
    WebkitMaskImage: `url(${iconPath})`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-white">Загрузка...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  }

  return (
    <div className="flex flex-col min-h-full font-['Unbounded'] bg-white">
      
      <main className="flex-grow flex flex-col items-center p-6 text-center">

        <Image
                src={MY_ICON_PATH}
                alt="Бонусный кристалл"
                width={180}
                height={180}
            />
        
        <h1 className="text-2xl text-black font-extrabold leading-tight mb-6">
          Приглашай<br />друзей и получай<br />плюсы
        </h1>

        {referrals.length > 0 && (
          <div className="w-full max-w-sm mb-8">
            <h2 className="text-lg font-bold text-black mb-3 text-left">Вы пригласили: {referrals.length}</h2>
            <div
              className="flex flex-nowrap items-center overflow-x-auto py-2 
                         pl-1 pr-4
                         space-x-[-16px]
                         [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {referrals.map((ref, index) => (
                <Avatar
                  key={ref.id}
                  firstName={ref.first_name}
                  lastName={ref.last_name}
                  style={{ zIndex: referrals.length - index }}
                />
              ))}
            </div>
          </div>
        )}

      </main>
      <footer className="w-full px-6 pb-6 flex-shrink-0">
        <button 
          onClick={handleInviteClick}
          className="w-full h-16 flex items-center justify-center bg-red-500 text-white text-lg gap-2 font-medium rounded-2xl 
          transition-all
          shadow-[0_6px_0_0_rgba(0,0,0,0.3)] 
          active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)]">
          <span>Пригласить друга</span>
          <div 
            className="w-5 h-5 bg-white"
            style={iconMaskStyle(MY_ICON_PATH)} 
          />
          <span>500</span>
        </button>
      </footer>
    </div>
  );
}