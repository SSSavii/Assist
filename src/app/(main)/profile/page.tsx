'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  ChevronRight,
  Medal,
  UserCircle,
  Pencil,
  Wallet,
} from 'lucide-react';

type UserProfile = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  balance_crystals: number;
};

interface ProfileLinkProps {
  icon: React.ElementType;
  iconBgColor: string;
  text: string;
  subText?: string;
  href: string;
}

function ProfileLink({ icon: Icon, iconBgColor, text, subText, href }: ProfileLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center w-full p-3 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 active:bg-gray-300"
    >
      <div className={`p-2 rounded-md ${iconBgColor}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="ml-4 font-semibold flex-grow">{text}</span>
      {subText && <span className="text-gray-500 mr-2">{subText}</span>}
      <ChevronRight className="h-5 w-5 text-gray-400" />
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


export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (!response.ok) throw new Error('Не удалось загрузить данные пользователя');
        return response.json();
      })
      .then(data => {
        if (data && data.error) {
            throw new Error(data.error);
        }
        const fullUserData = {
            ...data,
            photo_url: tg.initDataUnsafe?.user?.photo_url,
        };
        setUser(fullUserData);
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
    } else {
        setLoading(false);
        setError("Приложение необходимо открыть в Telegram");
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-white">
        <p className="text-gray-500">Загрузка данных профиля...</p>
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
    <div className="flex flex-col items-center bg-white text-black p-4 pt-8">
      <div className="flex flex-col items-center">
        {user.photo_url ? (
          <Image
            src={user.photo_url}
            alt="User Avatar"
            width={150}
            height={150}
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
        <BalanceDisplay 
            icon={Wallet}
            iconBgColor="bg-green-500"
            text="Баланс"
            balance={user.balance_crystals}
        />

        <ProfileLink
          icon={Pencil}
          iconBgColor="bg-blue-500"
          text="Добавить описание"
          href="/profile/edit-bio"
        />

        <ProfileLink
          icon={Medal}
          iconBgColor="bg-purple-500"
          text="Добавить достижения"
          href="/profile/edit-awards"
        />

        <ProfileLink
          icon={Users}
          iconBgColor="bg-orange-500"
          text="Сообщество Assist+"
          href=""
        />
      </div>
    </div>
  );
}