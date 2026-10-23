'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { StudentAttendanceStatus } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

const SCHOOL_GRADES = [
  'T1',
  'E1',
  'E2',
  'E3',
  'E4',
  'E5',
  'M6',
  'M7',
  'M8',
  'H9',
  'H10',
  'H11',
  'H12',
] as const;

function AttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'staff' | 'student'>('staff');
  const [selectedGrade, setSelectedGrade] = useState<string>('M8');
  const [isConfirmed, setIsConfirmed] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam === 'students') {
      setActiveTab('student');
    } else {
      setActiveTab('staff');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'staff' | 'student') => {
    setActiveTab(tab);
    router.replace(`/attendance?tab=${tab === 'student' ? 'students' : 'staff'}`);
  };

  // 7 attendance status options (조퇴, 무단조퇴, 무단결석 포함) - 번호 제거 및 학년 반영
  const [students, setStudents] = useState<
    { student_no: string; name: string; status: StudentAttendanceStatus; memo: string }[]
  >([
    { student_no: '2026-M801', name: '강서준', status: 'PRESENT', memo: '' },
    { student_no: '2026-M802', name: '김민재', status: 'LATE', memo: '병원 진료 후 09:10 입실' },
    { student_no: '2026-M803', name: '김서연', status: 'PRESENT', memo: '' },
    { student_no: '2026-M804', name: '박지우', status: 'EARLY_LEAVE', memo: '체험학습 조퇴' },
    { student_no: '2026-M805', name: '이준혁', status: 'PRESENT', memo: '' },
    { student_no: '2026-M806', name: '정예원', status: 'SICK', memo: '독감 병결' },
    { student_no: '2026-M807', name: '최도윤', status: 'ABSENT', memo: '가족행사 결석' },
    { student_no: '2026-M808', name: '한지민', status: 'PRESENT', memo: '' },
  ]);

  const handleStudentStatusChange = (index: number, newStatus: StudentAttendanceStatus) => {
    const next = [...students];
    next[index].status = newStatus;
    setStudents(next);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    setToastMessage(t('반별 학생 출결이 최종 Confirm(확정)되었습니다.', 'Class attendance confirmed successfully.'));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const statusOptions: { value: StudentAttendanceStatus; labelKo: string; labelEn: string; color: string }[] = [
    { value: 'PRESENT', labelKo: '출석', labelEn: 'Present', color: 'bg-emerald-600 text-white' },
    { value: 'LATE', labelKo: '지각', labelEn: 'Late', color: 'bg-amber-500 text-white' },
    { value: 'ABSENT', labelKo: '결석', labelEn: 'Absent', color: 'bg-rose-500 text-white' },
    { value: 'SICK', labelKo: '병결', labelEn: 'Sick', color: 'bg-indigo-600 text-white' },
    { value: 'EARLY_LEAVE', labelKo: '조퇴', labelEn: 'Early Leave', color: 'bg-sky-600 text-white' },
    { value: 'UNAUTH_EARLY', labelKo: '무단조퇴', labelEn: 'Truant Early', color: 'bg-orange-600 text-white' },
    { value: 'UNAUTH_ABSENT', labelKo: '무단결석', labelEn: 'Truancy', color: 'bg-red-700 text-white' },
  ];

  return (
    <div className="space-y-5">
      {/* Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('근태 및 학생 출결 관리', 'Attendance Management')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              '학교 공인 IP 기반 출퇴근 인증 및 반별 학생 출결(조퇴/무단조퇴/무단결석 포함) Confirm 센터입니다.',
              'Verified school IP attendance and daily class attendance confirmation center.'
            )}
          </p>
        </div>

        {/* Tab Switcher: Mutual Exclusive Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => handleTabChange('staff')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('교직원 근태/연차', 'Staff Attendance')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('student')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'student'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('반별 학생 출결 Confirm', 'Student Attendance')}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tab 1: Staff Attendance */}
      {activeTab === 'staff' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                {t('오늘 출근 상태', 'Today Check-In')}
              </span>
              <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                08:15 {t('정상 출근', 'Checked In')}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">IP: 211.104.88.24</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                {t('퇴근 상태', 'Check-Out')}
              </span>
              <div className="text-xl font-bold text-slate-700 mt-1">{t('미체크 (근무중)', 'Working')}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">08:30 ~ 16:30</span>
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

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                {t('교직원 출퇴근 및 공인 IP 접속 기록', 'Staff Attendance History')}
              </h2>
              <span className="text-xs text-slate-400 font-mono">2026.10</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-4">{t('일자', 'Date')}</th>
                    <th className="py-2.5 px-4">{t('출근 시간', 'Check-In')}</th>
                    <th className="py-2.5 px-4">{t('퇴근 시간', 'Check-Out')}</th>
                    <th className="py-2.5 px-4">{t('접속 공인 IP', 'Public IP')}</th>
                    <th className="py-2.5 px-4">{t('학교 IP 검증', 'IP Verified')}</th>
                    <th className="py-2.5 px-4">{t('상태', 'Status')}</th>
                    <th className="py-2.5 px-4">{t('비고', 'Memo')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium">2026.10.23 (금)</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">08:15:22</td>
                    <td className="py-3 px-4 font-mono text-slate-400">-</td>
                    <td className="py-3 px-4 font-mono">211.104.88.24</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {t('정상 인증', 'Verified')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {t('정상 출근', 'Present')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Student Attendance (with 7 Statuses) */}
      {activeTab === 'student' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">{t('학년 선택:', 'Grade:')}</label>
              <select
                aria-label="학년 선택"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="h-8 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold"
              >
                {SCHOOL_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g} 학년 {g === 'M8' ? '(담임: 김교사)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('오늘 출결 최종 Confirm (확정)', 'Confirm Attendance')}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-xs">
                  {selectedGrade}
                </span>
                <span>학생 명렬표 (총원 {students.length}명)</span>
              </h2>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {isConfirmed ? t('Confirm 완료 (08:50)', 'Confirmed') : t('미확정', 'Pending')}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2.5 px-3 w-32">{t('학번', 'Student ID')}</th>
                    <th className="py-2.5 px-3 w-28">{t('성명', 'Name')}</th>
                    <th className="py-2.5 px-3 w-20 text-center">{t('학년', 'Grade')}</th>
                    <th className="py-2.5 px-3 text-center">
                      {t('출결 상태 선택 (7개 항목: 출석, 지각, 결석, 병결, 조퇴, 무단조퇴, 무단결석)', 'Status Options')}
                    </th>
                    <th className="py-2.5 px-3 w-64">{t('사유 및 메모', 'Memo')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {students.map((s, idx) => (
                    <tr key={s.student_no} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 text-xs">{s.student_no}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 text-xs">{s.name}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs">
                          {selectedGrade}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {statusOptions.map((opt) => {
                            const isSelected = s.status === opt.value;
                            const label = lang === 'ko' ? opt.labelKo : opt.labelEn;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleStudentStatusChange(idx, opt.value)}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                                  isSelected
                                    ? `${opt.color} shadow-sm scale-105`
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={s.memo}
                          onChange={(e) => {
                            const next = [...students];
                            next[idx].memo = e.target.value;
                            setStudents(next);
                          }}
                          placeholder={t('메모 입력', 'Memo')}
                          className="w-full h-7 px-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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
