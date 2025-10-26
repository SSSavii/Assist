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
      
      @font-face {
        font-family: 'Vasek';
        src: url('/fonts/Vasek-Italic.woff2') format('woff2'),
             url('/fonts/Vasek-Italic.woff') format('woff');
        font-weight: 400;
        font-style: italic;
        font-display: swap;
      }
      
      body {
        font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
    `}</style>
  </>
);

interface NavigationCard {
  id: number;
  title: string;
  image: string;
  route: string;
}

export default function NavigationPage() {
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
        router.push('/');
      });
    }
    setLoading(false);

    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [router]);

  const handleCardClick = (card: NavigationCard) => {
    const tg = window.Telegram?.WebApp;
    
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }

    router.push(card.route);
  };

  const handleBackClick = () => {
    const tg = window.Telegram?.WebApp;
    
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    
    router.push('/');
  };

  const navigationCards: NavigationCard[] = [
    {
      id: 1,
      title: "Кейсы",
      image: "/images/cases.png",
      route: "/navigation/cases"
    },
    {
      id: 2,
      title: "Подборки",
      image: "/images/selections.png",
      route: "/navigation/selections"
    },
    {
      id: 3,
      title: "Мероприятия",
      image: "/images/events.png",
      route: "/navigation/events"
    },
    {
      id: 4,
      title: "Записи онлайн встреч",
      image: "/images/online-meetings.png",
      route: "/navigation/online-meetings"
    },
    {
      id: 5,
      title: "Оффлайн мероприятия",
      image: "/images/offline-events.png",
      route: "/navigation/offline-events"
    },
    {
      id: 6,
      title: "Гайды и лайфхаки",
      image: "/images/guides.png",
      route: "/navigation/guides"
    },
    {
      id: 7,
      title: "Вакансии",
      image: "/images/vacancies.png",
      route: "/navigation/vacancies"
    },
    {
      id: 8,
      title: "Подкасты",
      image: "/images/podcasts.png",
      route: "/navigation/podcasts"
    }
  ];

  if (loading) {
    return <div className="loading-container">Загрузка...</div>;
  }

  return (
    <>
      <GlobalStyles />
      <div className="navigation-wrapper">
        <main className="navigation-container">
          {/* контейнер */}
          <div className="content-container">
            {/* Верх навигации */}
            <header className="navigation-header">
              {/* Верх */}
              <div className="header-top">
                <h1 className="page-title">Навигация</h1>
                <button className="back-button" onClick={handleBackClick}>
                  назад
                </button>
              </div>

              {/* Подзаголовок */}
              <p className="page-subtitle">
                Изучай все самые важные <br />
                и полезные материалы АССИСТ+
              </p>
            </header>

            {/* карточки */}
            <section className="cards-grid">
              {[0, 1, 2, 3].map((rowIndex) => (
                <div key={rowIndex} className="cards-row">
                  {navigationCards.slice(rowIndex * 2, rowIndex * 2 + 2).map((card) => (
                    <button
                      key={card.id}
                      className="navigation-card"
                      onClick={() => handleCardClick(card)}
                      style={{
                        backgroundImage: `url(${card.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <span className="card-title">{card.title}</span>
                    </button>
                  ))}
                </div>
              ))}
            </section>
          </div>
        </main>

        <style jsx>{`
          .navigation-wrapper {
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

          /* навигация */
          .navigation-container {
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

          /* контейнер */
          .content-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px 16px;
            gap: 32px;
            width: 100%;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            z-index: 0;
            box-sizing: border-box;
          }

          /* Верх навигации */
          .navigation-header {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 16px;
            width: 100%;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Верх */
          .header-top {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0px;
            width: 100%;
            height: 21px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Навигация */
          .page-title {
            margin: 0;
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
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          /* назад */
          .back-button {
            margin: 0;
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
            justify-content: flex-end;
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
          }

          .back-button:active {
            opacity: 0.7;
          }

          /* Изучай все самые важные и полезные материалы АССИСТ+ */
          .page-subtitle {
            width: 270px;
            height: 60px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 20px;
            line-height: 100%;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.02em;
            color: #000000;
            flex: none;
            order: 1;
            flex-grow: 0;
            margin: 0;
          }

          /* карточки */
          .cards-grid {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0px;
            gap: 8px;
            width: 100%;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          /* строка */
          .cards-row {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding: 0px;
            gap: 8px;
            width: 100%;
            height: 120px;
            flex: none;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Карточка */
          .navigation-card {
            display: flex;
            flex-direction: row;
            align-items: flex-end;
            padding: 0px 0px 12px 16px;
            isolation: isolate;
            height: 120px;
            background: #F1F1F1;
            border-radius: 16px;
            flex: 1;
            min-width: 0;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.1s ease-in-out;
            -webkit-tap-highlight-color: transparent;
            border: none;
          }

          .navigation-card:active {
            transform: scale(0.98);
          }

          .card-title {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 16px;
            display: block;
            letter-spacing: -0.05em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
            z-index: 0;
            max-width: calc(100% - 16px);
            word-wrap: break-word;
            text-align: left;
            white-space: pre-wrap;
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
            .navigation-container {
              padding: 48px 0px 100px;
            }

            .page-title {
              font-size: 28px;
            }

            .back-button {
              font-size: 18px;
            }

            .page-subtitle {
              font-size: 18px;
              width: 250px;
            }

            .navigation-card {
              min-width: calc(50% - 4px);
            }
          }

          @supports (-webkit-touch-callout: none) {
            .navigation-wrapper {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}