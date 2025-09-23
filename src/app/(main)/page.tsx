/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tapsLeft, setTapsLeft] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [isBalancePressed, setIsBalancePressed] = useState(false);
  const DAILY_TAP_LIMIT = 100;

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      
      const startappParam = tg.initDataUnsafe?.start_param;
      console.log('startapp from WebApp:', startappParam);
      
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
        console.error('Tap error:', data.error);
        
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
    if (!tg || !user || !user.tg_id) {
      tg?.showAlert('Не удалось создать ссылку. Пожалуйста, перезагрузите страницу.');
      return;
    }
    
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    const appName = 'assist_plus';
    
    if (!botUsername) {
      console.error("Bot username is not set in .env.local");
      tg?.showAlert('Ошибка конфигурации приложения.');
      return;
    }
    
    const referralLink = `https://t.me/${botUsername}/${appName}?startapp=ref${user.tg_id}`;
    const shareText = `Привет! Запусти мини-приложение "Ассист+" и получай бонусы!`;
    
    try {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
      tg.openTelegramLink(shareUrl);
    } catch (error) {
      console.error('Share error:', error);
      navigator.clipboard.writeText(`${shareText}\n${referralLink}`);
      tg.showAlert('Ссылка скопирована в буфер обмена! Отправь ее другу.');
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
    tg?.openTelegramLink('https://t.me/assistplus_business');
  };

  const handleVoteForChannel = () => {
    const tg = window.Telegram?.WebApp;
    tg?.openTelegramLink('https://t.me/assistplus_business');
  };

  const [tasks] = useState<Task[]>([
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
  ]);

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
    <main className="main-container">
      {/* Логотип с fallback и плюсиком - ИСПРАВЛЕННЫЙ */}
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
                {/* Плюсик сдвинут еще больше вверх и вправо */}
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
            {/* Слово "обмен" опущено и сдвинуто влево */}
            <div className="logo-title">обмен</div>
          </div>
        </div>
      </header>

      {/* Кнопка подписки */}
      <section className="subscribe-section">
        <button
          onClick={handleSubscribeToChannel}
          className="subscribe-button"
          aria-label="Подписаться на канал"
        >
          <div className="subscribe-text">Подписаться на канал</div>
        </button>
      </section>

      {/* Блок с балансом - ИСПРАВЛЕННЫЙ (добавлен эффект нажатия) */}
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
              src="/vector3530-fpvf.svg"
            />
            <div className="balance-amount">{user.balance_crystals}</div>
          </div>
        </div>

        <p className="balance-description">
          <span className="description-text">
            Кликай, зарабатывай плюсы, <br />и меняй их в{" "}
          </span>
          <span className="description-bold">аукционе знакомств</span>
        </p>
      </section>

      {/* Задания */}
      <section className="tasks-section">
        <div className="tasks-container">
          <div className="tasks-background">
            <div className="tasks-bg-color"></div>
            <img
              className="tasks-bg-image"
              alt="Фоновое изображение"
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

      <style jsx>{`
        .main-container {
          width: 100%;
          display: flex;
          overflow: auto;
          min-height: 100vh;
          align-items: center;
          flex-direction: column;
          background-color: #FFFFFF;
        }

        /* Логотип - ИСПРАВЛЕННЫЙ */
        .logo-section {
          gap: 10px;
          display: flex;
          align-self: stretch;
          align-items: center;
          flex-direction: column;
          padding-top: 40px;
        }
        
        .logo-container {
          width: 216px;
          height: 83px;
          display: flex;
          position: relative;
          align-items: flex-start;
          flex-direction: column;
        }
        
        .logo-wrapper {
          position: relative;
          width: 200px;
          height: 48px;
          margin-left: 12px;
        }
        
        .logo-image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .logo-image {
          width: 100%;
          height: 100%;
        }
        
        .plus-icon {
          position: absolute;
          top: -15px;  /* Еще больше сдвиг вверх */
          right: -15px; /* Еще больше сдвиг вправо */
          width: 24px;
          height: 24px;
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
          font-family: 'Cera Pro', sans-serif;
          font-weight: 700;
          font-size: 24px;
          color: #000000;
        }
        
        .plus-text {
          font-family: 'Cera Pro', sans-serif;
          font-weight: 700;
          font-size: 24px;
          color: #FF0000;
          margin-left: 2px;
        }
        
        .logo-text-container {
          position: relative;
          width: 220px;
          height: 34px;
          margin-top: 1px;
          margin-left: -2px;
        }
        
        .logo-subtitle {
          position: absolute;
          top: 15px;
          left: calc(50% - 49px);
          font-family: 'Cera Pro';
          font-weight: 400;
          font-size: 18px;
          text-align: center;
          color: #000000;
          line-height: 14.6px;
          letter-spacing: -1.26px;
          white-space: nowrap;
        }
        
        .logo-title {
          position: absolute;
          top: 10px; /* Опущено вниз */
          left: calc(50% - 120px); /* Сдвинуто влево для центрирования */
          font-family: 'Vasek';
          font-style: italic;
          font-weight: 400;
          font-size: 24px;
          text-align: center;
          color: #000000;
          line-height: 19.5px;
          letter-spacing: -0.72px;
          white-space: nowrap;
        }

        /* Кнопка подписки */
        .subscribe-section {
          gap: 10px;
          display: flex;
          align-self: stretch;
          align-items: center;
          flex-direction: column;
        }
        
        .subscribe-button {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 20px;
          background: linear-gradient(244deg, #F23939 0%, #DB1B1B 100%);
          border: none;
          border-radius: 30px;
          cursor: pointer;
          transition: transform 0.1s ease-in-out;
        }
        
        .subscribe-button:active {
          transform: scale(0.98);
        }
        
        .subscribe-text {
          width: 195px;
          font-family: 'Cera Pro';
          font-weight: 700;
          font-size: 18px;
          text-align: center;
          color: #FFFFFF;
          line-height: 18px;
          letter-spacing: -0.36px;
        }

        /* Блок с балансом - ИСПРАВЛЕННЫЙ (добавлен эффект нажатия) */
        .balance-section {
          gap: 25px;
          display: flex;
          padding: 5px 0 20px;
          align-self: stretch;
          align-items: center;
          flex-direction: column;
        }
        
        .balance-container {
          width: 195px;
          height: 195px;
          position: relative;
          cursor: pointer;
        }
        
        .balance-shadow-box {
          position: absolute;
          top: 0;
          left: 0;
          width: 195px;
          height: 195px;
          border-radius: 30px;
          box-shadow: 
            5px 5px 10px rgba(0, 0, 0, 0.25),
            inset 3px 3px 10px #ffffff,
            inset -4px -5px 20px rgba(0, 0, 0, 0.3);
          background: linear-gradient(144deg, #D9D9D9 0%, #CDCDCD 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.1s ease-in-out;
        }
        
        .balance-shadow-box.pressed {
          transform: scale(0.98); /* Эффект нажатия */
        }
        
        .balance-crystal {
          width: 106px;
          height: 101px;
        }
        
        .balance-amount {
          position: absolute;
          bottom: 8px;
          background: rgba(255, 255, 255, 0.8);
          padding: 6px 12px;
          border-radius: 20px;
          font-family: 'Cera Pro';
          font-weight: 700;
          font-size: 18px;
          color: #000000;
        }
        
        .balance-description {
          width: 253px;
          height: 29px;
          font-family: 'Cera Pro';
          font-weight: 400;
          font-size: 16px;
          text-align: center;
          color: #000000;
          line-height: 17.6px;
          letter-spacing: -0.48px;
        }
        
        .description-bold {
          font-family: 'Cera Pro';
          font-weight: 700;
          letter-spacing: -0.08px;
        }

        /* Задания */
        .tasks-section {
          gap: 10px;
          display: flex;
          align-self: stretch;
          align-items: center;
          flex-direction: column;
        }
        
        .tasks-container {
          width: 359px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 35px;
          padding: 35px 0 8px;
          position: relative;
          border-radius: 0 0 32px 32px;
          overflow: hidden;
        }
        
        .tasks-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 359px;
          height: 1771px;
        }
        
        .tasks-bg-color {
          position: absolute;
          top: 91px;
          left: 0;
          width: 359px;
          height: 1680px;
          background-color: #EAEAEA;
        }
        
        .tasks-bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 359px;
          height: 218px;
        }
        
        .tasks-header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 0 16px 0 0;
          width: 100%;
          z-index: 1;
        }
        
        .tasks-title {
          font-family: 'Cera Pro';
          font-weight: 700;
          font-size: 32px;
          text-align: right;
          color: #000000;
          line-height: 35.2px;
          letter-spacing: -0.96px;
          white-space: nowrap;
        }
        
        .tasks-list {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 1;
        }
        
        .task-card {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          padding: 20px;
          width: 343px;
          position: relative;
          background: linear-gradient(244deg, #F23939 0%, #DB1B1B 100%);
          border-radius: 30px;
          overflow: hidden;
        }
        
        .task-points {
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .points-text {
          font-family: 'Cera Pro';
          font-weight: 700;
          font-size: 24px;
          color: #FFFFFF;
          line-height: 24px;
          white-space: nowrap;
        }
        
        .points-icon {
          width: 25px;
          height: 25px;
          background: #FFFFFF;
          border-radius: 12.5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .points-crystal {
          width: 15px;
          height: 15px;
        }
        
        .task-content {
          display: inline-flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          gap: 10px;
        }
        
        .task-title {
          width: 285px;
          font-family: 'Cera Pro';
          font-weight: 500;
          font-size: 20px;
          text-align: right;
          color: #FFFFFF;
          line-height: 20px;
          letter-spacing: -0.4px;
        }
        
        .task-actions {
          display: inline-flex;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 15px;
        }
        
        .task-button {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 15px;
          background: #FFFFFF;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          transition: transform 0.1s ease-in-out;
        }
        
        .task-button:active {
          transform: scale(0.98);
        }
        
        .button-text {
          font-family: 'Cera Pro';
          font-weight: 400;
          font-size: 16px;
          color: #0D0D0D;
          line-height: 16px;
          letter-spacing: -0.48px;
          white-space: nowrap;
        }
        
        .button-text.bold {
          font-weight: 700;
        }
        
        .task-glow {
          position: absolute;
          top: -43px;
          left: 207px;
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 60px;
          filter: blur(125px);
        }

        /* Утилиты */
        .loading-container, .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #FFFFFF;
          font-family: 'Cera Pro';
        }
        
        .loading-container {
          color: #666666;
        }
        
        .error-container {
          color: #FF0000;
          padding: 20px;
          text-align: center;
        }
      `}</style>
    </main>
  );
}