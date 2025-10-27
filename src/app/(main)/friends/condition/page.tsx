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

type UserProfile = {
  id: number;
  tg_id: number;
  balance_crystals: number;
  referral_count: number;
  current_month_referrals: number;
  cases_to_open: number;
};

interface Condition {
  id: number;
  required: number;
  title: string;
  description: string;
}

export default function ConditionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Инициализация Telegram WebApp
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();
      
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.push('/friends');
      });
    }

    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [router]);

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
        console.log('[Conditions] User data:', userData);
        setUser(userData);
      })
      .catch((err) => {
        console.error('Ошибка в ConditionsPage:', err);
        setError(err.message || 'Не удалось загрузить данные');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const conditions: Condition[] = [
    {
      id: 1,
      required: 1,
      title: '1 приглашение',
      description: 'Какой то еще мини приз'
    },
    {
      id: 2,
      required: 10,
      title: '10 приглашений',
      description: 'Возможность попасть на онлайн мини-разбор с Иваном Абрамовым. Разбор проводится еженедельно.'
    },
    {
      id: 3,
      required: 20,
      title: '20 приглашений',
      description: 'Приоритетное место на мини-разборе, что гарантирует 100% участие в ближайшей сессии.'
    },
    {
      id: 4,
      required: 30,
      title: '30 приглашений',
      description: 'Участие в ежемесячном розыгрыше завтрака с Иваном Абрамовым в Сколково.'
    }
  ];

  const isCompleted = (required: number): boolean => {
    return (user?.referral_count || 0) >= required;
  };

  const handleBackClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    router.push('/friends');
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
      <div className="conditions-wrapper" ref={wrapperRef}>
        <main className="conditions-container">
          {/* Контейнер */}
          <div className="content-container">
            {/* Условия */}
            <div className="conditions-section">
              {/* Заголовок */}
              <div className="header-section">
                <h1 className="page-title">Условия участия в розыгрышах</h1>
              </div>

              {/* Карточки условий */}
              {conditions.map((condition) => {
                const completed = isCompleted(condition.required);
                return (
                  <div
                    key={condition.id}
                    className={completed ? 'condition-card completed' : 'condition-card'}
                  >
                    {/* Верх */}
                    <div className="card-header">
                      <span className="card-title">{condition.title}</span>
                      <span className="card-status">
                        {completed ? 'Выполнено' : 'Не выполнено'}
                      </span>
                    </div>

                    {/* Описание */}
                    <p className="card-description">{condition.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Кнопка */}
            <button className="back-button" onClick={handleBackClick}>
              Понятно
            </button>
          </div>
        </main>

        <style jsx>{`
          .conditions-wrapper {
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
          .conditions-container {
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
            justify-content: space-between;
            align-items: center;
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

          /* Условия */
          .conditions-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 8px;
            margin: 0 auto;
            width: 100%;
            max-width: 343px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Заголовок */
          .header-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px 0px 16px;
            gap: 10px;
            width: 100%;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Условия участия в розыгрышах */
          .page-title {
            margin: 0;
            width: 244px;
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

          /* Карточка условия */
          .condition-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 16px;
            gap: 10px;
            width: 100%;
            background: #F1F1F1;
            border-radius: 15px;
            flex: none;
            align-self: stretch;
            flex-grow: 0;
            box-sizing: border-box;
          }

          .condition-card.completed {
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
          }

          /* Верх */
          .card-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0px;
            gap: 10px;
            width: 100%;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          /* Название условия */
          .card-title {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .condition-card.completed .card-title {
            color: #FFFFFF;
          }

          /* Статус */
          .card-status {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 16px;
            line-height: 110%;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.02em;
            color: #000000;
            flex: none;
            order: 1;
            flex-grow: 0;
          }

          .condition-card.completed .card-status {
            font-weight: 500;
            letter-spacing: -0.05em;
            color: #FFFFFF;
          }

          /* Описание */
          .card-description {
            margin: 0;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 300;
            font-size: 16px;
            line-height: 110%;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.02em;
            color: #000000;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          .condition-card.completed .card-description {
            font-weight: 400;
            color: #FFFFFF;
          }

          /* Кнопка */
          .back-button {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 16px 0px;
            gap: 10px;
            margin: 0 auto;
            width: 100%;
            max-width: 343px;
            height: 52px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 16px;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
            border: none;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            transition: opacity 0.2s;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
            box-sizing: border-box;
          }

          .back-button:active {
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
            .conditions-container {
              padding: 48px 0px 100px;
            }

            .page-title {
              font-size: 28px;
              width: auto;
              max-width: 220px;
            }

            .card-title {
              font-size: 18px;
            }

            .card-status {
              font-size: 14px;
            }

            .card-description {
              font-size: 14px;
            }
          }

          @supports (-webkit-touch-callout: none) {
            .conditions-wrapper {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}