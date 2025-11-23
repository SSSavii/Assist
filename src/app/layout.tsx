// app/layout.tsx

import type { Metadata, Viewport } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'АССИСТ+',
  description: '«Тиндер» для бизнес-знакомств',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Preload критичных шрифтов на уровне всего приложения */}
        <link
          rel="preload"
          href="/fonts/CeraPro-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/CeraPro-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/CeraPro-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/CeraPro-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Vasek-Italic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}