'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// КОНФИГУРАЦИЯ СЛАЙДОВ
// ============================================

interface StoryImage {
  src: string;
  style: React.CSSProperties;
  blur?: boolean;
}

interface StorySlide {
  id: number;
  title: string;
  subtitle: string;
  additionalText?: string;
  buttonText: string;
  images: StoryImage[];
}

const STORIES: StorySlide[] = [
  {
    id: 1,
    title: 'Что тебя ждёт в мини-приложении АССИСТ+?',
    subtitle: 'Возможность получать подарки, выполняя задания и приглашая друзей',
    additionalText: 'Среди призов могут оказаться чек-листы, разборы твоих запросов от команды и даже личная встреча с предпринимателем',
    buttonText: 'А что еще?',
    images: [
      {
        src: '/stories/gift.png',
        style: {
          width: '397.64px',
          height: '397.64px',
          left: '56.14px',
          top: '303.52px',
          transform: 'rotate(-21.24deg)',
        },
      },
    ],
  },
  {
    id: 2,
    title: 'Доступ к навигации по нашему каналу',
    subtitle: 'Все в одном месте: максимально просто находи полезный контент',
    buttonText: 'Отлично',
    images: [
      {
        src: '/stories/folder.png',
        style: {
          width: '506px',
          height: '506px',
          left: '18px',
          top: '256px',
          transform: 'scaleX(-1)',
        },
      },
    ],
  },
  {
    id: 3,
    title: 'Информация об эксклюзивных мероприятиях',
    subtitle: 'Узнавай самым первым о новых событиях АССИСТ+',
    buttonText: 'Хорошо',
    images: [
      {
        src: '/stories/star.png',
        style: {
          width: '427.98px',
          height: '427.98px',
          left: '-92px',
          top: '311.55px',
          transform: 'matrix(-0.99, -0.13, -0.13, 0.99, 0, 0)',
        },
      },
      {
        src: '/stories/star2.png',
        style: {
          width: '199.99px',
          height: '199.99px',
          left: '193.08px',
          top: '291px',
          transform: 'rotate(10.8deg)',
        },
        blur: true,
      },
    ],
  },
  {
    id: 4,
    title: 'Разбор резюме от ИИ-агента',
    subtitle: 'Сильные стороны, зоны роста, рекомендации, и не только — всё в одном разборе от ИИ',
    buttonText: 'Начать',
    images: [
      {
        src: '/stories/paper.png',
        style: {
          width: '430.46px',
          height: '430.46px',
          left: '-89px',
          top: '219px',
          transform: 'rotate(22.27deg)',
        },
      },
    ],
  },
];

const SLIDE_DURATION = 5000; // 5 секунд на слайд

// ============================================
// КОМПОНЕНТ СТРАНИЦЫ
// ============================================

