/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
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

interface CategoryItem {
  id: number;
  title: string;
  link: string;
}

interface Category {
  id: number;
  title: string;
  items: CategoryItem[];
}

export default function CasesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  // Отдельный useEffect для скролла
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

  const categories: Category[] = [
    {
      id: 1,
      title: "Бизнес-ассистенты",
      items: [
        {
          id: 1,
          title: "Екатерина Возилкина,\nMaru Studio",
          link: "https://t.me/c/2782276287/205"
        },
        {
          id: 2,
          title: "Полина Жижина,\nSelSovet",
          link: "https://t.me/c/2782276287/159?single"
        },
        {
          id: 3,
          title: "Матвей Глаголев,\nБА Игоря Лихонина",
          link: "https://t.me/c/2782276287/252"
        }
      ]
    },
    {
      id: 2,
      title: "Предприниматели",
      items: [
        {
          id: 1,
          title: "",
          link: "https://t.me/assist_plus_channel/126"
        }
      ]
    }
  ];

  if (loading) {
    return <div className="loading-container">Загрузка...</div>;
  }

  return (
    <>
      <GlobalStyles />
      <div className="cases-wrapper" ref={wrapperRef}>
        <main className="cases-container">
          {/* Плюс на фоне */}
          <div className="background-plus">
            <svg width="187" height="207" viewBox="0 0 187 207" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M69 55.4706C69 62.9427 62.9427 69 55.4706 69L13.5294 69C6.05732 69 8.7051e-06 75.0573 8.05267e-06 82.5294L4.39054e-06 124.471C3.73811e-06 131.943 6.05732 138 13.5294 138L55.4706 138C62.9427 138 69 144.057 69 151.529L69 193.471C69 200.943 75.0573 207 82.5294 207L124.471 207C131.943 207 138 200.943 138 193.471L138 151.529C138 144.057 144.057 138 151.529 138L193.471 138C200.943 138 207 131.943 207 124.471L207 82.5294C207 75.0573 200.943 69 193.471 69L151.529 69C144.057 69 138 62.9427 138 55.4706L138 13.5294C138 6.05732 131.943 -6.56976e-06 124.471 -7.22379e-06L82.5294 -1.08949e-05C75.0573 -1.15489e-05 69 6.05731 69 13.5294L69 55.4706Z" fill="#F6F6F6"/>
            </svg>
          </div>

          {/* Контейнер */}
          <div className="content-container">
            {/* Верх */}
            <header className="page-header">
              <h1 className="page-title">Кейсы</h1>
              <button className="back-button" onClick={handleBackClick}>
                назад
              </button>
            </header>

            {/* Контент */}
            <section className="categories-content">
              {categories.map((category) => (
                <article key={category.id} className="category-section">
                  <h2 className="category-title">{category.title}</h2>
                  
                  <div className="category-cards">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        className="mini-card"
                        onClick={() => handleItemClick(item.link)}
                      >
                        {item.title && <span className="card-text">{item.title}</span>}
                        <div className="card-arrow">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 1L9 6L3 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </div>
        </main>

        <style jsx>{`
          .cases-wrapper {
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

          /* кейсы */
          .cases-container {
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
            opacity: 0.5;
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
            order: 1;
            align-self: stretch;
            flex-grow: 0;
            z-index: 1;
            box-sizing: border-box;
          }

          /* Верх */
          .page-header {
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

          /* Заголовок */
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
            width: auto;
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
          }

          .back-button:active {
            opacity: 0.7;
          }

          /* контент */
          .categories-content {
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

          /* Категория */
          .category-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 16px 16px;
            gap: 24px;
            width: 100%;
            background: #F1F1F1;
            border-radius: 16px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            box-sizing: border-box;
          }

          .category-title {
            width: auto;
            height: 16px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 24px;
            line-height: 100%;
            leading-trim: both;
            text-edge: cap;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
            margin: 0;
          }

          /* карточки */
          .category-cards {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 8px;
            width: 100%;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Карточка мини */
          .mini-card {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            gap: 16px;
            width: 100%;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 16px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            border: none;
            cursor: pointer;
            transition: transform 0.1s ease-in-out;
            -webkit-tap-highlight-color: transparent;
            min-height: 54px;
            box-sizing: border-box;
          }

          .mini-card:active {
            transform: scale(0.98);
          }

          .card-text {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.03em;
            color: #FFFFFF;
            flex: 1;
            text-align: left;
            white-space: pre-line;
          }

          /* Стрелка */
          .card-arrow {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
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
            .cases-container {
              padding: 48px 0px 100px;
            }

            .page-title {
              font-size: 28px;
            }

            .back-button {
              font-size: 18px;
            }

            .category-title {
              font-size: 20px;
            }

            .card-text {
              font-size: 18px;
            }
          }

          @supports (-webkit-touch-callout: none) {
            .cases-wrapper {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}