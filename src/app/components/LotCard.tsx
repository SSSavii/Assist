'use client';

import Image from 'next/image';
import Link from 'next/link';
import CountdownTimer from './CountdownTimer';
import DecorativeShape from './DecorativeShape';

interface Lot {
  id: number;
  title: string;
  photoUrl: string | null;
  current_price: number;
  winner_id: number | null;
  expires_at: string;
}

const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price);

interface LotCardProps {
  lot: Lot;
  currentUserId: number | null;
}

export default function LotCard({ lot, currentUserId }: LotCardProps) {
  const isMyBid = lot.winner_id === currentUserId;

  const imageUrl = lot.photoUrl
    ? `${process.env.NEXT_PUBLIC_APP_URL}${lot.photoUrl}`
    : '/images/placeholder.png';

  return (
    <Link 
      href={`/lots/${lot.id}`}
      className={`relative block overflow-hidden p-4 bg-white border-2 rounded-2xl text-center w-full h-full transition-transform active:scale-95 ${isMyBid ? 'border-green-500' : 'border-red-500'}`}
    >
      <DecorativeShape iconPath="/decor/star.svg" className="w-42 h-42 top-[-40px] left-[-50px] opacity-20 rotate-[-15deg] z-0" />
      <DecorativeShape iconPath="/decor/plus.svg" className="w-28 h-28 bottom-[-15px] right-[-30px] opacity-30 rotate-[25deg] z-0" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="relative w-24 h-24 mb-3 rounded-full overflow-hidden mx-auto">
          <Image src={imageUrl} alt={lot.title} className="object-cover" fill sizes="96px" />
        </div>

        <div className="flex-grow flex items-center justify-center">
          <p className="font-semibold text-base leading-tight">
            {lot.title}
          </p>
        </div>

        <div className="mt-3">
          <CountdownTimer expiryDate={lot.expires_at} />
        </div>
        
        <div className="flex items-center justify-center mt-1 text-xl font-bold">
          <span>{formatPrice(lot.current_price)}</span>
          <div className="ml-1.5 h-6 w-6 bg-red-500" style={{ maskImage: 'url(/images/crystal.png)', WebkitMaskImage: 'url(/images/crystal.png)', maskSize: 'contain', maskRepeat: 'no-repeat' }}/>
        </div>
      </div>
    </Link>
  );
}