export default function StoriesPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const goToNextSlide = useCallback(() => {
    if (currentSlide < STORIES.length - 1) {
      setCurrentSlide(prev => prev + 1);
      setProgress(0);
    } else {
      // Последний слайд - переход на главную
      router.push('/');
    }
  }, [currentSlide, router]);

  // Автопрокрутка с прогресс-баром
  useEffect(() => {
    if (isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (SLIDE_DURATION / 50));
        if (newProgress >= 100) {
          goToNextSlide();
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentSlide, isPaused, goToNextSlide]);

  // Пауза при удержании
  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  const handleImageError = (src: string) => {
    setImageErrors(prev => ({ ...prev, [src]: true }));
  };

  const story = STORIES[currentSlide];

  // Эмодзи-заглушки для изображений
  const fallbackEmojis: Record<number, string> = {
    1: '🎁',
    2: '📁',
    3: '⭐',
    4: '📄',
  };

  return (
    <div 
      className="stories-container"
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Фоновые изображения */}
      {story.images.map((image, index) => (
        <div 
          key={`${story.id}-${index}`}
          className={`story-background-image ${image.blur ? 'blurred' : ''}`}
          style={image.style}
        >
          {imageErrors[image.src] ? (
            index === 0 ? (
              <div className="fallback-emoji">{fallbackEmojis[story.id]}</div>
            ) : null
          ) : (
            <img 
              src={image.src} 
              alt="" 
              onError={() => handleImageError(image.src)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </div>
      ))}

      {/* Прогресс-бары сверху */}
      <div className="progress-bars">
        {STORIES.map((_, index) => (
          <div key={index} className="progress-bar-track">
            <div 
              className="progress-bar-fill"
              style={{
                width: index < currentSlide 
                  ? '100%' 
                  : index === currentSlide 
                    ? `${progress}%` 
                    : '0%',
                background: index <= currentSlide ? '#FF3F3F' : '#D1D1D1'
              }}
            />
          </div>
        ))}
      </div>

      {/* Контент */}
      <div className="story-content">
        {/* Заголовок */}
        <div className="story-header">
          <h1 className="story-title">{story.title}</h1>
        </div>

        {/* Подзаголовок */}
        <p className="story-subtitle">{story.subtitle}</p>

        {/* Дополнительный текст (только для первого слайда) */}
        {story.additionalText && (
          <p className="story-additional-text">{story.additionalText}</p>
        )}

        {/* Отступ */}
        <div className="story-spacer" />

        {/* Кнопка */}
        <button 
          className="story-button"
          onClick={(e) => {
            e.stopPropagation();
            goToNextSlide();
          }}
        >
          <div className="button-content">
            <span className="button-text">{story.buttonText}</span>
            <div className="button-arrow" />
          </div>
        </button>
      </div>

      <style jsx>{`
        .stories-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 48px 16px 32px;
          gap: 16px;
          isolation: isolate;
          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          background: linear-gradient(165.16deg, #F8F8F9 31.47%, #E2E0E7 72.98%);
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          box-sizing: border-box;
        }

        /* Фоновое изображение */
        .story-background-image {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .story-background-image.blurred {
          filter: blur(2px);
        }

        .fallback-emoji {
          font-size: 200px;
          opacity: 0.8;
        }

        /* Прогресс-бары */
        .progress-bars {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          padding: 0px;
          gap: 8px;
          width: 100%;
          height: 5px;
          z-index: 10;
        }

        .progress-bar-track {
          flex: 1;
          height: 5px;
          background: #D1D1D1;
          box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.25);
          border-radius: 555px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: #FF3F3F;
          border-radius: 555px;
          transition: width 0.05s linear;
        }

        /* Контент */
        .story-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          flex: 1;
          z-index: 5;
        }

        /* Заголовок */
        .story-header {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 16px 0px 0px;
          gap: 10px;
          width: 100%;
        }

        .story-title {
          width: 100%;
          max-width: 341px;
          font-family: 'Cera Pro', sans-serif;
          font-style: normal;
          font-weight: 400;
          font-size: 36px;
          line-height: 110%;
          letter-spacing: -0.07em;
          color: #000000;
          margin: 0;
        }

        /* Подзаголовок */
        .story-subtitle {
          width: 100%;
          max-width: 293px;
          font-family: 'Cera Pro', sans-serif;
          font-style: normal;
          font-weight: 300;
          font-size: 20px;
          line-height: 105%;
          letter-spacing: -0.05em;
          color: #000000;
          margin: 16px 0 0 0;
        }

        /* Дополнительный текст */
        .story-additional-text {
          width: 100%;
          max-width: 269px;
          font-family: 'Cera Pro', sans-serif;
          font-style: normal;
          font-weight: 300;
          font-size: 20px;
          line-height: 105%;
          letter-spacing: -0.05em;
          color: #000000;
          margin: 16px 0 0 0;
        }

        /* Отступ */
        .story-spacer {
          flex: 1;
          min-height: 100px;
        }

        /* Кнопка */
        .story-button {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding: 18px 20px;
          gap: 10px;
          width: 100%;
          height: 60px;
          background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
          box-shadow: 
            1px 4px 12px rgba(0, 0, 0, 0.25), 
            inset -1px -1px 8px rgba(0, 0, 0, 0.15), 
            inset 2px 4px 8px rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          border: none;
          cursor: pointer;
          transition: transform 0.1s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .story-button:active {
          transform: scale(0.98);
        }

        .button-content {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding: 0px;
          gap: 10px;
        }

        .button-text {
          font-family: 'Cera Pro', sans-serif;
          font-style: normal;
          font-weight: 500;
          font-size: 24px;
          line-height: 100%;
          letter-spacing: -0.05em;
          color: #FFFFFF;
        }

        .button-arrow {
          width: 30px;
          height: 2px;
          background: #FFFFFF;
          border-radius: 1px;
        }

        /* Адаптивность */
        @media (max-width: 375px) {
          .story-title {
            font-size: 32px;
          }
          
          .story-subtitle,
          .story-additional-text {
            font-size: 18px;
          }
          
          .button-text {
            font-size: 20px;
          }
        }

        @media (min-height: 900px) {
          .story-spacer {
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
}