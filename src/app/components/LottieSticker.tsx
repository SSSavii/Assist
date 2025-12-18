'use client';

import { useEffect, useState, CSSProperties } from 'react';

// Маппинг стикеров
export const STICKERS = {
  exclamation: '/stickers/TgSticker_17a9cf2d.json',
  heart_fire: '/stickers/TgSticker_9350f51d.json',
  checkmark: '/stickers/TgSticker_0926397b.json',
  fire: '/stickers/TgSticker_a565b730.json',
  a_plus_spin: '/stickers/TgSticker_aea13e35.json',
  megaphone: '/stickers/TgSticker_cdb103af.json',
  ba_logo: '/stickers/TgSticker_d8b0d670.json',
  a_plus_badge: '/stickers/TgSticker_d419e9d1.json',
  heart_a_plus: '/stickers/TgSticker_f2d45d72.json',
} as const;

export type StickerType = keyof typeof STICKERS;

// Fallback эмодзи
const FALLBACK_EMOJIS: Record<StickerType, string> = {
  exclamation: '⚠️',
  heart_fire: '🔥',
  checkmark: '✅',
  fire: '🔥',
  a_plus_spin: '🏆',
  megaphone: '📢',
  ba_logo: '📊',
  a_plus_badge: '⭐',
  heart_a_plus: '💖',
};

interface LottieStickerProps {
  name: StickerType;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  style?: CSSProperties;
  className?: string;
}

// Кэш для загруженных анимаций
const animationCache: Map<string, object> = new Map();

// Переменная для хранения компонента Lottie
let LottieComponent: React.ComponentType<{
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  style?: CSSProperties;
}> | null = null;

let lottieLoadPromise: Promise<void> | null = null;

export default function LottieSticker({ 
  name, 
  size = 32, 
  loop = true, 
  autoplay = true,
  style,
  className 
}: LottieStickerProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [lottieReady, setLottieReady] = useState<boolean>(!!LottieComponent);
  const [error, setError] = useState<boolean>(false);
  
  const stickerPath = STICKERS[name];

  // Загружаем lottie-react один раз
  useEffect(() => {
    if (LottieComponent) {
      setLottieReady(true);
      return;
    }

    if (!lottieLoadPromise) {
      lottieLoadPromise = import('lottie-react')
        .then((module) => {
          LottieComponent = module.default;
        })
        .catch((err) => {
          console.error('Ошибка загрузки lottie-react:', err);
        });
    }

    lottieLoadPromise.then(() => {
      if (LottieComponent) {
        setLottieReady(true);
      }
    });
  }, []);

  // Загружаем данные стикера
  useEffect(() => {
    if (animationCache.has(stickerPath)) {
      setAnimationData(animationCache.get(stickerPath)!);
      return;
    }

    fetch(stickerPath)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        animationCache.set(stickerPath, data);
        setAnimationData(data);
      })
      .catch((err) => {
        console.error(`Ошибка загрузки стикера ${name}:`, err);
        setError(true);
      });
  }, [stickerPath, name]);

  // Общие стили контейнера
  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  };

  // Если ошибка - показываем эмодзи
  if (error) {
    return (
      <span className={className} style={containerStyle}>
        {FALLBACK_EMOJIS[name]}
      </span>
    );
  }

  // Если lottie или данные ещё не загружены - показываем эмодзи как плейсхолдер
  if (!lottieReady || !animationData || !LottieComponent) {
    return (
      <span className={className} style={containerStyle}>
        {FALLBACK_EMOJIS[name]}
      </span>
    );
  }

  // Всё загружено - показываем анимацию
  return (
    <div className={className} style={containerStyle}>
      <LottieComponent
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

// Компонент для отображения стикера по оценке
export function ScoreSticker({ score, size = 48 }: { score: number; size?: number }) {
  if (score >= 8) {
    return <LottieSticker name="a_plus_spin" size={size} />;
  } else if (score >= 6) {
    return <LottieSticker name="a_plus_badge" size={size} />;
  } else {
    return <LottieSticker name="exclamation" size={size} />;
  }
}