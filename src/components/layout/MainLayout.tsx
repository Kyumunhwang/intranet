'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import { useUser } from '@/lib/user-context';
import PasswordChangeModal from '@/components/auth/PasswordChangeModal';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoggedIn, isLoading } = useUser();
  const isAdmin = pathname.startsWith('/admin');

  // 로그인하지 않은 상태(Frontpage 로그인 화면)에서는 사이드바 마진 및 헤더 제거
  if (!isLoggedIn && !isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-slate-950">
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    );
  }

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
      <PasswordChangeModal />
    </div>
  );
}
