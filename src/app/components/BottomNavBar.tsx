// components/BottomNavBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { 
    id: "home",
    href: '/', 
    label: 'Главная', 
    icon: '/vector6430-oh1s.svg'
  },
  { 
    id: "shop",
    href: '/auction', 
    label: 'Магазин', 
    icon: '/vector6430-lih9.svg'
  },
  { 
    id: "friends",
    href: '/friends', 
    label: 'Друзья', 
    icon: '/vector6430-gzd.svg'
  },
  { 
    id: "profile",
    href: '/profile', 
    label: 'Профиль', 
    icon: '/vector6431-qbze.svg'
  },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  const handlePress = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const getIconSize = (itemId: string) => {
    switch (itemId) {
      case "home": return { width: "29.86px", height: "25.57px" };
      case "shop": return { width: "28px", height: "28px" };
      case "friends": return { width: "28px", height: "26px" };
      case "profile": return { width: "28.29px", height: "28.29px" };
      default: return { width: "28px", height: "24px" };
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-between px-[25px] py-2 bg-[#262626] rounded-t-[15px] overflow-hidden z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
      role="navigation"
      aria-label="Основная навигация"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const iconSize = getIconSize(item.id);

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={handlePress}
            className="flex flex-col items-center justify-center gap-2 w-[66px] h-full text-decoration-none transition-opacity hover:opacity-80"
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <img
              style={iconSize}
              alt={item.label}
              src={item.icon}
            />
            <div
              className={`font-['Cera_Pro'] font-medium text-sm text-center leading-[11.3px] tracking-[-0.42px] ${
                isActive ? "text-white" : "text-[#868686]"
              }`}
            >
              {item.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}