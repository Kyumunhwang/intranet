'use client';

import React, { Suspense } from 'react';
import { CalendarCheck, Clock, FileCheck2, Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

function AttendanceContent() {
  const { t } = useLanguage();

  const attendanceRecords = [
    { date: '2026.10.23 (금)', checkIn: '08:15:22', checkOut: '-', status: '정상 출근', statusEn: 'Present', memo: '-' },
    { date: '2026.10.22 (목)', checkIn: '08:20:10', checkOut: '16:35:12', status: '정상 출퇴근', statusEn: 'Completed', memo: '-' },
    { date: '2026.10.21 (수)', checkIn: '08:18:45', checkOut: '16:32:00', status: '정상 출퇴근', statusEn: 'Completed', memo: '-' },
    { date: '2026.10.20 (화)', checkIn: '08:12:03', checkOut: '16:40:15', status: '정상 출퇴근', statusEn: 'Completed', memo: '-' },
    { date: '2026.10.19 (월)', checkIn: '08:25:30', checkOut: '16:30:50', status: '정상 출퇴근', statusEn: 'Completed', memo: '-' },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <span>{t('교직원 근태 / 연차', 'Staff Attendance & Leave')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              '교직원 출퇴근 기록 및 연차, 초과근무 현황을 확인하고 관리합니다.',
              'View and manage faculty attendance records and annual leave status.'
            )}
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            {t('오늘 출근 상태', 'Today Check-In')}
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            08:15 {t('정상 출근', 'Checked In')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">08:15:22 타임스탬프</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            {t('퇴근 상태', 'Check-Out')}
          </span>
          <div className="text-xl font-bold text-slate-700 mt-1">{t('미체크 (근무중)', 'Working')}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">정규 근무: 08:30 ~ 16:30</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            {t('잔여 연차 일수', 'Remaining Leave')}
          </span>
          <div className="text-xl font-bold text-blue-600 mt-1">11.5일 / 15.0일</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{t('0.5일 반차 지원', '0.5 Day Leave')}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            {t('당월 초과근무', 'Monthly Overtime')}
          </span>
          <div className="text-xl font-bold text-slate-800 mt-1">0시간 00분</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{t('승인 대기 0건', '0 Pending')}</span>
        </div>
      </div>

      {/* Staff Attendance History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{t('교직원 출퇴근', 'Staff Attendance')}</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            2026.10
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">{t('일자', 'Date')}</th>
                <th className="py-2.5 px-4">{t('출근 시간', 'Check-In')}</th>
                <th className="py-2.5 px-4">{t('퇴근 시간', 'Check-Out')}</th>
                <th className="py-2.5 px-4">{t('상태', 'Status')}</th>
                <th className="py-2.5 px-4">{t('비고', 'Memo')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendanceRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-medium">{rec.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">{rec.checkIn}</td>
                  <td className={`py-3 px-4 font-mono ${rec.checkOut === '-' ? 'text-slate-400' : 'text-slate-700'}`}>
                    {rec.checkOut}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.checkOut === '-'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t(rec.status, rec.statusEn)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{rec.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Attendance...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
