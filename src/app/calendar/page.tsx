'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function CalendarPage() {
  const { lang, t } = useLanguage();
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'CARD'>('CALENDAR');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'ACADEMIC' | 'DEPT' | 'PERSONAL'>('ALL');

  // 연도 및 월 선택 상태
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // 선택된 연월에 따른 날짜 및 시작 요일 동적 계산
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0: 일요일 ~ 6: 토요일
  const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysInMonth = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const events = [
    {
      id: 'e1',
      title: '2026학년도 1학기 신입생 오리엔테이션',
      date: '2026-10-23',
      year: 2026,
      month: 10,
      day: 23,
      time: '09:00 - 12:00',
      category: 'ACADEMIC',
      color: 'bg-blue-600',
      textColor: 'text-blue-700 bg-blue-50 border border-blue-200',
      location: '본관 대강당',
      owner: '황규문 (교감)',
    },
    {
      id: 'e2',
      title: '중고등부 교과협의회 및 학사점검',
      date: '2026-10-23',
      year: 2026,
      month: 10,
      day: 23,
      time: '14:30 - 16:00',
      category: 'DEPT',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      location: '본관 제2회의실',
      owner: '이재원 (중고등학사팀)',
    },
    {
      id: 'e3',
      title: '과학 탐구보고서 심사회의',
      date: '2026-10-26',
      year: 2026,
      month: 10,
      day: 26,
      time: '15:00 - 17:00',
      category: 'DEPT',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      location: '과학실험실',
      owner: '이재원',
    },
    {
      id: 'e4',
      title: '전교직원 정기 월례회의',
      date: '2026-10-30',
      year: 2026,
      month: 10,
      day: 30,
      time: '16:00 - 17:30',
      category: 'ACADEMIC',
      color: 'bg-blue-600',
      textColor: 'text-blue-700 bg-blue-50 border border-blue-200',
      location: '시청각실',
      owner: '김바울 (교장)',
    },
  ];

  const currentMonthEvents = events.filter(
    (ev) => ev.year === currentYear && ev.month === currentMonth
  );

  const filtered =
    filterCategory === 'ALL'
      ? currentMonthEvents
      : currentMonthEvents.filter((e) => e.category === filterCategory);

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('학사 일정 및 교직원 캘린더', 'Academic Calendar')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              '월간 달력(Calendar Grid) 또는 카드 리스트(Card List) 형식으로 학사 및 부서 일정을 조회합니다.',
              'View schedule in Monthly Calendar Grid or Card List format.'
            )}
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Calendar View vs Card List View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setViewMode('CALENDAR')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'CALENDAR'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('달력 형식 (Calendar)', 'Calendar')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARD')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'CARD'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('카드 형식 (Cards)', 'Cards')}</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                filterCategory === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('전체', 'All')}
            </button>
            <button
              onClick={() => setFilterCategory('ACADEMIC')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                filterCategory === 'ACADEMIC'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              {t('학사', 'Academic')}
            </button>
            <button
              onClick={() => setFilterCategory('DEPT')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                filterCategory === 'DEPT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {t('부서', 'Dept')}
            </button>
          </div>

          <button
            type="button"
            className="h-8 px-3 rounded-lg bg-primary-container hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('+ 일정 등록', '+ Event')}</span>
          </button>
        </div>
      </div>

      {/* Main Calendar or Card View */}
      {viewMode === 'CALENDAR' ? (
        /* Calendar Grid View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          {/* Month Header with Year & Month Dropdown Selectors */}
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Year Selector */}
                <select
                  aria-label="연도 선택"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold text-sm focus:bg-white focus:border-blue-500 focus:outline-none shadow-xs"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </select>

                {/* Month Selector */}
                <select
                  aria-label="월 선택"
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold text-sm focus:bg-white focus:border-blue-500 focus:outline-none shadow-xs"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}월
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-sm font-bold text-slate-900 font-mono hidden sm:inline">
                ({new Date(currentYear, currentMonth - 1).toLocaleString('en-US', { month: 'long' })} {currentYear})
              </span>

              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {currentMonth >= 3 && currentMonth <= 8 ? '1학기' : '2학기 / 동계'}
              </span>
            </div>

            {/* Prev, Next, Today Buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="이전 달"
                className="h-8 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1 font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">이전 달</span>
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="h-8 px-3 font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {t('오늘', 'Today')}
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="다음 달"
                className="h-8 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1 font-medium transition-colors"
              >
                <span className="hidden sm:inline">다음 달</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Table */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs">
            {/* Days of week header */}
            {['일 (Sun)', '월 (Mon)', '화 (Tue)', '수 (Wed)', '목 (Thu)', '금 (Fri)', '토 (Sat)'].map(
              (dayName, idx) => (
                <div
                  key={idx}
                  className={`py-2 text-center font-bold bg-slate-100 ${
                    idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-blue-600' : 'text-slate-700'
                  }`}
                >
                  {dayName}
                </div>
              )
            )}

            {/* Leading blanks for Thursday start */}
            {leadingBlanks.map((b) => (
              <div key={`blank-${b}`} className="min-h-[90px] bg-slate-50/50 p-1.5"></div>
            ))}

            {/* Days in Month */}
            {daysInMonth.map((dayNum) => {
              const dayEvents = filtered.filter((ev) => ev.day === dayNum);
              const now = new Date();
              const isToday =
                (currentYear === now.getFullYear() &&
                  currentMonth === now.getMonth() + 1 &&
                  dayNum === now.getDate()) ||
                (currentYear === 2026 && currentMonth === 10 && dayNum === 23);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[90px] p-1.5 bg-white flex flex-col justify-between transition-colors hover:bg-blue-50/30 ${
                    isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1 rounded">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Day Events Pills */}
                  <div className="space-y-1 mt-1 flex-1">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${ev.textColor} cursor-pointer hover:opacity-90`}
                        title={`${ev.title} (${ev.time} @ ${ev.location})`}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Card List View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-900 font-mono">
                2026년 10월 일정 목록 (Card List)
              </span>
            </div>

            <div className="space-y-3">
              {filtered.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/40 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${ev.color}`}></div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{ev.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {ev.date} · {ev.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {ev.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
                    작성자: {ev.owner}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Legend */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
              일정 범례 (Category Legend)
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg">
                <span className="font-bold text-blue-900">🟦 학사일정 전체 (School All)</span>
                <p className="text-[11px] text-blue-800 mt-0.5">교무부 주관 전교 일정</p>
              </div>
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-900">🟩 부서별 일정 (Department)</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">부서 협의회 및 연구 모임</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
