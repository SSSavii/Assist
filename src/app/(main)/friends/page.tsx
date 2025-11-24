/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    
    {/* Preload главного изображения с высоким приоритетом */}
    <link 
      rel="preload" 
      href="/images/friends-header.png" 
      as="image" 
      fetchPriority="high"
    />
    
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

type UserProfile = {
  id: number;
  tg_id: number;
  balance_crystals: number;
  referral_count: number;
  current_month_referrals: number;
  cases_to_open: number;
};

// Функция предзагрузки изображения
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve даже при ошибке
  });
};

export default function FriendsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Предзагрузка изображения
  useEffect(() => {
    preloadImage('/images/friends-header.png').then(() => {
      setImageLoaded(true);
    });
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();
    }
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop = 0;
    }
    
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 10);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError('Telegram WebApp недоступен');
      setLoading(false);
      return;
    }

    const initData = tg.initData;
    if (!initData) {
      setError('initData отсутствует');
      setLoading(false);
      return;
    }

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
      })
      .catch((err) => {
        console.error('Ошибка в FriendsPage:', err);
        setError(err.message || 'Не удалось загрузить данные');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setTimeLeft({ days, hours });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleInviteFriend = () => {
    const tg = window.Telegram?.WebApp;
    
    if (!tg) {
      console.error('Telegram WebApp недоступен');
      alert('Ошибка: приложение должно запускаться в Telegram');
      return;
    }

    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }

    if (!user?.tg_id) {
      console.error('User tg_id not found:', user);
      tg.showAlert('Ошибка: пользователь не загружен. Перезагрузите страницу.');
      return;
    }

    const botUsername = 'my_auction_admin_bot';
    const appName = 'assist_plus';

    const referralLink = `https://t.me/${botUsername}/${appName}?startapp=ref${user.tg_id}`;
    const shareText = `Привет! Запусти мини-приложение АССИСТ+ и получай бонусы!`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;

    tg.openTelegramLink(shareUrl);
  };

  const handleRulesClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    router.push('/friends/condition');
  };

  // Показываем загрузку пока не загрузились данные И изображение
  if (loading || !imageLoaded) {
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
            height: -webkit-fill-available;
            background-color: #FFFFFF;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #666666;
            gap: 16px;
          }
          
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #ff0000ff;
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

  if (error) {
    return (
      <div className="error-container">
        <p><strong>Ошибка:</strong> {error}</p>
        <button onClick={() => window.location.reload()} className="reload-button">
          Перезагрузить
        </button>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="friends-wrapper" ref={wrapperRef}>
        <main className="friends-container">
          <div className="content-container">
            <div className="header-section">
              <div className="header-image-absolute">
                <Image 
                  src="/images/friends-header.png" 
                  alt="Приглашай друзей" 
                  width={343} 
                  height={300}
                  priority
                  quality={100}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </div>

            <div className="buttons-overlay">
              <div className="info-card">
                <div className="info-row">
                  <span className="info-label">Вы пригласили: </span>
                  <span className="info-value" style={{ color: '#ff0000ff' }}>
                    {user?.referral_count || 0}
                  </span>
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-value" style={{ color: '#ff0000ff' }}>
                    {timeLeft.days}д {timeLeft.hours}ч
                  </div>
                  <div className="stat-label">Осталось времени<br />до конца розыгрыша</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value" style={{ color: '#ff0000ff' }}>
                    {user?.current_month_referrals || 0}
                  </div>
                  <div className="stat-label">Вы пригласили<br />в этом розыгрыше</div>
                </div>
              </div>

              <button className="rules-button" onClick={handleRulesClick}>
                Условия участия в розыгрышах
              </button>

              <button 
                className="invite-button" 
                onClick={handleInviteFriend}
                style={{ background: 'linear-gradient(243.66deg, #ff0000ff 10.36%, #E72525 86.45%)' }}
              >
                <span className="invite-text">Пригласить друга</span>
                <span className="invite-bonus">+500 плюсов</span>
                <div className="glow-top"></div>
                <div className="glow-bottom"></div>
              </button>
            </div>
          </div>
        </main>

        <style jsx>{`
          .friends-wrapper {
            position: relative;
            min-height: 100vh;
            min-height: -webkit-fill-available;
            background-color: #FFFFFF;
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: auto;
            padding-bottom: 0;
          }

          .friends-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 56px 0px 100px;
            gap: 10px;
            isolation: isolate;
            position: relative;
            width: 100%;
            min-height: 812px;
            background: #FFFFFF;
            box-sizing: border-box;
          }

          .content-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px 16px;
            width: 100%;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            z-index: 0;
            box-sizing: border-box;
            position: relative;
          }

          .header-section {
            width: 100%;
            position: relative;
            height: 300px;
            margin-bottom: -10px;
            z-index: 0;
          }

          .header-image-absolute {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 0;
          }

          .buttons-overlay {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
          }

          .info-card {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding: 24px 16px;
            gap: 8px;
            width: 100%;
            height: 72px;
            background: #F1F1F1;
            border-radius: 15px;
            flex: none;
            align-self: stretch;
            flex-grow: 0;
            box-sizing: border-box;
          }

          .info-row {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0px;
            gap: 0px;
            height: 24px;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .info-label {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 24px;
            line-height: 100%;
            display: flex;
            align-items: center;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
            white-space: nowrap;
          }

          .info-value {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 24px;
            line-height: 100%;
            display: flex;
            align-items: center;
            letter-spacing: -0.03em;
            flex: none;
            order: 1;
            flex-grow: 0;
          }

          .stats-row {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 0px;
            gap: 8px;
            width: 100%;
            height: 103px;
            flex: none;
            align-self: stretch;
            flex-grow: 0;
          }

          .stat-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 0px 16px 16px;
            gap: 12px;
            width: 167.5px;
            height: 103px;
            background: #F1F1F1;
            border-radius: 16px;
            flex: none;
            order: 0;
            flex-grow: 1;
            box-sizing: border-box;
          }

          .stat-value {
            width: auto;
            height: 21px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 32px;
            line-height: 110%;
            leading-trim: both;
            text-edge: cap;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.03em;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .stat-label {
            width: auto;
            max-width: 136px;
            height: 30px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 110%;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.02em;
            color: #000000;
            flex: none;
            order: 1;
            flex-grow: 0;
          }

          .rules-button {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 10px 15px;
            gap: 10px;
            width: 100%;
            height: 60px;
            background: #F1F1F1;
            border-radius: 15px;
            flex: none;
            align-self: stretch;
            flex-grow: 0;
            border: none;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            transition: opacity 0.2s;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 20px;
            line-height: 100%;
            text-align: center;
            letter-spacing: -0.02em;
            color: #000000;
            box-sizing: border-box;
          }

          .rules-button:active {
            opacity: 0.7;
          }

          .invite-button {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 10px 16px;
            gap: 8px;
            isolation: isolate;
            width: 100%;
            height: 69px;
            border-radius: 15px;
            flex: none;
            align-self: stretch;
            flex-grow: 0;
            border: none;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            position: relative;
            overflow: hidden;
            transition: transform 0.1s;
            box-sizing: border-box;
          }

          .invite-button:active {
            transform: scale(0.98);
          }

          .invite-text {
            width: 215px;
            height: 20px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            text-align: center;
            letter-spacing: -0.03em;
            color: #FFFFFF;
            flex: none;
            order: 0;
            flex-grow: 0;
            z-index: 0;
          }

          .invite-bonus {
            width: 203px;
            height: 21px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 20px;
            line-height: 100%;
            text-align: center;
            letter-spacing: -0.02em;
            color: #FFFFFF;
            flex: none;
            order: 1;
            flex-grow: 0;
            z-index: 1;
          }

          .glow-top {
            position: absolute;
            width: 60px;
            height: 60px;
            right: 24px;
            top: -23px;
            background: rgba(255, 255, 255, 0.8);
            filter: blur(50px);
            flex: none;
            order: 2;
            flex-grow: 0;
            z-index: 2;
            pointer-events: none;
          }

          .glow-bottom {
            position: absolute;
            width: 77px;
            height: 77px;
            left: 39px;
            bottom: -32px;
            background: rgba(255, 255, 255, 0.8);
            filter: blur(75px);
            flex: none;
            order: 3;
            flex-grow: 0;
            z-index: 3;
            pointer-events: none;
          }

          .error-container {
            padding: 24px;
            text-align: center;
            color: #ff0000ff;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
          }

          .reload-button {
            margin-top: 16px;
            padding: 12px 24px;
            background: #ff0000ff;
            color: white;
            border: none;
            border-radius: 12px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            cursor: pointer;
          }

          @media (max-width: 375px) {
            .friends-container {
              padding: 48px 0px 100px;
            }

            .header-section {
              margin-bottom: -20px;
            }

            .info-label,
            .info-value {
              font-size: 20px;
            }

            .stat-value {
              font-size: 28px;
            }
          }

          @supports (-webkit-touch-callout: none) {
            .friends-wrapper {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}