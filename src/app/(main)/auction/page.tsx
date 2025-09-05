'use client';
import Link from "next/link";

 

export default function HomePage() {
  
  return (
    <div className="flex flex-col font-['Unbounded'] items-center px-6 pt-6 pb-4 text-center text-black bg-white">

      <h1 className="text-5xl font-black mb-4">
        Аукцион знакомств
      </h1>
      
      <p className="text-xl font-medium mb-4">
        Познакомься с кумиром и найди полезные связи!
      </p>
      
      <div className="w-full flex  flex-col items-center">
        
        <Link
          href="/cases"
          className="block w-full h-20 mb-6 flex items-center justify-center bg-red-500 text-white text-2xl font-extrabold rounded-2xl 
          transition-all
          shadow-[0_6px_0_0_rgba(0,0,0,0.3)] 
          active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)]">
            Открыть кейс
        </Link>

        <Link
          href="/lots"
          className="block w-full h-20 mb-4 flex items-center justify-center bg-red-500 text-white text-xl font-extrabold rounded-2xl 
          transition-all
          shadow-[0_6px_0_0_rgba(0,0,0,0.3)] 
          active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)]">
            Познакомься с кумиром
        </Link>

        <button
          className="w-full h-20 mb-4 flex items-center justify-center bg-red-500 text-white text-xl font-extrabold rounded-2xl
          transition-all
          shadow-[0_6px_0_0_rgba(0,0,0,0.3)] 
          active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)]">
            Стать бизнес - ассистентом
        </button>

        <button
          className="w-full h-20 flex items-center justify-center bg-red-500 text-white text-xl font-extrabold rounded-2xl
          transition-all
          shadow-[0_6px_0_0_rgba(0,0,0,0.3)] 
          active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.3)]">
            Обрести единомышленника
        </button>

      </div>
    </div>
  );
}