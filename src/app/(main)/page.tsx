/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

type UserProfile = {
  id: number;
  tg_id: number;
  balance_crystals: number;
  cases_to_open: number;
  daily_taps_count: number;
  last_tap_date: string | null;
  subscribed_to_channel?: boolean;
  voted_for_channel?: boolean;
  tasks_completed?: {
    subscribe: boolean;
    vote: boolean;
    invite: boolean;
  };
};

interface Task {
  id: number;
  points: number;
  title: string;
  description?: string;
  checkButtonText: string;
  actionButtonText: string;
  action: () => void;
  checkAction: () => void;
  isCompleted?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tapsLeft, setTapsLeft] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [isBalancePressed, setIsBalancePressed] = useState(false);
  const [isNavigationPressed, setIsNavigationPressed] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isMobile: false,
    pixelRatio: 1,
    viewportWidth: 375,
    viewportHeight: 812
  });
  const DAILY_TAP_LIMIT = 100;

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    const pixelRatio = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    setDeviceInfo({
      isIOS,
      isMobile,
      pixelRatio,
      viewportWidth,
      viewportHeight
    });

    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();
      
      const startappParam = tg.initDataUnsafe?.start_param;
      
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          initData: tg.initData,
          startapp: startappParam
        }),
      })
      .then(response => {
        if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
        return response.json();
      })
      .then((data: UserProfile) => {
        if ((data as any).error) {
          setError((data as any).error);
        } else {
          setUser(data);
          const today = new Date().toISOString().split('T')[0];
          if (data.last_tap_date === today) {
            setTapsLeft(Math.max(0, DAILY_TAP_LIMIT - data.daily_taps_count));
          } else {
            setTapsLeft(DAILY_TAP_LIMIT);
          }
        }
      })
      .catch(err => {
        console.error("Auth fetch error:", err);
        setError("Не удалось связаться с сервером.");
      })
      .finally(() => setLoading(false));
    } else {
      setError("Пожалуйста, откройте приложение в Telegram.");
      setLoading(false);
    }
  }, []);

  const handleEarnCrystals = () => {
    const tg = window.Telegram?.WebApp;
    if (!user || !tg?.initData || tapsLeft <= 0) return;
    if (tapsLeft <= 0) {
      tg.showAlert('Плюсы на сегодня закончились! Возвращайся завтра.');
      return;
    }
    
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    
    setTapsLeft(prev => prev - 1);
    setUser(prevUser => {
        if (!prevUser) return null;
        return {
            ...prevUser,
            balance_crystals: prevUser.balance_crystals + 1,
            daily_taps_count: prevUser.daily_taps_count + 1
        };
    });

    fetch('/api/tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setUser(prevUser => {
            if (!prevUser) return null;
            const newBalance = (prevUser.balance_crystals || 0) - 1;
            const newTaps = (prevUser.daily_taps_count || 0) - 1;
            return {
                ...prevUser,
                balance_crystals: newBalance < 0 ? 0 : newBalance,
                daily_taps_count: newTaps < 0 ? 0 : newTaps
            };
        });
        
        if (typeof data.tapsLeft === 'number') {
            setTapsLeft(data.tapsLeft);
        } else {
            setTapsLeft(prev => prev + 1);
        }
        
        if (data.error === 'Daily tap limit reached') {
            tg.showAlert('Плюсы на сегодня закончились! Возвращайся завтра.');
        }
      } else {
        if (typeof data.newBalance === 'number') {
            setUser(prev => prev ? { ...prev, balance_crystals: data.newBalance } : null);
        }
        if (typeof data.tapsLeft === 'number') {
            setTapsLeft(data.tapsLeft);
        }
      }
    })
    .catch(err => {
      console.error('Tap fetch error:', err);
      setTapsLeft(prev => prev + 1);
      setUser(prevUser => {
          if (!prevUser) return null;
          return {
              ...prevUser,
              balance_crystals: prevUser.balance_crystals - 1,
              daily_taps_count: prevUser.daily_taps_count - 1
          };
      });
      tg.showAlert('Произошла ошибка сети. Попробуйте еще раз.');
    });
  };
  
  const handleInviteFriend = () => {
    const tg = window.Telegram?.WebApp;
    
    if (!tg) {
      return;
    }
    
    if (loading) {
      tg.showAlert('Загрузка данных. Подождите немного.');
      return;
    }
    
    if (!user) {
      tg.showAlert('Данные пользователя не загружены. Перезагрузите страницу.');
      return;
    }
    
    const userId = user.tg_id;
    
    if (!userId) {
      tg.showAlert('ID пользователя не найден. Перезагрузите страницу.');
      return;
    }
    
    const botUsername = 'my_auction_admin_bot';
    const appName = 'assist_plus';
    
    const referralLink = `https://t.me/${botUsername}/${appName}?startapp=ref${userId}`;
    const shareText = `Привет! Запусти мини-приложение "Ассист+" и получай бонусы!`;
    
    try {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
      tg.openTelegramLink(shareUrl);
    } catch (error) {
      console.error('Share error:', error);
      const fullText = `${shareText}\n${referralLink}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullText)
          .then(() => {
            tg.showAlert('Ссылка скопирована в буфер обмена! Отправь ее другу.');
          })
          .catch(() => {
            tg.showAlert(`Ссылка для друга:\n${referralLink}`);
          });
      } else {
        tg.showAlert(`Ссылка для друга:\n${referralLink}`);
      }
    }
  };

  const checkTask = (taskId: 'subscribe' | 'vote' | 'invite') => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;

    fetch('/api/check-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData, taskId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  balance_crystals: data.newBalance,
                  tasks_completed: {
                    ...prev.tasks_completed,
                    subscribe: taskId === 'subscribe' ? true : prev.tasks_completed?.subscribe || false,
                    vote: taskId === 'vote' ? true : prev.tasks_completed?.vote || false,
                    invite: taskId === 'invite' ? true : prev.tasks_completed?.invite || false,
                  }
                }
              : null
          );
          tg.showAlert(data.message || `Награда получена: +${data.reward} плюсов!`);
        } else {
          tg.showAlert(data.message || 'Условия не выполнены.');
        }
      })
      .catch((err) => {
        console.error(`Check ${taskId} error:`, err);
        tg.showAlert('Ошибка соединения с сервером.');
      });
  };

  const handleSubscribeToChannel = () => {
    const tg = window.Telegram?.WebApp;
    tg?.openTelegramLink('https://t.me/+6flpcSdc4sg5OTAy');
  };

  const handleVoteForChannel = () => {
    const tg = window.Telegram?.WebApp;
    
    if (tg?.initData) {
      fetch('/api/save-boost-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      })
      .then(() => {
        tg.openTelegramLink('https://t.me/boost?c=2782276287');
      })
      .catch((err) => {
        console.error('Save boost count error:', err);
        tg.openTelegramLink('https://t.me/boost?c=2782276287');
      });
    } else {
      tg?.openTelegramLink('https://t.me/boost?c=2782276287');
    }
  };

  const handleNavigationClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    router.push('/navigation');
  };

  const tasks: Task[] = [
    {
      id: 1,
      points: 100,
      title: "Подпишись на Ассист+",
      checkButtonText: "Проверить",
      actionButtonText: "Подписаться",
      action: handleSubscribeToChannel,
      checkAction: () => checkTask('subscribe'),
      isCompleted: user?.tasks_completed?.subscribe || false,
    },
    {
      id: 2,
      points: 500,
      title: "Отдай голос",
      description: "на улучшение канала",
      checkButtonText: "Проверить",
      actionButtonText: "Проголосовать",
      action: handleVoteForChannel,
      checkAction: () => checkTask('vote'),
      isCompleted: user?.tasks_completed?.vote || false,
    },
    {
      id: 3,
      points: 500,
      title: "Пригласи друга",
      checkButtonText: "Проверить",
      actionButtonText: "Пригласить",
      action: handleInviteFriend,
      checkAction: () => checkTask('invite'),
      isCompleted: user?.tasks_completed?.invite || false,
    },
  ];

  const handleTaskAction = (taskId: number, actionType: "check" | "action") => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      if (actionType === "check") {
        task.checkAction();
      } else {
        task.action();
      }
    }
  };

  if (loading) {
    return <div className="loading-container">Загрузка...</div>;
  }
  if (error) {
    return <div className="error-container">Ошибка: {error}</div>;
  }
  if (!user) {
    return <div className="error-container">Не удалось загрузить данные пользователя.</div>;
  }

  return (
    <>
      <GlobalStyles />
      <div className="app-wrapper">
        <main className="main-container">
          <header className="logo-section">
            <div className="logo-container">
              <div className="logo-wrapper">
                {logoError ? (
                  <div className="logo-text-fallback">
                    <span className="assist-text">АССИСТ</span>
                    <span className="plus-text">+</span>
                  </div>
                ) : (
                  <div className="logo-image-container">
                    <img
                      className="logo-image"
                      alt="Ассист+ логотип"
                      src="/svg4122-a7pi.svg"
                      onError={() => setLogoError(true)}
                    />
                    <img
                      className="plus-icon"
                      alt="Плюсик"
                      src="/svg4122-denw.svg"
                    />
                  </div>
                )}
              </div>
              
              <div className="logo-text-container">
                <div className="logo-subtitle">между поколениями</div>
                <div className="logo-title">обмен</div>
              </div>
            </div>
          </header>

          <section className="balance-section">
            <div 
              className="balance-container"
              onClick={handleEarnCrystals}
              onMouseDown={() => setIsBalancePressed(true)}
              onMouseUp={() => setIsBalancePressed(false)}
              onMouseLeave={() => setIsBalancePressed(false)}
              onTouchStart={() => setIsBalancePressed(true)}
              onTouchEnd={() => setIsBalancePressed(false)}
            >
              <div className={`balance-shadow-box ${isBalancePressed ? 'pressed' : ''}`}>
                <img
                  className="balance-crystal"
                  alt="Кристалл"
                  src="/images/134.png"
                />
              </div>
            </div>
            
            <div className="balance-amount">{user.balance_crystals}</div>

            <p className="balance-description">
              <span className="description-text">
                Кликай, зарабатывай плюсы, <br />и меняй их в{" "}
              </span>
              <span className="description-bold">аукционе знакомств</span>
            </p>
          </section>

          <section className="tasks-section">
            <div className="tasks-container">
              <div className="tasks-background">
                <img
                  className="tasks-bg-image-top"
                  alt="Фоновое изображение сверху"
                  src="/svg1642-j9o.svg"
                />
                <div className="tasks-bg-color"></div>
                <img
                  className="tasks-bg-image-bottom"
                  alt="Фоновое изображение снизу"
                  src="/svg1642-j9o.svg"
                />
              </div>

              <div className="tasks-header">
                <h2 className="tasks-title">Задания</h2>
              </div>

              <div className="tasks-list">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className="task-card"
                  >
                    <div className="task-header">
                      <div className="task-content">
                        {task.description ? (
                          <p className="task-title">
                            {task.title} <br />
                            {task.description}
                          </p>
                        ) : (
                          <div className="task-title">{task.title}</div>
                        )}
                      </div>

                      <div className="task-points">
                        <div className="points-text">+{task.points}</div>
                        <div className="points-icon">
                          <img
                            src="/vector4120-sezw.svg"
                            alt="Кристалл"
                            className="points-crystal"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        onClick={() => handleTaskAction(task.id, "check")}
                        className="task-button check-button"
                      >
                        <div className="button-text">{task.checkButtonText}</div>
                      </button>

                      <button
                        onClick={() => handleTaskAction(task.id, "action")}
                        className="task-button action-button"
                      >
                        <div className="button-text bold">{task.actionButtonText}</div>
                      </button>
                    </div>

                    <div className="task-glow"></div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="navigation-section">
            <button
              className={`navigation-button ${isNavigationPressed ? 'pressed' : ''}`}
              onClick={handleNavigationClick}
              onMouseDown={() => setIsNavigationPressed(true)}
              onMouseUp={() => setIsNavigationPressed(false)}
              onMouseLeave={() => setIsNavigationPressed(false)}
              onTouchStart={() => setIsNavigationPressed(true)}
              onTouchEnd={() => setIsNavigationPressed(false)}
            >
              <div className="navigation-text">
                <div>Навигация</div>
                <div>по каналу АССИСТ+</div>
              </div>
              <div className="navigation-arrow">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 1L9 6L3 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </section>
        </main>

        <style jsx>{`
          .app-wrapper {
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

          .main-container {
            width: 100%;
            display: flex;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: contain;
            min-height: 100vh;
            min-height: -webkit-fill-available;
            align-items: center;
            flex-direction: column;
            background-color: #FFFFFF;
            padding: 25px 0px 0px;
            padding-bottom: 70px;
            box-sizing: border-box;
            gap: 8px;
            position: relative;
          }

          .logo-section {
            gap: 6px;
            display: flex;
            align-self: stretch;
            align-items: center;
            flex-direction: column;
          }
          
          .logo-container {
            width: 173px;
            height: 66px;
            display: flex;
            position: relative;
            align-items: flex-start;
            flex-direction: column;
          }
          
          .logo-wrapper {
            position: relative;
            width: 160px;
            height: 38px;
            margin-left: 10px;
          }
          
          .logo-image-container {
            position: relative;
            width: 100%;
            height: 100%;
          }
          
          .logo-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            -webkit-backface-visibility: hidden;
            transform: translateZ(0);
          }
          
          .plus-icon {
            position: absolute;
            top: -12px;
            right: -12px;
            width: 19px;
            height: 19px;
            object-fit: contain;
            -webkit-backface-visibility: hidden;
            transform: translateZ(0);
          }
          
          .logo-text-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          
          .assist-text {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 700;
            font-size: 19px;
            color: #000000;
          }
          
          .plus-text {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 700;
            font-size: 19px;
            color: #FF0000;
            margin-left: 2px;
          }
          
          .logo-text-container {
            position: relative;
            width: 176px;
            height: 27px;
            margin-top: 1px;
            margin-left: -2px;
          }
          
          .logo-subtitle {
            position: absolute;
            top: 12px;
            left: calc(50% - 36px);
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 400;
            font-size: 14px;
            text-align: center;
            color: #000000;
            line-height: 11.7px;
            letter-spacing: -1px;
            white-space: nowrap;
          }
          
          .logo-title {
            color: #000000;
            height: auto;
            position: absolute;
            font-size: 38px;
            font-style: italic;
            font-family: 'Vasek', Georgia, serif;
            font-weight: 400;
            line-height: 81%;
            text-align: center;
          }

          .balance-section {
            gap: 15px;
            display: flex;
            padding: 5px 0 12px;
            align-self: stretch;
            align-items: center;
            flex-direction: column;
          }
          
          .balance-container {
            width: 114px;
            height: 114px;
            position: relative;
            cursor: pointer;
            margin-top: -6px;
            -webkit-tap-highlight-color: transparent;
          }
          
          .balance-shadow-box {
            position: absolute;
            top: 0;
            left: 0;
            width: 114px;
            height: 114px;
            border-radius: 24px;
            box-shadow: 
              4px 4px 8px rgba(0, 0, 0, 0.25),
              inset 3px 3px 8px #ffffff,
              inset -3px -4px 16px rgba(0, 0, 0, 0.3);
            background: linear-gradient(144deg, #D9D9D9 0%, #CDCDCD 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.1s ease-in-out;
          }
          
          .balance-shadow-box.pressed {
            transform: scale(0.98);
          }
          
          .balance-crystal {
            width: 62px;
            height: 58px;
            object-fit: contain;
            -webkit-backface-visibility: hidden;
            transform: translateZ(0);
          }
          
          .balance-amount {
            background: rgba(255, 255, 255, 0.8);
            padding: 6px 12px;
            border-radius: 20px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 700;
            font-size: 20px;
            color: #000000;
            border: 1px solid #b4b4b4;
            line-height: 16.2px;
            letter-spacing: -0.60px;
            margin-top: -5px;
          }
          
          .balance-description {
            width: 240px;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 400;
            font-size: 18px;
            text-align: center;
            color: #000000;
            line-height: 21px;
            letter-spacing: -0.34px;
            margin: 0;
          }
          
          .description-text {
            letter-spacing: -0.05px;
          }
          
          .description-bold {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 700;
            letter-spacing: -0.05px;
          }

          .tasks-section {
            gap: 6px;
            display: flex;
            align-self: stretch;
            align-items: center;
            flex-direction: column;
            width: 100%;
          }
          
          .tasks-container {
            width: 100vw;
            margin-left: -16px;
            margin-right: -16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 28px 0px 28px;
            position: relative;
            overflow: visible;
          }
          
          .tasks-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .tasks-bg-image-top {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 100vw;
            height: 253px;
            object-fit: cover;
            z-index: 0;
          }
          
          .tasks-bg-color {
            position: absolute;
            top: 73px;
            bottom: 73px;
            left: 0;
            width: 100%;
            background-color: #EAEAEA;
            z-index: 0;
          }

          .tasks-bg-image-bottom {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%) rotate(180deg);
            width: 100%;
            max-width: 100vw;
            height: 253px;
            object-fit: cover;
            z-index: 0;
          }
          
          .tasks-header {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px;
            padding: 4px 19px 0px 0px;
            width: 100%;
            max-width: 100vw;
            z-index: 1;
          }
          
          .tasks-title {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 700;
            font-size: 26px;
            text-align: right;
            color: #000000;
            line-height: 28px;
            letter-spacing: -0.77px;
            white-space: nowrap;
            margin: 0;
          }
          
          .tasks-list {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            z-index: 1;
            width: 100%;
            padding: 0 16px;
            box-sizing: border-box;
          }
          
          .task-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            padding: 16px;
            width: 100%;
            max-width: calc(100vw - 32px);
            position: relative;
            background: linear-gradient(244deg, #F23939 0%, #DB1B1B 100%);
            border-radius: 24px;
            overflow: hidden;
          }
          
          .task-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            width: 100%;
            gap: 8px;
          }
          
          .task-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
          }
          
          .task-title {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 500;
            font-size: 16px;
            text-align: left;
            color: #FFFFFF;
            line-height: 16px;
            letter-spacing: -0.32px;
            margin: 0;
          }
          
          .task-points {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }
          
          .points-text {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 700;
            font-size: 19px;
            color: #FFFFFF;
            line-height: 19px;
            white-space: nowrap;
          }
          
          .points-icon {
            width: 20px;
            height: 20px;
            background: #FFFFFF;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .points-crystal {
            width: 12px;
            height: 12px;
            object-fit: contain;
          }
          
          .task-actions {
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            gap: 8px;
            padding-top: 8px;
            width: 100%;
          }
          
          .task-button {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 11px;
            background: #FFFFFF;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            transition: transform 0.1s ease-in-out;
            -webkit-tap-highlight-color: transparent;
          }
          
          .task-button:active {
            transform: scale(0.98);
          }
          
          .button-text {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 300;
            font-size: 13px;
            color: #0D0D0D;
            line-height: 13px;
            letter-spacing: -0.64px;
            white-space: nowrap;
          }
          
          .button-text.bold {
            font-weight: 500;
          }
          
          .task-glow {
            position: absolute;
            top: -35px;
            right: 13px;
            width: 97px;
            height: 97px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 48.5px;
            filter: blur(100px);
            pointer-events: none;
          }

          .navigation-section {
            width: 100%;
            padding: 0 16px 16px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            z-index: 1;
          }

          .navigation-button {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            gap: 10px;
            isolation: isolate;
            width: 100%;
            max-width: calc(100vw - 32px);
            height: 80px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 30px;
            border: none;
            cursor: pointer;
            transition: transform 0.1s ease-in-out;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 4px 12px rgba(215, 37, 37, 0.3);
            position: relative;
          }

          .navigation-button.pressed {
            transform: scale(0.98);
          }

          .navigation-text {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 500;
            font-size: 18px;
            color: #FFFFFF;
            line-height: 1.2;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .navigation-arrow {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading-container, .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            height: -webkit-fill-available;
            background-color: #FFFFFF;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          .loading-container {
            color: #666666;
          }
          
          .error-container {
            color: #FF0000;
            padding: 20px;
            text-align: center;
          }

          @media (max-width: 375px) {
            .main-container {
              padding: 20px 0px 0px;
              padding-bottom: 70px;
            }
            
            .task-card {
              padding: 13px;
            }
            
            .task-title {
              font-size: 14px;
            }
            
            .points-text {
              font-size: 18px;
            }

            .navigation-button {
              height: 70px;
              padding: 16px;
            }

            .navigation-text {
              font-size: 16px;
            }
          }

          @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
            .logo-image, .plus-icon, .balance-crystal, .points-crystal, .tasks-bg-image-top, .tasks-bg-image-bottom {
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
          }

          @supports (-webkit-touch-callout: none) {
            .app-wrapper {
              min-height: -webkit-fill-available;
            }
            
            .main-container {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}