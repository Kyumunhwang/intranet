import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import MainLayout from '@/components/layout/MainLayout';
import { LanguageProvider } from '@/lib/language-context';
import { UserProvider } from '@/lib/user-context';

export const metadata: Metadata = {
  title: '등대글로벌스쿨 인트라넷 | Lighthouse Global School Intranet',
  description: '등대교육공동체 등대글로벌스쿨 교직원 전용 업무 및 학사 통합 포털',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-canvas-bg text-slate-900 antialiased font-sans">
        <LanguageProvider>
          <UserProvider>
            <Sidebar />
            <MainLayout>{children}</MainLayout>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
