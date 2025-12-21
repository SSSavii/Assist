// src/app/(main)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/app/context/UserContext';
import {
  ChevronRight,
  UserCircle,
  Wallet,
  Gift,
  Calendar,
  FileText,
} from 'lucide-react';

// ============================================
// ТИПЫ
// ============================================

interface Winning {
  id: number;
  prize_name: string;
  won_at: string;
  prize_type: string;
}

// ============================================
// КОМПОНЕНТЫ
// ============================================

interface ProfileLinkProps {
  icon?: React.ElementType;
  imageSrc?: string;
  iconBgColor?: string;
  text: string;
  subText?: string;
  href?: string;
  onClick?: () => void;
}

function ProfileLink({ icon: Icon, imageSrc, iconBgColor, text, subText, href, onClick }: ProfileLinkProps) {
  const content = (
    <>
      {imageSrc ? (
        <div className="relative h-10 w-10 flex-shrink-0">
          <Image 
            src={imageSrc} 
            alt={text}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      ) : (
        <div className={`p-2 rounded-md ${iconBgColor}`}>
          {Icon && <Icon className="h-5 w-5 text-white" />}
        </div>
      )}
      
      <span className="ml-4 font-semibold flex-grow">{text}</span>
      {subText && <span className="text-gray-500 mr-2">{subText}</span>}
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex items-center w-full p-3 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 active:bg-gray-300 text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href || '#'}
      className="flex items-center w-full p-3 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 active:bg-gray-300"
    >
      {content}
    </Link>
  );
}

interface BalanceDisplayProps {
  icon: React.ElementType;
  iconBgColor: string;
  text: string;
  balance: number;
}

function BalanceDisplay({ icon: Icon, iconBgColor, text, balance }: BalanceDisplayProps) {
  return (
    <div className="flex items-center w-full p-3 bg-gray-100 rounded-lg">
      <div className={`p-2 rounded-md ${iconBgColor}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="ml-4 font-semibold flex-grow">{text}</span>
      <span className="font-bold text-lg">{balance.toLocaleString('ru-RU')}</span>
    </div>
  );
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, error } = useUser();
  
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [winningsLoading, setWinningsLoading] = useState(false);
  const [isNavigationPressed, setIsNavigationPressed] = useState(false);

  // Загружаем выигрыши после загрузки user
  useEffect(() => {
    if (!user) return;
    
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;

    setWinningsLoading(true);
    
    fetch('/api/user/winnings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Не удалось загрузить историю выигрышей');
        return res.json();
      })
      .then(data => {
        setWinnings(data);
      })
      .catch(err => {
        console.error('Winnings fetch error:', err);
      })
      .finally(() => {
        setWinningsLoading(false);
      });
  }, [user]);

  // Обработчики переходов
  const handleNavigationClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    router.push('/navigation');
  };

  const handleTelegramLink = (url: string) => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    tg?.openTelegramLink(url);
  };

  // Загрузка
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white gap-4">
        <div className="loading-spinner"></div>
        <p className="text-gray-500 font-medium">Загрузка профиля...</p>
      </div>
    );
  }

  // Ошибка
  if (error || !user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white gap-4 px-4">
        <p className="text-red-500 text-center">{error || "Не удалось загрузить профиль"}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-red-500 text-white rounded-lg"
        >
          Перезагрузить
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-white text-black p-4 pt-8 pb-20 min-h-screen">
      {/* Аватар и имя */}
      <div className="flex flex-col items-center">
        {user.photo_url ? (
          <Image
            src={user.photo_url}
            alt="Avatar"
            width={150}
            height={150}
            priority
            className="rounded-full"
            unoptimized
          />
        ) : (
          <UserCircle className="h-24 w-24 text-gray-300" />
        )}
        <h2 className="text-2xl font-bold mt-4">
          {user.first_name} {user.last_name || ''}
        </h2>
      </div>

      {/* Меню */}
      <div className="w-full max-w-md mt-10 space-y-3">
        {/* Баланс */}
        <BalanceDisplay 
          icon={Wallet}
          iconBgColor="bg-green-500"
          text="Баланс"
          balance={user.balance_crystals}
        />

        {/* Random Coffee */}
        <ProfileLink
          imageSrc="/profile/Frame 30.png"
          text="Random coffee"
          onClick={() => handleTelegramLink('https://t.me/c/2782276287/324')}
        />

        {/* Сообщество */}
        <ProfileLink
          imageSrc="/profile/Frame 30-2.png"
          text="Сообщество АССИСТ+"
          onClick={() => handleTelegramLink('https://t.me/+6flpcSdc4sg5OTAy')}
        />

        {/* Поддержка */}
        <ProfileLink
          imageSrc="/profile/Frame 30-3.png"
          text="Поддержка"
          onClick={() => handleTelegramLink('https://t.me/KISLVVS')}
        />

        {/* Сотрудничество */}
        <ProfileLink
          imageSrc="/profile/Frame 30-4.png"
          text="Сотрудничество"
          onClick={() => handleTelegramLink('https://t.me/lesya_syeva')}
        />
        
        {/* AI Анализ резюме */}
        <ProfileLink
          icon={FileText}
          iconBgColor="bg-purple-500"
          text="AI Анализ резюме"
          subText="NEW"
          href="/resume"
        />

        {/* Кнопка навигации */}
        <button
          className={`flex items-center justify-between w-full p-5 bg-gradient-to-r from-[#F34444] to-[#D72525] rounded-3xl transition-transform shadow-lg ${isNavigationPressed ? 'scale-[0.98]' : ''}`}
          onClick={handleNavigationClick}
          onMouseDown={() => setIsNavigationPressed(true)}
          onMouseUp={() => setIsNavigationPressed(false)}
          onMouseLeave={() => setIsNavigationPressed(false)}
          onTouchStart={() => setIsNavigationPressed(true)}
          onTouchEnd={() => setIsNavigationPressed(false)}
        >
          <div className="text-white font-semibold text-lg text-left leading-tight">
            <div>Навигация</div>
            <div>по каналу АССИСТ+</div>
          </div>
          <div className="text-white flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 1L9 6L3 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      </div>

      {/* История выигрышей */}
      <div className="w-full max-w-md mt-8">
        <div className="flex items-center mb-4">
          <Gift className="h-6 w-6 text-red-500 mr-2" />
          <h3 className="text-xl font-bold">История выигрышей</h3>
        </div>

        {winningsLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Загрузка истории...</p>
          </div>
        ) : winnings.length > 0 ? (
          <div className="space-y-3">
            {winnings.map((winning) => (
              <div key={winning.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{winning.prize_name}</h4>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(winning.won_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    winning.prize_type === 'rare' || winning.prize_type === 'very_rare'
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {winning.prize_type === 'rare' || winning.prize_type === 'very_rare' ? 'Редкий' : 'Обычный'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">У вас пока нет выигрышей</p>
            <p className="text-sm text-gray-400 mt-1">Испытайте удачу в магазине!</p>
          </div>
        )}
      </div>
    </div>
  );
}