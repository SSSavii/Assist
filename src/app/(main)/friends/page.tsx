'use client';

import { useState, useEffect } from 'react';
import Avatar from '../../components/Avatar';
import Image from 'next/image';

type UserProfile = {
  id: number;
  tg_id: number;
  balance_crystals: number;
};

type Referral = {
  id: number;
  tg_id: number;
  first_name: string;
  last_name: string | null;
  photo_url?: string;
};

const MY_ICON_PATH = '/images/134.png';

export default function FriendsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError('Telegram WebApp недоступен');
      setLoading(false);
      return;
    }

    tg.ready();

    const initData = tg.initData;
    if (!initData) {
      setError('initData отсутствует');
      setLoading(false);
      return;
    }

    console.log('[Friends] Запрос к /api/auth...');
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Auth: ${res.status} ${await res.text()}`);
        return res.json();
      })
      .then((userData) => {
        console.log('[Friends] User data:', userData);
        setUser(userData);
        return fetch('/api/referrals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Referrals: ${res.status} ${await res.text()}`);
        return res.json();
      })
      .then((data) => {
        console.log('[Friends] Referrals data:', data);
        setReferrals(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Ошибка в FriendsPage:', err);
        setError(err.message || 'Не удалось загрузить данные');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isClient]);

  const handleInviteFriend = () => {
    const tg = window.Telegram?.WebApp;
    
    if (!tg) {
      console.error('Telegram WebApp недоступен');
      alert('Ошибка: приложение должно запускаться в Telegram');
      return;
    }

    if (!user?.tg_id) {
      console.error('User tg_id not found:', user);
      tg.showAlert('Ошибка: пользователь не загружен. Перезагрузите страницу.');
      return;
    }

    const botUsername = 'my_auction_admin_bot';
    const appName = 'assist_plus';

    const referralLink = `https://t.me/${botUsername}/${appName}?startapp=ref${user.tg_id}`;
    const shareText = `Привет! Запусти мини-приложение "Ассист+" и получай бонусы!`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;

    console.log('[Friends] Opening share URL:', shareUrl);
    console.log('[Friends] Referral link:', referralLink);

    tg.openTelegramLink(shareUrl);
  };

  if (!isClient) {
    return <div className="h-screen bg-white"></div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        Загрузка...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p><strong>Ошибка:</strong> {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Перезагрузить
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-['Unbounded'] bg-white">
      <main className="flex-grow flex flex-col items-center px-6 pt-6 pb-4">
        <Image src={MY_ICON_PATH} alt="Кристалл" width={180} height={180} />

        <h1 className="text-2xl text-black font-extrabold leading-tight mb-6 text-center">
          Приглашай<br />друзей и получай<br />плюсы
        </h1>

        <button
          onClick={() => setShowRules(true)}
          className="w-full max-w-sm h-16 mb-6 flex items-center justify-center bg-red-500 text-white text-lg font-medium rounded-2xl 
                    transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.3)] 
                    active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)]"
        >
          Условия розыгрышей и бонусов
        </button>

        <div className="w-full max-w-sm mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <h2 className="text-lg font-bold text-black mb-3 text-left">
            Вы пригласили: <span className="text-red-500">{referrals.length}</span>
          </h2>

          {referrals.length > 0 ? (
            <div className="flex flex-nowrap items-center overflow-x-auto py-2 pl-1 pr-4 space-x-[-16px] [&::-webkit-scrollbar]:hidden">
              {referrals.map((ref) => (
                <Avatar
                  key={ref.id}
                  firstName={ref.first_name}
                  lastName={ref.last_name}
                  photoUrl={ref.photo_url} 
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-left">Пока никто не присоединился</p>
          )}
        </div>
      </main>

      <footer className="w-full px-6 pb-6">
        <button
          onClick={handleInviteFriend}
          className="w-full h-16 flex items-center justify-center bg-red-500 text-white text-lg gap-2 font-medium rounded-2xl 
                    transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.3)] 
                    active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)]"
        >
          <span>Пригласить друга</span>
          <div
            className="w-5 h-5 bg-white"
            style={{
              maskImage: `url(${MY_ICON_PATH})`,
              WebkitMaskImage: `url(${MY_ICON_PATH})`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            }}
          />
          <span>500</span>
        </button>
      </footer>

      {showRules && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRules(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-black mb-3">Условия участия</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• 10 приглашений — возможность попасть на онлайн мини-разбор с Иваном Абрамовым. Разбор проводится еженедельно.</li>
              <li>• 20 приглашений — приоритетное место на мини-разборе, что гарантирует 100% участие в ближайшей сессии.</li>
              <li>• 30 приглашений — участие в ежемесячном розыгрыше завтрака с Иваном Абрамовым в Сколково.</li>
            </ul>
            <button
              onClick={() => setShowRules(false)}
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-xl font-medium"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}