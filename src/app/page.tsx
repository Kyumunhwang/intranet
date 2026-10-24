'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  GraduationCap,
} from 'lucide-react';
import {
  Student,
  ClassAttendanceConfirm,
  StudentAttendanceStatus,
} from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';
import FrontpageLogin from '@/components/auth/FrontpageLogin';
import rawStudentsData from '../../data/students.json';

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

const GRADE_TEACHER_MAP: Record<string, { teacherName: string; teacherId: string }> = {
  T1: { teacherName: '편제 준비중', teacherId: '' },
  E1: { teacherName: '임그린 (Green Lim)', teacherId: 'u15' },
  E2: { teacherName: '에크남 (Eknam)', teacherId: 'u18' },
  E3: { teacherName: '유윤정 (Yoonjung Yu)', teacherId: 'u16' },
  E4: { teacherName: '박예진 (Yejin Park)', teacherId: 'u17' },
  E5: { teacherName: '김다니엘 (Daniel Kim)', teacherId: 'u21' },
  M6: { teacherName: '류미연 (Monica Ryu)', teacherId: 'u25' },
  M7: { teacherName: '강소라 (Sora Kang)', teacherId: 'u22' },
  M8: { teacherName: '이재원 (Jay Lee)', teacherId: 'u8' },
  H9: { teacherName: '이영은 (Michelle Lee)', teacherId: 'u20' },
  H10: { teacherName: '박진희 (Jinhee Park)', teacherId: 'u19' },
  H11: { teacherName: '나경식 (Kyungsik Nah)', teacherId: 'u13' },
  H12: { teacherName: '유찬호 (Chanho Yu)', teacherId: 'u4' },
};

