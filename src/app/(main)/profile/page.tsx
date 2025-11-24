'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  UserCircle,
  Wallet,
  Gift,
  Calendar,
} from 'lucide-react';

type UserProfile = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  balance_crystals: number;
};

interface Winning {
  id: number;
  prize_name: string;
  won_at: string;
  prize_type: string;
}

interface ProfileLinkProps {
  icon?: React.ElementType; // Делаем необязательным, так как может быть картинка
  imageSrc?: string;        // Добавляем проп для картинки
  iconBgColor?: string;     // Необязателен, если есть картинка
  text: string;
  subText?: string;
  href?: string;
  onClick?: () => void;
}

function ProfileLink({ icon: Icon, imageSrc, iconBgColor, text, subText, href, onClick }: ProfileLinkProps) {
  const content = (
    <>
      {/* Если передана картинка, показываем её, иначе показываем иконку с фоном */}
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

// Функция предзагрузки аватарки
const preloadAvatar = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve даже при ошибке
  });
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [winningsLoading, setWinningsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavigationPressed, setIsNavigationPressed] = useState(false);

  const handleNavigationClick = () => {
    router.push('/navigation');
  };

  const handleCommunityClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.openTelegramLink('https://t.me/+6flpcSdc4sg5OTAy');
    }
  };

  const handleRandomCoffeeClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.openTelegramLink('https://t.me/c/2782276287/324');
    }
  };

  const handleSupportClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.openTelegramLink('https://t.me/KISLVVS');
    }
  };

  const handleCooperationClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.openTelegramLink('https://t.me/lesya_syeva');
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      
      const photoUrl = tg.initDataUnsafe?.user?.photo_url;
      
      // Если есть аватарка - предзагружаем её
      if (photoUrl) {
        preloadAvatar(photoUrl).then(() => {
          setAvatarLoaded(true);
        });
      } else {
        // Если нет аватарки - сразу помечаем как загруженную
        setAvatarLoaded(true);
      }
      
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
        const fullUserData = {
            ...data,
            photo_url: photoUrl,
        };
        setUser(fullUserData);
        
        // Загружаем историю выигрышей после загрузки профиля
        setWinningsLoading(true);
        return fetch('/api/user/winnings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData }),
        });
      })
      .then(response => {
        if (!response.ok) throw new Error('Не удалось загрузить историю выигрышей');
        return response.json();
      })
      .then(winningsData => {
        setWinnings(winningsData);
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        setWinningsLoading(false);
      });
    } else {
        setLoading(false);
        setAvatarLoaded(true);
        setError("Приложение необходимо открыть в Telegram");
    }
  }, []);

  // Показываем загрузку пока не загрузились данные И аватарка
  if (loading || !avatarLoaded) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-white gap-4">
        <div className="loading-spinner"></div>
        <p className="text-gray-500">Загрузка данных профиля...</p>
        <style jsx>{`
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3b82f6;
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

  if (error || !user) {
      return (
        <div className="flex justify-center items-center h-full bg-white">
            <p className="text-red-500">{error || "Не удалось загрузить профиль."}</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center bg-white text-black p-4 pt-8 pb-20">
      <div className="flex flex-col items-center">
        {user.photo_url ? (
          <Image
            src={user.photo_url}
            alt="User Avatar"
            width={150}
            height={150}
            priority
            quality={100}
            className="rounded-full"
          />
        ) : (
          <UserCircle className="h-24 w-24 text-gray-300" />
        )}
        <h2 className="text-2xl font-bold mt-4">
          {user.first_name} {user.last_name || ''}
        </h2>
      </div>

      <div className="w-full max-w-md mt-10 space-y-3">
        {/* Баланс */}
        <BalanceDisplay 
            icon={Wallet}
            iconBgColor="bg-green-500"
            text="Баланс"
            balance={user.balance_crystals}
        />

        {/* Random Coffee - Картинка Frame 30.png */}
        <ProfileLink
          imageSrc="/profile/Frame 30.png"
          text="Random coffee"
          onClick={handleRandomCoffeeClick}
        />

        {/* Сообщество - Картинка Frame 30-2.png */}
        <ProfileLink
          imageSrc="/profile/Frame 30-2.png"
          text="Сообщество АССИСТ+"
          onClick={handleCommunityClick}
        />

        {/* Поддержка - Картинка Frame 30-3.png */}
        <ProfileLink
          imageSrc="/profile/Frame 30-3.png"
          text="Поддержка"
          onClick={handleSupportClick}
        />

        {/* Сотрудничество - Картинка Frame 30-4.png */}
        <ProfileLink
          imageSrc="/profile/Frame 30-4.png"
          text="Сотрудничество"
          onClick={handleCooperationClick}
        />

        {/* Кнопка навигации по каналу АССИСТ+ */}
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

      {/* Раздел истории выигрышей */}
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
                    winning.prize_type === 'rare' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {winning.prize_type === 'rare' ? 'Редкий приз' : 'Обычный приз'}
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