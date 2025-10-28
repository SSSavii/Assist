'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function EditBioPage() {
  const [bio, setBio] = useState('');
  const [initialBio, setInitialBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const bioRef = useRef(bio);
  useEffect(() => {
    bioRef.current = bio;
  }, [bio]);

  const handleSave = useCallback(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !tg.initData) return;
    
    tg.offEvent('mainButtonClicked', handleSave);
    tg.MainButton.showProgress();

    fetch('/api/profile/update-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData, bio: bioRef.current }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        tg.MainButton.hideProgress();
        router.push('/profile');
      } else {
        throw new Error(data.error || 'Ошибка');
      }
    })
    .catch(err => {
      setError(err.message);
      tg.MainButton.hideProgress();
      tg.onEvent('mainButtonClicked', handleSave);
    });
  }, [router]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const onBackClick = () => router.back();
      tg.BackButton.show();
      tg.MainButton.setText('Сохранить');
      
      tg.onEvent('backButtonClicked', onBackClick);
      tg.onEvent('mainButtonClicked', handleSave);

      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      })
      .then(res => {
        if (!res.ok) throw new Error('Не удалось загрузить описание');
        return res.json();
      })
      .then(data => {
        const bioText = data.bio || '';
        setBio(bioText);
        setInitialBio(bioText);
      })
      .catch((err) => {
        console.error('Load bio error:', err);
        setError("Не удалось загрузить описание.");
      })
      .finally(() => setLoading(false));

      return () => {
        tg.MainButton.hideProgress();
        tg.BackButton.hide();
        tg.MainButton.hide();
        tg.offEvent('backButtonClicked', onBackClick);
        tg.offEvent('mainButtonClicked', handleSave);
      };
    }
  }, [handleSave, router]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      if (!tg.MainButton.isProgressVisible) {
        if (bio !== initialBio && bio.trim() !== '') {
          tg.MainButton.show();
        } else {
          tg.MainButton.hide();
        }
      }
    }
  }, [bio, initialBio]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="fixed inset-0 flex flex-col p-4 pt-4 bg-white gap-4 z-10">
      <h1 className="text-xl font-bold text-black flex-shrink-0">Ваше описание</h1>
      
      {error && <p className="text-red-500 flex-shrink-0">{error}</p>}

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Расскажите о себе..."
        className="w-full flex-grow p-3 bg-gray-100 text-black rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </div>
  );
}