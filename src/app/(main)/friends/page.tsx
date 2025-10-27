'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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

type UserProfile = {
  id: number;
  tg_id: number;
  balance_crystals: number;
  referral_count: number;
  current_month_referrals: number;
  cases_to_open: number;
};

export default function FriendsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Инициализация Telegram WebApp
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();
    }
  }, []);

  // Скролл в начало
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

  // Загрузка данных пользователя
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

  // Таймер до конца месяца
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
    const interval = setInterval(updateTimer, 60000); // обновляем каждую минуту

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
    const shareText = `Привет! Запусти мини-приложение "Ассист+" и получай бонусы!`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;

    tg.openTelegramLink(shareUrl);
  };

  const handleRulesClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    setShowRules(true);
  };

  if (loading) {
    return <div className="loading-container">Загрузка...</div>;
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
          {/* Контейнер */}
          <div className="content-container">
            {/* Верх */}
            <div className="header-section">
              <h1 className="page-title">Приглашай друзей и получай плюсы</h1>
              
              {/* Изображение */}
              <div className="header-image">
                <Image 
                  src="/images/friends-header.png" 
                  alt="Друзья" 
                  width={580} 
                  height={320}
                  priority
                  style={{
                    width: '100%',
                    height: 'auto',
                    transform: 'rotate(13.77deg)',
                  }}
                />
              </div>
            </div>

            {/* Кнопка условия (первая) */}
            <button className="info-card clickable" onClick={handleRulesClick}>
              <div className="info-row">
                <span className="info-label">Вы пригласили:&nbsp;</span>
                <span className="info-value">{user?.referral_count || 0}</span>
              </div>
              <p className="info-subtitle">
                {(user?.referral_count || 0) === 0
                  ? 'Пока никто не присоединился' 
                  : 'Нажмите, чтобы узнать условия розыгрышей'}
              </p>
            </button>

            {/* Информационные блоки */}
            <div className="stats-row">
              {/* Таймер */}
              <div className="stat-card">
                <div className="stat-value">{timeLeft.days}д {timeLeft.hours}ч</div>
                <div className="stat-label">Осталось времени<br />до конца розыгрыша</div>
              </div>

              {/* Приглашения за месяц */}
              <div className="stat-card">
                <div className="stat-value">{user?.current_month_referrals || 0}</div>
                <div className="stat-label">Вы пригласили<br />в этом розыгрыше</div>
              </div>
            </div>

            {/* Кнопка условия участия */}
            <button className="rules-button" onClick={handleRulesClick}>
              Условия участия в розыгрышах
            </button>

            {/* Кнопка пригласить */}
            <button className="invite-button" onClick={handleInviteFriend}>
              <span className="invite-text">Пригласить друга</span>
              <span className="invite-bonus">+500 плюсов</span>
              <div className="glow-top"></div>
              <div className="glow-bottom"></div>
            </button>
          </div>
        </main>

        {/* Модальное окно с правилами */}
        {showRules && (
          <div className="modal-overlay" onClick={() => setShowRules(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="modal-title">Условия участия в розыгрышах</h3>
              <ul className="modal-list">
                <li>• 10 приглашений — возможность попасть на онлайн мини-разбор с Иваном Абрамовым. Разбор проводится еженедельно.</li>
                <li>• 20 приглашений — приоритетное место на мини-разборе, что гарантирует 100% участие в ближайшей сессии.</li>
                <li>• 30 приглашений — участие в ежемесячном розыгрыше завтрака с Иваном Абрамовым в Сколково.</li>
              </ul>
              <button className="modal-close" onClick={() => setShowRules(false)}>
                Понятно
              </button>
            </div>
          </div>
        )}

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

          /* Друзья */
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

          /* Контейнер */
          .content-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px 16px;
            gap: 10px;
            width: 100%;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            z-index: 0;
            box-sizing: border-box;
          }

          /* Верх */
          .header-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 10px;
            isolation: isolate;
            width: 100%;
            height: 300px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            position: relative;
          }

          /* Приглашай друзей и получай плюсы */
          .page-title {
            margin: 0;
            width: 284px;
            height: 56px;
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
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
            z-index: 0;
          }

          /* Изображение */
          .header-image {
            position: absolute;
            width: 579.75px;
            height: 320.11px;
            left: calc(50% - 579.75px/2 - 8.63px);
            top: 0px;
            flex: none;
            order: 2;
            flex-grow: 0;
            z-index: 2;
            overflow: visible;
          }

          /* Кнопка условия (кликабельная) */
          .info-card {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            padding: 24px 16px;
            gap: 8px;
            width: 100%;
            height: 98px;
            background: #F1F1F1;
            border-radius: 15px;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
            border: none;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
            transition: opacity 0.2s;
          }

          .info-card.clickable:active {
            opacity: 0.7;
          }

          .info-row {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 0px;
            gap: 3px;
            width: 188px;
            height: 24px;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .info-label {
            width: 170px;
            height: 24px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 24px;
            line-height: 100%;
            display: flex;
            align-items: flex-end;
            text-align: center;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .info-value {
            width: auto;
            min-width: 15px;
            height: 24px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 24px;
            line-height: 100%;
            display: flex;
            align-items: flex-end;
            text-align: center;
            letter-spacing: -0.03em;
            color: rgba(234, 0, 0, 0.9);
            flex: none;
            order: 1;
            flex-grow: 0;
          }

          .info-subtitle {
            margin: 0;
            width: 220px;
            height: 18px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 300;
            font-size: 16px;
            line-height: 110%;
            display: flex;
            align-items: flex-end;
            text-align: center;
            letter-spacing: -0.02em;
            color: #000000;
            flex: none;
            order: 1;
            flex-grow: 0;
          }

          /* Информационные блоки */
          .stats-row {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 0px;
            gap: 8px;
            width: 100%;
            height: 103px;
            flex: none;
            order: 2;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Карточка */
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
            color: #EA0000;
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

          /* Кнопка условия участия */
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
            order: 3;
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

          /* Пригласить */
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
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 15px;
            flex: none;
            order: 4;
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

          /* Ellipse 25 - верхний блик */
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

          /* Ellipse 26 - нижний блик */
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

          /* Модальное окно */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 16px;
          }

          .modal-content {
            background: white;
            border-radius: 16px;
            padding: 20px;
            max-width: 400px;
            width: 100%;
            box-sizing: border-box;
          }

          .modal-title {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 20px;
            font-weight: 500;
            color: #000000;
            margin: 0 0 16px 0;
          }

          .modal-list {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            color: #666666;
            line-height: 1.5;
            margin: 0 0 16px 0;
            padding-left: 0;
            list-style: none;
          }

          .modal-list li {
            margin-bottom: 12px;
          }

          .modal-close {
            width: 100%;
            padding: 12px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            color: white;
            border: none;
            border-radius: 12px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            transition: opacity 0.2s;
          }

          .modal-close:active {
            opacity: 0.8;
          }

          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            height: -webkit-fill-available;
            background-color: #FFFFFF;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #666666;
          }

          .error-container {
            padding: 24px;
            text-align: center;
            color: #EA0000;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
          }

          .reload-button {
            margin-top: 16px;
            padding: 12px 24px;
            background: #EA0000;
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

            .page-title {
              font-size: 28px;
              width: 250px;
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