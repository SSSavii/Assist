/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface MeetingItem {
  id: number;
  title: string;
  link: string;
}

export default function OnlineMeetingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();
      
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.push('/navigation');
      });
    }
    setLoading(false);

    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [router]);

  const handleItemClick = (link: string) => {
    const tg = window.Telegram?.WebApp;
    
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }

    tg?.openTelegramLink(link);
  };

  const handleBackClick = () => {
    const tg = window.Telegram?.WebApp;
    
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    
    router.push('/navigation');
  };

  const meetings: MeetingItem[] = [
    {
      id: 1,
      title: "Записи прошедших онлайн встреч",
      link: "https://t.me/+6flpcSdc4sg5OTAy" // Замените на реальную ссылку
    },
    {
      id: 2,
      title: "Предстоящие онлайн мероприятия",
      link: "https://t.me/+6flpcSdc4sg5OTAy"
    }
  ];

  if (loading) {
    return <div className="loading-container">Загрузка...</div>;
  }

  return (
    <>
      <GlobalStyles />
      <div className="meetings-wrapper">
        <main className="meetings-container">
          {/* Плюс на фоне */}
          <div className="background-plus">
            <img src="/svg4122-denw.svg" alt="" />
          </div>

          {/* Контейнер */}
          <div className="content-container">
            {/* Верх */}
            <header className="page-header">
              <h1 className="page-title">Записи онлайн встреч</h1>
              <button className="back-button" onClick={handleBackClick}>
                назад
              </button>
            </header>

            {/* Контент */}
            <section className="content-section">
              {/* карточки */}
              <div className="cards-list">
                {meetings.map((item) => (
                  <button
                    key={item.id}
                    className="mini-card"
                    onClick={() => handleItemClick(item.link)}
                  >
                    <span className="card-text">{item.title}</span>
                    <div className="card-arrow">
                      <div className="arrow-line-1"></div>
                      <div className="arrow-line-2"></div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </main>

        <style jsx>{`
          .meetings-wrapper {
            position: relative;
            min-height: 100vh;
            min-height: -webkit-fill-available;
            background-color: #FFFFFF;
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          /* запись встреч */
          .meetings-container {
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

          /* Плюс на фоне */
          .background-plus {
            position: absolute;
            width: 207px;
            height: 207px;
            right: -20px;
            bottom: 63px;
            transform: matrix(1, 0, 0, -1, 0, 0);
            flex: none;
            order: 0;
            flex-grow: 0;
            z-index: 0;
          }

          .background-plus img {
            width: 100%;
            height: 100%;
            opacity: 0.1;
          }

          .background-plus::before {
            content: '';
            position: absolute;
            width: 207px;
            height: 207px;
            right: 0px;
            bottom: -5px;
            background: #F6F6F6;
            border-radius: 10px;
            transform: matrix(-1, 0, 0, 1, 0, 0);
          }

          /* контейнер */
          .content-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px 16px;
            gap: 32px;
            width: 100%;
            max-width: 375px;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
            z-index: 1;
          }

          /* Верх */
          .page-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0px;
            width: 100%;
            min-height: 56px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Навигация (заголовок) - может быть многострочным */
          .page-title {
            margin: 0 auto;
            width: auto;
            max-width: 252px;
            min-height: 56px;
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
          }

          /* назад */
          .back-button {
            margin: 0 auto;
            width: 53px;
            height: 21px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 110%;
            leading-trim: both;
            text-edge: cap;
            display: flex;
            align-items: flex-end;
            text-align: right;
            letter-spacing: -0.03em;
            color: #EA0000;
            flex: none;
            order: 1;
            flex-grow: 0;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
            flex-shrink: 0;
          }

          .back-button:active {
            opacity: 0.7;
          }

          /* контент */
          .content-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 16px;
            width: 100%;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          /* карточки */
          .cards-list {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 8px;
            width: 100%;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Карточка мини */
          .mini-card {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 16px;
            gap: 16px;
            width: 100%;
            height: 80px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 16px;
            flex: none;
            align-self: stretch;
            flex-grow: 0;
            border: none;
            cursor: pointer;
            transition: transform 0.1s ease-in-out;
            -webkit-tap-highlight-color: transparent;
          }

          .mini-card:active {
            transform: scale(0.98);
          }

          .card-text {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 120%;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.02em;
            color: #FFFFFF;
            flex: 1;
            text-align: left;
          }

          /* Group 22 (стрелка) */
          .card-arrow {
            width: 16px;
            height: 16px;
            transform: rotate(-135deg);
            flex: none;
            order: 1;
            flex-grow: 0;
            position: relative;
            flex-shrink: 0;
          }

          /* Line 1 (Stroke) */
          .arrow-line-1 {
            position: absolute;
            width: 13.47px;
            height: 2.53px;
            left: 0;
            top: 0;
            background: #FFFFFF;
            transform: rotate(-135deg);
            transform-origin: left top;
          }

          /* Line 2 (Stroke) */
          .arrow-line-2 {
            position: absolute;
            width: 16px;
            height: 2.53px;
            left: 0;
            top: 9.52px;
            background: #FFFFFF;
            transform: rotate(135deg);
            transform-origin: left top;
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

          @media (max-width: 375px) {
            .meetings-container {
              padding: 48px 0px 100px;
            }

            .page-title {
              font-size: 28px;
              max-width: 200px;
            }

            .back-button {
              font-size: 18px;
            }

            .card-text {
              font-size: 18px;
            }
          }

          @supports (-webkit-touch-callout: none) {
            .meetings-wrapper {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}