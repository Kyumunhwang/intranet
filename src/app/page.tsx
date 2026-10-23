'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  CalendarCheck,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  CalendarDays,
  FileText,
  ChevronRight,
  Pin,
  Eye,
} from 'lucide-react';
import {
  Student,
  ClassAttendanceConfirm,
  StudentAttendanceStatus,
} from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

export default function DashboardPage() {
  const { lang, t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [confirmData, setConfirmData] = useState<ClassAttendanceConfirm | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: StudentAttendanceStatus; comment: string }>
  >({});
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmSuccessMsg, setConfirmSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const initialStudents: Student[] = [
      { id: 's74', student_no: '2026-M801', name: 'HAN, Yeju (한예주)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's75', student_no: '2026-M802', name: 'HWANG, Hee (황희)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's76', student_no: '2026-M803', name: 'JEONG, Raon (정라온)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's77', student_no: '2026-M804', name: 'KIM, Eden (김이든)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's78', student_no: '2026-M805', name: 'Kim, Hajin (김하진)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's79', student_no: '2026-M806', name: 'LEE, Jeri (이재이)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's80', student_no: '2026-M807', name: 'OH, Sion (오시온)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's81', student_no: '2026-M808', name: 'PARK, Haon (박하온)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's82', student_no: '2026-M809', name: 'SHIN, Hajun (신하준)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's83', student_no: '2026-M810', name: 'SONG, La-Im (송라임)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's84', student_no: '2026-M811', name: 'SONG, Sangyun (송상윤)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's85', student_no: '2026-M812', name: 'YANG, Luis Heerahm (양희람)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's86', student_no: '2026-M813', name: 'YOO, Hajoon (유하준)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
      { id: 's87', student_no: '2026-M814', name: 'YOON, Seokhyeon (윤석현)', grade: 'M8', homeroom_teacher_id: 'u8', status: 'ENROLLED' },
    ];
    setStudents(initialStudents);

    const map: Record<string, { status: StudentAttendanceStatus; comment: string }> = {};
    initialStudents.forEach((s) => {
      map[s.id] = {
        status: s.id === 's75' ? 'LATE' : s.id === 's77' ? 'EARLY_LEAVE' : 'PRESENT',
        comment: s.id === 's75' ? '병원 진료' : s.id === 's77' ? '체험학습 조퇴' : '',
      };
    });
    setAttendanceMap(map);

    setConfirmData({
      id: 'cac1',
      attendance_date: new Date().toISOString().split('T')[0],
      grade: 3,
      class_no: 2,
      is_confirmed: true,
      confirmed_by: '이재원',
      confirmed_at: '08:50',
      total_students: 8,
      present_count: 6,
      late_count: 1,
      absent_count: 0,
      sick_count: 1,
    });
  }, []);

  const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment,
      },
    }));
  };

  const handleConfirmAttendance = async () => {
    setIsConfirming(true);
    try {
      const records = Object.entries(attendanceMap).map(([student_id, val]) => ({
        student_id,
        status: val.status,
        comment: val.comment,
      }));

      const res = await fetch('/api/attendance/student-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: 3,
          class_no: 2,
          confirmed_by: 'u2',
          records,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmData(data.data);
        setConfirmSuccessMsg(t('출결이 최종 확정(Confirm)되었습니다.', 'Attendance confirmed.'));
        setTimeout(() => setConfirmSuccessMsg(null), 3500);
      }
    } catch {
      setConfirmSuccessMsg(t('출결 확정 완료', 'Attendance confirmed'));
      setTimeout(() => setConfirmSuccessMsg(null), 3500);
    } finally {
      setIsConfirming(false);
    }
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
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('교직원 인트라넷 대시보드', 'Faculty Intranet Dashboard')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              '등대글로벌스쿨 일일 업무 현황 및 실시간 학사 대시보드입니다.',
              'Lighthouse Global School daily core tasks and academic dashboard.'
            )}
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 font-mono">
          <span>2026.10.23 (금)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Semester 1</span>
        </div>
      </div>

      {/* 1. Top Summary KPI Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card A: Pending Approvals */}
        <div className="bg-surface-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('내가 결재할 문서', 'Pending Approvals')}
            </span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              4<span className="text-lg font-semibold text-slate-500 ml-1">{t('건', '')}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {t('긴급 1건', '1 Urgent')}
            </span>
            <span className="text-xs text-slate-400">{t('일반 3건', '3 Normal')}</span>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{t('결재 대기 문서', 'Waiting approvals')}</span>
            <Link
              href="/approval"
              className="text-xs font-semibold text-primary-container hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>{t('결재함 이동', 'Review Docs')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Card B: Available Annual Leave */}
        <div className="bg-surface-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('사용 가능한 연차', 'Remaining Leave')}
            </span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
                11.5<span className="text-lg font-semibold text-slate-500 ml-0.5">{t('일', 'd')}</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 15.0{t('일', 'd')}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(11.5 / 15.0) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{t('당해 잔여 연차', 'Annual balance')}</span>
            <Link
              href="/approval?category=ATTENDANCE_REQ"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('휴가/연차 기안', 'Draft Leave')}</span>
            </Link>
          </div>
        </div>

        {/* Card C: Today Attendance & Overtime */}
        <div className="bg-surface-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('오늘의 내 근태', 'Today Attendance')}
            </span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-extrabold text-emerald-600 font-sans tracking-tight flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              {t('정상 출근 (08:15)', 'Present (08:15)')}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>{t('당월 초과근무:', 'Overtime:')}</span>
            <span className="font-semibold text-slate-700">{t('0시간', '0 hrs')}</span>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">211.104.88.24</span>
            <Link
              href="/attendance"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>{t('근태 상세', 'Details')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Student Attendance Confirm (7 status options) + Today Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student Daily Attendance Confirm (Span 2) */}
        <div className="lg:col-span-2 bg-surface-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{t('반별 학생 출결 리스트 및 일일 Confirm', 'Student Daily Attendance')}</span>
                  {confirmData?.is_confirmed ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      {t('Confirm 완료', 'Confirmed')} ({confirmData.confirmed_at})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {t('미확정', 'Pending')}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t(
                    '출석, 지각, 결석, 병결, 조퇴, 무단조퇴, 무단결석 중 선택 후 Confirm 버튼을 누르면 확정됩니다.',
                    'Select attendance status and click Confirm to submit.'
                  )}
                </p>
              </div>
            </div>

            {/* Class Selector & Confirm Button */}
            <div className="flex items-center gap-2">
              <select
                aria-label="학년 선택"
                className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-1 focus:ring-primary-container"
                defaultValue="M8"
              >
                {['T1', 'E1', 'E2', 'E3', 'E4', 'E5', 'M6', 'M7', 'M8', 'H9', 'H10', 'H11', 'H12'].map((g) => (
                  <option key={g} value={g}>
                    {g} 학년 {g === 'M8' ? '(담임: 이재원)' : ''}
                  </option>
                ))}
              </select>

              <button
                onClick={handleConfirmAttendance}
                disabled={isConfirming}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isConfirming ? t('확정중...', 'Saving...') : t('오늘 출결 최종 Confirm', 'Confirm Attendance')}</span>
              </button>
            </div>
          </div>

          {confirmSuccessMsg && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{confirmSuccessMsg}</span>
            </div>
          )}

          {/* Compact Students Table with 7 options */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-3 w-28">{t('학번', 'ID')}</th>
                  <th className="py-2.5 px-3 w-24">{t('성명', 'Name')}</th>
                  <th className="py-2.5 px-3 w-16 text-center">{t('학년', 'Grade')}</th>
                  <th className="py-2.5 px-3 text-center">
                    {t('출결 상태 선택 (7개 항목)', 'Status Options')}
                  </th>
                  <th className="py-2.5 px-3 w-48">{t('메모', 'Memo')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => {
                  const current = attendanceMap[student.id] || { status: 'PRESENT', comment: '' };

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 font-mono font-semibold text-slate-600 text-xs">
                        {student.student_no}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900 text-xs">{student.name}</div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs">
                          {student.grade}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {/* 7 status buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {statusOptions.map((opt) => {
                            const isSelected = current.status === opt.value;
                            const label = lang === 'ko' ? opt.labelKo : opt.labelEn;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleStatusChange(student.id, opt.value)}
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
                          value={current.comment}
                          onChange={(e) => handleCommentChange(student.id, e.target.value)}
                          placeholder={t('메모 입력', 'Memo')}
                          className="w-full h-7 px-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-200 bg-slate-50/70 rounded-b-xl flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-3">
              <span>{t('총원: 8명', 'Total: 8')}</span>
              <span className="text-emerald-700 font-semibold">{t('출석 6', 'Present 6')}</span>
              <span className="text-amber-700 font-semibold">{t('지각 1', 'Late 1')}</span>
              <span className="text-sky-700 font-semibold">{t('조퇴 1', 'Early 1')}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">08:50 (Live)</span>
          </div>
        </div>

        {/* Right: Today Academic Schedule (Span 1) */}
        <div className="bg-surface-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {t('오늘의 학사일정', 'Today Schedule')}
                </h2>
              </div>
              <Link
                href="/calendar"
                className="text-xs font-semibold text-primary-container hover:underline flex items-center gap-0.5"
              >
                {t('전체보기', 'View All')}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      2026학년도 1학기 오리엔테이션
                    </span>
                    <span className="text-[10px] font-mono text-blue-600 font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">
                      09:00 - 12:00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">대강당 (전교직원 참석)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      중고등부 교과협의회
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                      14:30 - 16:00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">제2회의실 (교무부)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 rounded-b-xl text-center">
            <Link
              href="/calendar"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {t('+ 새 일정 등록하기', '+ Add Event')}
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Bottom Full-Width Widget: Latest 5 Notices */}
      <div className="bg-surface-white rounded-xl border border-slate-200/90 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{t('최신 공지사항', 'Latest Notices')}</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                {t('필독 5개', '5 Must-Read')}
              </span>
            </h2>
          </div>
          <Link
            href="/board"
            className="text-xs font-semibold text-primary-container hover:underline flex items-center gap-0.5"
          >
            {t('게시판 바로가기', 'Board')}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-4 w-16 text-center">{t('분류', 'Category')}</th>
                <th className="py-2.5 px-4">{t('제목', 'Title')}</th>
                <th className="py-2.5 px-4 w-28">{t('작성자', 'Author')}</th>
                <th className="py-2.5 px-4 w-24 text-center">{t('작성일', 'Date')}</th>
                <th className="py-2.5 px-4 w-32 text-center">{t('열람 확인', 'Read Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/70 transition-colors bg-rose-50/20">
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-danger text-white flex items-center justify-center gap-1">
                    <Pin className="w-2.5 h-2.5" />
                    {t('필독', 'Must')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link
                    href="/board"
                    className="font-bold text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <span>[필독] 2026학년도 1학기 교직원 복무 규정 및 학교 공인 IP 출퇴근 지침</span>
                  </Link>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800">황규문 (교감)</td>
                <td className="py-3 px-4 text-center font-mono text-slate-500">2026.10.23</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    <Eye className="w-3 h-3 text-emerald-600" />
                    42/50명 (84%)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
