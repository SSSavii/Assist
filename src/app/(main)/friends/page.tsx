// src/app/(main)/friends/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/app/context/UserContext';

export default function FriendsPage() {
  const router = useRouter();
  const { user, loading, error } = useUser();
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Скролл наверх при загрузке
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, []);

  // Приглашение друга
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

  // Переход к условиям
  const handleRulesClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    router.push('/friends/condition');
  };

  // Загрузка
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <div className="error-container">
        <p><strong>Ошибка:</strong> {error}</p>
        <button onClick={() => window.location.reload()} className="reload-button">
          Перезагрузить
        </button>
        <style jsx>{`
          .error-container {
            padding: 24px;
            text-align: center;
            color: #ff0000;
            font-family: 'Cera Pro', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .reload-button {
            margin-top: 16px;
            padding: 12px 24px;
            background: #ff0000;
            color: white;
            border: none;
            border-radius: 12px;
            font-family: 'Cera Pro', sans-serif;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="friends-wrapper" ref={wrapperRef}>
      <main className="friends-container">
        <div className="content-container">
          {/* Header Image */}
          <div className="header-section">
            <div className="header-image-container">
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

          {/* Buttons */}
          <div className="buttons-container">
            {/* Счётчик приглашений */}
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">Вы пригласили:</span>
                <span className="info-value">
                  &nbsp;{user?.referral_count || 0}
                </span>
              </div>
            </div>

            {/* Статистика */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value">
                  {timeLeft.days}д {timeLeft.hours}ч
                </div>
                <div className="stat-label">Осталось времени<br />до конца розыгрыша</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">
                  {user?.current_month_referrals || 0}
                </div>
                <div className="stat-label">Вы пригласили<br />в этом розыгрыше</div>
              </div>
            </div>

            {/* Условия */}
            <button className="rules-button" onClick={handleRulesClick}>
              <span className="rules-title">Условия участия в розыгрышах</span>
              <span className="rules-subtext">Бонус начислим после подписки друга на тг канал</span>
            </button>

            {/* Пригласить */}
            <button className="invite-button" onClick={handleInviteFriend}>
              <span className="invite-text">Пригласить друга</span>
              <span className="invite-bonus">500 А+</span>
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
          margin-bottom: -10px;
          z-index: 0;
        }

        .header-image-container {
          width: 100%;
        }

        .buttons-container {
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
          box-sizing: border-box;
        }

        .info-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0px;
          gap: 0px;
          height: 24px;
        }

        .info-label {
          font-family: 'Cera Pro', sans-serif;
          font-weight: 500;
          font-size: 24px;
          line-height: 100%;
          display: flex;
          align-items: center;
          letter-spacing: -0.03em;
          color: #000000;
          white-space: nowrap;
        }

        .info-value {
          font-family: 'Cera Pro', sans-serif;
          font-weight: 500;
          font-size: 24px;
          line-height: 100%;
          display: flex;
          align-items: center;
          letter-spacing: -0.03em;
          color: #ff0000;
        }

        .stats-row {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          padding: 0px;
          gap: 8px;
          width: 100%;
          height: 103px;
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
          flex: 1;
          box-sizing: border-box;
        }

        .stat-value {
          font-family: 'Cera Pro', sans-serif;
          font-weight: 500;
          font-size: 32px;
          line-height: 110%;
          display: flex;
          align-items: flex-end;
          letter-spacing: -0.03em;
          color: #ff0000;
        }

        .stat-label {
          font-family: 'Cera Pro', sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 110%;
          display: flex;
          align-items: flex-end;
          letter-spacing: -0.02em;
          color: #000000;
        }

        .rules-button {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 8px 15px;
          gap: 5px;
          width: 100%;
          min-height: 65px;
          background: #F1F1F1;
          border-radius: 15px;
          border: none;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: opacity 0.2s;
          box-sizing: border-box;
        }

        .rules-title {
          font-family: 'Cera Pro', sans-serif;
          font-weight: 400;
          font-size: 20px;
          line-height: 100%;
          text-align: center;
          letter-spacing: -0.02em;
          color: #000000;
        }

        .rules-subtext {
          font-family: 'Cera Pro', sans-serif;
          font-weight: 400;
          font-size: 11px;
          line-height: 110%;
          text-align: center;
          letter-spacing: -0.02em;
          color: #808080;
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
          background: linear-gradient(243.66deg, #ff0000 10.36%, #E72525 86.45%);
          border-radius: 15px;
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
          font-family: 'Cera Pro', sans-serif;
          font-weight: 500;
          font-size: 20px;
          line-height: 100%;
          text-align: center;
          letter-spacing: -0.03em;
          color: #FFFFFF;
          z-index: 0;
        }

        .invite-bonus {
          font-family: 'Cera Pro', sans-serif;
          font-weight: 400;
          font-size: 20px;
          line-height: 100%;
          text-align: center;
          letter-spacing: -0.02em;
          color: #FFFFFF;
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
          z-index: 3;
          pointer-events: none;
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
  );
}