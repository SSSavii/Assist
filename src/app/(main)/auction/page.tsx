/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import HorizontalTextSlotMachine from '@/app/components/TextSlotMachine';

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
  first_name: string;
  last_name?: string;
  username?: string;
}

interface DailyLimit {
  remaining: number;
  used: number;
  maxLimit: number;
}

const CASE_COST = 500;
const PREMIUM_ITEM_COST = 10000;

export default function ShopPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [spinKey, setSpinKey] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const hasSpunRef = useRef(false);
  const isProcessingPrizeRef = useRef(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError("Telegram WebApp не найден. Откройте приложение в Telegram.");
      setIsLoading(false);
      return;
    }

    tg.ready();

    Promise.all([
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      }).then(response => {
        if (!response.ok) throw new Error('Не удалось загрузить данные пользователя');
        return response.json();
      }),
      
      fetch('/api/user/daily-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          initData: tg.initData,
          action: 'check'
        }),
      }).then(response => {
        if (!response.ok) throw new Error('Не удалось загрузить лимиты');
        return response.json();
      })
    ])
    .then(([userData, limitData]) => {
      if (userData && userData.error) {
        throw new Error(userData.error);
      }
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
    if (!tg || isProcessingPrizeRef.current) return;

    isProcessingPrizeRef.current = true;

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
    } finally {
      isProcessingPrizeRef.current = false;
    }
  };

  const handleSpin = async () => {
    const tg = window.Telegram?.WebApp;

    if (isSpinning || hasSpunRef.current || !user) return;

    if (user.balance_crystals < CASE_COST) {
      tg?.showAlert(`У вас недостаточно плюсов! Требуется: ${CASE_COST} А+`);
      return;
    }

    if (dailyLimit && dailyLimit.remaining <= 0) {
      tg?.showAlert(`Вы достигли дневного лимита открытий кейсов!\nОсталось попыток сегодня: 0/${dailyLimit.maxLimit}`);
      return;
    }

    setIsSpinning(true);
    setError('');
    setWinningPrize(null);
    hasSpunRef.current = true;
    isProcessingPrizeRef.current = false;

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

      await new Promise(resolve => setTimeout(resolve, 100));
      
      const prize = getRandomPrize();
      setSpinKey(prev => prev + 1);
      setWinningPrize(prize);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsSpinning(false);
      hasSpunRef.current = false;
      tg?.HapticFeedback.notificationOccurred('error');
      tg?.showAlert(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте еще раз.');
    }
  };

  const handleSpinEnd = () => {
    if (winningPrize && !isProcessingPrizeRef.current) {
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
      handlePrizeDelivery(winningPrize);
    }
    
    setTimeout(() => {
      setIsSpinning(false);
      hasSpunRef.current = false;
    }, 500);
  };

  const handleOpenBot = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    const botUsername = 'my_auction_admin_bot';
    tg?.openTelegramLink(`https://t.me/${botUsername}`);
  };

  const handlePurchasePremiumItem = async () => {
    const tg = window.Telegram?.WebApp;
    
    if (isPurchasing || !user) return;

    if (user.balance_crystals < PREMIUM_ITEM_COST) {
      tg?.showAlert(`У вас недостаточно плюсов!\nТребуется: ${PREMIUM_ITEM_COST.toLocaleString('ru-RU')} А+`);
      return;
    }

    setIsPurchasing(true);

    try {
      tg?.HapticFeedback.impactOccurred('medium');

      const response = await fetch('/api/shop/purchase-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg?.initData,
          itemName: 'Созвон с кумиром',
          itemCost: PREMIUM_ITEM_COST
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось совершить покупку');
      }

      const data = await response.json();

      setUser(prev => prev ? {
        ...prev,
        balance_crystals: data.newBalance
      } : null);

      tg?.HapticFeedback.notificationOccurred('success');
      tg?.showAlert('🎉 Покупка успешно совершена!\n\n📞 Администратор свяжется с вами в ближайшее время для организации созвона.');

    } catch (err) {
      console.error('Purchase error:', err);
      tg?.HapticFeedback.notificationOccurred('error');
      tg?.showAlert(err instanceof Error ? err.message : 'Произошла ошибка при покупке. Попробуйте еще раз.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Загрузка...</div>;
  }

  const isSpinDisabled = isSpinning || 
                         !user || 
                         (user?.balance_crystals ?? 0) < CASE_COST || 
                         (dailyLimit?.remaining ?? 0) <= 0;

  const isBuyDisabled = isPurchasing || !user || (user?.balance_crystals ?? 0) < PREMIUM_ITEM_COST;

  return (
    <>
      <GlobalStyles />
      <div className="shop-wrapper">
        <main className="shop-container">
          {/* Заголовок магазина */}
          <div className="shop-header">
            <h1 className="shop-title">Магазин</h1>
            <p className="shop-subtitle">
              Обменивай свои плюсы на интересные товары!
            </p>
          </div>
          
          {/* Предупреждение о боте */}
          {!user?.bot_started && (
            <button onClick={handleOpenBot} className="bot-warning">
              <p className="warning-title">Внимание!</p>
              <p className="warning-text">Запустите бота для получения призов</p>
            </button>
          )}

          {/* Блок с балансом */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dailyLimit?.remaining || 0}/{dailyLimit?.maxLimit || 5}</div>
              <div className="stat-label">Осталось<br/>открытий</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{user?.balance_crystals?.toLocaleString('ru-RU') || 0}</div>
              <div className="stat-label">Текущий<br/>баланс</div>
            </div>
          </div>

          {/* Слот-машина */}
          <div className="slot-section">
            <div className="slot-machine">
              <HorizontalTextSlotMachine
                key={spinKey}
                spinId={spinKey}
                prizes={ALL_PRIZES.map(p => ({ name: p.name, icon: '' }))}
                winningPrize={winningPrize ? { name: winningPrize.name, icon: '' } : null}
                onSpinEnd={handleSpinEnd}
              />
            </div>
            
            <button 
              onClick={handleSpin}
              disabled={isSpinDisabled}
              className="spin-button"
            >
              {isSpinning ? 'Крутится...' : `Крутить`}
            </button>
            
            <div className="spin-cost">
              Крутить стоит {CASE_COST} А+
            </div>
          </div>

          {/* Контейнер товары */}
          <div className="products-container">
            {/* Премиум товары */}
            <div className="premium-section">
              <h2 className="premium-title">Премиум товар</h2>
              
              {/* Товар */}
              <div className="product-item">
                {/* Текст */}
                <div className="product-text">
                  <div className="product-name">Созвон с кумиром</div>
                  <div className="product-description">30 минут личного общения</div>
                </div>
                
                {/* Купить */}
                <div className="purchase-section">
                  <button 
                    onClick={handlePurchasePremiumItem}
                    disabled={isBuyDisabled}
                    className="buy-button"
                  >
                    {isPurchasing ? 'Покупка...' : 'Купить'}
                  </button>
                  
                  {/* + очки */}
                  <div className="price-section">
                    <span className="price-value">{PREMIUM_ITEM_COST.toLocaleString('ru-RU')}</span>
                    <div className="crystal-icon">
                      <Image 
                        src="/images/322.png" 
                        alt="Crystal" 
                        width={25} 
                        height={25}
                        style={{ 
                          filter: 'drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.25))'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
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
            padding-bottom: 80px;
          }

          .shop-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 16px 100px;
            gap: 16px;
            width: 100%;
            min-height: 100vh;
            box-sizing: border-box;
          }

          .shop-header {
            width: 100%;
            max-width: 343px;
            text-align: center;
            margin-bottom: 8px;
          }

          .shop-title {
            margin: 0 0 8px 0;
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 700;
            font-size: 28px;
            line-height: 110%;
            color: #000000;
          }

          .shop-subtitle {
            margin: 0;
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 16px;
            line-height: 120%;
            color: #666666;
          }

          .bot-warning {
            width: 100%;
            max-width: 343px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border: 2px solid #D72525;
            color: white;
            padding: 16px;
            border-radius: 16px;
            cursor: pointer;
            transition: opacity 0.2s;
            border: none;
          }

          .bot-warning:active {
            opacity: 0.9;
          }

          .warning-title {
            margin: 0 0 4px 0;
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 16px;
          }

          .warning-text {
            margin: 0;
            font-family: 'Cera Pro', sans-serif;
            font-weight: 400;
            font-size: 14px;
            text-decoration: underline;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            width: 100%;
            max-width: 343px;
          }

          .stat-card {
            background: #F1F1F1;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
          }

          .stat-value {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 32px;
            line-height: 100%;
            color: #EA0000;
            margin-bottom: 8px;
          }

          .stat-label {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 400;
            font-size: 14px;
            line-height: 110%;
            color: #000000;
          }

          .slot-section {
            width: 100%;
            max-width: 343px;
            background: #F1F1F1;
            border-radius: 16px;
            padding: 16px;
          }

          .slot-machine {
            height: 256px;
            margin-bottom: 16px;
          }

          .spin-button {
            width: 100%;
            height: 56px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            color: white;
            font-family: 'Cera Pro', sans-serif;
            font-weight: 700;
            font-size: 18px;
            border: none;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.1s;
            box-shadow: 0 4px 0 0 rgba(220, 38, 38, 0.6);
            margin-bottom: 8px;
          }

          .spin-button:active:not(:disabled) {
            transform: translateY(2px);
            box-shadow: 0 2px 0 0 rgba(220, 38, 38, 0.6);
          }

          .spin-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .spin-cost {
            font-family: 'Cera Pro', sans-serif;
            font-weight: 500;
            font-size: 14px;
            text-align: center;
            color: #EA0000;
          }

          /* Контейнер товары */
          .products-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 10px;
            width: 100%;
            max-width: 343px;
            flex: none;
            order: 5;
            align-self: stretch;
            flex-grow: 0;
          }

          /* Премиум товары */
          .premium-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 16px;
            gap: 16px;
            width: 100%;
            max-width: 100%;  /* Изменено с 343px */
            background: #F1F1F1;
            border-radius: 16px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            box-sizing: border-box;
          }

          .premium-title {
            margin: 0;
            width: 100%;
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 24px;
            line-height: 100%;
            leading-trim: both;
            text-edge: cap;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .product-item {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 4px 0px;
            gap: 16px;
            width: 100%;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          .product-text {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px;
            gap: 4px;
            flex: 1;
            order: 0;
            flex-grow: 1;
          }

          .product-name {
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            letter-spacing: -0.05em;
            color: #000000;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
          }

          .product-description {
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 300;
            font-size: 16px;
            line-height: 110%;
            letter-spacing: -0.02em;
            color: #000000;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
          }

          .purchase-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            padding: 0px;
            gap: 8px;
            flex: none;
            order: 1;
            flex-grow: 0;
          }

          .buy-button {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 8px 32px;
            gap: 10px;
            background: linear-gradient(243.66deg, #F34444 10.36%, #D72525 86.45%);
            border-radius: 30px;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;
            border: none;
            cursor: pointer;
            transition: opacity 0.2s;
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 100%;
            text-align: center;
            letter-spacing: -0.05em;
            color: #FFFFFF;
          }

          .buy-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .buy-button:active:not(:disabled) {
            opacity: 0.9;
          }

          .price-section {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0px;
            gap: 10px;
            flex: none;
            order: 1;
            flex-grow: 0;
          }

          .price-value {
            font-family: 'Cera Pro', sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            line-height: 100%;
            display: flex;
            align-items: center;
            text-align: center;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .crystal-icon {
            width: 25px;
            height: 25px;
            flex: none;
            order: 1;
            flex-grow: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .error-message {
            width: 100%;
            max-width: 343px;
            background: #FEE2E2;
            border-left: 4px solid #DC2626;
            color: #991B1B;
            padding: 16px;
            border-radius: 8px;
          }

          .error-message p {
            margin: 0;
            font-family: 'Cera Pro', sans-serif;
            font-size: 14px;
          }

          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #FFFFFF;
            font-family: 'Cera Pro', sans-serif;
            color: #666666;
          }

          @media (max-width: 375px) {
            .shop-title {
              font-size: 24px;
            }

            .premium-title {
              font-size: 20px;
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