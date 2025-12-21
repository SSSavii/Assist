// src/app/(main)/layout.tsx

'use client';

import BottomNavBar from "@/app/components/BottomNavBar";
import { UserProvider } from "@/app/context/UserContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <div className="bg-white min-h-screen min-h-[-webkit-fill-available]">
        <main className="pb-24">
          {children}
        </main>
        <footer className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNavBar />
        </footer>
      </div>
    </UserProvider>
  );
}