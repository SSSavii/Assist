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

  const getItemPadding = (itemId: string) => {
    switch (itemId) {
      case "home": return "gap-[13px] px-2 py-1.5";
      case "friends": return "gap-[13px] px-2.5 py-1.5";
      case "profile": return "gap-[11px] px-[3px] py-[5px]";
      default: return "gap-[11px] p-1.5";
    }
  };

  return (
    <nav 
      className="flex h-20 items-center justify-between px-[25px] py-2.5 w-full bg-neutral-800 rounded-[15px_15px_0px_0px] overflow-hidden"
      role="navigation"
      aria-label="Основная навигация"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const iconSize = getIconSize(item.id);
        const paddingClass = getItemPadding(item.id);

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={handlePress}
            className={`flex flex-col items-center justify-center ${paddingClass} hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-800 w-[66.25px]`}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <img
              style={iconSize}
              alt={item.label}
              src={item.icon}
            />
            <div
              className={`font-['Cera_Pro'] font-medium text-sm text-center tracking-[-0.42px] leading-[11.3px] ${
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