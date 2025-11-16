'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

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

type Prize = {
  id: number;
  chance: string;
  chanceColor: string;
  points: string;
  items: string[];
};

export default function PrizesPage() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Скролл вверх при загрузке страницы
  useEffect(() => {
    // Скроллим wrapper
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop = 0;
    }
    
    // Скроллим window с задержкой
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

  const prizes: Prize[] = [
    {
      id: 1,
      chance: 'Супер редкий шанс',
      chanceColor: '#FFCA37',
      points: '3000 A+',
      items: [
        'Завтрак с предпринимателем (онлайн-формат или офлайн при наличии слотов)',
        'Индивидуальный разбор 60 минут от предпринимателя',
        'Приглашение на закрытое мероприятие/митап'
      ]
    },
    {
      id: 2,
      chance: 'Очень маленький шанс',
      chanceColor: '#FF6A6A',
      points: '2000 A+',
      items: [
        'Разбор 1 запроса от предпринимателя с высокой выручкой',
        'Пакет практических лайфхаков (видеоурок/гайд)'
      ]
    },
    {
      id: 3,
      chance: 'Маленький шанс',
      chanceColor: '#E895FF',
      points: '1000 A+',
      items: [
        'Розыгрыш онлайн-мини-разбора (10 минут)',
        'Приглашение на еженедельный созвон с командой АССИСТ+ (с возможным разбором)',
        'Разбор резюме'
      ]
    },
    {
      id: 4,
      chance: 'Хороший шанс',
      chanceColor: '#9EA4FF',
      points: '500 A+',
      items: [
        'Разбор запроса от команды'
      ]
    },
    {
      id: 5,
      chance: 'Отличный шанс',
      chanceColor: '#F1F1F1',
      points: '',
      items: [
        '1 тематический чек-лист (без повторов). После 10 чек-листов — 250 A+',
        '250 A+',
        '100 A+'
      ]
    }
  ];

  const handleClose = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    router.back();
  };

  return (
    <>
      <GlobalStyles />
      <div className="prizes-wrapper" ref={wrapperRef}>
        <main className="prizes-container">
          <div className="content-container">
            <h1 className="prizes-title">Возможные призы</h1>

            {prizes.map((prize) => (
              <div key={prize.id} className="prize-item">
                <div 
                  className="chance-badge"
                  style={{ backgroundColor: prize.chanceColor }}
                >
                  <span className="chance-text">{prize.chance}</span>
                </div>
                
                <div className="prize-description">
                  {prize.points && (
                    <>
                      <div className="prize-points">{prize.points}</div>
                    </>
                  )}
                  <ul className="prize-list">
                    {prize.items.map((item, index) => (
                      <li key={index} className="prize-list-item">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <button 
              className="close-button"
              onClick={handleClose}
            >
              Понятно
            </button>
          </div>
        </main>

        <style jsx>{`
          .prizes-wrapper {
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
          }

          .prizes-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 56px 0px 100px;
            gap: 10px;
            isolation: isolate;
            position: relative;
            width: 100%;
            min-height: 100vh;
            min-height: -webkit-fill-available;
            background: #FFFFFF;
          }

          .content-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0px 16px;
            gap: 20px;
            width: 100%;
            max-width: 375px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            z-index: 0;
            box-sizing: border-box;
          }

          .prizes-title {
            width: 100%;
            margin: 0;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 32px;
            line-height: 110%;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          .prize-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 8px;
            width: 100%;
            flex: none;
            align-self: stretch;
            flex-grow: 0;
          }

          .chance-badge {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 4px 12px;
            gap: 10px;
            border-radius: 4px;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .chance-text {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            letter-spacing: -0.05em;
            color: #000000;
            white-space: nowrap;
          }

          .prize-description {
            width: 100%;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 110%;
            letter-spacing: -0.02em;
            color: #000000;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          .prize-points {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .prize-list {
            margin: 0;
            padding-left: 20px;
            list-style-type: disc;
          }

          .prize-list-item {
            margin-bottom: 4px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 110%;
            letter-spacing: -0.02em;
            color: #000000;
          }

          .prize-list-item:last-child {
            margin-bottom: 0;
          }

          .close-button {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 16px 0px;
            gap: 10px;
            width: 100%;
            height: 52px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 16px;
            border: none;
            cursor: pointer;
            flex: none;
            order: 6;
            align-self: stretch;
            flex-grow: 0;
            transition: transform 0.1s ease-in-out;
            -webkit-tap-highlight-color: transparent;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
          }

          .close-button:active {
            transform: scale(0.98);
          }

          @media (max-width: 375px) {
            .prizes-title {
              font-size: 28px;
            }

            .close-button {
              font-size: 18px;
            }
          }

          @supports (-webkit-touch-callout: none) {
            .prizes-wrapper {
              min-height: -webkit-fill-available;
            }
            
            .prizes-container {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}