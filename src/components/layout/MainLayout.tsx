'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="pl-[260px] min-h-screen flex flex-col bg-slate-50">
      {!isAdmin && <Header />}
      <main
        className={`flex-1 p-6 max-w-[1850px] w-full mx-auto ${
          isAdmin ? 'pt-4' : 'pt-[76px]'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
