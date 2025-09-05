'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CountdownTimer from 'wxqryy/app/components/CountdownTimer';
import DecorativeShape from 'wxqryy/app/components/DecorativeShape';

interface Lot {
  id: number;
  title: string;
  photoUrl: string | null;
  current_price: number;
  description: string | null;
  age: number | null;
  city: string | null;
  min_bid_step: number;
  winner_id: number | null;
  winner_first_name: string | null;
  winner_last_name: string | null;
  expires_at: string;
}

interface User {
  id: number;
  balance_crystals: number;
}

const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LotDetailPage(props: any) {
  const id = props.params?.id;
  const router = useRouter();
  
  const [lot, setLot] = useState<Lot | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBidding, setIsBidding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);

  const fetchLotData = useCallback(async () => {
    try {
      if (!id) throw new Error('ID лота не найден');
      const response = await fetch(`/api/lots/${id}`);
      if (!response.ok) throw new Error('Лот не найден или произошла ошибка');
      const data = await response.json();
      setLot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  }, [id]);

  const handlePlaceBid = async () => {
    if (!lot || !currentUser || isBidding || isTimeUp || bidAmount > currentUser.balance_crystals) {
      if (currentUser && bidAmount > currentUser.balance_crystals) {
        alert('У вас недостаточно средств для такой ставки.');
      }
      return;
    }
    setIsBidding(true);
    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotId: lot.id, userId: currentUser.id, bidAmount }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось сделать ставку');
      setBidAmount(0);
      await fetchLotData();
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsBidding(false);
    }
  };

  useEffect(() => {
    if (lot) {
      setBidAmount(lot.current_price + lot.min_bid_step);
    }
  }, [lot]);

  useEffect(() => {
    setLoading(true);
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
            if (!data.error) setCurrentUser(data);
        });
    }
    fetchLotData().finally(() => setLoading(false));
    if (tg) {
        const goBack = () => router.back();
        tg.BackButton.show();
        tg.BackButton.onClick(goBack);
        return () => {
            tg.BackButton.offClick(goBack);
            tg.BackButton.hide();
        };
    }
  }, [id, router, fetchLotData]);

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Ошибка: {error}</p>;
  if (!lot) return <p className="text-center mt-10">Лот не найден.</p>;

  const imageUrl = lot.photoUrl ? `${process.env.NEXT_PUBLIC_APP_URL}${lot.photoUrl}` : '/images/placeholder.png';
  const minBid = lot.current_price + lot.min_bid_step;
  const canAffordMinimum = currentUser ? currentUser.balance_crystals >= minBid : false;
  const maxBid = Math.min(currentUser?.balance_crystals || minBid, lot.current_price + 5000);
  const isBiddingDisabled = isBidding || isTimeUp || !canAffordMinimum;

  return (
    <div className="p-4 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold text-center mb-4">Познакомиться с кумиром</h2>
      
      <div className="relative overflow-hidden w-full max-w-md mx-auto p-4 bg-white border-2 border-red-500 rounded-2xl">
        
        <DecorativeShape iconPath="/decor/star.svg" className="w-40 h-40 -top-6 -left-10 opacity-20 rotate-12 z-0" />
        <DecorativeShape iconPath="/decor/plus.svg" className="w-40 h-40 bottom-39 -right-6 opacity-15 -rotate-30 z-0" />
        <DecorativeShape iconPath="/decor/star.svg" className="w-60 h-60 -bottom-6 left-[-1rem] opacity-25 rotate-[-25deg] z-0" />

        <div className="relative z-10 flex flex-col space-y-4">
          
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
              <Image src={imageUrl} alt={lot.title} className="object-cover" fill sizes="96px" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold">{lot.title}</p>
              {lot.age && lot.city && (
                <p className="text-sm text-gray-600">{`${lot.age}, г.${lot.city}`}</p>
              )}
            </div>
          </div>

          {lot.description && (
              <ol className="list-decimal list-inside text-left text-base space-y-2">
                  {lot.description.split(';').map((fact, index) => (
                      fact.trim() && <li key={index}>{fact.trim()}</li>
                  ))}
              </ol>
          )}

          <div className="flex flex-col items-center pt-2 space-y-4">
            <div className="mb-2">
              <CountdownTimer 
                  expiryDate={lot.expires_at}
                  onTimeUp={() => setIsTimeUp(true)}
              />
            </div>

            {lot.winner_first_name && (
              <p className="text-sm text-gray-600">
                Лидирующая ставка: <span className="font-semibold text-black">{`${lot.winner_first_name} ${lot.winner_last_name || ''}`}</span>
              </p>
            )}

            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatPrice(minBid)}</span>
                  {maxBid > minBid && <span>{formatPrice(maxBid)}</span>}
              </div>
              <input
                  type="range"
                  min={minBid}
                  max={maxBid < minBid ? minBid : maxBid}
                  step={lot.min_bid_step}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  disabled={isBiddingDisabled}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500 disabled:opacity-50 disabled:accent-gray-300"
              />
            </div>

            <button
              onClick={handlePlaceBid}
              disabled={isBiddingDisabled}
              className="w-full bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center text-lg transition-transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span>
                  {isBiddingDisabled && !isTimeUp ? 'Недостаточно средств' : `Сделать ставку ${formatPrice(bidAmount)}`}
              </span>
              <div className="ml-2 h-6 w-6 bg-white" style={{ maskImage: 'url(/images/crystal.png)', WebkitMaskImage: 'url(/images/crystal.png)', maskSize: 'contain', maskRepeat: 'no-repeat' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}