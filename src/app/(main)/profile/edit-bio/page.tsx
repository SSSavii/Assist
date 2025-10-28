'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

export default function EditBioPage() {
  const [bio, setBio] = useState('');
  const [initialBio, setInitialBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const bioRef = useRef(bio);
  useEffect(() => {
    bioRef.current = bio;
  }, [bio]);

  const handleSave = useCallback(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !tg.initData) return;
    
    tg.offEvent('mainButtonClicked', handleSave);
    tg.MainButton.showProgress();

    fetch('/api/profile/update-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData, bio: bioRef.current }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        tg.MainButton.hideProgress();
        router.push('/profile');
      } else {
        throw new Error(data.error || 'Ошибка');
      }
    })
    .catch(err => {
      setError(err.message);
      tg.MainButton.hideProgress();
      tg.onEvent('mainButtonClicked', handleSave);
    });
  }, [router]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const onBackClick = () => router.back();
      tg.BackButton.show();
      tg.MainButton.setText('Сохранить');
      
      tg.onEvent('backButtonClicked', onBackClick);
      tg.onEvent('mainButtonClicked', handleSave);

      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      })
      .then(res => {
        if (!res.ok) throw new Error('Не удалось загрузить описание');
        return res.json();
      })
      .then(data => {
        const bioText = data.bio || '';
        setBio(bioText);
        setInitialBio(bioText);
      })
      .catch((err) => {
        console.error('Load bio error:', err);
        setError("Не удалось загрузить описание.");
      })
      .finally(() => setLoading(false));

      return () => {
        tg.MainButton.hideProgress();
        tg.BackButton.hide();
        tg.MainButton.hide();
        tg.offEvent('backButtonClicked', onBackClick);
        tg.offEvent('mainButtonClicked', handleSave);
      };
    }
  }, [handleSave, router]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      if (!tg.MainButton.isProgressVisible) {
        if (bio !== initialBio && bio.trim() !== '') {
          tg.MainButton.show();
        } else {
          tg.MainButton.hide();
        }
      }
    }
  }, [bio, initialBio]);

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

  if (loading) {
    return <div className="loading-container">Загрузка...</div>;
  }

  return (
    <>
      <GlobalStyles />
      <div className="bio-wrapper" ref={wrapperRef}>
        <main className="bio-container">
          {/* Плюс на фоне */}
          <div className="background-plus">
            <svg width="187" height="207" viewBox="0 0 187 207" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M69 55.4706C69 62.9427 62.9427 69 55.4706 69L13.5294 69C6.05732 69 8.7051e-06 75.0573 8.05267e-06 82.5294L4.39054e-06 124.471C3.73811e-06 131.943 6.05732 138 13.5294 138L55.4706 138C62.9427 138 69 144.057 69 151.529L69 193.471C69 200.943 75.0573 207 82.5294 207L124.471 207C131.943 207 138 200.943 138 193.471L138 151.529C138 144.057 144.057 138 151.529 138L193.471 138C200.943 138 207 131.943 207 124.471L207 82.5294C207 75.0573 200.943 69 193.471 69L151.529 69C144.057 69 138 62.9427 138 55.4706L138 13.5294C138 6.05732 131.943 -6.56976e-06 124.471 -7.22379e-06L82.5294 -1.08949e-05C75.0573 -1.15489e-05 69 6.05731 69 13.5294L69 55.4706Z" fill="#F6F6F6"/>
            </svg>
          </div>

          {/* Контейнер */}
          <div className="content-container">
            <h1 className="page-title">Ваше описание</h1>
            
            {error && <p className="error-text">{error}</p>}

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о себе..."
              className="bio-textarea"
            />
          </div>
        </main>

        <style jsx>{`
          .bio-wrapper {
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

          .bio-container {
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

          .background-plus {
            position: absolute;
            width: 207px;
            height: 207px;
            right: -20px;
            bottom: 63px;
            transform: matrix(1, 0, 0, -1, 0, 0);
            flex: none;
            order: 0;
            flex-grow: 0;
            z-index: 0;
            opacity: 0.5;
          }

          .content-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0px 16px;
            gap: 24px;
            width: 100%;
            flex: none;
            order: 1;
            align-self: stretch;
            flex-grow: 0;
            z-index: 1;
            box-sizing: border-box;
          }

          .page-title {
            margin: 0;
            width: auto;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 500;
            font-size: 32px;
            line-height: 110%;
            leading-trim: both;
            text-edge: cap;
            display: flex;
            align-items: flex-end;
            letter-spacing: -0.03em;
            color: #000000;
            flex: none;
            order: 0;
            flex-grow: 0;
          }

          .error-text {
            margin: 0;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 16px;
            color: #EA0000;
            flex: none;
            align-self: stretch;
          }

          .bio-textarea {
            width: 100%;
            height: 400px;
            padding: 16px;
            background: #F6F6F6;
            border: none;
            border-radius: 16px;
            resize: none;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 16px;
            line-height: 140%;
            color: #000000;
            flex: none;
            align-self: stretch;
            box-sizing: border-box;
          }

          .bio-textarea:focus {
            outline: none;
            background: #F1F1F1;
          }

          .bio-textarea::placeholder {
            color: #999999;
          }

          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            height: -webkit-fill-available;
            background-color: #FFFFFF;
            font-family: 'Cera Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #666666;
          }

          @media (max-width: 375px) {
            .bio-container {
              padding: 48px 0px 100px;
            }

            .page-title {
              font-size: 28px;
            }

            .bio-textarea {
              height: 350px;
              font-size: 15px;
            }
          }

          @supports (-webkit-touch-callout: none) {
            .bio-wrapper {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </div>
    </>
  );
}