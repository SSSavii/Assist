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
  imageStyle?: React.CSSProperties;
  route: string; // Изменили с link на route
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

  const navigationCards: NavigationCard[] = [
    {
      id: 1,
      title: "Кейсы",
      image: "/images/cases.png",
      imageStyle: {
        width: '220.87px',
        height: '124.24px',
        right: '-53.37px',
        top: 'calc(50% - 124.24px/2 + 2.12px)'
      },
      route: "/navigation/cases"
    },
    {
      id: 2,
      title: "Подборки",
      image: "/images/selections.png",
      imageStyle: {
        width: '256px',
        height: '144px',
        right: '-102px',
        top: 'calc(50% - 144px/2 - 12px)'
      },
      route: "/navigation/selections"
    },
    {
      id: 3,
      title: "Мероприятия",
      image: "/images/events.png",
      imageStyle: {
        width: '177px',
        height: '100px',
        right: '-53.5px',
        top: 'calc(50% - 100px/2 - 14px)'
      },
      route: "/navigation/events"
    },
    {
      id: 4,
      title: "Записи онлайн встреч",
      image: "/images/online-meetings.png",
      imageStyle: {
        width: '220px',
        height: '124px',
        right: '-74px',
        top: 'calc(50% - 124px/2 - 20px)',
        transform: 'rotate(4.01deg)'
      },
      route: "/navigation/online-meetings"
    },
    {
      id: 5,
      title: "Оффлайн мероприятия",
      image: "/images/offline-events.png",
      imageStyle: {
        width: '213.43px',
        height: '120.06px',
        right: '-69.93px',
        top: 'calc(50% - 120.06px/2 - 24.97px)',
        transform: 'rotate(-12.78deg)'
      },
      route: "/navigation/offline-events"
    },
    {
      id: 6,
      title: "Гайды и лайфхаки",
      image: "/images/guides.png",
      imageStyle: {
        width: '253.59px',
        height: '142.65px',
        right: '-93.74px',
        top: 'calc(50% - 142.65px/2 - 13.34px)',
        transform: 'matrix(-0.97, 0.23, 0.23, 0.97, 0, 0)'
      },
      route: "/navigation/guides"
    },
    {
      id: 7,
      title: "Вакансии",
      image: "/images/vacancies.png",
      imageStyle: {
        width: '223.48px',
        height: '125.71px',
        right: '-58.98px',
        top: 'calc(50% - 125.71px/2 - 2.15px)',
        transform: 'rotate(5.89deg)'
      },
      route: "/navigation/vacancies"
    },
    {
      id: 8,
      title: "Подкасты",
      image: "/images/podcasts.png",
      imageStyle: {
        height: '157.03px',
        left: '-10.66%',
        right: '-56%',
        top: 'calc(50% - 157.03px/2 - 27.17px)',
        transform: 'rotate(-12.34deg)'
      },
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
          <header className="page-header">
            <h1 className="page-title">Навигация</h1>
            <p className="page-subtitle">по каналу АССИСТ+</p>
          </header>

          <section className="cards-grid">
            {[0, 1, 2, 3].map((rowIndex) => (
              <div key={rowIndex} className="cards-row">
                {navigationCards.slice(rowIndex * 2, rowIndex * 2 + 2).map((card) => (
                  <article
                    key={card.id}
                    className="navigation-card"
                    onClick={() => handleCardClick(card)}
                  >
                    <div className="card-title">{card.title}</div>
                    <img
                      className="card-image"
                      alt={card.title}
                      src={card.image}
                      style={card.imageStyle}
                    />
                  </article>
                ))}
              </div>
            ))}
          </section>
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

          .page-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 0 16px;
            width: 100%;
            margin-bottom: 24px;
          }

          .page-title {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 700;
            font-size: 32px;
            text-align: center;
            color: #000000;
            line-height: 1.2;
            letter-spacing: -0.96px;
            margin: 0;
          }

          .page-subtitle {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 400;
            font-size: 16px;
            text-align: center;
            color: #666666;
            line-height: 1.4;
            margin: 0;
          }

          .cards-grid {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0px;
            gap: 8px;
            width: 343px;
            height: 504px;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          .cards-row {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding: 0px;
            gap: 8px;
            width: 343px;
            height: 120px;
            flex: none;
            align-self: stretch;
            flex-grow: 0;
          }

          .navigation-card {
            display: flex;
            flex-direction: row;
            align-items: flex-end;
            padding: 0px 0px 12px 16px;
            isolation: isolate;
            width: 167.5px;
            height: 120px;
            background: #F1F1F1;
            border-radius: 16px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 1;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.1s ease-in-out;
            -webkit-tap-highlight-color: transparent;
          }

          .navigation-card:active {
            transform: scale(0.98);
          }

          .card-title {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.05em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
            z-index: 0;
            max-width: calc(100% - 16px);
            word-wrap: break-word;
          }

          .card-image {
            position: absolute;
            object-fit: cover;
            flex: none;
            order: 1;
            flex-grow: 0;
            z-index: 1;
            pointer-events: none;
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

            .page-subtitle {
              font-size: 14px;
            }

            .cards-grid {
              width: calc(100vw - 32px);
            }

            .cards-row {
              width: 100%;
            }

            .navigation-card {
              width: calc(50% - 4px);
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