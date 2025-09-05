'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, UserCircle, Store } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/auction', label: 'Аукцион', icon: Store },
  { href: '/friends', label: 'Друзья', icon: Users },
  { href: '/profile', label: 'Профиль', icon: UserCircle },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  const handlePress = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  return (
    // Убираем bg-white, так как фон теперь на футере в MainLayout
    <nav className="w-full border-t border-gray-300/50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handlePress}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 border-b-4 ${
                isActive ? 'border-transparent text-red-500' : 'border-transparent text-gray-800'
              }`}
            >
              <item.icon size={28} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}