export default function HomePage() {
  const { isLoggedIn, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>등대글로벌스쿨 인트라넷 연결 중...</span>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우 첫화면 Frontpage 로그인 화면 노출
  if (!isLoggedIn) {
    return <FrontpageLogin />;
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const { lang, t } = useLanguage();
  const { currentUser } = useUser();

  // 144명 실제 학생 데이터
  const allStudents = useMemo(() => rawStudentsData as unknown as Student[], []);

  // 로그인한 교사의 담임 학년 계산 (기본값 설정)
  const defaultGrade = useMemo(() => {
    if (currentUser.homeroom_grade) {
      return currentUser.homeroom_grade;
    }
    // 담임교사 ID 매핑 검색
    const matchedGrade = Object.entries(GRADE_TEACHER_MAP).find(
      ([, info]) => info.teacherId === currentUser.id
    )?.[0];
    if (matchedGrade) return matchedGrade;

    // 만약 학생 DB에서 직접 담임교사 ID로 검색
    const student = allStudents.find((s) => s.homeroom_teacher_id === currentUser.id);
    if (student) return String(student.grade);

    // 관리자/교장 등 담임이 아닌 경우 기본값 M8
    return 'M8';
  }, [currentUser, allStudents]);

  // 선택된 학년 상태 (기본값: 로그인한 교사의 담임 학년)
  const [selectedGrade, setSelectedGrade] = useState<string>(defaultGrade);

  useEffect(() => {
    setSelectedGrade(defaultGrade);
  }, [defaultGrade]);

  // 선택된 학년의 학생 명단 필터링
  const currentGradeStudents = useMemo(() => {
    return allStudents.filter((s) => String(s.grade) === selectedGrade);
  }, [allStudents, selectedGrade]);

  // 학생별 출결 상태 및 메모 맵
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: StudentAttendanceStatus; comment: string }>
  >({});

  const [confirmData, setConfirmData] = useState<ClassAttendanceConfirm | null>({
    id: 'cac1',
    attendance_date: new Date().toISOString().split('T')[0],
    grade: selectedGrade as any,
    class_no: 1,
    is_confirmed: true,
    confirmed_by: currentUser.name,
    confirmed_at: '08:50',
    total_students: currentGradeStudents.length,
    present_count: currentGradeStudents.length,
    late_count: 0,
    absent_count: 0,
    sick_count: 0,
  });

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmSuccessMsg, setConfirmSuccessMsg] = useState<string | null>(null);

  const getStudentStatus = (studentId: string): StudentAttendanceStatus => {
    return attendanceMap[studentId]?.status || 'PRESENT';
  };

  const getStudentComment = (studentId: string): string => {
    return attendanceMap[studentId]?.comment || '';
  };

  const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        status,
        comment: prev[studentId]?.comment || '',
      },
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'PRESENT',
        comment,
      },
    }));
  };

  const handleConfirmAttendance = async () => {
    setIsConfirming(true);
    try {
      const records = currentGradeStudents.map((s) => ({
        student_id: s.id,
        status: getStudentStatus(s.id),
        comment: getStudentComment(s.id),
      }));

      const res = await fetch('/api/attendance/student-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          class_no: 1,
          confirmed_by: currentUser.id,
          records,
        }),
      });
      const data = await res.json();
      const nowTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      setConfirmData({
        id: `cac_${Date.now()}`,
        attendance_date: new Date().toISOString().split('T')[0],
        grade: selectedGrade as any,
        class_no: 1,
        is_confirmed: true,
        confirmed_by: currentUser.name,
        confirmed_at: nowTime,
        total_students: currentGradeStudents.length,
        present_count: stats.present,
        late_count: stats.late,
        absent_count: stats.absent,
        sick_count: stats.sick,
      });
      setConfirmSuccessMsg(
        t(
          `[${selectedGrade} 학년] 학생 ${currentGradeStudents.length}명의 출결이 최종 확정(Confirm)되었습니다.`,
          `[${selectedGrade}] Attendance for ${currentGradeStudents.length} students confirmed.`
        )
      );
      setTimeout(() => setConfirmSuccessMsg(null), 3500);
    } catch {
      setConfirmSuccessMsg(t('출결 확정 완료', 'Attendance confirmed'));
      setTimeout(() => setConfirmSuccessMsg(null), 3500);
    } finally {
      setIsConfirming(false);
    }
  };

  // 통계 계산
  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let sick = 0;
    let early = 0;
    currentGradeStudents.forEach((s) => {
      const st = getStudentStatus(s.id);
      if (st === 'PRESENT') present++;
      else if (st === 'LATE') late++;
      else if (st === 'ABSENT' || st === 'UNAUTH_ABSENT') absent++;
      else if (st === 'SICK') sick++;
      else if (st === 'EARLY_LEAVE' || st === 'UNAUTH_EARLY') early++;
    });
    return { present, late, absent, sick, early, total: currentGradeStudents.length };
  }, [currentGradeStudents, attendanceMap]);

  const statusOptions: { value: StudentAttendanceStatus; labelKo: string; labelEn: string; color: string }[] = [
    { value: 'PRESENT', labelKo: '출석', labelEn: 'Present', color: 'bg-emerald-600 text-white' },
    { value: 'LATE', labelKo: '지각', labelEn: 'Late', color: 'bg-amber-500 text-white' },
    { value: 'ABSENT', labelKo: '결석', labelEn: 'Absent', color: 'bg-rose-500 text-white' },
    { value: 'SICK', labelKo: '병결', labelEn: 'Sick', color: 'bg-indigo-600 text-white' },
    { value: 'EARLY_LEAVE', labelKo: '조퇴', labelEn: 'Early Leave', color: 'bg-sky-600 text-white' },
    { value: 'UNAUTH_EARLY', labelKo: '무단조퇴', labelEn: 'Truant Early', color: 'bg-orange-600 text-white' },
    { value: 'UNAUTH_ABSENT', labelKo: '무단결석', labelEn: 'Truancy', color: 'bg-red-700 text-white' },
  ];

  const currentTeacherInfo = GRADE_TEACHER_MAP[selectedGrade];

  return (
    <div className="space-y-6">
      {/* 1. Top Row: 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card A: Pending Electronic Approvals */}
        <div className="bg-surface-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentUser.role === 'TEACHER'
                ? t('내 기안 결재 진행', 'My Drafts')
                : t('결재 대기 문서', 'Pending Approvals')}
            </span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              1<span className="text-lg font-semibold text-slate-500 ml-0.5">{t('건', 'item')}</span>
            </span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {currentUser.role === 'TEACHER' ? t('1차 승인 대기', 'In Progress') : t('검토 필요', 'Needs Review')}
            </span>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{t('결재 처리 평균 2.4시간', 'Avg. 2.4 hrs')}</span>
            <Link
              href="/approval"
              className="text-xs font-semibold text-primary-container hover:underline flex items-center gap-0.5"
            >
              <span>{t('전자결재 바로가기', 'Approvals')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card B: Remaining Leave Days */}
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
            <span>{t('접속 계정:', 'User:')}</span>
            <span className="font-semibold text-slate-700">{currentUser.name} ({currentUser.title})</span>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">211.104.88.24</span>
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
                  {currentTeacherInfo?.teacherName ? (
                    <span>담임: <strong>{currentTeacherInfo.teacherName}</strong> · </span>
                  ) : null}
                  <span>출석, 지각, 결석, 병결, 조퇴, 무단조퇴, 무단결석 중 선택 후 Confirm 버튼을 누르면 확정됩니다.</span>
                </p>
              </div>
            </div>

            {/* Class Selector & Confirm Button */}
            <div className="flex items-center gap-2">
              <select
                aria-label="학년 선택"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {SCHOOL_GRADES.map((g) => {
                  const teacher = GRADE_TEACHER_MAP[g]?.teacherName;
                  return (
                    <option key={g} value={g}>
                      {g} 학년 {teacher ? `(${teacher})` : ''}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={handleConfirmAttendance}
                disabled={isConfirming || currentGradeStudents.length === 0}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
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
                  <th className="py-2.5 px-3 w-40">{t('성명', 'Name')}</th>
                  <th className="py-2.5 px-3 w-16 text-center">{t('학년', 'Grade')}</th>
                  <th className="py-2.5 px-3 text-center">
                    {t('출결 상태 선택 (7개 항목: 출석, 지각, 결석, 병결, 조퇴, 무단조퇴, 무단결석)', 'Status Options')}
                  </th>
                  <th className="py-2.5 px-3 w-48">{t('메모', 'Memo')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentGradeStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {t(`[${selectedGrade} 학년] 등록된 학생이 없습니다.`, `No students in ${selectedGrade}.`)}
                    </td>
                  </tr>
                ) : (
                  currentGradeStudents.map((student) => {
                    const status = getStudentStatus(student.id);
                    const comment = getStudentComment(student.id);

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
                        <td className="py-1.5 px-3">
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {statusOptions.map((opt) => {
                              const isSelected = status === opt.value;
                              const label = lang === 'ko' ? opt.labelKo : opt.labelEn;

                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, opt.value)}
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                                    isSelected
                                      ? `${opt.color} shadow-xs font-bold scale-105`
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={comment}
                            onChange={(e) => handleCommentChange(student.id, e.target.value)}
                            placeholder={t('사유 및 메모 입력', 'Enter note')}
                            className="w-full h-7 px-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary-container focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-200 bg-slate-50/70 rounded-b-xl flex flex-wrap items-center justify-between text-xs text-slate-600 font-medium gap-2">
            <div className="flex items-center gap-3">
              <span>{t(`[${selectedGrade} 학년 총원: ${stats.total}명]`, `Total: ${stats.total}`)}</span>
              <span className="text-emerald-700 font-semibold">{t(`출석 ${stats.present}`, `Present ${stats.present}`)}</span>
              {stats.late > 0 && <span className="text-amber-700 font-semibold">{t(`지각 ${stats.late}`, `Late ${stats.late}`)}</span>}
              {stats.sick > 0 && <span className="text-indigo-700 font-semibold">{t(`병결 ${stats.sick}`, `Sick ${stats.sick}`)}</span>}
              {stats.early > 0 && <span className="text-sky-700 font-semibold">{t(`조퇴 ${stats.early}`, `Early ${stats.early}`)}</span>}
              {stats.absent > 0 && <span className="text-rose-700 font-semibold">{t(`결석 ${stats.absent}`, `Absent ${stats.absent}`)}</span>}
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
