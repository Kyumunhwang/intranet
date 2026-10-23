'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  FileCheck2,
  CalendarDays,
  FileText,
  ShieldCheck,
  CheckSquare,
  Globe,
  Sliders,
  ArrowLeft,
  Lock,
  Layers,
  FileCode2,
  Building2,
  Clock,
  GraduationCap,
  BarChart3,
  Award,
  ChevronRight,
  UserCheck,
  KeyRound,
  FileSpreadsheet,
  Settings,
  Calendar as CalendarIcon,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface AdminSubItem {
  id: string;
  labelKo: string;
  labelEn: string;
  subParam: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface AdminNavGroup {
  id: string;
  tabKey: string;
  labelKo: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems: AdminSubItem[];
}

function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'school-info';
  const currentSub = searchParams.get('sub');
  const { lang, t } = useLanguage();

  const isAdminMode = pathname.startsWith('/admin');

  // 일반 교직원 전용 메뉴
  const teacherNavItems = [
    {
      id: 'dashboard',
      labelKo: '홈 대시보드',
      labelEn: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
      isActive: pathname === '/',
    },
    {
      id: 'attendance',
      labelKo: '교직원 근태 / 연차',
      labelEn: 'Faculty Attendance',
      href: '/attendance?tab=staff',
      icon: CalendarCheck,
      badge: null,
      isActive: pathname.startsWith('/attendance') && searchParams.get('tab') !== 'student',
    },
    {
      id: 'student-attendance',
      labelKo: '반별 학생 출결 확인',
      labelEn: 'Student Attendance',
      href: '/attendance?tab=student',
      icon: Users,
      badge: null,
      isActive: pathname.startsWith('/attendance') && searchParams.get('tab') === 'student',
    },
    {
      id: 'approval',
      labelKo: '전자결재 기안 및 승인',
      labelEn: 'E-Approval System',
      href: '/approval',
      icon: FileCheck2,
      badge: '3',
      isActive: pathname.startsWith('/approval'),
    },
    {
      id: 'calendar',
      labelKo: '학사일정 캘린더',
      labelEn: 'Academic Calendar',
      href: '/calendar',
      icon: CalendarDays,
      badge: null,
      isActive: pathname.startsWith('/calendar'),
    },
    {
      id: 'board',
      labelKo: '전자게시판',
      labelEn: 'Notice Board',
      href: '/board',
      icon: FileText,
      badge: '필독',
      isActive: pathname.startsWith('/board'),
    },
  ];

  // 최고관리자 전용 6대 대분류 및 하위 메뉴 매핑 정의
  const adminNavGroups: AdminNavGroup[] = [
    {
      id: 'school-info',
      tabKey: 'school-info',
      labelKo: '[학교정보관리]',
      labelEn: 'School Info',
      icon: Building2,
      subItems: [
        { id: 'si-staff', labelKo: '교직원 DB 관리', labelEn: 'Staff DB Management', subParam: 'staff', icon: Users },
        { id: 'si-basic', labelKo: '기본정보 등록', labelEn: 'Basic School Info', subParam: 'basic', icon: Settings },
        { id: 'si-org', labelKo: '조직도 등록', labelEn: 'Org Chart & Roles', subParam: 'org', icon: Building2 },
        { id: 'si-dept', labelKo: '부서할당 & 교사검색', labelEn: 'Department Assign', subParam: 'dept-assign', icon: UserCheck },
        { id: 'si-student', labelKo: '학생등록관리', labelEn: 'Student Management', subParam: 'student', icon: GraduationCap },
      ],
    },
    {
      id: 'permissions',
      tabKey: 'permissions',
      labelKo: '[권한관리]',
      labelEn: 'Permissions',
      icon: ShieldCheck,
      subItems: [
        { id: 'pm-code', labelKo: '권한코드등록', labelEn: 'Role Codes', subParam: 'codes', icon: KeyRound },
        { id: 'pm-menu', labelKo: '메뉴별 권한설정', labelEn: 'Menu Permissions', subParam: 'menu-matrix', icon: CheckSquare },
        { id: 'pm-user', labelKo: '사용자별 권한설정', labelEn: 'User Permissions', subParam: 'user-assign', icon: Users },
      ],
    },
    {
      id: 'intranet-manage',
      tabKey: 'intranet-manage',
      labelKo: '[인트라넷 관리]',
      labelEn: 'Intranet Admin',
      icon: Layers,
      subItems: [
        { id: 'im-ip', labelKo: '접속ip관리 & 검색', labelEn: 'IP Management', subParam: 'ip', icon: Globe },
        { id: 'im-appdel', labelKo: '전자결재 삭제 기능', labelEn: 'Approval Delete', subParam: 'approval-del', icon: FileCheck2 },
        { id: 'im-brddel', labelKo: '전자게시판 삭제 기능', labelEn: 'Board Delete', subParam: 'board-del', icon: FileText },
        { id: 'im-doc', labelKo: '문서양식관리', labelEn: 'Document Forms', subParam: 'form-doc', icon: FileSpreadsheet },
        { id: 'im-draft', labelKo: '기안양식관리', labelEn: 'Draft Forms', subParam: 'form-draft', icon: FileCode2 },
        { id: 'im-att', labelKo: '근태신청서양식관리', labelEn: 'Attendance Forms', subParam: 'form-att', icon: CalendarCheck },
      ],
    },
    {
      id: 'work-support',
      tabKey: 'work-support',
      labelKo: '[업무지원]',
      labelEn: 'Work Support',
      icon: BarChart3,
      subItems: [
        { id: 'ws-staff', labelKo: '사원별근태현황', labelEn: 'Staff Attendance', subParam: 'staff', icon: Users },
        { id: 'ws-dept', labelKo: '부서별근태집계', labelEn: 'Dept Summary', subParam: 'dept', icon: BarChart3 },
        { id: 'ws-daily', labelKo: '일별근태현황', labelEn: 'Daily Status', subParam: 'daily', icon: CalendarIcon },
        { id: 'ws-monthly', labelKo: '월별근태현황', labelEn: 'Monthly Status', subParam: 'monthly', icon: CalendarDays },
        { id: 'ws-retired', labelKo: '퇴사자 근태확인', labelEn: 'Retired Staff Log', subParam: 'retired', icon: UserCheck },
        { id: 'ws-overtime', labelKo: '월별 연장근무 현황', labelEn: 'Overtime Status', subParam: 'overtime', icon: Clock },
      ],
    },
    {
      id: 'attendance-manage',
      tabKey: 'attendance-manage',
      labelKo: '[근태관리]',
      labelEn: 'Attendance Admin',
      icon: Clock,
      subItems: [
        { id: 'am-config', labelKo: '근태기초설정', labelEn: 'Attendance Config', subParam: 'config', icon: Settings },
        { id: 'am-days', labelKo: '근무일설정', labelEn: 'Workdays Config', subParam: 'days', icon: CalendarIcon },
        { id: 'am-extend', labelKo: '근태승인연장', labelEn: 'Approval Extension', subParam: 'extend', icon: Clock },
        { id: 'am-base', labelKo: '근무기초 설정', labelEn: 'Base Rules', subParam: 'base', icon: Sliders },
        { id: 'am-ot', labelKo: '연장근무승인', labelEn: 'Overtime Approval', subParam: 'overtime-approval', icon: CheckCircle2 },
      ],
    },
    {
      id: 'leave-manage',
      tabKey: 'leave-manage',
      labelKo: '[연차관리]',
      labelEn: 'Leave Master',
      icon: Award,
      subItems: [
        { id: 'lm-adjust', labelKo: '연차조정 (가감)', labelEn: 'Leave Adjustment', subParam: 'adjust', icon: Award },
        { id: 'lm-batch', labelKo: '연차일괄등록 (+15일)', labelEn: 'Batch Leave Grant', subParam: 'batch', icon: Plus },
      ],
    },
  ];

  // [핵심 요구사항 반영]: 현재 상단에서 선택된 대분류 그룹 찾기
  const currentGroup = adminNavGroups.find((g) => g.tabKey === currentTab) || adminNavGroups[0];
  const CurrentGroupIcon = currentGroup.icon;

  return (
    <div className="flex-1 flex flex-col justify-between">
      <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
        {/* 일반 교직원 모드일 때 네비게이션 */}
        {!isAdminMode && (
          teacherNavItems.map((item) => {
            const Icon = item.icon;
            const label = lang === 'ko' ? item.labelKo : item.labelEn;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                  item.isActive
                    ? 'bg-primary-container text-white shadow-md font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${item.isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate whitespace-nowrap">{label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold shrink-0 ${
                      item.badge === '3' || item.badge === '필독'
                        ? 'bg-status-danger text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })
        )}

        {/* 최고관리자 모드: [요구사항 반영] 상단 메뉴에서 선택된 분야의 하위 메뉴들만 네비게이션바에 단독 표시! */}
        {isAdminMode && (
          <div className="space-y-3">
            {/* 현재 상단에서 선택된 대분류 타이틀 배너 */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-600/90 to-amber-700 text-white shadow-md border border-amber-500/40">
              <div className="flex items-center gap-2">
                <CurrentGroupIcon className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="text-xs font-bold tracking-tight">{currentGroup.labelKo}</span>
              </div>
              <span className="text-[10px] text-amber-100 block mt-1 font-mono">
                세부 하위 메뉴 ({currentGroup.subItems.length}개)
              </span>
            </div>

            {/* 선택된 대분류의 하위메뉴 목록들만 표시 */}
            <div className="space-y-1 pt-1">
              {currentGroup.subItems.map((sub, index) => {
                const SubIcon = sub.icon || ChevronRight;
                // subParam이 일치하거나, sub 파라미터가 비어있을 때는 첫 번째 하위메뉴가 활성화 상태
                const isSubActive =
                  currentSub === sub.subParam || (!currentSub && index === 0);

                return (
                  <Link
                    key={sub.id}
                    href={`/admin?tab=${currentGroup.tabKey}&sub=${sub.subParam}`}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isSubActive
                        ? 'bg-amber-600 text-white shadow-md border-l-4 border-amber-300 pl-2.5'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-amber-200' : 'text-slate-400'}`} />
                      <span className="truncate whitespace-nowrap">{sub.labelKo}</span>
                    </div>
                    {isSubActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-200 shrink-0"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* 관리자 모드일 때 포털로 복귀하는 버튼 */}
      {isAdminMode && (
        <div className="px-3 pt-2 pb-2 border-t border-slate-800 mt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('일반 교직원 포털로 복귀', 'Back to Faculty Portal')}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const isAdminMode = pathname.startsWith('/admin');
  const { t } = useLanguage();

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-sidebar-bg z-50 flex flex-col justify-between border-r border-slate-800 text-slate-300 select-none shadow-xl">
      <div className="flex flex-col flex-1 min-h-0">
        {/* 상단 로고: 가로형 배너 로고 */}
        <div className="h-[64px] px-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 px-2 py-1 bg-white/10 rounded-lg flex items-center justify-center border border-white/15 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/lis_logo_2026.png"
                alt="등대글로벌스쿨 배너 로고"
                className="h-full w-auto object-contain filter brightness-110"
              />
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-3 overflow-hidden flex flex-col">
          <Suspense fallback={<div className="p-4 text-xs text-slate-500">Loading Navigation...</div>}>
            <SidebarNav />
          </Suspense>
        </div>
      </div>

      {/* 하단 프로필 섹션: 등대교육공동체 원형 심볼 로고 배치 */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center shrink-0 border border-slate-600 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/lighthouse_logo.png"
              alt="등대교육공동체 심볼 로고"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-semibold text-slate-200 truncate">등대글로벌스쿨</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {isAdminMode ? 'Tier-1 Admin Mode' : '2026 Academic Term'}
            </span>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="System Online"></div>
      </div>
    </aside>
  );
}
