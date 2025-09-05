'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import LotCard from 'wxqryy/app/components/LotCard'; 
import { ArrowDownUp } from 'lucide-react';

interface Lot {
  id: number;
  title: string;
  photoUrl: string | null;
  current_price: number;
  winner_id: number | null;
  expires_at: string;
}

interface User {
  id: number;
  balance_crystals: number;
}

export default function LotsPage() {
  const router = useRouter();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchLots = async () => {
    try {
      const response = await fetch('/api/lots');
      if (!response.ok) throw new Error('Ошибка сети при загрузке лотов');
      const data: Lot[] = await response.json();
      setLots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setCurrentUser(data);
        }
      })
      .catch(err => setError(err.message));
    }
    
    fetchLots();

    const handleBackClick = () => router.back();
    tg?.BackButton.show();
    tg?.BackButton.onClick(handleBackClick);
    return () => {
      tg?.BackButton.offClick(handleBackClick);
      tg?.BackButton.hide();
    };
  }, [router]);

  const toggleSortOrder = () => {
    setSortOrder(currentOrder => (currentOrder === 'asc' ? 'desc' : 'asc'));
  };

  const sortedLots = useMemo(() => {
    return [...lots].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.current_price - b.current_price;
      } else {
        return b.current_price - a.current_price;
      }
    });
  }, [lots, sortOrder]);


return (
    <div className="relative p-4 bg-white min-h-screen text-black overflow-hidden">
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Аукцион</h1>
          
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <ArrowDownUp size={16} />
            <span>
              {sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
            </span>
          </button>
        </div>
        
        {loading && <p className="text-center">Загрузка...</p>}
        {error && <p className="text-center text-red-500">Ошибка: {error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4">
            {sortedLots.map(lot => (
              <LotCard 
                key={lot.id} 
                lot={lot}
                currentUserId={currentUser?.id || null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}