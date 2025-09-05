'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const SPARKLE_IMAGE = '/images/one_spark.png';
const CRYSTAL_IMAGE = '/images/134.png';
const ARROW_IMAGE = '/images/picmi2.png';

interface Sparkle {
  id: string;
  top: string;
  left: string;
  size: number;
  animationDuration: number;
}

interface BalanceCardProps {
  balance: number;
  onButtonClick: () => void;
  tapsLeft: number;
  tapLimit: number;
}

const random = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export default function BalanceCard({ balance, onButtonClick, tapsLeft }: BalanceCardProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const handleCrystalClick = () => {
    if (isCoolingDown || tapsLeft <= 0) return;
    onButtonClick();
    setIsCoolingDown(true);
    setTimeout(() => {
      setIsCoolingDown(false);
    }, 50);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const angle = Math.random() * 2 * Math.PI;
      const maxRadius = 45;
      const radius = Math.sqrt(Math.random()) * maxRadius;
      const offsetX = radius * Math.cos(angle);
      const offsetY = radius * Math.sin(angle);
      const sparkle: Sparkle = {
        id: String(Date.now()),
        top: `calc(50% + ${offsetY}%)`,
        left: `calc(50% + ${offsetX}%)`,
        size: random(15, 25),
        animationDuration: random(2000, 3500),
      };
      setSparkles(currentSparkles => [...currentSparkles, sparkle]);
      setTimeout(() => {
        setSparkles(current => current.filter(s => s.id !== sparkle.id));
      }, sparkle.animationDuration);
    }, 900);
    return () => clearInterval(interval);
  }, []);

    return (
    <div className="w-full bg-white text-white rounded-3xl">
      <div className="relative flex flex-col items-center justify-center">
        <div className="relative h-50 w-50 flex items-center justify-center">
          <button
            onClick={handleCrystalClick}
            disabled={tapsLeft <= 0}
            className="group rounded-full active:scale-95 transition-transform duration-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Image
              src={CRYSTAL_IMAGE}
              alt="Crystal"
              width={200}
              height={200}
              className="transition-all duration-200"
              priority
            />
          </button>
          {sparkles.map(({ id, top, left, size, animationDuration }) => (
            <img
              key={id}
              src={SPARKLE_IMAGE}
              alt=""
              className="absolute pointer-events-none sparkle-animation invert"
              style={{ top, left, width: `${size}px`, height: `${size}px`, animationDuration: `${animationDuration}ms`, willChange: 'transform, opacity' }}
            />
          ))}
        </div>
        <p className="text-3xl font-bold text-black">
          {balance}
        </p>
        <div className="absolute top-[65px] left-1/2 transform translate-x-[35px] pointer-events-none">
          <Image
            src={ARROW_IMAGE}
            alt="Нажми на меня"
            width={150}
            height={150}
          />
        </div>
        
      </div>
    </div>
  );
}