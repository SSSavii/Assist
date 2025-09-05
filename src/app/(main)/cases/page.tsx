'use client';

import { useState, useEffect } from 'react';
import SlotMachine from 'wxqryy/app/components/SlotMachine';

type Prize = { name: string; icon: string; };
type UserProfile = { id: number; cases_to_open: number; };

const ALL_PRIZES: Prize[] = [
    { name: 'Чек-лист', icon: '/images/checklist.png' },
    ...Array.from({ length: 9 }, (_, i) => ({
        name: `Подарок ${i + 1}`,
        icon: '/images/gift.png',
    }))
];

export default function CasesPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winningPrize, setWinningPrize] = useState<Prize | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [spinKey, setSpinKey] = useState(0);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
            setError("Telegram WebApp не найден. Откройте приложение в Telegram.");
            setIsLoading(false);
            return;
        }

        tg.ready();
        fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: tg.initData }),
        })
        .then(res => res.ok ? res.json() : Promise.reject('Ошибка при загрузке профиля.'))
        .then(data => {
            if (data.error) throw new Error(data.error);
            setUser(data);
        })
        .catch(err => setError(err instanceof Error ? err.message : "Не удалось связаться с сервером."))
        .finally(() => setIsLoading(false));
    }, []);

    const handleSpin = async () => {
        if (isSpinning || !user || user.cases_to_open < 1) return;

        setSpinKey(prevKey => prevKey + 1); 
        setIsSpinning(true);
        setError('');
        setWinningPrize(null);

        try {
            window.Telegram?.WebApp?.HapticFeedback.impactOccurred('light');

            const response = await fetch('/api/cases/open', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData: window.Telegram?.WebApp.initData }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Ошибка при открытии кейса');

            const wonPrize = ALL_PRIZES.find(p => p.name === result.prizeName);
            if (wonPrize) {
                setUser(prev => prev ? { ...prev, cases_to_open: prev.cases_to_open - 1 } : null);
                setWinningPrize(wonPrize);
            } else {
                throw new Error('Получен неизвестный приз от сервера.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            setIsSpinning(false);
            window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('error');
        }
    };

    const handleSpinEnd = () => {
        if (winningPrize) {
            window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
            window.Telegram?.WebApp.showAlert(`Поздравляем! Вы выиграли: ${winningPrize.name}`);
        }
        setIsSpinning(false);
    };

    if (isLoading) {
        return <div className="fixed inset-0 flex items-center justify-center bg-white"><p>Загрузка...</p></div>;
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center p-6 pb-28 bg-white z-10">
            <h1 className="text-3xl font-bold mb-4 text-black flex-shrink-0">
                Откройте кейс
            </h1>

            <div className="w-full flex-grow flex flex-col">
                <SlotMachine
                    key={spinKey} 
                    prizes={ALL_PRIZES}
                    winningPrize={winningPrize}
                    onSpinEnd={handleSpinEnd}
                />
            </div>
            
            <div className="w-full mt-auto pt-6 flex-shrink-0">
                {error && <p className="text-red-500 text-center mb-2">{error}</p>}
                <button
                    onClick={handleSpin}
                    disabled={isSpinning || isLoading || !user || user.cases_to_open < 1}
                    className="w-full h-16 bg-red-500 text-white font-bold text-lg rounded-2xl transition-transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                    {isSpinning ? 'Крутится...' : `Крутить (${user?.cases_to_open || 0} шт.)`}
                </button>
            </div>
        </div>
    );
}