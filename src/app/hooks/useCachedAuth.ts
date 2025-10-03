/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

export function useCachedAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Загружаем из кэша сразу при инициализации
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('userProfile');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError('Пожалуйста, откройте приложение в Telegram.');
      setLoading(false);
      return;
    }

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
        // Сохраняем в кэш
        localStorage.setItem('userProfile', JSON.stringify(data));
      }
    })
    .catch(err => {
      console.error("Auth fetch error:", err);
      // Если есть кэш, используем его даже при ошибке
      if (!user) {
        setError("Не удалось связаться с сервером.");
      }
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('userProfile', JSON.stringify(updated));
      return updated;
    });
  };

  return { user, setUser: updateUser, loading, error };
}