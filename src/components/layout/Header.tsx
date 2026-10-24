'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogIn,
  LogOut,
  Search,
  Bell,
  Lock,
  CheckCircle2,
  AlertCircle,
  Languages,
  User,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useUser, UserRole, USERS } from '@/lib/user-context';

interface HeaderProps {
  currentIp?: string;
  isSchoolIp?: boolean;
}

export default function Header({ currentIp = '211.104.88.24', isSchoolIp = true }: HeaderProps) {
  const pathname = usePathname();
  
  // 관리자 화면에서는 상단 헤더를 표시하지 않음 (요청사항 반영)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [todayCheckedIn, setTodayCheckedIn] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { lang, toggleLang, t } = useLanguage();
  const { currentUser, setCurrentUserRole, logout, setIsPasswordModalOpen } = useUser();

  const handleAttendanceClick = async (action: 'CHECK_IN' | 'CHECK_OUT') => {
    try {
      const res = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, teacher_id: currentUser.id, client_ip: currentIp }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusType('success');
        setStatusMessage(data.message);
        if (action === 'CHECK_IN') setTodayCheckedIn(true);
      } else {
        setStatusType('error');
        setStatusMessage(data.message);
      }
      setTimeout(() => setStatusMessage(null), 3500);
    } catch {
      setStatusType('error');
      setStatusMessage('네트워크 통신 오류');
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'TEACHER', label: '이재원 (Jay Lee)', desc: '정규교사 / M8 담임' },
    { role: 'DEPT_HEAD', label: '황규문 (Kyumun Hwang)', desc: '교감 / 1차 결재권자' },
    { role: 'PRINCIPAL', label: '김바울 (Paul Kim)', desc: '교장 / 최종 결재권자' },
    { role: 'ADMIN', label: '하지현 (Jihyun Ha)', desc: '행정실 / 시스템 관리자' },
  ];

  return (
    <header className="fixed top-0 left-[250px] right-0 h-[64px] bg-surface-white border-b border-slate-200 z-40 flex items-center justify-between px-5 shadow-sm">
      {/* Left: School IP Badge & Attendance Quick Buttons */}
      <div className="flex items-center gap-3">
        {/* School IP Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium whitespace-nowrap ${
            isSchoolIp
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full inline-block ${
              isSchoolIp ? 'bg-status-success animate-pulse' : 'bg-status-danger'
            }`}
          ></span>
          <span className="font-semibold">
            {isSchoolIp ? t('학교 공인 IP 인증됨', 'School IP Verified') : t('외부 접속 IP', 'External IP')}
          </span>
          <span className="font-mono text-[10px] opacity-80">{currentIp}</span>
        </div>

        <div className="h-4 w-[1px] bg-slate-200"></div>

        {/* Quick Attendance Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAttendanceClick('CHECK_IN')}
            className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm whitespace-nowrap ${
              todayCheckedIn
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-primary-container text-white hover:bg-blue-700'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>
              {todayCheckedIn
                ? t('출근 완료 08:15', 'Check-In Done 08:15')
                : t('출근 체크', 'Check In')}
            </span>
          </button>

          <button
            onClick={() => handleAttendanceClick('CHECK_OUT')}
            className="h-8 px-3 rounded-lg bg-surface-white border border-slate-300 text-slate-700 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('퇴근 체크', 'Check Out')}</span>
          </button>
        </div>

        {statusMessage && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium animate-fade-in ${
              statusType === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {statusType === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Right: Language Toggle, Search, User Profile Switcher, Admin Console */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <button
          onClick={toggleLang}
          className="h-8 px-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          title="언어 전환 (Switch Language)"
        >
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          <span>{lang === 'ko' ? '한국어' : 'English'}</span>
        </button>

        {/* Global Search */}
        <div className="relative flex items-center w-52">
          <input
            type="text"
            placeholder={t('통합검색...', 'Search...')}
            className="w-full h-8 pl-8 pr-10 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-container focus:bg-white transition-all font-sans"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
          <kbd className="absolute right-2 px-1 py-0.2 rounded bg-slate-200/70 border border-slate-300 text-slate-500 text-[9px] font-mono">
            ⌘K
          </kbd>
        </div>

        {/* User Account Switcher Dropdown (실제 계정 로그인 전환) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 leading-none">
                  {currentUser.name}
                </span>
                <span className="px-1 py-0.2 rounded text-[8px] bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  {currentUser.role === 'TEACHER'
                    ? '기안자'
                    : currentUser.role === 'DEPT_HEAD'
                    ? '1차결재자'
                    : currentUser.role === 'PRINCIPAL'
                    ? '최종결재자'
                    : '관리자'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                {currentUser.title}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* User Switch Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{currentUser.email}</div>
                <div className="text-[10px] text-blue-700 font-semibold mt-0.5">{currentUser.title} · {currentUser.dept}부</div>
              </div>

              <div className="p-1.5 border-b border-slate-100 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('비밀번호 변경', 'Change Password')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-rose-50 flex items-center gap-2 text-rose-700 font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t('로그아웃', 'Sign Out')}</span>
                </button>
              </div>

              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase">
                {t('테스트 계정 전환', 'Switch Test Account')}
              </div>
              <div className="px-1.5 space-y-0.5">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setCurrentUserRole(item.role);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full px-2.5 py-1.5 text-left rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentUser.role === item.role ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                    {currentUser.role === item.role && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Console Entry Button (관리자 권한자 또는 관리자 모드 이동) */}
        <Link
          href="/admin"
          className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all whitespace-nowrap"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('관리자 화면', 'Admin')}</span>
        </Link>
      </div>
    </header>
  );
}
