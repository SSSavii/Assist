'use client';

import { useEffect, useState, CSSProperties } from 'react';
import dynamic from 'next/dynamic';

// Динамический импорт Lottie без SSR
const Lottie = dynamic(() => import('lottie-react'), { 
  ssr: false,
  loading: () => <div style={{ width: 32, height: 32 }} />
});

// Маппинг стикеров
export const STICKERS = {
  exclamation: '/stickers/TgSticker_17a9cf2d.json',      // восклицательный знак
  heart_fire: '/stickers/TgSticker_9350f51d.json',       // горящее сердечко
  checkmark: '/stickers/TgSticker_0926397b.json',        // галочка
  fire: '/stickers/TgSticker_a565b730.json',             // огонёк
  a_plus_spin: '/stickers/TgSticker_aea13e35.json',      // крутящийся А+
  megaphone: '/stickers/TgSticker_cdb103af.json',        // мегафон
  ba_logo: '/stickers/TgSticker_d8b0d670.json',          // БА логотип
  a_plus_badge: '/stickers/TgSticker_d419e9d1.json',     // герб А+
  heart_a_plus: '/stickers/TgSticker_f2d45d72.json',     // сердечко А+
} as const;

export type StickerType = keyof typeof STICKERS;

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

export default function LottieSticker({ 
  name, 
  size = 32, 
  loop = true, 
  autoplay = true,
  style,
  className 
}: LottieStickerProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [error, setError] = useState(false);
  
  const stickerPath = STICKERS[name];

  useEffect(() => {
    // Проверяем кэш
    if (animationCache.has(stickerPath)) {
      setAnimationData(animationCache.get(stickerPath)!);
      return;
    }

    // Загружаем JSON
    fetch(stickerPath)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load sticker');
        return res.json();
      })
      .then(data => {
        animationCache.set(stickerPath, data);
        setAnimationData(data);
      })
      .catch(err => {
        console.error('Error loading sticker:', name, err);
        setError(true);
      });
  }, [stickerPath, name]);

  // Если ошибка загрузки - показываем fallback эмодзи
  if (error) {
    const fallbackEmojis: Record<StickerType, string> = {
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
    
    return (
      <span 
        className={className}
        style={{ 
          fontSize: size * 0.7, 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          ...style 
        }}
      >
        {fallbackEmojis[name]}
      </span>
    );
  }

  // Если ещё загружается
  if (!animationData) {
    return (
      <div 
        className={className}
        style={{ 
          width: size, 
          height: size, 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style 
        }}
      />
    );
  }
  
  return (
    <div 
      className={className}
      style={{ 
        width: size, 
        height: size, 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style 
      }}
    >
      <Lottie
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