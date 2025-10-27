/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';

const GlobalStyles = () => (
  <>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style jsx global>{`
      * {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Regular.woff2') format('woff2'),
             url('/fonts/CeraPro-Regular.woff') format('woff');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Light.woff2') format('woff2'),
             url('/fonts/CeraPro-Light.woff') format('woff');
        font-weight: 300;
        font-style: normal;
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Medium.woff2') format('woff2'),
             url('/fonts/CeraPro-Medium.woff') format('woff');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Cera Pro';
        src: url('/fonts/CeraPro-Bold.woff2') format('woff2'),
             url('/fonts/CeraPro-Bold.woff') format('woff');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
      
      body {
        font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
    `}</style>
  </>
);

type Prize = {
  name: string;
  type: 'rare' | 'common';
  canWin: boolean;
  deliveryType: 'instant' | 'bot_message' | 'manual';
};

const ALL_PRIZES: Prize[] = [
  { name: 'Онлайн-мини-разбор с Иваном', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: 'Приоритетное место в мини-разборе у Ивана', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: 'Участие в розыгрыше завтрака с Иваном', type: 'rare', canWin: false, deliveryType: 'manual' },
  { name: 'Ответ Ивана голосом на ваш вопрос', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: 'Звонок 1 на 1 с Антоном Орешкиным', type: 'rare', canWin: true, deliveryType: 'manual' },
  { name: '3 чек-листа', type: 'common', canWin: true, deliveryType: 'bot_message' },
  { name: 'Участие в созвоне Антона Орешкина с БА', type: 'common', canWin: true, deliveryType: 'manual' },
  { name: '1000 A+', type: 'common', canWin: true, deliveryType: 'instant' },
  { name: 'Разбор вашего резюме', type: 'common', canWin: true, deliveryType: 'manual' }
];

interface UserProfile {
  id: number;
  tg_id: number;
  balance_crystals: number;
  cases_to_open: number;
  bot_started?: boolean;
}

interface DailyLimit {
  remaining: number;
  used: number;
  maxLimit: number;
}

const CASE_COST = 500;
const PREMIUM_ITEM_COST = 10000;
const ANIMATION_DURATION = 6000;

