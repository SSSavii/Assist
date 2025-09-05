'use client';

import { useState, useEffect, useRef } from 'react';

const padWithZero = (num: number) => num.toString().padStart(2, '0');

const calculateTimeLeft = (expiryDate: string) => {
  const difference = +new Date(expiryDate) - +new Date();
  let timeLeft = { hours: 0, minutes: 0, seconds: 0 };

  if (difference > 0) {
    timeLeft = {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

interface CountdownTimerProps {
  expiryDate: string;
  onTimeUp?: () => void;
}

export default function CountdownTimer({ expiryDate, onTimeUp }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiryDate));
  const timeUpReported = useRef(false); 

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiryDate);
      setTimeLeft(newTimeLeft);

      const isTimeUpNow = !newTimeLeft.hours && !newTimeLeft.minutes && !newTimeLeft.seconds;
      if (isTimeUpNow && onTimeUp && !timeUpReported.current) {
        onTimeUp();
        timeUpReported.current = true;
      }

    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate, onTimeUp]);

  const timerComponents = [
    padWithZero(timeLeft.hours),
    padWithZero(timeLeft.minutes),
    padWithZero(timeLeft.seconds),
  ];
  
  const isTimeUp = !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds;

  return (
    <div className={`font-mono text-xl ${isTimeUp ? 'text-gray-400' : 'text-gray-800'}`}>
      {isTimeUp ? 'Завершен' : timerComponents.join(':')}
    </div>
  );
}