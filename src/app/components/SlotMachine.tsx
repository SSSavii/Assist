'use client';

import Image from 'next/image';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';

type Prize = { name: string; icon: string };

interface SlotMachineProps {
    prizes: Prize[];
    winningPrize: Prize | null;
    onSpinEnd: () => void;
}

const shuffle = (array: Prize[]): Prize[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const REEL_ITEM_HEIGHT = 160;
const IMAGE_SIZE = 112;
const ANIMATION_DURATION = 5000;

export default function SlotMachine({ prizes, winningPrize, onSpinEnd }: SlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(0);

    const [reelItems, setReelItems] = useState<Prize[]>([]);
    const [transform, setTransform] = useState('translateY(0px)');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerHeight(containerRef.current.offsetHeight);
        }
    }, []);

    useEffect(() => {
        if (winningPrize && containerHeight > 0) {
            const newReel = Array.from({ length: 10 }, () => shuffle(prizes)).flat();
            const winningIndex = newReel.length - prizes.length * 2;
            newReel[winningIndex] = winningPrize;
            setReelItems(newReel);
            const finalPosition =
                (containerHeight / 2) -
                (winningIndex * REEL_ITEM_HEIGHT) -
                (REEL_ITEM_HEIGHT / 2);
            requestAnimationFrame(() => {
                setTransform(`translateY(${finalPosition}px)`);
            });

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(onSpinEnd, ANIMATION_DURATION);
        } else {
            const initialReel = Array.from({ length: 10 }, () => shuffle(prizes)).flat();
            setReelItems(initialReel);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [winningPrize, containerHeight]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden">
            <div
                className="absolute top-0 left-0 w-full"
                style={{
                    transform: transform,
                    transition: transform !== 'translateY(0px)'
                        ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`
                        : 'none',
                }}
            >
                {reelItems.map((prize, index) => (
                    <div
                        key={`${prize.name}-${index}`}
                        className="w-full flex flex-col items-center justify-center p-2"
                        style={{ height: REEL_ITEM_HEIGHT }}
                    >
                        <Image
                            src={prize.icon}
                            alt={prize.name}
                            width={IMAGE_SIZE}
                            height={IMAGE_SIZE}
                            className="object-contain"
                            priority
                        />
                        <p className="mt-2 text-base text-gray-800 font-bold text-center">
                            {prize.name}
                        </p>
                    </div>
                ))}
            </div>
            <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500/80 z-20 -translate-y-1/2 rounded-full" />
        </div>
    );
}