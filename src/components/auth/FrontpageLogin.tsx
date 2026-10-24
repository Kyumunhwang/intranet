'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
  Building,
  GraduationCap,
} from 'lucide-react';
import { useUser } from '@/lib/user-context';
import { useLanguage } from '@/lib/language-context';

export default function FrontpageLogin() {
  const { login } = useUser();
  const { lang, t } = useLanguage();

  const [email, setEmail] = useState('lis.jaelee@gmail.com');
  const [password, setPassword] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoAccounts = [
    { label: 'M8 이재원 (중고등 담임)', email: 'lis.jaelee@gmail.com', role: 'M8 담임교사' },
    { label: 'E1 임그린 (초등 담임)', email: 'greenlim93@gmail.com', role: 'E1 담임교사' },
    { label: 'H9 이영은 (고등 담임)', email: 'lee.michelleye@gmail.com', role: 'H9 담임교사' },
    { label: '황규문 (교감 / 1차결재)', email: 'kyumun.hwang@gmail.com', role: '교감' },
    { label: '김바울 (교장 / 최종결재)', email: 'jmlife0@gmail.com', role: '교장' },
    { label: '하지현 (행정실)', email: 'jihyun.ha@lighthouse.org', role: '행정실장' },
  ];

  const handleSelectDemo = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('1234');
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage(t('이메일과 비밀번호를 모두 입력해 주십시오.', 'Please enter both email and password.'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        login(data.profile);
      } else {
        setErrorMessage(data.message || t('로그인에 실패하였습니다.', 'Login failed.'));
      }
    } catch {
      setErrorMessage(t('로그인 서버와 통신할 수 없습니다.', 'Cannot communicate with login server.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 text-white">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/lighthouse_logo.png"
            alt="등대글로벌스쿨 로고"
            className="w-10 h-10 object-contain drop-shadow"
          />
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              LIGHTHOUSE GLOBAL SCHOOL
            </span>
            <span className="text-[11px] text-blue-300 font-medium tracking-wide">
              등대글로벌스쿨 교직원 인트라넷
            </span>
          </div>
        </div>

        {/* Security Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>학교 공인 IP 보안 인증망 (211.104.88.24)</span>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Left Side: School Vision & Overview */}
        <div className="lg:col-span-6 text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>2026학년도 교직원 통합 업무 포털</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            등대글로벌스쿨 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              교직원 전용 인트라넷
            </span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
            등대교육공동체의 복무·출퇴근 관리, 반별 일일 학생 출결 Confirm, 전자결재, 학사일정 및 공지사항을 통합 관리하는 보안 전산망입니다.
          </p>

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-5 h-5 text-sky-400 mb-1.5" />
              <div className="text-xs font-bold text-white">반별 학생 출결</div>
              <div className="text-[10px] text-slate-400 mt-0.5">7단계 상태 실시간 확정</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1.5" />
              <div className="text-xs font-bold text-white">공인 IP 출퇴근</div>
              <div className="text-[10px] text-slate-400 mt-0.5">인가 IP 자동 인증 체크</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl backdrop-blur-sm">
              <Users className="w-5 h-5 text-amber-400 mb-1.5" />
              <div className="text-xs font-bold text-white">전자결재 & 기안</div>
              <div className="text-[10px] text-slate-400 mt-0.5">3단계 직급별 원클릭 승인</div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Login Box */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 text-slate-900 animate-fade-in">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 uppercase">
                  Faculty & Staff Login
                </span>
                <span className="text-[11px] text-slate-400 font-mono">LGS INTRANET</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">교직원 로그인</h2>
              <p className="text-xs text-slate-500 mt-1">
                학교 인트라넷에 등록된 교직원 이메일(ID)과 비밀번호를 입력해 주십시오.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  로그인 ID (교직원 등록 이메일)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="예: lis.jaelee@gmail.com"
                    className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    비밀번호 (Password)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    초기 비밀번호: <strong className="text-blue-700 font-mono">1234</strong>
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력 (기본값: 1234)"
                    className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <>
                    <span>로그인 (Sign In)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Selectors */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-600">
                  ⚡ 빠른 테스트 계정 선택 (원클릭 자동입력)
                </span>
                <span className="text-[10px] text-slate-400">초기 PW: 1234</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemo(acc.email)}
                    className={`p-2 text-left rounded-lg border text-[11px] transition-all flex flex-col ${
                      email === acc.email
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{acc.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                로그인 후 우측 상단 프로필에서 언제든지 비밀번호를 수정하실 수 있습니다. 비밀번호를 잊으신 경우 관리자에게 1234 초기화 리셋을 요청하십시오.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          © 2026 등대글로벌스쿨 (Lighthouse Global School). All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>교무행정실: 031-123-4567</span>
          <span>개인정보보호 및 복무 보안 방침 준수</span>
        </div>
      </footer>
    </div>
  );
}
