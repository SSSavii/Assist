// src/app/context/UserContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ============================================
// ТИПЫ
// ============================================

interface CompletedTask {
  task_key: string;
  reward_crystals: number;
  completed_at: string;
}

interface InviteMilestone {
  friends: number;
  reward: number;
  taskKey: string;
  title?: string;
}

interface CalendarStatus {
  isActive: boolean;
  currentDay: number | null;
  claimedToday: boolean;
  claimedDays: number[];
  timeUntilNext: number;
}

export interface UserProfile {
  id: number;
  tg_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  photo_url?: string;
  balance_crystals: number;
  last_tap_date: string | null;
  daily_taps_count: number;
  cases_to_open: number;
  created_at: string;
  last_login_at: string;
  subscribed_to_channel?: boolean;
  voted_for_channel?: boolean;
  bot_started?: boolean;
  referral_count: number;
  referral_count_subscribed?: number;
  current_month_referrals?: number;
  bio?: string;
  awards?: string;
  completed_tasks: CompletedTask[];
  invite_milestones?: InviteMilestone[];
  has_spun_before?: boolean;
  calendar?: CalendarStatus;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  addCompletedTask: (task: CompletedTask) => void;
  updateCalendar: (updates: Partial<CalendarStatus>) => void;
  setLoading: (loading: boolean) => void;
}

// ============================================
// КОНТЕКСТ
// ============================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================
// ПРОВАЙДЕР
// ============================================

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchUser = useCallback(async () => {
    const tg = window.Telegram?.WebApp;
    
    if (!tg) {
      setError('Приложение должно быть открыто в Telegram');
      setLoading(false);
      return;
    }

    if (!tg.initData) {
      setError('Данные инициализации отсутствуют');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          initData: tg.initData,
          startapp: tg.initDataUnsafe?.start_param 
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Добавляем photo_url из Telegram WebApp
      const photoUrl = tg.initDataUnsafe?.user?.photo_url;
      
      setUser({
        ...data,
        photo_url: photoUrl,
      });
      setError(null);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление баланса
  const updateBalance = useCallback((newBalance: number) => {
    setUser(prev => prev ? { ...prev, balance_crystals: newBalance } : null);
  }, []);

  // Частичное обновление пользователя
  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Добавление выполненного задания
  const addCompletedTask = useCallback((task: CompletedTask) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        completed_tasks: [...prev.completed_tasks, task]
      };
    });
  }, []);

  // Обновление статуса календаря
  const updateCalendar = useCallback((updates: Partial<CalendarStatus>) => {
    setUser(prev => {
      if (!prev || !prev.calendar) return prev;
      return {
        ...prev,
        calendar: { ...prev.calendar, ...updates }
      };
    });
  }, []);

  // Инициализация Telegram WebApp и загрузка пользователя
  useEffect(() => {
    if (initialized) return;
    
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();
    }
    
    setInitialized(true);
    fetchUser();
  }, [initialized, fetchUser]);

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      error, 
      refreshUser: fetchUser,
      updateBalance,
      updateUser,
      addCompletedTask,
      updateCalendar,
      setLoading
    }}>
      {children}
    </UserContext.Provider>
  );
}

// ============================================
// ХУК
// ============================================

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}