/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import OnboardingStories from '../components/OnboardingStories';

// ============================================
// КОНФИГУРАЦИЯ MILESTONE-ЗАДАНИЙ
// ============================================
const INVITE_MILESTONES = [
  { friends: 1, reward: 500, taskKey: 'invite_1', title: 'Пригласи 1 друга' },
  { friends: 3, reward: 500, taskKey: 'invite_3', title: 'Пригласи 3 друзей' },
  { friends: 5, reward: 500, taskKey: 'invite_5', title: 'Пригласи 5 друзей' },
  { friends: 10, reward: 500, taskKey: 'invite_10', title: 'Пригласи 10 друзей' },
];

interface CompletedTask {
  task_key: string;
  reward_crystals: number;
  completed_at: string;
}

interface Task {
  id: string;
  taskKey: string;
  points: number;
  title: string;
  description?: string;
  progress?: { current: number; required: number };
  buttonText: string;
  checkButtonText?: string;
  action: () => void;
  checkAction?: () => void;
  isCompleted: boolean;
  type: 'welcome' | 'manual' | 'milestone' | 'story';
}

const DAILY_TAP_LIMIT = 100;
const MIN_STORY_LENGTH = 15;

// ============================================
// ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// ============================================
export default function HomePage() {
  const router = useRouter();
  const { user, loading, error, updateBalance, updateUser, addCompletedTask, updateCalendar, markStoriesAsSeen } = useUser();
  
  const [tapsLeft, setTapsLeft] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [isBalancePressed, setIsBalancePressed] = useState(false);
  const [isNavigationPressed, setIsNavigationPressed] = useState(false);
  
  // Состояния для модального окна истории
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [hasSubmittedStory, setHasSubmittedStory] = useState(false);

  // Состояния для адвент-календаря
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [calendarCountdown, setCalendarCountdown] = useState<string>('');
  const [isCalendarPressed, setIsCalendarPressed] = useState(false);

  // Состояние для онбординг-сторис
  const [showStories, setShowStories] = useState(false);

  // Форматирование времени в чч:мм:сс
  const formatTime = useCallback((ms: number): string => {
    if (ms <= 0) return '00:00:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Проверка показа сторис
  useEffect(() => {
    if (user && !user.has_seen_stories) {
      setShowStories(true);
    }
  }, [user]);

  // Обработчик завершения сторис
  const handleStoriesComplete = async () => {
    await markStoriesAsSeen();
    setShowStories(false);
    
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  };

  // Таймер обратного отсчёта для календаря
  useEffect(() => {
    if (!user?.calendar?.isActive || !user.calendar.claimedToday) return;

    let timeLeft = user.calendar.timeUntilNext;
    
    const updateCountdown = () => {
      setCalendarCountdown(formatTime(timeLeft));
      timeLeft -= 1000;
      
      if (timeLeft < 0) {
        window.location.reload();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [user?.calendar, formatTime]);

  // Обработчик получения приза из календаря
  const handleClaimCalendarPrize = async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData || isCalendarLoading || !user?.calendar?.isActive || user.calendar.claimedToday) return;

    setIsCalendarLoading(true);

    try {
      const response = await fetch('/api/calendar/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      });

      const data = await response.json();

      if (data.success) {
        updateCalendar({
          claimedToday: true,
          timeUntilNext: data.timeUntilNext,
          claimedDays: [...(user?.calendar?.claimedDays || []), data.day]
        });
        
        tg.showAlert(`🎁 ${data.message}\n\nПодарок отправлен вам в бота!`);
        
        if (tg.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('success');
        }
      } else {
        if (data.botNotStarted) {
          tg.showAlert('Пожалуйста, сначала запустите бота @my_auction_admin_bot, чтобы получать подарки!');
        } else if (data.alreadyClaimed) {
          updateCalendar({
            claimedToday: true,
            timeUntilNext: data.timeUntilNext
          });
        } else {
          tg.showAlert(data.error || 'Ошибка при получении подарка');
        }
      }
    } catch (err) {
      console.error('Calendar claim error:', err);
      tg.showAlert('Ошибка соединения с сервером');
    } finally {
      setIsCalendarLoading(false);
    }
  };

  // Инициализация tapsLeft при загрузке user
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      if (user.last_tap_date === today) {
        setTapsLeft(Math.max(0, DAILY_TAP_LIMIT - user.daily_taps_count));
      } else {
        setTapsLeft(DAILY_TAP_LIMIT);
      }
    }
  }, [user]);

  // Проверка на редирект
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const startappParam = tg.initDataUnsafe?.start_param;
      if (startappParam === 'navigation') {
        router.replace('/navigation');
      }
    }
    window.scrollTo(0, 0);
  }, [router]);

  // Проверяем, выполнено ли задание
  const isTaskCompleted = (taskKey: string): boolean => {
    if (!user?.completed_tasks) return false;
    return user.completed_tasks.some(t => t.task_key === taskKey);
  };

  // Получаем следующий невыполненный milestone
  const getNextMilestone = (): typeof INVITE_MILESTONES[0] | null => {
    for (const milestone of INVITE_MILESTONES) {
      if (!isTaskCompleted(milestone.taskKey)) {
        return milestone;
      }
    }
    return null;
  };

  const handleEarnCrystals = () => {
    const tg = window.Telegram?.WebApp;
    if (!user || !tg?.initData) return;
    
    if (tapsLeft <= 0) {
      tg.showAlert('Плюсы на сегодня закончились! Возвращайся завтра.');
      return;
    }
    
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    
    setTapsLeft(prev => prev - 1);
    updateBalance(user.balance_crystals + 1);
    updateUser({ daily_taps_count: user.daily_taps_count + 1 });

    fetch('/api/tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setTapsLeft(prev => prev + 1);
        updateBalance(user.balance_crystals);
        updateUser({ daily_taps_count: user.daily_taps_count });
        
        if (data.error === 'Daily tap limit reached') {
          tg.showAlert('Плюсы на сегодня закончились! Возвращайся завтра.');
        }
      } else {
        if (typeof data.newBalance === 'number') {
          updateBalance(data.newBalance);
        }
        if (typeof data.tapsLeft === 'number') {
          setTapsLeft(data.tapsLeft);
        }
      }
    })
    .catch(err => {
      console.error('Tap fetch error:', err);
      setTapsLeft(prev => prev + 1);
      updateBalance(user.balance_crystals);
      updateUser({ daily_taps_count: user.daily_taps_count });
    });
  };
  
  const handleInviteFriend = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !user) return;
    
    const botUsername = 'my_auction_admin_bot';
    const appName = 'assist_plus';
    const referralLink = `https://t.me/${botUsername}/${appName}?startapp=ref${user.tg_id}`;
    const shareText = `Привет! Запусти мини-приложение "АССИСТ+" и получай бонусы!`;
    
    try {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
      tg.openTelegramLink(shareUrl);
    } catch (error) {
      console.error('Share error:', error);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(`${shareText}\n${referralLink}`)
          .then(() => tg.showAlert('Ссылка скопирована в буфер обмена!'))
          .catch(() => tg.showAlert(`Ссылка для друга:\n${referralLink}`));
      } else {
        tg.showAlert(`Ссылка для друга:\n${referralLink}`);
      }
    }
  };

  const checkTask = (taskId: string) => {
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
          const newCompletedTask: CompletedTask = {
            task_key: data.taskKey || taskId,
            reward_crystals: data.reward,
            completed_at: new Date().toISOString()
          };
          
          updateBalance(data.newBalance);
          addCompletedTask(newCompletedTask);
          
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
    tg?.openTelegramLink('https://t.me/boost?c=2782276287');
  };

  const handleNavigationClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    router.push('/navigation');
  };

  const handleOpenStoryModal = () => {
    setIsStoryModalOpen(true);
  };

  const handleCloseStoryModal = () => {
    setIsStoryModalOpen(false);
  };

  const handleSubmitStory = async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;

    const trimmedText = storyText.trim();
    
    if (trimmedText.length < MIN_STORY_LENGTH) {
      tg.showAlert(`Минимум ${MIN_STORY_LENGTH} символов. Сейчас: ${trimmedText.length}`);
      return;
    }

    setIsSubmittingStory(true);

    try {
      const response = await fetch('/api/submit-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          taskKey: 'share_mistake',
          text: trimmedText
        }),
      });

      const data = await response.json();

      if (data.success) {
        setHasSubmittedStory(true);
        setIsStoryModalOpen(false);
        setStoryText('');
        tg.showAlert(data.message || 'История сохранена! Теперь нажмите "Проверить".');
      } else {
        tg.showAlert(data.message || 'Ошибка при сохранении.');
      }
    } catch (err) {
      console.error('Submit story error:', err);
      tg.showAlert('Ошибка соединения с сервером.');
    } finally {
      setIsSubmittingStory(false);
    }
  };

  // Формируем список заданий
  const { activeTasks, completedTasks } = useMemo(() => {
    if (!user) return { activeTasks: [], completedTasks: [] };

    const allTasks: Task[] = [];

    // 1. Приветственный бонус
    allTasks.push({
      id: 'welcome',
      taskKey: 'welcome_bonus',
      points: 400,
      title: 'Приветственный бонус',
      description: 'Получи стартовые плюсы',
      buttonText: 'Получить',
      action: () => checkTask('welcome_bonus'),
      isCompleted: isTaskCompleted('welcome_bonus'),
      type: 'welcome'
    });

    // 2. Подписка на канал
    allTasks.push({
      id: 'subscribe',
      taskKey: 'subscribe_channel',
      points: 100,
      title: 'Подпишись на АССИСТ+',
      buttonText: 'Подписаться',
      checkButtonText: 'Проверить',
      action: handleSubscribeToChannel,
      checkAction: () => checkTask('subscribe'),
      isCompleted: isTaskCompleted('subscribe_channel'),
      type: 'manual'
    });

    // 3. Голосование/буст
    allTasks.push({
      id: 'vote',
      taskKey: 'vote_poll',
      points: 500,
      title: 'Отдай голос',
      description: 'на улучшение канала',
      buttonText: 'Проголосовать',
      checkButtonText: 'Проверить',
      action: handleVoteForChannel,
      checkAction: () => checkTask('vote'),
      isCompleted: isTaskCompleted('vote_poll'),
      type: 'manual'
    });

    // 4. Задание "Расскажи о своей ошибке"
    allTasks.push({
      id: 'share_mistake',
      taskKey: 'share_mistake',
      points: 500,
      title: 'Расскажи о своей ошибке',
      buttonText: 'Написать',
      checkButtonText: 'Проверить',
      action: handleOpenStoryModal,
      checkAction: () => checkTask('share_mistake'),
      isCompleted: isTaskCompleted('share_mistake'),
      type: 'story'
    });

    // 5. Milestone-задания приглашений
    const nextMilestone = getNextMilestone();
    if (nextMilestone) {
      const canClaim = user.referral_count >= nextMilestone.friends;
      
      allTasks.push({
        id: nextMilestone.taskKey,
        taskKey: nextMilestone.taskKey,
        points: nextMilestone.reward,
        title: nextMilestone.title,
        progress: {
          current: user.referral_count,
          required: nextMilestone.friends
        },
        buttonText: canClaim ? 'Получить' : 'Пригласить',
        action: canClaim ? () => checkTask(nextMilestone.taskKey) : handleInviteFriend,
        isCompleted: false,
        type: 'milestone'
      });
    }

    // Добавляем выполненные milestone-задания
    INVITE_MILESTONES.forEach(milestone => {
      if (isTaskCompleted(milestone.taskKey)) {
        allTasks.push({
          id: `completed_${milestone.taskKey}`,
          taskKey: milestone.taskKey,
          points: milestone.reward,
          title: milestone.title,
          buttonText: '',
          action: () => {},
          isCompleted: true,
          type: 'milestone'
        });
      }
    });

    const active = allTasks.filter(t => !t.isCompleted);
    const completed = allTasks.filter(t => t.isCompleted);

    return { activeTasks: active, completedTasks: completed };
  }, [user, hasSubmittedStory]);

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
  if (error && !loading) {
    return <div className="error-container">Ошибка: {error}</div>;
  }

  // Редирект
  if (!user && !loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Переход...</p>
      </div>
    );
  }

  // Показывать ли календарь
  const showCalendar = user?.calendar?.isActive;
  const calendarClaimedToday = user?.calendar?.claimedToday;

  return (
    <>
      {/* Онбординг-сторис для новых пользователей */}
      {showStories && (
        <OnboardingStories onComplete={handleStoriesComplete} />
      )}

      <div className="app-wrapper">
        <main className="main-container">
          {/* HEADER - LOGO */}
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
                      alt="АССИСТ+ логотип"
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

          {/* BALANCE SECTION */}
          <section className="balance-section">
            <svg 
              width="30" 
              height="66" 
              viewBox="0 0 30 66" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="balance-arrow"
            >
              <path d="M5.48642 65.5451C5.58692 65.8023 5.8769 65.9293 6.1341 65.8288C6.39131 65.7283 6.51834 65.4383 6.41783 65.1811L5.95213 65.3631L5.48642 65.5451ZM29.8569 4.0976C30.0556 3.90583 30.0612 3.5893 29.8694 3.39061L26.7443 0.152786C26.5525 -0.0459032 26.236 -0.0515086 26.0373 0.140266C25.8386 0.33204 25.833 0.648573 26.0248 0.847262L28.8027 3.72533L25.9246 6.50323C25.7259 6.695 25.7203 7.01154 25.9121 7.21022C26.1039 7.40891 26.4204 7.41452 26.6191 7.22275L29.8569 4.0976ZM5.95213 65.3631L6.41783 65.1811C-0.145329 48.3852 -0.45165 33.0033 3.91768 21.9096C8.27709 10.841 17.2886 4.0215 29.5008 4.23777L29.5097 3.73785L29.5185 3.23792C16.8458 3.0135 7.4831 10.1281 2.98725 21.5431C-1.49868 32.9329 -1.1413 48.584 5.48642 65.5451L5.95213 65.3631Z" fill="black"/>
            </svg>

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
            
            <div className="balance-amount">{user ? user.balance_crystals : 0}</div>

            <p className="balance-description">
              <span className="description-bold">Кликай на кнопку выше</span>, зарабатывай <br />
              плюсы и меняй их в <span className="description-bold">магазине</span>
            </p>
          </section>

          {/* NAVIGATION BUTTON */}
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

          {/* TASKS SECTION */}
          <section className="tasks-section">
            <div className="tasks-container">
              <div className="tasks-background">
                <img className="tasks-bg-image-top" alt="" src="/svg1642-j9o.svg" />
                <div className="tasks-bg-color"></div>
                <img className="tasks-bg-image-bottom" alt="" src="/svg1642-j9o.svg" />
              </div>

              {/* АДВЕНТ-КАЛЕНДАРЬ - В САМОМ ВЕРХУ */}
              {showCalendar && (
                <div className="advent-section">
                  <div 
                    className={`advent-calendar ${isCalendarPressed ? 'pressed' : ''}`}
                    onClick={!calendarClaimedToday && !isCalendarLoading ? handleClaimCalendarPrize : undefined}
                    onMouseDown={() => !calendarClaimedToday && setIsCalendarPressed(true)}
                    onMouseUp={() => setIsCalendarPressed(false)}
                    onMouseLeave={() => setIsCalendarPressed(false)}
                    onTouchStart={() => !calendarClaimedToday && setIsCalendarPressed(true)}
                    onTouchEnd={() => setIsCalendarPressed(false)}
                    style={{ cursor: calendarClaimedToday ? 'default' : 'pointer' }}
                  >
                    {/* Снежинки - декоративные элементы */}
                    <div className="snowflakes-container">
                      {/* Круглые снежинки */}
                      <div className="snowflake-circle" style={{ left: 'calc(50% - 114.63px)', top: 'calc(50% - 22.81px)' }} />
                      <div className="snowflake-circle" style={{ left: 'calc(50% - 137.61px)', top: 'calc(50% + 4px)' }} />
                      <div className="snowflake-circle" style={{ left: 'calc(50% + 107.49px)', top: 'calc(50% - 53.45px)' }} />
                      <div className="snowflake-circle" style={{ left: 'calc(50% + 152.49px)', top: 'calc(50% - 12.28px)' }} />
                      <div className="snowflake-circle" style={{ left: 'calc(50% + 115.15px)', top: 'calc(50% + 10.7px)' }} />
                      <div className="snowflake-circle" style={{ left: 'calc(50% + 107.49px)', top: 'calc(50% + 35.59px)' }} />
                      <div className="snowflake-circle" style={{ left: 'calc(50% - 155.8px)', top: 'calc(50% - 18.02px)' }} />
                      
                      {/* Звёздочки большие */}
                      <div className="snowflake-star-big" style={{ left: 'calc(50% - 120.37px)', top: 'calc(50% + 15.01px)' }} />
                      <div className="snowflake-star-big" style={{ left: 'calc(50% - 102.18px)', top: 'calc(50% - 51.05px)' }} />
                      <div className="snowflake-star-big" style={{ left: 'calc(50% + 133.34px)', top: 'calc(50% - 40.52px)' }} />
                      <div className="snowflake-star-big" style={{ left: 'calc(50% + 149.62px)', top: 'calc(50% + 22.67px)' }} />
                      <div className="snowflake-star-big" style={{ left: 'calc(50% - 153.88px)', top: 'calc(50% - 40.52px)' }} />
                      
                      {/* Звёздочки маленькие */}
                      <div className="snowflake-star-small" style={{ left: 'calc(50% - 143.83px)', top: 'calc(50% + 24.1px)' }} />
                      <div className="snowflake-star-small" style={{ left: 'calc(50% + 107.97px)', top: 'calc(50% - 20.9px)' }} />
                      <div className="snowflake-star-small" style={{ left: 'calc(50% + 134.78px)', top: 'calc(50% - 1.75px)' }} />
                      <div className="snowflake-star-small" style={{ left: 'calc(50% - 100.75px)', top: 'calc(50% + 31.76px)' }} />
                      <div className="snowflake-star-small" style={{ left: 'calc(50% - 125.64px)', top: 'calc(50% - 47.7px)' }} />
                      <div className="snowflake-star-small" style={{ left: 'calc(50% + 85.95px)', top: 'calc(50% - 51.53px)' }} />
                      <div className="snowflake-star-small" style={{ left: 'calc(50% + 152.97px)', top: 'calc(50% - 38.13px)' }} />
                    </div>

                    {/* Размытые круги - декорация */}
                    <div className="glow-circle-left" />
                    <div className="glow-circle-right" />

                    {/* Контент */}
                    <div className="advent-content">
                      <h3 className="advent-title">Адвент-календарь</h3>
                      
                      {calendarClaimedToday ? (
                        <div className="advent-countdown">
                          <span className="countdown-label">До следующего подарка:</span>
                          <span className="countdown-time">{calendarCountdown}</span>
                        </div>
                      ) : (
                        <div className="advent-claim-text">
                          {isCalendarLoading ? 'Загрузка...' : 'Забрать подарок'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE TASKS */}
              <div className="tasks-header">
                <h2 className="tasks-title">Задания</h2>
              </div>

              <div className="tasks-list">
                {activeTasks.map((task) => (
                  <article key={task.id} className="task-card active">
                    <div className="task-header">
                      <div className="task-content">
                        <div className="task-title">
                          {task.title}
                          {task.description && <><br />{task.description}</>}
                        </div>
                        {task.progress && (
                          <div className="task-progress">
                            {task.progress.current} из {task.progress.required}
                          </div>
                        )}
                      </div>

                      <div className="task-points">
                        <div className="points-text">+{task.points}</div>
                        <div className="points-icon">
                          <img src="/vector4120-sezw.svg" alt="" className="points-crystal" />
                        </div>
                      </div>
                    </div>

                    <div className="task-actions">
                      {task.checkButtonText && task.checkAction && (
                        <button onClick={task.checkAction} className="task-button check-button">
                          <span className="button-text">{task.checkButtonText}</span>
                        </button>
                      )}
                      
                      <button onClick={task.action} className="task-button action-button">
                        <span className="button-text bold">{task.buttonText}</span>
                      </button>
                    </div>

                    <div className="task-glow"></div>
                    <div className="task-glow-bottom"></div>
                  </article>
                ))}
              </div>

              {/* COMPLETED TASKS */}
              <div className="tasks-header completed-header">
                <h2 className="tasks-title">Выполненные</h2>
              </div>

              <div className="tasks-list">
                {completedTasks.length === 0 ? (
                  <div className="no-completed-tasks">
                    Выполняй задания, чтобы они появились здесь
                  </div>
                ) : (
                  completedTasks.map((task) => (
                    <article key={task.id} className="task-card completed">
                      <div className="task-header">
                        <div className="task-content">
                          <div className="task-title">{task.title}</div>
                        </div>

                        <div className="task-points">
                          <div className="points-text">+{task.points}</div>
                          <div className="points-icon">
                            <img src="/vector4120-sezw.svg" alt="" className="points-crystal" />
                          </div>
                        </div>
                      </div>

                      <div className="task-glow"></div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>

        {/* МОДАЛЬНОЕ ОКНО ДЛЯ НАПИСАНИЯ ИСТОРИИ */}
        {isStoryModalOpen && (
          <div className="modal-overlay" onClick={handleCloseStoryModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Расскажи о своей ошибке</h3>
                <button className="modal-close" onClick={handleCloseStoryModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              <p className="modal-description">
                Поделись своим опытом — какую ошибку ты совершил и чему научился?
              </p>
              
              <textarea
                className="modal-textarea"
                placeholder="Напиши свою историю здесь..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                maxLength={2000}
              />
              
              <div className="modal-footer">
                <span className="char-count">
                  {storyText.length} / {MIN_STORY_LENGTH} мин.
                </span>
                <button 
                  className="modal-submit-button"
                  onClick={handleSubmitStory}
                  disabled={isSubmittingStory || storyText.trim().length < MIN_STORY_LENGTH}
                >
                  {isSubmittingStory ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          /* ============================================ */
          /* ADVENT CALENDAR STYLES - GLOBAL */
          /* ============================================ */
          .advent-section {
            width: 100%;
            padding: 0 16px;
            box-sizing: border-box;
            z-index: 1;
            margin-bottom: 10px;
          }

          .advent-calendar {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px 10px 30px;
            gap: 20px;
            isolation: isolate;
            width: 100%;
            height: 128px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 30px;
            position: relative;
            overflow: hidden;
            transition: transform 0.1s ease-in-out;
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
          }

          .advent-calendar.pressed {
            transform: scale(0.98);
          }

          .advent-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            z-index: 10;
          }

          .advent-title {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
            margin: 0;
          }

          .advent-claim-text {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 500;
            font-size: 24px;
            line-height: 100%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
          }

          .advent-countdown {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }

          .countdown-label {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 400;
            font-size: 16px;
            line-height: 110%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
          }

          .countdown-time {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
          }

          /* Размытые круги - декорация */
          .glow-circle-left {
            position: absolute;
            width: 67px;
            height: 67px;
            left: calc(50% - 67px/2 - 100px);
            top: calc(50% - 67px/2 + 30px);
            background: #FFFFFF;
            filter: blur(60px);
            transform: rotate(-180deg);
            pointer-events: none;
            z-index: 3;
          }

          .glow-circle-right {
            position: absolute;
            width: 55px;
            height: 55px;
            left: calc(50% - 55px/2 + 100px);
            top: calc(50% - 55px/2 - 52px);
            background: #FFFFFF;
            filter: blur(60px);
            transform: rotate(-180deg);
            pointer-events: none;
            z-index: 4;
          }

          /* Снежинки контейнер */
          .snowflakes-container {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 5;
          }

          /* Круглые снежинки */
          .snowflake-circle {
            position: absolute;
            width: 7.66px;
            height: 7.66px;
            background: #FFFFFF;
            border-radius: 50%;
          }

          /* Звёздочки большие */
          .snowflake-star-big {
            position: absolute;
            width: 17px;
            height: 16px;
            background: #FFFFFF;
            clip-path: polygon(
              50% 0%, 61% 35%, 98% 35%, 68% 57%, 
              79% 91%, 50% 70%, 21% 91%, 32% 57%, 
              2% 35%, 39% 35%
            );
            transform: rotate(-90deg);
          }

          /* Звёздочки маленькие */
          .snowflake-star-small {
            position: absolute;
            width: 16px;
            height: 11px;
            background: #FFFFFF;
            clip-path: polygon(
              50% 0%, 61% 35%, 98% 35%, 68% 57%, 
              79% 91%, 50% 70%, 21% 91%, 32% 57%, 
              2% 35%, 39% 35%
            );
            transform: rotate(-90deg);
          }
        `}</style>

        <style jsx>{`
          .app-wrapper {
            position: relative;
            min-height: auto;
            min-height: auto;
            background-color: #FFFFFF;
            width: 100%;
            max-width: 100vw;
            /* overflow-x: hidden; */
            /* overflow-y: auto; */
            /* -webkit-overflow-scrolling: touch; */
          }

          .main-container {
            width: 100%;
            display: flex;
            /* overflow-y: auto; */
            /* overflow-x: hidden; */
            /* -webkit-overflow-scrolling: touch; */
            /* overscroll-behavior-y: contain; */
            min-height: auto;
            min-height: auto;
            align-items: center;
            flex-direction: column;
            background-color: #FFFFFF;
            padding: 25px 0px 0px;
            padding-bottom: 70px;
            box-sizing: border-box;
            gap: 8px;
            position: relative;
          }

          /* LOGO STYLES */
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
          }
          
          .plus-icon {
            position: absolute;
            top: -12px;
            right: -12px;
            width: 19px;
            height: 19px;
            object-fit: contain;
          }
          
          .logo-text-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .assist-text {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 19px;
            color: #000000;
          }
          
          .plus-text {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 19px;
            color: #FF0000;
            margin-left: 2px;
          }
          
          .logo-text-container {
            position: relative;
            width: 176px;
            height: 27px;
            margin-top: -10px;
            margin-left: -2px;
          }
          
          .logo-subtitle {
            position: absolute;
            top: 12px;
            left: calc(50% - 36px);
            font-family: 'Cera Pro', sans-serif;
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
            position: absolute;
            font-size: 38px;
            font-style: italic;
            font-family: 'Vasek', Georgia, serif;
            font-weight: 400;
            line-height: 81%;
            text-align: center;
          }

          /* BALANCE STYLES */
          .balance-section {
            position: relative;
            gap: 15px;
            display: flex;
            padding: 5px 0 12px;
            align-self: stretch;
            align-items: center;
            flex-direction: column;
          }

          .balance-arrow {
            position: absolute;
            left: calc(50% - 110px);
            top: 105px;
            width: 28.4px;
            height: 62.03px;
            z-index: 3;
            transform: rotate(1.01deg);
            pointer-events: none;
          }
          
          .balance-container {
            width: 120px;
            height: 120px;
            position: relative;
            cursor: pointer;
            margin-top: -6px;
            -webkit-tap-highlight-color: transparent;
          }
          
          .balance-shadow-box {
            position: absolute;
            top: 0;
            left: 0;
            width: 120px;
            height: 120px;
            border-radius: 20px;
            box-shadow: 0px 3px 10px 1px rgba(0, 0, 0, 0.15), inset -1px -1px 5px rgba(0, 0, 0, 0.35), inset 2px 2px 5px #FFFFFF;
            background: linear-gradient(133.36deg, #E3E3E3 39.04%, #E1E1E1 97.42%);
            border: 0.5px solid rgba(0, 0, 0, 0.2);
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
          }
          
          .balance-amount {
            background: rgba(255, 255, 255, 0.5);
            padding: 7px 10px;
            border-radius: 30px;
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 20px;
            color: #0D0D0D;
            border: 1px solid #B4B4B4;
            line-height: 81%;
            letter-spacing: -0.03em;
            margin-top: -5px;
            min-width: 53px;
            height: 27px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .balance-description {
            width: 281px;
            font-family: 'Cera Pro', sans-serif;
            font-weight: 400;
            font-size: 14px;
            text-align: center;
            color: #0D0D0D;
            line-height: 110%;
            letter-spacing: -0.03em;
            margin: 0;
          }
          
          .description-bold {
            font-weight: 700;
          }

          /* NAVIGATION STYLES */
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
          }

          .navigation-button.pressed {
            transform: scale(0.98);
          }

          .navigation-text {
            font-family: 'Cera Pro', sans-serif;
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
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* TASKS SECTION STYLES */
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
            gap: 10px;
            padding: 28px 0px 70px;
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

          .completed-header {
            padding-top: 15px;
          }
          
          .tasks-title {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 500;
            font-size: 32px;
            text-align: right;
            color: #0D0D0D;
            line-height: 110%;
            letter-spacing: -0.03em;
            white-space: nowrap;
            margin: 0;
          }
          
          .tasks-list {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            z-index: 1;
            width: 100%;
            padding: 0 16px;
            box-sizing: border-box;
          }

          .no-completed-tasks {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 400;
            font-size: 14px;
            color: #666666;
            text-align: center;
            padding: 20px;
          }
          
          /* TASK CARD STYLES */
          .task-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
            gap: 8px;
            width: 100%;
            max-width: calc(100vw - 32px);
            position: relative;
            border-radius: 30px;
            overflow: hidden;
            isolation: isolate;
          }

          .task-card.active {
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
          }

          .task-card.completed {
            background: linear-gradient(243.66deg, #707070 10.36%, #525252 86.45%);
            padding: 20px;
            gap: 8px;
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
            gap: 4px;
          }
          
          .task-title {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 500;
            font-size: 20px;
            text-align: left;
            color: #FFFFFF;
            line-height: 100%;
            letter-spacing: -0.03em;
            margin: 0;
          }

          .task-progress {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 400;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 4px;
          }
          
          .task-points {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
          }
          
          .points-text {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 24px;
            color: #FFFFFF;
            line-height: 100%;
            white-space: nowrap;
          }
          
          .points-icon {
            width: 25px;
            height: 25px;
            background: #FFFFFF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .points-crystal {
            width: 14px;
            height: 12px;
            object-fit: contain;
          }
          
          .task-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            padding-top: 10px;
            width: 100%;
          }
          
          .task-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 14px;
            background: #FFFFFF;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            transition: transform 0.1s ease-in-out;
            -webkit-tap-highlight-color: transparent;
          }
          
          .task-button:active {
            transform: scale(0.98);
          }

          .check-button {
            padding: 10px 14px;
          }

          .action-button {
            padding: 10px 14px;
          }
          
          .button-text {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 300;
            font-size: 16px;
            color: #0D0D0D;
            line-height: 100%;
            letter-spacing: -0.05em;
            white-space: nowrap;
          }
          
          .button-text.bold {
            font-weight: 500;
            font-size: 20px;
            letter-spacing: -0.03em;
          }
          
          .task-glow {
            position: absolute;
            width: 120px;
            height: 120px;
            right: -20px;
            top: -43px;
            background: rgba(255, 255, 255, 0.8);
            filter: blur(125px);
            pointer-events: none;
            z-index: -1;
          }

          .task-glow-bottom {
            position: absolute;
            width: 78px;
            height: 78px;
            left: 10px;
            bottom: -30px;
            background: #FFFFFF;
            filter: blur(60px);
            pointer-events: none;
            z-index: -1;
          }

          /* MODAL STYLES */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-content {
            background: #FFFFFF;
            border-radius: 24px;
            padding: 24px;
            width: 100%;
            max-width: 400px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .modal-title {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 600;
            font-size: 20px;
            color: #0D0D0D;
            margin: 0;
          }

          .modal-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-description {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 400;
            font-size: 14px;
            color: #666666;
            margin: 0;
            line-height: 1.4;
          }

          .modal-textarea {
            width: 100%;
            min-height: 150px;
            padding: 16px;
            border: 1px solid #E0E0E0;
            border-radius: 16px;
            font-family: 'Cera Pro', sans-serif;
            font-size: 16px;
            color: #0D0D0D;
            resize: none;
            outline: none;
            transition: border-color 0.2s;
          }

          .modal-textarea:focus {
            border-color: #D72525;
          }

          .modal-textarea::placeholder {
            color: #AAAAAA;
          }

          .modal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .char-count {
            font-family: 'Cera Pro', sans-serif;
            font-size: 12px;
            color: #999999;
          }

          .modal-submit-button {
            padding: 12px 24px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border: none;
            border-radius: 30px;
            color: #FFFFFF;
            font-family: 'Cera Pro', sans-serif;
            font-weight: 500;
            font-size: 16px;
            cursor: pointer;
            transition: opacity 0.2s, transform 0.1s;
          }

          .modal-submit-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .modal-submit-button:active:not(:disabled) {
            transform: scale(0.98);
          }

          /* RESPONSIVE */
          @media (max-width: 375px) {
            .main-container {
              padding: 20px 0px 0px;
              padding-bottom: 70px;
            }
            
            .task-card {
              padding: 16px;
            }
            
            .task-title {
              font-size: 18px;
            }
            
            .points-text {
              font-size: 20px;
            }

            .navigation-button {
              height: 70px;
              padding: 16px;
            }

            .navigation-text {
              font-size: 16px;
            }

            .button-text.bold {
              font-size: 18px;
            }

            .modal-content {
              padding: 20px;
            }

            .modal-title {
              font-size: 18px;
            }
          }
        `}</style>
      </div>
    </>
  );
}