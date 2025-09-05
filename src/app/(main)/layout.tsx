'use client';

import BottomNavBar from "wxqryy/app/components/BottomNavBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white min-h-screen">
      <main className="pb-24">
        {children}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/75 backdrop-blur-lg">
        <BottomNavBar />
        <div className="h-4"></div>
      </footer>
    </div>
  );
}