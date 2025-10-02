'use client';

import { usePathname } from 'next/navigation';

export default function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { 
      id: "home",
      href: '/main', 
      label: 'Главная', 
      iconActive: '/vector6430-oh1s.svg',
      iconInactive: '/1.svg'
    },
    { 
      id: "shop",
      href: '/auction', 
      label: 'Магазин', 
      iconActive: '/2.svg',
      iconInactive: '/vector6430-lih9.svg'
    },
    { 
      id: "friends",
      href: '/friends', 
      label: 'Друзья', 
      iconActive: '/3.svg',
      iconInactive: '/vector6430-gzd.svg'
    },
    { 
      id: "profile",
      href: '/profile', 
      label: 'Профиль', 
      iconActive: '/4.svg',
      iconInactive: '/vector6431-qbze.svg'
    },
  ];

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
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const iconSize = getIconSize(item.id);
        const isActive = pathname === item.href;

        return (
          <a
            key={item.id}
            href={item.href}
            onClick={handlePress}
            className={`nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <img
              style={{
                ...iconSize,
                objectFit: 'contain' as const
              }}
              alt={item.label}
              src={isActive ? item.iconActive : item.iconInactive}
            />
            <div className="nav-label">
              {item.label}
            </div>
          </a>
        );
      })}

      <style jsx>{`
        .bottom-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 25px;
          background-color: #262626;
          border-radius: 15px 15px 0px 0px;
          overflow: hidden;
          box-sizing: border-box;
          height: 80px;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 66px;
          height: 100%;
          text-decoration: none;
          transition: opacity 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-item:hover {
          opacity: 0.8;
        }

        .nav-label {
          font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 500;
          font-size: 13px;
          text-align: center;
          color: #868686;
          line-height: 11.3px;
          letter-spacing: -0.42px;
          transition: color 0.2s ease;
          white-space: nowrap;
        }

        .nav-item.active .nav-label {
          color: #FFFFFF;
        }
      `}</style>
    </nav>
  );
}