export default function ShopPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const slotRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();
    }
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop = 0;
    }
    
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 10);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError("Telegram WebApp не найден");
      setIsLoading(false);
      return;
    }

    Promise.all([
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      }).then(res => res.json()),
      
      fetch('/api/user/daily-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          initData: tg.initData,
          action: 'check'
        }),
      }).then(res => res.json())
    ])
    .then(([userData, limitData]) => {
      if (userData.error) throw new Error(userData.error);
      setUser(userData);
      setDailyLimit(limitData);
    })
    .catch(err => {
      console.error("Shop page fetch error:", err);
      setError(err.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, []);

  const getRandomPrize = (): Prize => {
    const random = Math.random();
    const availablePrizes = random < 0.2 
      ? ALL_PRIZES.filter(p => p.type === 'rare' && p.canWin)
      : ALL_PRIZES.filter(p => p.type === 'common' && p.canWin);

    return availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
  };

  const handlePrizeDelivery = async (prize: Prize) => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    try {
      if (prize.deliveryType === 'instant') {
        const response = await fetch('/api/user/award-prize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initData: tg.initData,
            prizeName: prize.name,
            prizeType: 'instant'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (prize.name === '1000 A+') {
            setUser(prev => prev ? {
              ...prev,
              balance_crystals: data.newBalance || (prev.balance_crystals + 1000)
            } : null);
            
            tg.showAlert(`🎉 Поздравляем! Вы выиграли: ${prize.name}\n\n✨ Плюсы начислены на ваш баланс!`);
          }
        }
      } else if (prize.deliveryType === 'bot_message') {
        await fetch('/api/bot/send-prize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initData: tg.initData,
            prizeName: prize.name,
            messageType: 'checklist'
          }),
        });
        
        tg.showAlert(`🎉 Поздравляем! Вы выиграли: ${prize.name}\n\n📬 Приз отправлен вам в бот!`);
      } else if (prize.deliveryType === 'manual') {
        await fetch('/api/bot/send-prize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initData: tg.initData,
            prizeName: prize.name,
            messageType: 'manual_contact'
          }),
        });
        
        tg.showAlert(`🎉 Поздравляем! Вы выиграли: ${prize.name}\n\n📞 С вами свяжутся в ближайшее время!`);
      }

      await fetch('/api/user/save-winning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          prizeName: prize.name,
          prizeType: prize.type,
          deliveryType: prize.deliveryType
        }),
      });

    } catch (error) {
      console.error('Error delivering prize:', error);
      tg.showAlert('❌ Произошла ошибка при начислении приза. Обратитесь в поддержку.');
    }
  };

  const handleSpin = async () => {
    const tg = window.Telegram?.WebApp;

    if (isSpinning || !user) return;

    if (user.balance_crystals < CASE_COST) {
      tg?.showAlert(`У вас недостаточно плюсов! Требуется: ${CASE_COST} А+`);
      return;
    }

    if (dailyLimit && dailyLimit.remaining <= 0) {
      tg?.showAlert(`Вы достигли дневного лимита открытий кейсов!\nПопробуйте завтра.`);
      return;
    }

    setIsSpinning(true);
    setError('');
    setWinningPrize(null);

    try {
      tg?.HapticFeedback.impactOccurred('light');

      const spendResponse = await fetch('/api/user/spend-crystals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg?.initData,
          amount: CASE_COST
        }),
      });

      if (!spendResponse.ok) {
        const errorData = await spendResponse.json();
        throw new Error(errorData.error || 'Не удалось списать плюсы');
      }

      const spendData = await spendResponse.json();

      const limitResponse = await fetch('/api/user/daily-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg?.initData,
          action: 'use'
        }),
      });

      if (!limitResponse.ok) {
        throw new Error('Не удалось использовать попытку');
      }

      const limitData = await limitResponse.json();
      
      setUser(prev => prev ? { 
        ...prev, 
        balance_crystals: spendData.newBalance
      } : null);

      setDailyLimit({
        remaining: limitData.remaining,
        used: limitData.used,
        maxLimit: dailyLimit?.maxLimit || 5
      });

      // Выбираем приз
      const prize = getRandomPrize();
      setWinningPrize(prize);

      // Анимация прокрутки
      const prizeIndex = ALL_PRIZES.findIndex(p => p.name === prize.name);
      const cardWidth = 144; // 120px + 24px gap
      const extraSpins = 5;
      const finalPosition = (prizeIndex + extraSpins * ALL_PRIZES.length) * cardWidth;

      if (slotRef.current) {
        slotRef.current.scrollTo({
          left: finalPosition,
          behavior: 'smooth'
        });
      }

      // Через 3 секунды останавливаем и показываем результат
      setTimeout(() => {
        tg?.HapticFeedback.notificationOccurred('success');
        handlePrizeDelivery(prize);
        setIsSpinning(false);
      }, ANIMATION_DURATION);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsSpinning(false);
      tg?.HapticFeedback.notificationOccurred('error');
      tg?.showAlert(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте еще раз.');
    }
  };

  const handleBuyPremium = async () => {
    const tg = window.Telegram?.WebApp;
    
    if (!user || user.balance_crystals < PREMIUM_ITEM_COST) {
      tg?.showAlert(`Недостаточно плюсов!\nТребуется: ${PREMIUM_ITEM_COST.toLocaleString('ru-RU')} А+`);
      return;
    }

    tg?.HapticFeedback.impactOccurred('medium');
    tg?.showAlert('Функция покупки премиум товаров будет доступна в ближайшее время!');
  };

  const handleOpenBot = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    
    const botUsername = 'my_auction_admin_bot';
    tg?.openTelegramLink(`https://t.me/${botUsername}`);
  };

  if (isLoading) {
    return <div className="loading-container">Загрузка...</div>;
  }

  const canSpin = user && 
                  user.balance_crystals >= CASE_COST && 
                  dailyLimit && 
                  dailyLimit.remaining > 0 && 
                  !isSpinning;

  // Создаём массив призов для прокрутки (повторяем несколько раз для эффекта)
  const extendedPrizes = [...ALL_PRIZES, ...ALL_PRIZES, ...ALL_PRIZES, ...ALL_PRIZES, ...ALL_PRIZES, ...ALL_PRIZES];

  return (
    <>
      <GlobalStyles />
      <div className="shop-wrapper" ref={wrapperRef}>
        <main className="shop-container">
          <div className="content-container">
            {/* Текст */}
            <div className="text-section">
              <h1 className="page-title">Магазин</h1>
              <p className="page-subtitle">
                Обменивай свои плюсы<br />на интересные товары
              </p>
            </div>

            {/* Предупреждение */}
            {!user?.bot_started && (
              <button className="warning-card" onClick={handleOpenBot}>
                <div className="warning-title">Внимание!</div>
                <div className="warning-text">Запустите бота для получения призов</div>
              </button>
            )}

            {/* Инфа */}
            <div className="info-row">
              <div className="info-card">
                <div className="info-value">{dailyLimit?.remaining || 0}/{dailyLimit?.maxLimit || 5}</div>
                <div className="info-label">Осталось<br />открытий</div>
              </div>

              <div className="info-card">
                <div className="info-value">{user?.balance_crystals?.toLocaleString('ru-RU') || 0}</div>
                <div className="info-label">Текущий<br />баланс</div>
              </div>
            </div>

            {/* Контейнер крутилки */}
            <div className="spinner-container">
              {/* Фон крутилки */}
              <div className="spinner-background">
                {/* Крутилка */}
                <div className="spinner-box">
                  {/* Карточки крутилки */}
                  <div className="prize-cards" ref={slotRef}>
                    {extendedPrizes.map((prize, index) => (
                      <div key={index} className="prize-card">
                        <div className="prize-name">{prize.name}</div>
                      </div>
                    ))}
                  </div>

                  {/* Линия посередине */}
                  <div className="center-line"></div>
                </div>

                {/* Кнопка крутилки */}
                <button 
                  onClick={handleSpin}
                  disabled={!canSpin}
                  className="spin-button"
                >
                  Крутить
                </button>
              </div>
            </div>

            {/* Стоимость */}
            <div className="cost-info">{CASE_COST} А+ за открытие</div>

            {/* Контейнер товары */}
            <div className="products-container">
              <div className="premium-section">
                <h2 className="premium-title">Премиум товар</h2>

                <div className="product-item">
                  <div className="product-text">
                    <div className="product-name">Созвон с кумиром</div>
                    <div className="product-description">30 минут личного общения</div>
                  </div>

                  <div className="product-buy">
                    <button 
                      onClick={handleBuyPremium}
                      disabled={!user || user.balance_crystals < PREMIUM_ITEM_COST}
                      className="buy-button"
                    >
                      Купить
                    </button>

                    <div className="price-row">
                      <span className="price-value">{PREMIUM_ITEM_COST.toLocaleString('ru-RU')}</span>
                      <div className="crystal-icon">
                        <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12.5" cy="12.5" r="12.5" fill="#EA0000"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <style jsx>{`
          .shop-wrapper {
            position: relative;
            min-height: 100vh;
            min-height: -webkit-fill-available;
            background-color: #FFFFFF;
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: auto;
          }

          .shop-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 56px 0px 100px;
            gap: 10px;
            isolation: isolate;
            position: relative;
            width: 100%;
            min-height: 812px;
            background: #FFFFFF;
            box-sizing: border-box;
          }

          .content-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0px 16px;
            gap: 8px;
            width: 100%;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            z-index: 0;
            box-sizing: border-box;
          }

          .text-section {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-start;
            padding: 0px 0px 24px;
            gap: 16px;
            width: 100%;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          .page-title {
            margin: 0;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 32px;
            line-height: 110%;
            text-align: center;
            letter-spacing: -0.03em;
            color: #000000;
          }

          .page-subtitle {
            margin: 0;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 20px;
            line-height: 100%;
            letter-spacing: -0.02em;
            color: #000000;
          }

          .warning-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px;
            gap: 4px;
            width: 100%;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 16px;
            flex: none;
            order: 2;
            align-self: stretch;
            flex-grow: 0;
            box-sizing: border-box;
            border: none;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            transition: opacity 0.2s;
          }

          .warning-card:active {
            opacity: 0.8;
          }

          .warning-title {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 24px;
            line-height: 100%;
            text-align: center;
            letter-spacing: -0.03em;
            color: #FFFFFF;
          }

          .warning-text {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            text-align: center;
            letter-spacing: -0.05em;
            text-decoration-line: underline;
            color: #FFFFFF;
          }

          .info-row {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding: 0px;
            gap: 8px;
            width: 100%;
            height: 100px;
            flex: none;
            order: 3;
            align-self: stretch;
            flex-grow: 0;
          }

          .info-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 0px 0px 16px;
            gap: 12px;
            flex: 1;
            height: 100px;
            background: #F1F1F1;
            border-radius: 16px;
            box-sizing: border-box;
          }

          .info-value {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 32px;
            line-height: 110%;
            letter-spacing: -0.03em;
            color: #EA0000;
          }

          .info-label {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            letter-spacing: -0.03em;
            color: #000000;
          }

          /* Контейнер крутилки */
          .spinner-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 0px 0px 24px;
            width: 100%;
            flex: none;
            order: 4;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Фон крутилки */
          .spinner-background {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 16px;
            gap: 16px;
            width: 100%;
            background: #F1F1F1;
            border-radius: 16px;
            box-sizing: border-box;
          }

          /* Крутилка */
          .spinner-box {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 24px 0px;
            gap: 10px;
            isolation: isolate;
            width: 100%;
            height: 200px;
            background: #FFFFFF;
            border: 1px solid rgba(234, 0, 0, 0.8);
            border-radius: 8px;
            position: relative;
            overflow: hidden;
          }

          /* Карточки крутилки */
          .prize-cards {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 0px 16px;
            gap: 24px;
            width: 100%;
            height: 152px;
            overflow-x: scroll;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
            position: relative;
            z-index: 0;
          }

          .prize-cards::-webkit-scrollbar {
            display: none;
          }

          /* Приз */
          .prize-card {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 10px;
            gap: 10px;
            min-width: 120px;
            width: 120px;
            height: 152px;
            background: #F1F1F1;
            box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.25);
            border-radius: 16px;
            flex-shrink: 0;
          }

          .prize-name {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 110%;
            text-align: center;
            letter-spacing: -0.02em;
            color: #000000;
          }

          /* Line 3 - вертикальная линия посередине */
          .center-line {
            position: absolute;
            width: 176px;
            height: 0px;
            left: calc(50% - 176px/2 + 88.5px);
            top: calc(50% - 0px/2 - 88px);
            border: 2px solid #000000;
            transform: rotate(90deg);
            z-index: 1;
            pointer-events: none;
          }

          /* Кнопка крутилки */
          .spin-button {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 8px 32px;
            gap: 10px;
            width: 137px;
            height: 50px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 16px;
            border: none;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
            transition: opacity 0.2s;
          }

          .spin-button:active:not(:disabled) {
            opacity: 0.8;
          }

          .spin-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .cost-info {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            color: #666666;
            text-align: center;
            width: 100%;
          }

          .products-container {
            display: flex;
            flex-direction: column;
            padding: 0px 0px 12px;
            gap: 10px;
            width: 100%;
            flex: none;
            order: 5;
            align-self: stretch;
            flex-grow: 0;
          }

          .premium-section {
            display: flex;
            flex-direction: column;
            padding: 24px 16px;
            gap: 16px;
            width: 100%;
            background: #F1F1F1;
            border-radius: 16px;
            box-sizing: border-box;
          }

          .premium-title {
            margin: 0;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 500;
            font-size: 24px;
            line-height: 100%;
            letter-spacing: -0.03em;
            color: #000000;
          }

          .product-item {
            display: flex;
            flex-direction: row;
            padding: 4px 0px;
            gap: 16px;
            width: 100%;
          }

          .product-text {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
          }

          .product-name {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            letter-spacing: -0.05em;
            color: #000000;
          }

          .product-description {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 300;
            font-size: 16px;
            line-height: 110%;
            letter-spacing: -0.02em;
            color: #000000;
          }

          .product-buy {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }

          .buy-button {
            padding: 8px 32px;
            height: 32px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 30px;
            border: none;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            letter-spacing: -0.05em;
            color: #FFFFFF;
            transition: opacity 0.2s;
          }

          .buy-button:active:not(:disabled) {
            opacity: 0.8;
          }

          .buy-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .price-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .price-value {
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            letter-spacing: -0.03em;
            color: #000000;
          }

          .crystal-icon {
            width: 25px;
            height: 25px;
            filter: drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.25));
          }

          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #FFFFFF;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #666666;
          }

          @media (max-width: 375px) {
            .shop-container {
              padding: 48px 0px 100px;
            }

            .page-title {
              font-size: 28px;
            }

            .page-subtitle {
              font-size: 18px;
            }
          }

          @supports (-webkit-touch-callout: none) {
            .shop-wrapper {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}