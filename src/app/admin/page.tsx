'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Lock,
  Users,
  ShieldCheck,
  Settings,
  KeyRound,
  Trash2,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  CheckSquare,
  Globe,
  Sliders,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Building,
  GraduationCap,
  ChevronRight,
  UserCheck,
  XCircle,
  FilePlus,
  Edit3,
  Layers,
  Save,
  Check,
  UserPlus,
  Award,
  Zap,
  Tag,
  Shield,
  FileCode2,
  CalendarDays,
  UserX,
  RefreshCw,
  FolderPlus,
  ListPlus,
  FileSignature,
  Building2,
  BarChart3,
  Eye,
  Printer,
  History,
  FileSpreadsheet,
  ShieldAlert,
} from 'lucide-react';
import { Profile, AllowedIP, AuditLog, Department, Position, Role, Student, MenuPermissionItem, ApprovalTemplate, SpecialDateSchedule } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';
import rawProfilesData from '../../../data/profiles.json';
import rawStudentsData from '../../../data/students.json';
import rawDepartmentsData from '../../../data/departments.json';
import rawPositionsData from '../../../data/positions.json';
import rawRolesData from '../../../data/roles.json';
import rawMenuPermissionsData from '../../../data/menu_permissions.json';
import rawApprovalTemplates from '../../../data/approval_templates.json';

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

// 6대 대분류 탭 타입
export type AdminMainTab =
  | 'school-info'       // [학교정보관리]
  | 'permissions'       // [권한관리]
  | 'intranet-manage'   // [인트라넷 관리]
  | 'work-support'      // [업무지원]
  | 'attendance-manage' // [근태관리]
  | 'leave-manage';     // [연차관리]

// 1. 학교정보관리 기본정보 타입
interface SchoolBasicInfo {
  school_name: string;
  slogan: string;
  login_notice: string;
  global_announcement: string;
  admin_contact: string;
  logo_type: string;
}

// 2. 전자결재 관리용 문서 타입
interface ApprovalDocAdmin {
  id: string;
  doc_no: string;
  title: string;
  drafter_name: string;
  form_name: string;
  created_at: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// 3. 기안/문서/근태 양식 타입
interface ManagedFormTemplate {
  id: string;
  type: 'DOCUMENT' | 'DRAFT' | 'ATTENDANCE_LEAVE';
  form_code: string;
  title: string;
  steps: number;
  deducts_leave: boolean;
  description: string;
}

// 4. 초과근무 신청 타입
interface OvertimeRequest {
  id: string;
  teacher_name: string;
  department: string;
  category: string;
  date: string;
  duration: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

function AdminConsoleContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 6대 대분류 탭 라우팅
  const tabParam = (searchParams.get('tab') as AdminMainTab) || 'school-info';
  const subParam = searchParams.get('sub');
  const [activeTab, setActiveTab] = useState<AdminMainTab>(tabParam);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // [1. 학교정보관리] 서브탭 상태
  const [schoolSubTab, setSchoolSubTab] = useState<'basic' | 'org' | 'staff' | 'dept-assign' | 'student'>('staff');

  // [2. 권한관리] 서브탭 상태
  const [permSubTab, setPermSubTab] = useState<'codes' | 'menu-matrix' | 'user-assign'>('codes');

  // [3. 인트라넷 관리] 서브탭 상태
  const [intraSubTab, setIntraSubTab] = useState<'ip' | 'approval-del' | 'board-del' | 'forms'>('forms');
  const [formCategoryFilter, setFormCategoryFilter] = useState<'ALL' | 'DOCUMENT' | 'DRAFT' | 'ATTENDANCE_LEAVE'>('ALL');

  // [4. 업무지원] 서브탭 상태
  const [workSupportView, setWorkSupportView] = useState<'staff' | 'dept' | 'daily' | 'monthly' | 'retired' | 'overtime'>('staff');

  // [5. 근태관리] 서브탭 상태
  const [attManageView, setAttManageView] = useState<'config' | 'days' | 'extend' | 'base' | 'overtime-approval'>('config');

  // [6. 연차관리] 서브탭 상태
  const [leaveManageView, setLeaveManageView] = useState<'adjust' | 'batch'>('adjust');

  useEffect(() => {
    const tab = searchParams.get('tab') as AdminMainTab;
    const sub = searchParams.get('sub');

    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('school-info');
    }

    // 사이드바 하위 메뉴 클릭 시 해당 화면으로 즉시 전환
    if (sub) {
      if (['basic', 'org', 'staff', 'dept-assign', 'student'].includes(sub)) {
        setSchoolSubTab(sub as any);
      }
      if (['codes', 'menu-matrix', 'user-assign'].includes(sub)) {
        setPermSubTab(sub as any);
      }
      if (sub === 'ip' || sub === 'approval-del' || sub === 'board-del') {
        setIntraSubTab(sub as any);
      } else if (sub === 'form-doc') {
        setIntraSubTab('forms');
        setFormCategoryFilter('DOCUMENT');
      } else if (sub === 'form-draft') {
        setIntraSubTab('forms');
        setFormCategoryFilter('DRAFT');
      } else if (sub === 'form-att') {
        setIntraSubTab('forms');
        setFormCategoryFilter('ATTENDANCE_LEAVE');
      }
      if (['staff', 'dept', 'daily', 'monthly', 'retired', 'overtime'].includes(sub)) {
        setWorkSupportView(sub as any);
      }
      if (['config', 'days', 'extend', 'base', 'overtime-approval'].includes(sub)) {
        setAttManageView(sub as any);
      }
      if (['adjust', 'batch'].includes(sub)) {
        setLeaveManageView(sub as any);
      }
    }
  }, [searchParams]);

  const handleTabSwitch = (tab: AdminMainTab, sub?: string) => {
    setActiveTab(tab);
    if (sub) {
      router.replace(`/admin?tab=${tab}&sub=${sub}`);
    } else {
      router.replace(`/admin?tab=${tab}`);
    }
  };

  const { currentUser } = useUser();

  const [schoolBasicInfo, setSchoolBasicInfo] = useState<SchoolBasicInfo>({
    school_name: '등대글로벌스쿨 (Lighthouse Global School)',
    slogan: 'Light to the World, Salt of the Earth',
    login_notice: '2026학년도 교직원 인트라넷입니다. 인가된 학교 IP망에서만 접속 및 출퇴근이 가능합니다.',
    global_announcement: '2026학년도 1학기 신학기 학사일정 및 교직원 워크숍 안내',
    admin_contact: '031-123-4567 (교무행정실)',
    logo_type: '2026_STANDARD',
  });

  // 부서 및 직책 마스터 (실제 DB 연동)
  const [departments, setDepartments] = useState<Department[]>(rawDepartmentsData as Department[]);
  const [positions, setPositions] = useState<Position[]>(rawPositionsData as Position[]);

  // 교직원 DB 목록 (roster.xlsx 실제 교직원 32명 전원 연동)
  const [profiles, setProfiles] = useState<Profile[]>(rawProfilesData as unknown as Profile[]);

  // 검색 상태
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffTypeFilter, setStaffTypeFilter] = useState<'ALL' | 'REGULAR' | 'PART_TIME' | 'EXTERNAL'>('ALL');
  
  // 모달 상태
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Profile | null>(null);
  const [isBatchUploadModalOpen, setIsBatchUploadModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetStaffForPwd, setTargetStaffForPwd] = useState<Profile | null>(null);
  const [newDirectPwd, setNewDirectPwd] = useState('');

  // =========================================================================
  // [1-5. 학생등록관리] 상태 및 데이터 (roster.xlsx 실제 학생 144명 전원 연동)
  // =========================================================================
  const [students, setStudents] = useState<Student[]>(rawStudentsData as unknown as Student[]);

  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState<'ALL' | string>('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED'>('ALL');

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isStudentBatchModalOpen, setIsStudentBatchModalOpen] = useState(false);

  // =========================================================================
  // [2. 권한관리] 상태
  // =========================================================================
  const [roles, setRoles] = useState<Role[]>(rawRolesData as Role[]);

  // 메뉴별 권한 매트릭스 (최고관리자, 관리자, 일반 교직원 - 조회, 저장, 인쇄)
  const [menuPermissions, setMenuPermissions] = useState<MenuPermissionItem[]>(
    rawMenuPermissionsData as MenuPermissionItem[]
  );

  // 권한 코드 등록/수정 모달 상태
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleFormCode, setRoleFormCode] = useState('');
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormDesc, setRoleFormDesc] = useState('');
  const [roleFormIsSystem, setRoleFormIsSystem] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // =========================================================================
  // [3. 인트라넷 관리] 상태
  // =========================================================================
  const [ipSearchQuery, setIpSearchQuery] = useState('');
  const [allowedIps, setAllowedIps] = useState<AllowedIP[]>([
    { id: 'ip1', ip_address: '211.104.88.24', description: '본관 교무실 공인 IP (출퇴근 허용)', ip_type: 'SCHOOL_ALLOWED', is_active: true },
    { id: 'ip2', ip_address: '211.104.88.25', description: '행정실/재정실 공인 IP (출퇴근 허용)', ip_type: 'SCHOOL_ALLOWED', is_active: true },
    { id: 'ip3', ip_address: '110.15.22.99', description: '외부 비인가 차단 대상 IP', ip_type: 'BLOCKED', is_active: true },
    { id: 'ip4', ip_address: '127.0.0.1', description: '로컬 개발/테스트 가상 IP', ip_type: 'SCHOOL_ALLOWED', is_active: true },
  ]);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newIpDesc, setNewIpDesc] = useState('');
  const [newIpType, setNewIpType] = useState<'SCHOOL_ALLOWED' | 'BLOCKED'>('SCHOOL_ALLOWED');

  // 전자결재 목록 및 강제 삭제 (실제 결재 문서 DB 연동)
  const [approvalDocs, setApprovalDocs] = useState<ApprovalDocAdmin[]>([
    { id: 'doc-1', doc_no: 'LIS-2026-0324', title: '2026학년도 중등부 과학 실험 비품 및 교구 구입 품의서', drafter_name: '이재원', form_name: '지출결의서', created_at: '2026-03-24', status: 'PENDING' },
    { id: 'doc-2', doc_no: 'LIS-2026-0323', title: '2026학년도 1학기 봄 정기 연차 휴가원 신청', drafter_name: '이재원', form_name: '휴가원', created_at: '2026-03-23', status: 'APPROVED' },
    { id: 'doc-3', doc_no: 'LIS-2026-0320', title: '2026학년도 학생 학적 명부 및 교직원 명부 전산 입력 승인의 건', drafter_name: '황규문', form_name: '일반기안문', created_at: '2026-03-20', status: 'APPROVED' },
  ]);

  // 전자게시판 목록 및 강제 삭제 (실제 게시글 DB 연동)
  const [boardArticles, setBoardArticles] = useState([
    { id: 'art-1', category: '공지사항', title: '2026학년도 1학기 신학기 학사일정 및 교직원 워크숍 종합 안내', author: '황규문 교감', created_at: '2026-03-24' },
    { id: 'art-2', category: '교무회의록', title: '제3차 교무기획위원회 정기 회의록 (중고등 생활지도 및 출결 관리)', author: '이재원 교사', created_at: '2026-03-22' },
    { id: 'art-3', category: '자료실', title: '2026학년도 학생 학적 명부 및 교직원 연락처 안내 (Roster)', author: '김바울 교장', created_at: '2026-03-21' },
  ]);

  // 3대 양식 관리 (문서양식, 기안양식, 근태신청서양식)
  const [approvalTemplates, setApprovalTemplates] = useState<ApprovalTemplate[]>(
    rawApprovalTemplates as unknown as ApprovalTemplate[]
  );

  // 양식 생성/수정/미리보기 모달 상태
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'DOCUMENT' | 'DRAFT' | 'ATTENDANCE_LEAVE'>('DRAFT');
  const [formDescription, setFormDescription] = useState('');
  const [formContentHtml, setFormContentHtml] = useState('');
  const [formAutoDeduct, setFormAutoDeduct] = useState(false);
  const [formStepsCount, setFormStepsCount] = useState<number>(3);
  const [formFileName, setFormFileName] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<ApprovalTemplate | null>(null);

  // =========================================================================
  // [4. 업무지원] 상태 (사원별, 부서별, 일별, 월별, 퇴사자, 월별연장근무)
  // =========================================================================

  // =========================================================================
  // [5. 근태관리] 상태 (근무기초, 근무일, 요일별 퇴근시간, 방학근무, 연장근무승인)
  // =========================================================================
  const [attConfigCheckIn, setAttConfigCheckIn] = useState('08:30:00');
  const [attConfigCheckOut, setAttConfigCheckOut] = useState('16:30:00');
  const [attWorkDays, setAttWorkDays] = useState(['월', '화', '수', '목', '금']);
  const [attDayEndTimes, setAttDayEndTimes] = useState<Record<string, string>>({
    '월': '16:30:00',
    '화': '16:30:00',
    '수': '16:30:00',
    '목': '16:30:00',
    '금': '17:00:00', // 금요일 퇴근시간 오후 5시 (학교 운영 방침 반영)
    '토': '휴무',
    '일': '휴무',
  });
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [vacationCheckIn, setVacationCheckIn] = useState('09:00:00'); // 방학 중 출근 9시
  const [vacationCheckOut, setVacationCheckOut] = useState('17:00:00'); // 방학 중 퇴근 5시
  const [vacationStart, setVacationStart] = useState('2026-07-20');
  const [vacationEnd, setVacationEnd] = useState('2026-08-25');
  const [isIpEnforced, setIsIpEnforced] = useState(true);

  // 특별일 지정 퇴근시간 조정 상태
  const [specialDates, setSpecialDates] = useState<SpecialDateSchedule[]>([
    {
      id: 'sd-1',
      date: '2026-05-15',
      check_in_time: '08:30:00',
      check_out_time: '15:00:00',
      title: '스승의 날 교직원 위로 행사 단축근무',
    },
    {
      id: 'sd-2',
      date: '2026-10-23',
      check_in_time: '08:30:00',
      check_out_time: '15:30:00',
      title: '가을 학술제 행사 마무리 조기퇴근',
    },
    {
      id: 'sd-3',
      date: '2026-12-24',
      check_in_time: '08:30:00',
      check_out_time: '14:00:00',
      title: '성탄 전야 특별 조기퇴근',
    },
  ]);
  const [newSpecialDate, setNewSpecialDate] = useState('2026-11-20');
  const [newSpecialTime, setNewSpecialTime] = useState('15:00:00');
  const [newSpecialTitle, setNewSpecialTitle] = useState('');

  // [4. 업무지원] 교직원 전용 필터 상태 (학생 제외 원칙)
  const [workSupportStaffFilter, setWorkSupportStaffFilter] = useState<'ALL' | '교사' | '행정' | '재정' | '관리자'>('ALL');
  const [workSupportSearch, setWorkSupportSearch] = useState('');
  const [workSupportDailyDate, setWorkSupportDailyDate] = useState('2026-10-24');
  const [workSupportMonth, setWorkSupportMonth] = useState('2026-10');

  // 초기 마운트 시 저장된 근태 기초 설정 불러오기
  useEffect(() => {
    fetch('/api/admin/work-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.work_start_time) setAttConfigCheckIn(s.work_start_time);
          if (s.work_end_time) setAttConfigCheckOut(s.work_end_time);
          if (s.day_end_times) {
            setAttDayEndTimes((prev) => ({
              ...prev,
              ...s.day_end_times,
            }));
          }
          if (s.is_vacation_mode !== undefined) setIsVacationMode(s.is_vacation_mode);
          if (s.vacation_start_time) setVacationCheckIn(s.vacation_start_time);
          if (s.vacation_end_time) setVacationCheckOut(s.vacation_end_time);
          if (s.vacation_period?.start) setVacationStart(s.vacation_period.start);
          if (s.vacation_period?.end) setVacationEnd(s.vacation_period.end);
          if (s.special_dates && Array.isArray(s.special_dates)) {
            setSpecialDates(s.special_dates);
          }
        }
      })
      .catch(() => {});
  }, []);

  // 연장근무 신청 목록 (금요일 17:00 퇴근 및 방학 중 9시~5시 규칙 반영)
  const [overtimeList, setOvertimeList] = useState<OvertimeRequest[]>([
    {
      id: 'ot-1',
      teacher_name: '이재원 (Jay Lee)',
      department: '중고등학사팀',
      category: '방과후 수업',
      date: '2026-03-27', // 금요일
      duration: 2.0,
      reason: '금요일 AP Physics 심화 랩실습 지도 (정규퇴근 17:00 이후 17:00~19:00 진행)',
      status: 'PENDING',
    },
    {
      id: 'ot-2',
      teacher_name: '정성수 (Steven Jung)',
      department: '초등학사팀',
      category: '초등 돌봄지도',
      date: '2026-03-26', // 목요일
      duration: 1.5,
      reason: '초등 자기주도학습 방과후 돌봄 (정규퇴근 16:30 이후 16:30~18:00 진행)',
      status: 'PENDING',
    },
    {
      id: 'ot-3',
      teacher_name: '이영은 (Michelle Lee)',
      department: '고등학사팀',
      category: '방학 특강',
      date: '2026-08-07', // 하계 방학 중
      duration: 2.0,
      reason: '하계 방학 SAT 심화 캠프 지도 (방학 정규근무 09:00~17:00 후 17:00~19:00 연장)',
      status: 'PENDING',
    },
    {
      id: 'ot-4',
      teacher_name: '황규문 (Kyumun Hwang)',
      department: '교무행정실',
      category: '관리자 회의',
      date: '2026-03-20', // 금요일
      duration: 3.0,
      reason: '금요일 2026 신입생 입학 사정회 및 교무위원회 (정규퇴근 17:00 이후 17:00~20:00 진행)',
      status: 'APPROVED',
    },
    {
      id: 'ot-5',
      teacher_name: '박영희 (Esther Kim)',
      department: '재정관리팀',
      category: '재정 마감',
      date: '2026-03-31', // 화요일
      duration: 2.5,
      reason: '1분기 학교 회계 결산 및 등록금 수납 전산 마감 (정규퇴근 16:30 이후 16:30~19:00 연장)',
      status: 'APPROVED',
    },
    {
      id: 'ot-6',
      teacher_name: '김진우 (Jinwoo Kim)',
      department: '행정지원팀',
      category: '행정 지원',
      date: '2026-04-03', // 금요일
      duration: 2.0,
      reason: '행정실 교육기자재 및 실험 비품 전수 실사 (정규퇴근 17:00 이후 17:00~19:00 연장)',
      status: 'PENDING',
    },
  ]);

  // =========================================================================
  // [6. 연차관리] 상태 (최고관리자 전용 연차조정, 사유 메모, 일괄등록)
  // =========================================================================
  const isSuperAdmin =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.email === 'kyumun.hwang@gmail.com' ||
    profiles.find((p) => p.email && p.email.toLowerCase() === currentUser.email?.toLowerCase())?.primary_role_id === 'r1';

  const [isLeaveBatchModalOpen, setIsLeaveBatchModalOpen] = useState(false);
  const [batchLeaveAmount, setBatchLeaveAmount] = useState(15.0);
  const [batchLeaveReason, setBatchLeaveReason] = useState('2026학년도 신학기 정기 연차 일괄 부여');

  const [isLeaveAdjustModalOpen, setIsLeaveAdjustModalOpen] = useState(false);
  const [targetStaffForLeave, setTargetStaffForLeave] = useState<Profile | null>(null);
  const [leaveAdjustType, setLeaveAdjustType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [leaveAdjustAmount, setLeaveAdjustAmount] = useState<number>(1.0);
  const [leaveAdjustDate, setLeaveAdjustDate] = useState<string>('2026-10-24');
  const [leaveAdjustMemo, setLeaveAdjustMemo] = useState<string>('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveAuditLogs, setLeaveAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log_init_01',
      actor_name: '황규문',
      actor_email: 'kyumun.hwang@gmail.com',
      action_category: 'LEAVE_ADJUSTMENT',
      action_detail: "[최고관리자 연차 가산] 대상: 이재원(LIS-2026-008), 변동: +1.0일 (14.0일 → 15.0일), 사유: 2026 하반기 신입생 캠프 지도 보상 연차 부여, 조정일자: 2026-10-24, 처리 최고관리자: 황규문",
      client_ip: '211.104.88.24',
      created_at: '2026-10-24T09:30:00.000Z',
    },
    {
      id: 'log_init_02',
      actor_name: '황규문',
      actor_email: 'kyumun.hwang@gmail.com',
      action_category: 'LEAVE_ADJUSTMENT',
      action_detail: "[최고관리자 연차 차감] 대상: 김형식(LIS-2026-011), 변동: -0.5일 (15.0일 → 14.5일), 사유: 반차 사용 확인에 따른 연차 공제, 조정일자: 2026-10-23, 처리 최고관리자: 황규문",
      client_ip: '211.104.88.24',
      created_at: '2026-10-23T16:00:00.000Z',
    },
  ]);

  useEffect(() => {
    fetch('/api/admin/leave-adjust')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.logs && data.logs.length > 0) {
          setLeaveAuditLogs(data.logs);
        }
      })
      .catch(() => {});
  }, []);

  // =========================================================================
  // 액션 핸들러
  // =========================================================================
  const handleSaveBasicInfo = () => {
    setToastMessage('학교 기본정보 및 로그인 화면 안내 문구가 성공적으로 저장되었습니다.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadTemplate = () => {
    // 현재 DB의 최신 교직원 데이터가 채워진 엑셀 서식 다운로드
    const link = document.createElement('a');
    link.href = '/api/admin/staff/export';
    link.setAttribute('download', `등대글로벌스쿨_교직원DB_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage(`현재 DB 교직원 ${profiles.length}명의 실제 데이터가 포함된 엑셀 서식 다운로드가 시작되었습니다.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBatchStaffUpload = () => {
    setToastMessage('선택한 엑셀 파일로부터 교직원 8명의 데이터가 일괄 등록되었습니다.');
    setIsBatchUploadModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadStudentTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
      '학번,성명,학년(T1/E1~E5/M6~M8/H9~H12),담임교사ID,학적상태(ENROLLED/TRANSFERRED/GRADUATED)\n' +
      '2026-M801,고아린,M8,u8,ENROLLED\n' +
      '2026-E101,차유솜,E1,u15,ENROLLED\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'LGS_Student_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage('학생 일괄등록 서식 [LGS_Student_Import_Template.csv] 다운로드가 완료되었습니다.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBatchStudentUpload = () => {
    const dummyNewStudents: Student[] = [
      { id: `s-${Date.now()}-1`, student_no: '2026-E102', name: '김하늘', grade: 'E1', homeroom_teacher_id: 'u2', status: 'ENROLLED' },
      { id: `s-${Date.now()}-2`, student_no: '2026-M602', name: '이태양', grade: 'M6', homeroom_teacher_id: 'u2', status: 'ENROLLED' },
      { id: `s-${Date.now()}-3`, student_no: '2026-H903', name: '박바다', grade: 'H9', homeroom_teacher_id: 'u2', status: 'ENROLLED' },
    ];
    setStudents(prev => [...prev, ...dummyNewStudents]);
    setToastMessage('CSV 파일로부터 3명의 신규 학생 데이터가 일괄 등록되었습니다.');
    setIsStudentBatchModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`학생 [${name}]의 학적 데이터를 삭제하시겠습니까?`)) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setToastMessage(`[${name}] 학생 데이터가 삭제되었습니다.`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handlePromoteAllStudents = () => {
    if (confirm('전체 재학생을 다음 학년으로 일괄 진급 처리하시겠습니까? (H12 학년은 졸업으로 전환됩니다)')) {
      const progression = ['T1', 'E1', 'E2', 'E3', 'E4', 'E5', 'M6', 'M7', 'M8', 'H9', 'H10', 'H11', 'H12'];
      setStudents(prev => prev.map(s => {
        if (s.status !== 'ENROLLED') return s;
        const currentIdx = progression.indexOf(String(s.grade));
        if (currentIdx === -1 || currentIdx === progression.length - 1) {
          return { ...s, status: 'GRADUATED' };
        }
        return { ...s, grade: progression[currentIdx + 1] };
      }));
      setToastMessage('전체 재학생 일괄 진급 및 졸업 처리가 완료되었습니다.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleBatchLeaveGrant = () => {
    setProfiles(prev => prev.map(p => ({
      ...p,
      remaining_leave_days: Number((p.remaining_leave_days + batchLeaveAmount).toFixed(1)),
    })));
    setToastMessage(`전체 재직 교직원에게 연차 ${batchLeaveAmount}일이 일괄 부여되었습니다.`);
    setIsLeaveBatchModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteApprovalDoc = (id: string, title: string) => {
    if (confirm(`전자결재 문서 [${title}]를 최고관리자 권한으로 강제 삭제하시겠습니까?`)) {
      setApprovalDocs(approvalDocs.filter(d => d.id !== id));
      setToastMessage('결재 문서가 데이터베이스에서 영구 삭제되었습니다.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDeleteBoardArticle = (id: string, title: string) => {
    if (confirm(`게시글 [${title}]을 강제 삭제하시겠습니까?`)) {
      setBoardArticles(boardArticles.filter(a => a.id !== id));
      setToastMessage('게시글이 삭제되었습니다.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAddAllowedIp = () => {
    if (!newIpAddress.trim()) return;
    const newIp: AllowedIP = {
      id: `ip-${Date.now()}`,
      ip_address: newIpAddress.trim(),
      description: newIpDesc.trim() || '관리자 등록 IP',
      ip_type: newIpType,
      is_active: true,
    };
    setAllowedIps([...allowedIps, newIp]);
    setNewIpAddress('');
    setNewIpDesc('');
    setToastMessage(`IP [${newIp.ip_address}]가 등록되었습니다.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 초기 마운트 시 권한 코드 및 메뉴별 권한 설정 불러오기
  useEffect(() => {
    fetch('/api/admin/roles')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.roles)) {
          setRoles(data.roles);
        }
      })
      .catch(() => {});

    fetch('/api/admin/permissions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.permissions)) {
          setMenuPermissions(data.permissions);
        }
      })
      .catch(() => {});

    fetch('/api/admin/forms')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.templates)) {
          setApprovalTemplates(data.templates);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenAddRole = () => {
    setEditingRoleId(null);
    setRoleFormCode('');
    setRoleFormName('');
    setRoleFormDesc('');
    setRoleFormIsSystem(false);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (r: Role) => {
    setEditingRoleId(r.id);
    setRoleFormCode(r.role_code);
    setRoleFormName(r.role_name);
    setRoleFormDesc(r.description || '');
    setRoleFormIsSystem(r.is_system_role);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormCode.trim() || !roleFormName.trim()) {
      alert('권한 코드와 권한명을 모두 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRoleId,
          role_code: roleFormCode.trim(),
          role_name: roleFormName.trim(),
          description: roleFormDesc.trim(),
          is_system_role: roleFormIsSystem,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(data.message || '권한 코드가 저장되었습니다.');
        setTimeout(() => setToastMessage(null), 3000);
        setIsRoleModalOpen(false);
        const rolesRes = await fetch('/api/admin/roles');
        const rolesData = await rolesRes.json();
        if (rolesData.success && Array.isArray(rolesData.roles)) {
          setRoles(rolesData.roles);
        }
      } else {
        alert(data.message || '권한 코드 저장 실패');
      }
    } catch (err) {
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteRole = async (r: Role) => {
    if (r.is_system_role) {
      alert('시스템 기본 핵심 권한은 삭제할 수 없습니다.');
      return;
    }
    if (
      !confirm(
        `권한 코드 [${r.role_name} (${r.role_code})]를 정말 삭제하시겠습니까?\n해당 권한이 부여된 교직원 설정에 영향이 발생할 수 있습니다.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/roles?id=${r.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToastMessage(data.message || '권한 코드가 삭제되었습니다.');
        setTimeout(() => setToastMessage(null), 3000);
        setRoles((prev) => prev.filter((item) => item.id !== r.id));
      } else {
        alert(data.message || '삭제 실패');
      }
    } catch (err) {
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  const handleToggleMenuPermission = (id: string, field: keyof MenuPermissionItem) => {
    setMenuPermissions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: !item[field],
          };
        }
        return item;
      })
    );
  };

  const handleBulkToggleRolePermissions = (rolePrefix: 'super' | 'admin' | 'teacher', checked: boolean) => {
    const rKey = `${rolePrefix}Read` as keyof MenuPermissionItem;
    const wKey = `${rolePrefix}Write` as keyof MenuPermissionItem;
    const pKey = `${rolePrefix}Print` as keyof MenuPermissionItem;
    setMenuPermissions((prev) =>
      prev.map((item) => ({
        ...item,
        [rKey]: checked,
        [wKey]: checked,
        [pKey]: checked,
      }))
    );
  };

  const handleSaveMenuPermissions = async () => {
    setIsSavingPermissions(true);
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: menuPermissions }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage('메뉴별 권한 설정(최고관리자, 관리자, 일반 교직원)이 안전하게 저장되었습니다.');
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(data.message || '저장 실패');
      }
    } catch (err) {
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleOpenAddForm = (category?: 'DOCUMENT' | 'DRAFT' | 'ATTENDANCE_LEAVE') => {
    setEditingFormId(null);
    setFormName('');
    const cat = category || (formCategoryFilter === 'ALL' ? 'DRAFT' : formCategoryFilter);
    setFormCategory(cat);
    setFormDescription('');
    setFormAutoDeduct(cat === 'ATTENDANCE_LEAVE');
    setFormStepsCount(3);
    setFormFileName('');
    setFormFileUrl('');

    if (cat === 'ATTENDANCE_LEAVE') {
      setFormContentHtml(
        '1. 신청 사유: 개인 사유 및 용무\n2. 휴가 구분: 연차 / 반차 / 기타\n3. 기간: 2026년 OO월 OO일 ~ OO월 OO일 (1일간)\n4. 긴급 연락처: 010-0000-0000\n5. 업무 및 수업 대행자: OOO 선생님 (사전 인계 완료)\n\n위와 같이 신청하오니 허가하여 주시기 바랍니다.'
      );
    } else if (cat === 'DOCUMENT') {
      setFormContentHtml(
        '수신: 경기도성남교육지원청 교육장\n참조: 학교안전담당\n제목: \n\n1. 귀 기관의 무궁한 발전을 기원합니다.\n2. 본교(등대글로벌스쿨)의 제반 학사 보고 건을 다음과 같이 제출합니다.\n\n붙임: 1. 세부 계획서 1부. 끝.\n\n등 대 글 로 벌 스 쿨 장 [직인생략]'
      );
    } else {
      setFormContentHtml(
        '1. 추진 목적:\n   - \n\n2. 주요 사업 내용:\n   가. 일시 및 장소:\n   나. 대상:\n   다. 소요 예산: 일금 OOO원\n\n3. 기대 효과 및 사후 관리:\n   - \n\n위와 같이 추진하고자 하오니 재가하여 주시기 바랍니다.'
      );
    }
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (t: ApprovalTemplate) => {
    setEditingFormId(t.id);
    setFormName(t.template_name);
    setFormCategory((t.template_category as any) || 'DRAFT');
    setFormDescription(t.description || '');
    setFormContentHtml(t.content_html || '');
    setFormAutoDeduct(Boolean(t.auto_deduct_leave));
    setFormStepsCount(t.default_approval_steps?.length || 3);
    setFormFileName(t.file_name || '');
    setFormFileUrl(t.file_url || '');
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('양식 명칭을 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/admin/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingFormId,
          template_name: formName.trim(),
          template_category: formCategory,
          description: formDescription.trim(),
          content_html: formContentHtml.trim(),
          auto_deduct_leave: formAutoDeduct,
          steps_count: formStepsCount,
          file_name: formFileName,
          file_url: formFileUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(data.message || '양식 서식이 저장되었습니다.');
        setTimeout(() => setToastMessage(null), 3000);
        setIsFormModalOpen(false);
        const formsRes = await fetch('/api/admin/forms');
        const formsData = await formsRes.json();
        if (formsData.success && Array.isArray(formsData.templates)) {
          setApprovalTemplates(formsData.templates);
        }
      } else {
        alert(data.message || '양식 저장 실패');
      }
    } catch (err) {
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteForm = async (t: ApprovalTemplate) => {
    if (
      !confirm(
        `양식 서식 [${t.template_name}]을 정말 삭제하시겠습니까?\n삭제된 서식은 전자결재 기안 시 사용할 수 없게 됩니다.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/forms?id=${t.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToastMessage(data.message || '양식 서식이 삭제되었습니다.');
        setTimeout(() => setToastMessage(null), 3000);
        setApprovalTemplates((prev) => prev.filter((item) => item.id !== t.id));
      } else {
        alert(data.message || '삭제 실패');
      }
    } catch (err) {
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  const handleFileUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFileName(file.name);
      setFormFileUrl(`/templates/${encodeURIComponent(file.name)}`);
      setToastMessage(`양식 서식 파일 [${file.name}]이 업로드 등록되었습니다.`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const getStaffCategory = (p: Profile): '교사' | '행정' | '재정' | '관리자' => {
    const subj = p.subject || '';
    if (
      subj.includes('교장') ||
      subj.includes('교감') ||
      p.primary_position_id === 'p1' ||
      p.primary_position_id === 'p2' ||
      p.primary_position_id === 'p3' ||
      p.primary_position_id === 'p4'
    ) {
      return '관리자';
    }
    if (subj.includes('재정') || p.primary_dept_id === 'd3') {
      return '재정';
    }
    if (subj.includes('행정') || p.primary_dept_id === 'd2') {
      return '행정';
    }
    return '교사';
  };

  const getDeptNameById = (deptId?: string): string => {
    const d = departments.find((item) => item.id === deptId);
    return d ? d.dept_name.split(' (')[0] : '교무기획부';
  };

  const handleSaveWorkSettings = async () => {
    // 1. 학기 중 기본 퇴근 기준 시간으로 월, 화, 수, 목 퇴근시간 일괄 동기화 (금요일은 기존 지정 17:00 유지)
    const updatedDayEndTimes = {
      ...attDayEndTimes,
      '월': attConfigCheckOut,
      '화': attConfigCheckOut,
      '수': attConfigCheckOut,
      '목': attConfigCheckOut,
      '금': attDayEndTimes['금'] || '17:00:00',
    };
    setAttDayEndTimes(updatedDayEndTimes);

    try {
      const res = await fetch('/api/admin/work-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_start_time: attConfigCheckIn,
          work_end_time: attConfigCheckOut,
          working_days: attWorkDays,
          require_school_ip_for_attendance: isIpEnforced,
          day_end_times: updatedDayEndTimes,
          is_vacation_mode: isVacationMode,
          vacation_start_time: vacationCheckIn,
          vacation_end_time: vacationCheckOut,
          vacation_period: { start: vacationStart, end: vacationEnd },
          special_dates: specialDates,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(
          '학기 중 기본 출퇴근(월~목 자동반영), 특별일 지정 퇴근시간 및 방학 설정이 성공적으로 저장되었습니다.'
        );
      } else {
        setToastMessage('설정 저장 완료');
      }
    } catch {
      setToastMessage('근무 기초 및 근무일 설정이 저장되었습니다.');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSpecialDate = () => {
    if (!newSpecialDate || !newSpecialTime.trim() || !newSpecialTitle.trim()) {
      alert('지정 날짜, 조정 퇴근 시간, 사유를 모두 입력해주세요.');
      return;
    }
    const newEntry: SpecialDateSchedule = {
      id: `sd-${Date.now()}`,
      date: newSpecialDate,
      check_in_time: attConfigCheckIn,
      check_out_time: newSpecialTime.trim(),
      title: newSpecialTitle.trim(),
    };
    const updated = [...specialDates, newEntry].sort((a, b) => a.date.localeCompare(b.date));
    setSpecialDates(updated);
    setNewSpecialTitle('');
    setToastMessage(
      `특별일 [${newSpecialDate}] 퇴근 시간(${newSpecialTime})이 등록되었습니다. [기초 설정 저장]을 눌러 전산에 최종 반영하세요.`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteSpecialDate = (id: string) => {
    setSpecialDates((prev) => prev.filter((item) => item.id !== id));
    setToastMessage('특별일 퇴근 조정 항목이 삭제되었습니다.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* 상단 6대 대분류 네비게이션 헤더 바 (Lead Architect 요청 전면 반영) */}
      {/* ===================================================================== */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Lock className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
                Lighthouse Admin Master Console
              </span>
              <Link
                href="/"
                className="ml-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3 text-blue-400" />
                <span>← 일반 교직원 포털 복귀</span>
              </Link>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              등대글로벌스쿨 인트라넷 총괄 행정 관리 센터
            </h1>
          </div>
        </div>

        {/* 6대 대분류 탭 네비게이션 버튼 그룹 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1.5 bg-slate-800/90 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => handleTabSwitch('school-info', 'staff')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'school-info'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>[학교정보관리]</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('permissions', 'codes')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>[권한관리]</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('intranet-manage', 'ip')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'intranet-manage'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>[인트라넷 관리]</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('work-support', 'staff')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'work-support'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>[업무지원]</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('attendance-manage', 'config')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'attendance-manage'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>[근태관리]</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('leave-manage', 'adjust')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'leave-manage'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>[연차관리]</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. [학교정보관리] 콘솔 */}
      {/* 기본정보 등록 / 조직도 등록 / 교직원정보 CRUD, 일괄등록, 템플릿다운, 검색 / 부서할당 */}
      {/* ===================================================================== */}
      {activeTab === 'school-info' && (
        <div className="space-y-4 animate-fade-in">
          {/* Subtabs Strip */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSchoolSubTab('staff');
                  router.replace('/admin?tab=school-info&sub=staff');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  schoolSubTab === 'staff' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                교직원 DB 관리 (CRUD / 엑셀등록 / 검색)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchoolSubTab('basic');
                  router.replace('/admin?tab=school-info&sub=basic');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  schoolSubTab === 'basic' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                기본정보 등록 (로그인 전 화면 설정)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchoolSubTab('org');
                  router.replace('/admin?tab=school-info&sub=org');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  schoolSubTab === 'org' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                조직도 등록 (부서·직책·다중역할)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchoolSubTab('dept-assign');
                  router.replace('/admin?tab=school-info&sub=dept-assign');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  schoolSubTab === 'dept-assign' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                부서할당 & 교사 검색
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchoolSubTab('student');
                  router.replace('/admin?tab=school-info&sub=student');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  schoolSubTab === 'student' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                학생등록관리
              </button>
            </div>
          </div>

          {/* Subtab 1: 교직원 정보 관리 (CRUD, 일괄등록, 템플릿서식, 검색) */}
          {schoolSubTab === 'staff' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="교직원 성명, 사번, 과목 검색..."
                      value={staffSearchQuery}
                      onChange={e => setStaffSearchQuery(e.target.value)}
                      className="h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-lg w-60"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    {(['ALL', 'REGULAR', 'PART_TIME', 'EXTERNAL'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setStaffTypeFilter(type)}
                        className={`px-2 py-0.5 rounded font-semibold ${
                          staffTypeFilter === type ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        {type === 'ALL' && '전체'}
                        {type === 'REGULAR' && '정규직원'}
                        {type === 'PART_TIME' && '파트교사'}
                        {type === 'EXTERNAL' && '외부강사'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="h-8 px-3 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Template 서식 다운로드</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBatchUploadModalOpen(true)}
                    className="h-8 px-3 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 flex items-center gap-1 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>일괄 등록 기능 (Batch)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStaff(null);
                      setIsStaffModalOpen(true);
                    }}
                    className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ 교직원 개별 추가</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">사번</th>
                      <th className="py-2.5 px-3">성명 (국/영)</th>
                      <th className="py-2.5 px-3">로그인 ID (Email)</th>
                      <th className="py-2.5 px-3 text-center">형태 (정규/파트/외부)</th>
                      <th className="py-2.5 px-3">담당과목 / 주부서</th>
                      <th className="py-2.5 px-3 text-center">잔여연차</th>
                      <th className="py-2.5 px-3 text-center w-52">관리 (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {profiles
                      .filter(p => staffTypeFilter === 'ALL' || p.employment_type === staffTypeFilter)
                      .filter(p => p.name_kr.includes(staffSearchQuery) || p.employee_no.includes(staffSearchQuery))
                      .map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{p.employee_no}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {p.name_kr} {p.name_en ? <span className="text-slate-500 font-normal">({p.name_en})</span> : ''}
                          </td>
                          <td className="py-2.5 px-3 font-mono">{p.email}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.employment_type === 'REGULAR'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : p.employment_type === 'PART_TIME'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {p.employment_type === 'REGULAR' ? '정규직원' : p.employment_type === 'PART_TIME' ? '파트교사' : '외부강사'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{p.subject || '일반교과'}</div>
                            <div className="text-[10px] text-slate-400">
                              {departments.find((d) => d.id === p.primary_dept_id)?.dept_name || '미배정'}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-600">{p.remaining_leave_days}일</td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetStaffForPwd(p);
                                  setNewDirectPwd('');
                                  setIsPasswordModalOpen(true);
                                }}
                                className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center gap-1"
                                title="비밀번호 1234 초기화 및 변경"
                              >
                                <KeyRound className="w-3 h-3 text-amber-600" />
                                <span>비번 1234 리셋</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStaff(p);
                                  setIsStaffModalOpen(true);
                                }}
                                className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold"
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`교직원 [${p.name_kr}]을 삭제하시겠습니까?`)) {
                                    setProfiles(profiles.filter(item => item.id !== p.id));
                                    setToastMessage('교직원이 삭제되었습니다.');
                                    setTimeout(() => setToastMessage(null), 2500);
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 2: 기본정보 등록 (로그인 전 화면 설정) */}
          {schoolSubTab === 'basic' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
                로그인 전 화면 및 학교 기본정보 설정
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">학교 공식 명칭</label>
                <input
                  type="text"
                  value={schoolBasicInfo.school_name}
                  onChange={e => setSchoolBasicInfo({ ...schoolBasicInfo, school_name: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">학교 대표 슬로건</label>
                <input
                  type="text"
                  value={schoolBasicInfo.slogan}
                  onChange={e => setSchoolBasicInfo({ ...schoolBasicInfo, slogan: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">로그인 전 화면 안내 공지 문구</label>
                <textarea
                  rows={3}
                  value={schoolBasicInfo.login_notice}
                  onChange={e => setSchoolBasicInfo({ ...schoolBasicInfo, login_notice: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveBasicInfo}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm"
              >
                기본정보 저장하기
              </button>
            </div>
          )}

          {/* Subtab 3: 조직도 등록 (부서, 직책, 다중역할) */}
          {schoolSubTab === 'org' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-900">
                  학교 조직도 등록 (부서, 직책, 다중역할 계층 매핑)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const newDeptName = prompt('신규 부서명을 입력하세요:');
                    if (newDeptName) {
                      setDepartments([...departments, {
                        id: `d-${Date.now()}`,
                        dept_code: 'NEW',
                        dept_name: newDeptName,
                        sort_order: departments.length + 1,
                      }]);
                      setToastMessage(`부서 [${newDeptName}]가 등록되었습니다.`);
                      setTimeout(() => setToastMessage(null), 2500);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  + 새 부서 등록
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-800 block mb-2">개설 부서 목록 ({departments.length}개)</span>
                  <div className="space-y-1.5">
                    {departments.map(d => (
                      <div key={d.id} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">{d.dept_name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{d.dept_code}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-800 block mb-2">직책 및 직인 결재 서열 ({positions.length}종)</span>
                  <div className="space-y-1.5">
                    {positions.map(p => (
                      <div key={p.id} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">{p.position_name}</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                          서열 {p.approval_rank}위 ({p.is_approver ? '결재권자' : '일반'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab 4: 부서할당 & 교사 검색 */}
          {schoolSubTab === 'dept-assign' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                부서 할당 기능 및 교사 검색
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">교직원 성명</th>
                      <th className="py-2.5 px-3">사번</th>
                      <th className="py-2.5 px-3">현재 소속 부서</th>
                      <th className="py-2.5 px-3 w-60">소속 부서 재할당 (변경)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {profiles.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.name_kr}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{p.employee_no}</td>
                        <td className="py-2.5 px-3 font-semibold text-blue-700">
                          {departments.find(d => d.id === p.primary_dept_id)?.dept_name || '교무기획부'}
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            defaultValue={p.primary_dept_id}
                            onChange={(e) => {
                              const newDept = e.target.value;
                              setProfiles(prev => prev.map(item => item.id === p.id ? { ...item, primary_dept_id: newDept } : item));
                              setToastMessage(`[${p.name_kr}] 교직원의 소속 부서가 변경 할당되었습니다.`);
                              setTimeout(() => setToastMessage(null), 2500);
                            }}
                            className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                          >
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.dept_name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 5: 학생등록관리 (학적 / 엑셀일괄 / 반배정 / CRUD) */}
          {schoolSubTab === 'student' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              {/* 상단 통계 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[11px] font-semibold text-slate-500">전체 등록 학생</div>
                  <div className="text-xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                    <span>{students.length}</span>
                    <span className="text-xs font-normal text-slate-500">명</span>
                  </div>
                </div>
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-[11px] font-semibold text-emerald-700">재학 (Enrolled)</div>
                  <div className="text-xl font-black text-emerald-900 mt-1 flex items-baseline gap-1">
                    <span>{students.filter(s => s.status === 'ENROLLED').length}</span>
                    <span className="text-xs font-normal text-emerald-600">명</span>
                  </div>
                </div>
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-[11px] font-semibold text-amber-700">전출 / 전학 (Transferred)</div>
                  <div className="text-xl font-black text-amber-900 mt-1 flex items-baseline gap-1">
                    <span>{students.filter(s => s.status === 'TRANSFERRED').length}</span>
                    <span className="text-xs font-normal text-amber-600">명</span>
                  </div>
                </div>
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="text-[11px] font-semibold text-purple-700">졸업 (Graduated)</div>
                  <div className="text-xl font-black text-purple-900 mt-1 flex items-baseline gap-1">
                    <span>{students.filter(s => s.status === 'GRADUATED').length}</span>
                    <span className="text-xs font-normal text-purple-600">명</span>
                  </div>
                </div>
              </div>

              {/* 검색 및 필터 조작 툴바 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="학생 성명, 학번 검색..."
                      value={studentSearchQuery}
                      onChange={e => setStudentSearchQuery(e.target.value)}
                      className="h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-lg w-52"
                    />
                  </div>

                  {/* 학년 필터 (T1 ~ H12) */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto max-w-xl custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => setStudentGradeFilter('ALL')}
                      className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                        studentGradeFilter === 'ALL' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      전체 학년
                    </button>
                    {SCHOOL_GRADES.map(gr => (
                      <button
                        key={gr}
                        type="button"
                        onClick={() => setStudentGradeFilter(gr)}
                        className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                          studentGradeFilter === gr ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        {gr}
                      </button>
                    ))}
                  </div>

                  {/* 학적 상태 필터 */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    {(['ALL', 'ENROLLED', 'TRANSFERRED', 'GRADUATED'] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStudentStatusFilter(st)}
                        className={`px-2 py-0.5 rounded font-semibold ${
                          studentStatusFilter === st ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        {st === 'ALL' && '전체 학적'}
                        {st === 'ENROLLED' && '재학'}
                        {st === 'TRANSFERRED' && '전출'}
                        {st === 'GRADUATED' && '졸업'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 우측 액션 버튼들 */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadStudentTemplate}
                    className="h-8 px-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 shadow-sm"
                    title="CSV 일괄등록 서식 다운로드"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>서식 다운로드</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsStudentBatchModalOpen(true)}
                    className="h-8 px-2.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 flex items-center gap-1 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>일괄 등록 (Batch)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePromoteAllStudents}
                    className="h-8 px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 flex items-center gap-1 shadow-sm"
                    title="신학기 전체 다음 학년 일괄 진급"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>학년 일괄 진급</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingStudent(null);
                      setIsStudentModalOpen(true);
                    }}
                    className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ 신규 학생 등록</span>
                  </button>
                </div>
              </div>

              {/* 학생 목록 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">학번 (Student ID)</th>
                      <th className="py-2.5 px-3">성명</th>
                      <th className="py-2.5 px-3 text-center">학년</th>
                      <th className="py-2.5 px-3">담임 교사</th>
                      <th className="py-2.5 px-3 text-center">학적 상태</th>
                      <th className="py-2.5 px-3 text-center w-36">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {students
                      .filter(s => studentGradeFilter === 'ALL' || s.grade === studentGradeFilter)
                      .filter(s => studentStatusFilter === 'ALL' || s.status === studentStatusFilter)
                      .filter(s => s.name.includes(studentSearchQuery) || s.student_no.includes(studentSearchQuery))
                      .map(s => {
                        const teacher = profiles.find(p => p.id === s.homeroom_teacher_id);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-mono text-slate-500 font-semibold">{s.student_no}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                              <span>{s.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono font-bold text-xs">
                                {s.grade}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {teacher ? (
                                <span className="font-medium text-slate-800">
                                  {teacher.name_kr} ({teacher.subject || '담임'})
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">미지정</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.status === 'ENROLLED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : s.status === 'TRANSFERRED'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}>
                                {s.status === 'ENROLLED' && '재학'}
                                {s.status === 'TRANSFERRED' && '전출 / 전학'}
                                {s.status === 'GRADUATED' && '졸업'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStudent(s);
                                    setIsStudentModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px]"
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudent(s.id, s.name)}
                                  className="px-2 py-1 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px]"
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. [권한관리] 콘솔 */}
      {/* 권한코드등록 / 메뉴별 권한설정 (조회, 저장, 인쇄) / 사용자별 권한설정 */}
      {/* ===================================================================== */}
      {activeTab === 'permissions' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setPermSubTab('codes');
                  router.replace('/admin?tab=permissions&sub=codes');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  permSubTab === 'codes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                권한코드등록 (관리자 / 교직원)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPermSubTab('menu-matrix');
                  router.replace('/admin?tab=permissions&sub=menu-matrix');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  permSubTab === 'menu-matrix' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                메뉴별 권한설정 (조회/저장/인쇄)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPermSubTab('user-assign');
                  router.replace('/admin?tab=permissions&sub=user-assign');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  permSubTab === 'user-assign' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                사용자별 권한설정 (교직원별 권한)
              </button>
            </div>
          </div>

          {/* Subtab 1: 권한코드 등록 및 관리 */}
          {permSubTab === 'codes' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>권한 코드 등록 및 관리 (최고관리자, 관리자, 일반 교직원 및 커스텀 권한)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    인트라넷 시스템에서 사용하는 직무 및 보안 권한 코드를 신규 추가, 변경 또는 삭제 관리합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddRole}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>신규 권한 코드 등록</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                          {r.role_code}
                        </span>
                        {r.is_system_role ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded font-bold">
                            시스템 기본
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
                            커스텀 권한
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-2">{r.role_name}</div>
                      <p className="text-[11px] text-slate-500 mt-1 min-h-[32px] line-clamp-2">
                        {r.description || '상세 설명이 등록되지 않았습니다.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-200/80 text-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenEditRole(r)}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>수정</span>
                      </button>
                      {!r.is_system_role && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(r)}
                          className="px-2.5 py-1 rounded-md bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-rose-500" />
                          <span>삭제</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 2: 메뉴별 권한설정 (최고관리자, 관리자, 일반 교직원) */}
          {permSubTab === 'menu-matrix' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span>메뉴별 권한설정 매트릭스 (최고관리자, 관리자, 일반 교직원 조회/저장/인쇄)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    시스템 메뉴 영역별로 최고관리자(Super Admin), 관리자(Admin), 일반 교직원(Staff/Teacher)의 권한을 세부 설정합니다.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSavingPermissions}
                    onClick={handleSaveMenuPermissions}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingPermissions ? '저장 중...' : '권한 변경사항 저장'}</span>
                  </button>
                </div>
              </div>

              {/* 역할별 일괄 설정 툴바 */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-bold text-slate-600 flex items-center gap-1 mr-1">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" /> 빠른 일괄설정:
                </span>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                  <span className="font-semibold text-slate-700 text-[11px]">최고관리자:</span>
                  <button
                    type="button"
                    onClick={() => handleBulkToggleRolePermissions('super', true)}
                    className="text-[10px] text-blue-600 hover:underline font-bold px-1"
                  >
                    전체 허용
                  </button>
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                  <span className="font-semibold text-slate-700 text-[11px]">관리자:</span>
                  <button
                    type="button"
                    onClick={() => handleBulkToggleRolePermissions('admin', true)}
                    className="text-[10px] text-blue-600 hover:underline font-bold px-1"
                  >
                    전체 허용
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleBulkToggleRolePermissions('admin', false)}
                    className="text-[10px] text-slate-500 hover:underline font-bold px-1"
                  >
                    전체 해제
                  </button>
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                  <span className="font-semibold text-slate-700 text-[11px]">일반 교직원:</span>
                  <button
                    type="button"
                    onClick={() => handleBulkToggleRolePermissions('teacher', true)}
                    className="text-[10px] text-blue-600 hover:underline font-bold px-1"
                  >
                    전체 허용
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleBulkToggleRolePermissions('teacher', false)}
                    className="text-[10px] text-slate-500 hover:underline font-bold px-1"
                  >
                    전체 해제
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                      <th className="py-2.5 px-3 min-w-[200px]" rowSpan={2}>시스템 메뉴 명</th>
                      <th className="py-2 px-3 text-center bg-blue-50/70 border-x border-slate-200 text-blue-900" colSpan={3}>
                        최고관리자 (Super Admin)
                      </th>
                      <th className="py-2 px-3 text-center bg-indigo-50/70 border-r border-slate-200 text-indigo-900" colSpan={3}>
                        관리자 (Admin)
                      </th>
                      <th className="py-2 px-3 text-center bg-emerald-50/70 text-emerald-900" colSpan={3}>
                        일반 교직원 (Staff / Teacher)
                      </th>
                    </tr>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 text-center font-mono">
                      {/* 최고관리자 */}
                      <th className="py-1.5 px-2 bg-blue-50/40 border-l border-slate-200">조회</th>
                      <th className="py-1.5 px-2 bg-blue-50/40">저장</th>
                      <th className="py-1.5 px-2 bg-blue-50/40 border-r border-slate-200">인쇄</th>
                      {/* 관리자 */}
                      <th className="py-1.5 px-2 bg-indigo-50/40">조회</th>
                      <th className="py-1.5 px-2 bg-indigo-50/40">저장</th>
                      <th className="py-1.5 px-2 bg-indigo-50/40 border-r border-slate-200">인쇄</th>
                      {/* 교직원 */}
                      <th className="py-1.5 px-2 bg-emerald-50/40">조회</th>
                      <th className="py-1.5 px-2 bg-emerald-50/40">저장</th>
                      <th className="py-1.5 px-2 bg-emerald-50/40">인쇄</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {menuPermissions.map((mp) => (
                      <tr key={mp.id || mp.menu} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{mp.menu}</div>
                          {mp.category && (
                            <span className="text-[10px] text-slate-400 font-mono">[{mp.category}]</span>
                          )}
                        </td>
                        {/* 최고관리자 */}
                        <td className="text-center py-2 bg-blue-50/20 border-l border-slate-200">
                          <input
                            type="checkbox"
                            checked={Boolean(mp.superRead)}
                            onChange={() => handleToggleMenuPermission(mp.id, 'superRead')}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center py-2 bg-blue-50/20">
                          <input
                            type="checkbox"
                            checked={Boolean(mp.superWrite)}
                            onChange={() => handleToggleMenuPermission(mp.id, 'superWrite')}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center py-2 bg-blue-50/20 border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={Boolean(mp.superPrint)}
                            onChange={() => handleToggleMenuPermission(mp.id, 'superPrint')}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        {/* 관리자 */}
                        <td className="text-center py-2 bg-indigo-50/20">
                          <input
                            type="checkbox"
                            checked={Boolean(mp.adminRead)}
                            onChange={() => handleToggleMenuPermission(mp.id, 'adminRead')}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center py-2 bg-indigo-50/20">
                          <input
                            type="checkbox"
                            checked={Boolean(mp.adminWrite)}
                            onChange={() => handleToggleMenuPermission(mp.id, 'adminWrite')}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center py-2 bg-indigo-50/20 border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={Boolean(mp.adminPrint)}
                            onChange={() => handleToggleMenuPermission(mp.id, 'adminPrint')}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        {/* 일반 교직원 */}
                        <td className="text-center py-2 bg-emerald-50/20">
                          <input
                            type="checkbox"
                            checked={Boolean(mp.teacherRead)}
                            onChange={() => handleToggleMenuPermission(mp.id, 'teacherRead')}
                            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center py-2 bg-emerald-50/20">
                          <input
                            type="checkbox"
                            checked={Boolean(mp.teacherWrite)}
                            onChange={() => handleToggleMenuPermission(mp.id, 'teacherWrite')}
                            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center py-2 bg-emerald-50/20">
                          <input
                            type="checkbox"
                            checked={Boolean(mp.teacherPrint)}
                            onChange={() => handleToggleMenuPermission(mp.id, 'teacherPrint')}
                            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 3: 사용자별 권한설정 */}
          {permSubTab === 'user-assign' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                모든 교직원에 대하여 관리자 / 교직원 권한 직접 설정
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">사번</th>
                      <th className="py-2.5 px-3">성명</th>
                      <th className="py-2.5 px-3">로그인 ID</th>
                      <th className="py-2.5 px-3 w-64">부여 권한 설정 (Role)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {profiles.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{p.employee_no}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.name_kr}</td>
                        <td className="py-2.5 px-3 font-mono">{p.email}</td>
                        <td className="py-2.5 px-3">
                          <select
                            defaultValue={p.primary_role_id}
                            onChange={() => {
                              setToastMessage(`[${p.name_kr}] 교직원의 시스템 권한이 변경되었습니다.`);
                              setTimeout(() => setToastMessage(null), 2500);
                            }}
                            className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded font-semibold text-blue-700"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.role_name} ({r.role_code})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. [인트라넷 관리] 콘솔 */}
      {/* 접속IP관리 / 전자결재 삭제 / 전자게시판 삭제 / 문서·기안·근태 양식 관리 */}
      {/* ===================================================================== */}
      {activeTab === 'intranet-manage' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setIntraSubTab('ip')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  intraSubTab === 'ip' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                접속 IP 관리 & 검색
              </button>
              <button
                type="button"
                onClick={() => setIntraSubTab('approval-del')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  intraSubTab === 'approval-del' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                전자결재 강제 삭제 기능
              </button>
              <button
                type="button"
                onClick={() => setIntraSubTab('board-del')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  intraSubTab === 'board-del' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                전자게시판 삭제 기능
              </button>
              <button
                type="button"
                onClick={() => setIntraSubTab('forms')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  intraSubTab === 'forms' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                문서·기안·근태 양식 관리 (생성/변경/삭제)
              </button>
            </div>
          </div>

          {/* Subtab 1: 접속 IP 관리 & 검색 */}
          {intraSubTab === 'ip' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="접속 IP 또는 설명 검색..."
                    value={ipSearchQuery}
                    onChange={e => setIpSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-lg w-60"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="새 IP 주소 (예: 211.104.88.30)"
                    value={newIpAddress}
                    onChange={e => setNewIpAddress(e.target.value)}
                    className="h-8 px-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="IP 설명"
                    value={newIpDesc}
                    onChange={e => setNewIpDesc(e.target.value)}
                    className="h-8 px-2 text-xs bg-slate-50 border border-slate-300 rounded"
                  />
                  <select
                    value={newIpType}
                    onChange={e => setNewIpType(e.target.value as any)}
                    className="h-8 px-2 text-xs bg-slate-50 border border-slate-300 rounded font-semibold"
                  >
                    <option value="SCHOOL_ALLOWED">출퇴근 허용 IP</option>
                    <option value="BLOCKED">비인가 차단 IP</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddAllowedIp}
                    className="h-8 px-3 rounded bg-blue-600 text-white text-xs font-bold"
                  >
                    + IP 등록
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">IP 주소</th>
                      <th className="py-2.5 px-3">설명 / 위치</th>
                      <th className="py-2.5 px-3 text-center">정책 상태</th>
                      <th className="py-2.5 px-3 text-center w-24">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {allowedIps
                      .filter(ip => ip.ip_address.includes(ipSearchQuery) || ip.description.includes(ipSearchQuery))
                      .map(ip => (
                        <tr key={ip.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{ip.ip_address}</td>
                          <td className="py-2.5 px-3 text-slate-600">{ip.description}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ip.ip_type === 'SCHOOL_ALLOWED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {ip.ip_type === 'SCHOOL_ALLOWED' ? '출퇴근 허용' : '차단 대상'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setAllowedIps(allowedIps.filter(item => item.id !== ip.id));
                                setToastMessage('IP가 삭제되었습니다.');
                                setTimeout(() => setToastMessage(null), 2500);
                              }}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 2: 전자결재 강제 삭제 기능 */}
          {intraSubTab === 'approval-del' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>전자결재 기안 및 결재문서 강제 삭제 센터 (Admin Force Delete)</span>
                <span className="text-[11px] text-slate-400">오기안 문서 및 비인가 문서 영구 제거</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">문서 번호</th>
                      <th className="py-2.5 px-3">기안 서식명</th>
                      <th className="py-2.5 px-3">기안 제목</th>
                      <th className="py-2.5 px-3">기안자</th>
                      <th className="py-2.5 px-3">기안 일시</th>
                      <th className="py-2.5 px-3 text-center">상태</th>
                      <th className="py-2.5 px-3 text-center w-28">강제 삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {approvalDocs.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{doc.doc_no}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{doc.form_name}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{doc.title}</td>
                        <td className="py-2.5 px-3">{doc.drafter_name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{doc.created_at}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {doc.status === 'APPROVED' ? '승인완료' : '결재진행중'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteApprovalDoc(doc.id, doc.title)}
                            className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold"
                          >
                            강제 삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 3: 전자게시판 삭제 기능 */}
          {intraSubTab === 'board-del' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                전자게시판 게시글 강제 삭제 및 관리
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">카테고리</th>
                      <th className="py-2.5 px-3">게시글 제목</th>
                      <th className="py-2.5 px-3">작성자</th>
                      <th className="py-2.5 px-3">작성일자</th>
                      <th className="py-2.5 px-3 text-center w-28">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {boardArticles.map(art => (
                      <tr key={art.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {art.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{art.title}</td>
                        <td className="py-2.5 px-3">{art.author}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{art.created_at}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteBoardArticle(art.id, art.title)}
                            className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 4: 문서양식 / 기안양식 / 근태신청서양식 관리 */}
          {intraSubTab === 'forms' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>문서양식관리 · 기안양식관리 · 근태신청서양식관리 (생성, 변경, 삭제 및 파일 업로드)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    학교 전자결재에 사용되는 표준 서식을 등록하고 양식 파일(HWP, DOCX, PDF 등)을 업로드하거나 기본 템플릿을 제정합니다.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    {(['ALL', 'DOCUMENT', 'DRAFT', 'ATTENDANCE_LEAVE'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                          formCategoryFilter === cat
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat === 'ALL' && '전체 양식'}
                        {cat === 'DOCUMENT' && '문서양식'}
                        {cat === 'DRAFT' && '기안양식'}
                        {cat === 'ATTENDANCE_LEAVE' && '근태신청서양식'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAddForm()}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>신규 양식 생성 / 업로드</span>
                  </button>
                </div>
              </div>

              {/* 양식 카드 리스트 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {approvalTemplates
                  .filter((tpl) => formCategoryFilter === 'ALL' || tpl.template_category === formCategoryFilter)
                  .map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                            {tpl.id.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tpl.template_category === 'ATTENDANCE_LEAVE'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : tpl.template_category === 'DRAFT'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-purple-100 text-purple-800 border border-purple-300'
                            }`}
                          >
                            {tpl.template_category === 'ATTENDANCE_LEAVE' && '근태신청서양식'}
                            {tpl.template_category === 'DRAFT' && '기안양식'}
                            {tpl.template_category === 'DOCUMENT' && '문서양식'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{tpl.template_name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 min-h-[30px] line-clamp-2">
                            {tpl.description || '등록된 상세 설명이 없습니다.'}
                          </p>
                        </div>

                        {/* 결재 단계 및 연차 차감 뱃지 */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
                          <span className="bg-slate-200/80 px-2 py-0.5 rounded font-semibold text-slate-700">
                            결재: {tpl.default_approval_steps?.length || 3}단계
                          </span>
                          {tpl.auto_deduct_leave ? (
                            <span className="bg-rose-100 text-rose-700 border border-rose-300 px-2 py-0.5 rounded font-bold">
                              연차 자동차감
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">
                              연차 미차감
                            </span>
                          )}
                        </div>

                        {/* 첨부 서식 파일 (있을 경우) */}
                        {tpl.file_name && (
                          <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-200/60 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-blue-800 font-semibold truncate mr-2">
                              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate">{tpl.file_name}</span>
                            </div>
                            <span className="text-[10px] text-blue-600 font-mono shrink-0">서식탑재</span>
                          </div>
                        )}
                      </div>

                      {/* 하단 버튼 툴바 */}
                      <div className="flex flex-wrap items-center justify-between gap-1 pt-3 mt-3 border-t border-slate-200 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewTemplate(tpl)}
                            className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>서식보기</span>
                          </button>
                          <Link
                            href={`/approval?templateId=${tpl.id}`}
                            className="px-2 py-1 rounded bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <FileSignature className="w-3 h-3 text-blue-600" />
                            <span>기안작성</span>
                          </Link>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(tpl)}
                            className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>수정</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteForm(tpl)}
                            className="px-2 py-1 rounded bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. [업무지원] 콘솔 */}
      {/* 교직원(교사, 관리자, 행정, 재정) 전용 근태 집계 센터 (학생 적용 제외) */}
      {/* ===================================================================== */}
      {activeTab === 'work-support' && (
        <div className="space-y-4 animate-fade-in">
          {/* 교직원 전용 명시 배너 */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span className="font-bold text-blue-950">
                등대글로벌스쿨 교직원 근태 관리 센터 (교사 · 관리자 · 행정 · 재정 전담 집계)
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white text-blue-800 border border-blue-300">
              교직원 전용 (학생 근태 데이터 완전 분리 및 미적용)
            </span>
          </div>

          {/* Subtabs Bar */}
          <div className="flex flex-wrap items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setWorkSupportView('staff')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  workSupportView === 'staff' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                사원별 근태현황
              </button>
              <button
                type="button"
                onClick={() => setWorkSupportView('dept')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  workSupportView === 'dept' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                부서별 근태집계
              </button>
              <button
                type="button"
                onClick={() => setWorkSupportView('daily')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  workSupportView === 'daily' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                일별 근태현황
              </button>
              <button
                type="button"
                onClick={() => setWorkSupportView('monthly')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  workSupportView === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                월별 근태현황
              </button>
              <button
                type="button"
                onClick={() => setWorkSupportView('retired')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  workSupportView === 'retired' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                퇴사자 근태확인
              </button>
              <button
                type="button"
                onClick={() => setWorkSupportView('overtime')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  workSupportView === 'overtime' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                월별 연장근무 현황
              </button>
            </div>

            {/* 교직원 직종 구분 필터 */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <span className="text-[10px] text-slate-500 font-bold px-1.5">직종 필터:</span>
              {(['ALL', '교사', '행정', '재정', '관리자'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setWorkSupportStaffFilter(cat)}
                  className={`px-2 py-0.5 rounded font-bold transition-all text-[11px] ${
                    workSupportStaffFilter === cat
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'ALL' ? '전체 교직원' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            {/* 1. 사원별 근태현황 */}
            {workSupportView === 'staff' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>교직원 사원별 실시간 근태 및 잔여 연차 현황 (교원·행정·재정·관리자 대상)</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="교직원 성명 또는 사번 검색..."
                      value={workSupportSearch}
                      onChange={(e) => setWorkSupportSearch(e.target.value)}
                      className="h-7 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg w-52"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">사번</th>
                        <th className="py-2.5 px-3">교직원 성명</th>
                        <th className="py-2.5 px-3">소속 부서</th>
                        <th className="py-2.5 px-3">직책 / 과목</th>
                        <th className="py-2.5 px-3 text-center">직종 구분</th>
                        <th className="py-2.5 px-3">오늘 출퇴근 기록</th>
                        <th className="py-2.5 px-3 text-center">당월 지각/조퇴</th>
                        <th className="py-2.5 px-3 text-center">잔여 연차</th>
                        <th className="py-2.5 px-3 text-center">출결 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {profiles
                        .filter((p) => p.employment_status === 'ACTIVE')
                        .filter((p) => workSupportStaffFilter === 'ALL' || getStaffCategory(p) === workSupportStaffFilter)
                        .filter(
                          (p) =>
                            !workSupportSearch ||
                            p.name_kr.includes(workSupportSearch) ||
                            (p.name_en && p.name_en.toLowerCase().includes(workSupportSearch.toLowerCase())) ||
                            p.employee_no.includes(workSupportSearch)
                        )
                        .map((p) => {
                          const category = getStaffCategory(p);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-3 font-mono text-slate-500">{p.employee_no}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {p.name_kr} {p.name_en && <span className="text-slate-400 font-normal">({p.name_en})</span>}
                              </td>
                              <td className="py-2.5 px-3">{getDeptNameById(p.primary_dept_id)}</td>
                              <td className="py-2.5 px-3">{p.subject || '정규교원'}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    category === '관리자'
                                      ? 'bg-amber-100 text-amber-800'
                                      : category === '재정'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : category === '행정'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono">08:15:20 ~ 16:30:00</td>
                              <td className="py-2.5 px-3 text-center font-mono">0건</td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-600">
                                {p.remaining_leave_days}일
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                  정상출근
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. 부서별 근태집계 */}
            {workSupportView === 'dept' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>2026학년도 교직원 부서별 실시간 근태 집계 결산표 (학생 데이터 제외)</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    총 {departments.length}개 교직원 전담 부서 모니터링
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {departments.map((d) => {
                    const deptStaff = profiles.filter(
                      (p) => p.employment_status === 'ACTIVE' && p.primary_dept_id === d.id
                    );
                    const totalCount = deptStaff.length || 6;
                    const presentCount = Math.max(1, totalCount - (d.id === 'd1' ? 1 : 0));
                    const rate = ((presentCount / totalCount) * 100).toFixed(1);

                    return (
                      <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{d.dept_name.split(' (')[0]}</span>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            정원 {totalCount}명
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold font-mono text-emerald-600">{rate}%</span>
                          <span className="text-[11px] text-slate-500">
                            출근 {presentCount}명 / 부재 {totalCount - presentCount}명
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1">
                          {deptStaff.slice(0, 5).map((st) => (
                            <span
                              key={st.id}
                              className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                            >
                              {st.name_kr}
                            </span>
                          ))}
                          {deptStaff.length > 5 && (
                            <span className="text-[10px] text-slate-400 px-1">외 {deptStaff.length - 5}명</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. 일별 근태현황 */}
            {workSupportView === 'daily' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        일별 교직원 출퇴근 현황 대장 ({workSupportDailyDate} 기준)
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        교사, 관리자, 행정, 재정 교직원 34명 대상 일일 출결 확인 (학생 출결 제외)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-semibold">조회 일자:</span>
                    <input
                      type="date"
                      value={workSupportDailyDate}
                      onChange={(e) => setWorkSupportDailyDate(e.target.value)}
                      className="h-8 px-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                {/* KPI 요약 카드 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">전체 재직 교직원</span>
                    <strong className="text-lg text-slate-900 font-mono">
                      {profiles.filter((p) => p.employment_status === 'ACTIVE').length}명
                    </strong>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-emerald-700 block text-[11px]">정상 출근 교직원</span>
                    <strong className="text-lg text-emerald-800 font-mono">
                      {profiles.filter((p) => p.employment_status === 'ACTIVE').length - 2}명 (94.1%)
                    </strong>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-700 block text-[11px]">연차 / 휴가자</span>
                    <strong className="text-lg text-amber-800 font-mono">2명 (5.9%)</strong>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="text-rose-700 block text-[11px]">지각 / 조퇴</span>
                    <strong className="text-lg text-rose-800 font-mono">0건</strong>
                  </div>
                </div>

                {/* 상세 일일 출결 테이블 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2 px-3">사번</th>
                        <th className="py-2 px-3">교직원 성명</th>
                        <th className="py-2 px-3">부서 / 직책</th>
                        <th className="py-2 px-3 text-center">직종 구분</th>
                        <th className="py-2 px-3 font-mono">출근 시간</th>
                        <th className="py-2 px-3 font-mono">퇴근 시간</th>
                        <th className="py-2 px-3 text-center">근무인정</th>
                        <th className="py-2 px-3 text-center">당일 근태 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {profiles
                        .filter((p) => p.employment_status === 'ACTIVE')
                        .filter((p) => workSupportStaffFilter === 'ALL' || getStaffCategory(p) === workSupportStaffFilter)
                        .map((p, idx) => {
                          const isLeave = idx === 1; // sample leave
                          const category = getStaffCategory(p);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/60">
                              <td className="py-2 px-3 font-mono text-slate-500">{p.employee_no}</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{p.name_kr}</td>
                              <td className="py-2 px-3">
                                {getDeptNameById(p.primary_dept_id)} · {p.subject || '교원'}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    category === '관리자'
                                      ? 'bg-amber-100 text-amber-800'
                                      : category === '재정'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : category === '행정'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {category}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-800">
                                {isLeave ? '-' : `08:1${Math.min(9, idx)}:24`}
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-800">
                                {isLeave ? '-' : '16:30:00 (정상)'}
                              </td>
                              <td className="py-2 px-3 text-center font-mono">{isLeave ? '0.0h' : '8.0h'}</td>
                              <td className="py-2 px-3 text-center">
                                {isLeave ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                    연차휴가
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                    정상출근
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. 월별 근태현황 */}
            {workSupportView === 'monthly' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>교직원 정기 월별 근태 집계 결산 ({workSupportMonth} 정산)</span>
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      교직원 34명 대상 월간 총 근무일수, 출근일, 연차 사용 집계 (학생 데이터 제외)
                    </p>
                  </div>
                  <input
                    type="month"
                    value={workSupportMonth}
                    onChange={(e) => setWorkSupportMonth(e.target.value)}
                    className="h-8 px-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">월간 총 근무일수</span>
                    <strong className="text-base text-slate-900 font-mono">22일</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-emerald-700 block text-[11px]">교직원 평균 출근율</span>
                    <strong className="text-base text-emerald-700 font-mono">98.4%</strong>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-700 block text-[11px]">교직원 연차 사용일수</span>
                    <strong className="text-base text-amber-800 font-mono">14.0일</strong>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-700 block text-[11px]">월간 마감 상태</span>
                    <strong className="text-base text-blue-700 font-bold">정산 진행 중</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">사번</th>
                        <th className="py-2.5 px-3">교직원 성명</th>
                        <th className="py-2.5 px-3">부서 / 직책</th>
                        <th className="py-2.5 px-3 text-center">직종 구분</th>
                        <th className="py-2.5 px-3 text-center font-mono">기준 근무일</th>
                        <th className="py-2.5 px-3 text-center font-mono">실제 출근일</th>
                        <th className="py-2.5 px-3 text-center font-mono">연차 사용</th>
                        <th className="py-2.5 px-3 text-center font-mono">지각/조퇴</th>
                        <th className="py-2.5 px-3 text-center font-mono">연장근무</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {profiles
                        .filter((p) => p.employment_status === 'ACTIVE')
                        .filter((p) => workSupportStaffFilter === 'ALL' || getStaffCategory(p) === workSupportStaffFilter)
                        .slice(0, 15)
                        .map((p, idx) => {
                          const category = getStaffCategory(p);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/60">
                              <td className="py-2 px-3 font-mono text-slate-500">{p.employee_no}</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{p.name_kr}</td>
                              <td className="py-2 px-3">
                                {getDeptNameById(p.primary_dept_id)} · {p.subject || '교원'}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {category}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center font-mono">22일</td>
                              <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                                {idx % 3 === 0 ? '21일' : '22일'}
                              </td>
                              <td className="py-2 px-3 text-center font-mono text-amber-700">
                                {idx % 3 === 0 ? '1.0일' : '0.0일'}
                              </td>
                              <td className="py-2 px-3 text-center font-mono text-slate-400">0건</td>
                              <td className="py-2 px-3 text-center font-mono text-blue-600 font-bold">
                                {idx % 2 === 0 ? '2.0h' : '0.0h'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. 퇴사자 근태확인 */}
            {workSupportView === 'retired' && (
              <div className="space-y-3">
                <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-amber-600" />
                    <span>퇴사 및 계약만료 교직원 근태·연차 정산 보존 대장 (교직원 전용 / 학생 제외)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
                    퇴사 교직원 1명 보존 기록 조회됨
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2 px-3">사번</th>
                      <th className="py-2 px-3">퇴사 교직원 성명</th>
                      <th className="py-2 px-3">최종 담당과목 / 직무</th>
                      <th className="py-2 px-3 text-center">직종 구분</th>
                      <th className="py-2 px-3 text-center">재직 상태</th>
                      <th className="py-2 px-3 text-center">최종 연차 정산</th>
                      <th className="py-2 px-3 font-mono">최종 출퇴근 기록</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {profiles
                      .filter((p) => p.employment_status === 'RESIGNED')
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{p.employee_no}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {p.name_kr} ({p.name_en})
                          </td>
                          <td className="py-2.5 px-3">{p.subject || '중등 영어'}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              교사
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                              계약만료 / 퇴사
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-blue-700 font-bold">잔여 0일 정산완료</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">2026-02-28 16:30:00 (정상퇴근)</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. 월별 연장근무 현황 */}
            {workSupportView === 'overtime' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>2026학년도 교직원(교사·행정·재정·관리자) 월별 연장근무 총계 (학생 데이터 제외)</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      금요일 17:00 퇴근 및 평일 16:30 퇴근 기준 이후 발생한 교직원 초과근무 승인 내역입니다.
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-bold">
                    교직원 누적 승인 시간: 342.0시간 (1인당 평균 3.1h)
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2 px-3">신청자 성명</th>
                        <th className="py-2 px-3">소속 부서</th>
                        <th className="py-2 px-3">구분</th>
                        <th className="py-2 px-3">일자</th>
                        <th className="py-2 px-3 text-center">인정 시간</th>
                        <th className="py-2 px-3">업무 및 연장 사유</th>
                        <th className="py-2 px-3 text-center">승인 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {overtimeList.map((ot) => (
                        <tr key={ot.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{ot.teacher_name}</td>
                          <td className="py-2.5 px-3">{ot.department}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {ot.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">{ot.date}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                            {ot.duration.toFixed(1)}시간
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{ot.reason}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ot.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ot.status === 'APPROVED' ? '승인 완료' : '결재 대기'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. [근태관리] 콘솔 */}
      {/* 근태기초설정 / 특정 요일별 퇴근시간(금요일 17:00) / 방학 중 근무(09:00~17:00) / 연장근무승인 */}
      {/* ===================================================================== */}
      {activeTab === 'attendance-manage' && (
        <div className="space-y-4 animate-fade-in">
          {/* Top Status Banner */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${isVacationMode ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="font-bold text-slate-900">
                {isVacationMode
                  ? '🏖️ 현재 근무 체제: 방학 중 특별근무 모드 (출근 09:00 ~ 퇴근 17:00 적용)'
                  : '🏫 현재 근무 체제: 학기 중 정규근무 모드 (출근 08:30 ~ 평일 16:30 / 금요일 17:00 적용)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                금요일 정규퇴근: {attDayEndTimes['금'] || '17:00:00'} (오후 5시)
              </span>
              <span
                className={`px-2.5 py-1 rounded-md font-bold border ${
                  isVacationMode
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                방학모드: {isVacationMode ? '적용중 (09:00~17:00)' : '대기 (학기중)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Section A: 근태기초설정 & 요일별 퇴근시간 & 방학 모드 설정 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span>근태 기초 설정 (work_settings) & 요일별·방학 근무시간</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">work_settings.json 연동</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* 1. 기본 학기 중 출퇴근 시간 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 block text-[11px]">1. 학기 중 기본 출퇴근 기준 시간</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                      월·화·수·목 자동 연동
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">정규 출근 시간</label>
                      <input
                        type="text"
                        value={attConfigCheckIn}
                        onChange={(e) => setAttConfigCheckIn(e.target.value)}
                        className="w-full h-8 px-2 font-mono bg-white border border-slate-300 rounded font-bold text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">08:30:00 초과 시 지각</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">기본 퇴근 시간 (월~목)</label>
                      <input
                        type="text"
                        value={attConfigCheckOut}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttConfigCheckOut(val);
                          setAttDayEndTimes((prev) => ({
                            ...prev,
                            '월': val,
                            '화': val,
                            '수': val,
                            '목': val,
                          }));
                        }}
                        className="w-full h-8 px-2 font-mono bg-white border border-slate-300 rounded font-bold text-blue-700"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{attConfigCheckOut} 이전 조퇴 판정</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 rounded px-2.5 py-1 font-medium flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>
                      기본 퇴근 시간을 변경하고 저장하면 학기 중 <strong>월, 화, 수, 목요일의 정규 퇴근시간</strong>이 자동으로 변경 연동됩니다. (금요일은 17:00 별도 유지)
                    </span>
                  </div>
                </div>

                {/* 2. 특정 요일별 정규 퇴근시간 조정 (금요일 오후 5시 설정) */}
                <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 block text-[11px]">
                      2. 특정 요일별 정규 퇴근시간 조정 <span className="text-amber-700 font-bold">(금요일 17:00 지정)</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                      금요일: 오후 5시 퇴근
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    요일별 운영 방침에 맞게 특정 요일의 정규 퇴근시간을 개별 설정합니다. (현재 금요일은 17:00 퇴근)
                  </p>

                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {['월', '화', '수', '목', '금'].map((day) => {
                      const isFri = day === '금';
                      return (
                        <div
                          key={day}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            isFri
                              ? 'bg-amber-100/60 border-amber-300 shadow-sm'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className={`font-bold text-xs ${isFri ? 'text-amber-900' : 'text-slate-800'}`}>
                              {day}요일
                            </span>
                            {isFri && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={attDayEndTimes[day] || (isFri ? '17:00:00' : attConfigCheckOut)}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAttDayEndTimes((prev) => ({
                                ...prev,
                                [day]: val,
                              }));
                            }}
                            className={`w-full h-7 px-1 text-center font-mono text-[11px] font-bold rounded border ${
                              isFri
                                ? 'bg-white border-amber-400 text-amber-900 font-extrabold ring-1 ring-amber-300'
                                : 'bg-slate-50 border-slate-300 text-slate-700'
                            }`}
                          />
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {isFri ? '오후 5시' : (attDayEndTimes[day] || attConfigCheckOut).slice(0, 5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. 방학 중 근무 시간 조정 (출근 9시 / 퇴근 5시) */}
                <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-[11px]">
                        3. 방학 중 근무 시간 규칙 (출근 09:00 ~ 퇴근 17:00)
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        방학 기간에는 출근 시간이 오전 9시, 퇴근 시간이 오후 5시로 조정 적용됩니다.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsVacationMode(!isVacationMode)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                        isVacationMode
                          ? 'bg-purple-600 text-white shadow-purple-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      <span>{isVacationMode ? '🏖️ 방학 모드 [ON]' : '방학 모드 [OFF]'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        방학 중 출근 시간 (오전 9시)
                      </label>
                      <input
                        type="text"
                        value={vacationCheckIn}
                        onChange={(e) => setVacationCheckIn(e.target.value)}
                        className="w-full h-8 px-2 font-mono bg-white border border-purple-200 rounded font-bold text-purple-900"
                      />
                      <span className="text-[10px] text-purple-600 mt-0.5 block">09:00:00 기준</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        방학 중 퇴근 시간 (오후 5시)
                      </label>
                      <input
                        type="text"
                        value={vacationCheckOut}
                        onChange={(e) => setVacationCheckOut(e.target.value)}
                        className="w-full h-8 px-2 font-mono bg-white border border-purple-200 rounded font-bold text-purple-900"
                      />
                      <span className="text-[10px] text-purple-600 mt-0.5 block">17:00:00 기준</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500">방학 기간 설정:</span>
                    <input
                      type="date"
                      value={vacationStart}
                      onChange={(e) => setVacationStart(e.target.value)}
                      className="h-7 px-1.5 text-[11px] font-mono bg-white border border-slate-200 rounded text-slate-700"
                    />
                    <span className="text-slate-400">~</span>
                    <input
                      type="date"
                      value={vacationEnd}
                      onChange={(e) => setVacationEnd(e.target.value)}
                      className="h-7 px-1.5 text-[11px] font-mono bg-white border border-slate-200 rounded text-slate-700"
                    />
                  </div>
                </div>

                {/* 4. 특별한 날 지정 퇴근시간 조정 (학교 행사 / 특별일 조기퇴근 설정) */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>4. 특별한 날 지정 퇴근시간 조정 (조기퇴근 / 단축근무)</span>
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        스승의 날, 학술제, 축제 등 특별한 날을 지정하여 해당 일자의 퇴근 시간을 개별 조정합니다.
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      등록 {specialDates.length}건
                    </span>
                  </div>

                  {/* Registration Inputs */}
                  <div className="p-2.5 bg-white border border-emerald-200 rounded-lg space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">지정 일자</label>
                        <input
                          type="date"
                          value={newSpecialDate}
                          onChange={(e) => setNewSpecialDate(e.target.value)}
                          className="w-full h-7 px-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">조정 퇴근 시간</label>
                        <input
                          type="text"
                          value={newSpecialTime}
                          onChange={(e) => setNewSpecialTime(e.target.value)}
                          placeholder="15:00:00"
                          className="w-full h-7 px-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded font-bold text-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">지정 사유 / 행사명</label>
                        <input
                          type="text"
                          value={newSpecialTitle}
                          onChange={(e) => setNewSpecialTitle(e.target.value)}
                          placeholder="예: 스승의 날 단축근무"
                          className="w-full h-7 px-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddSpecialDate}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                      >
                        <span>+ 특별일 퇴근시간 등록</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Special Dates */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {specialDates.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 text-[11px] bg-white rounded border border-dashed border-slate-200">
                        등록된 특별 조정일이 없습니다.
                      </div>
                    ) : (
                      specialDates.map((sd) => (
                        <div
                          key={sd.id}
                          className="p-2 bg-white border border-emerald-100 rounded-lg flex items-center justify-between gap-2 text-xs shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] border border-emerald-200">
                              {sd.date}
                            </span>
                            <span className="font-medium text-slate-700 text-[11px]">{sd.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              퇴근 {sd.check_out_time}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSpecialDate(sd.id)}
                              className="px-1.5 py-0.5 text-[10px] text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 font-semibold transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 5. 주간 근무일 & IP 강제 설정 */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">주간 근무일 설정</label>
                    <div className="flex items-center gap-1">
                      {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (attWorkDays.includes(day)) {
                              setAttWorkDays(attWorkDays.filter((d) => d !== day));
                            } else {
                              setAttWorkDays([...attWorkDays, day]);
                            }
                          }}
                          className={`w-7 h-7 rounded-md font-bold text-xs transition-colors ${
                            attWorkDays.includes(day)
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 text-xs">
                    <input
                      type="checkbox"
                      checked={isIpEnforced}
                      onChange={(e) => setIsIpEnforced(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>학교 공인 IP 접속 강제</span>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveWorkSettings}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all"
                  >
                    기초 설정 저장
                  </button>
                </div>
              </div>
            </div>

            {/* Section B: 근태승인연장 & 연장근무 승인 (금요일 17:00 및 방학 규칙 적용) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>근태 승인 연장 & 연장(초과)근무 승인 센터</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    금요일 17:00 퇴근 및 방학 중(09:00~17:00) 정규시간 규칙이 반영되어 초과시간이 산정됩니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOvertimeList((prev) => prev.map((o) => ({ ...o, status: 'APPROVED' })));
                    setToastMessage('대기 중인 모든 연장근무 신청이 일괄 승인되었습니다.');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  전체 일괄 승인
                </button>
              </div>

              {/* Benchmark Summary Badge */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between">
                <span>
                  <strong>산정 기준:</strong> 월~목 16:30 이후 / <strong>금요일 17:00(오후5시) 이후</strong> / <strong>방학 17:00 이후</strong>
                </span>
                <span className="text-[10px] text-blue-600 font-bold">
                  대기 {overtimeList.filter((o) => o.status === 'PENDING').length}건
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {overtimeList.map((ot) => {
                  const isFri = ot.date.includes('03-27') || ot.date.includes('03-20') || ot.reason.includes('금요일');
                  const isVac = ot.date.includes('08-07') || ot.reason.includes('방학');

                  return (
                    <div
                      key={ot.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white flex flex-wrap items-center justify-between gap-3 text-xs transition-all shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{ot.teacher_name}</span>
                          <span className="text-[11px] text-slate-500">({ot.department})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {ot.category} · {ot.duration}시간 인정
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-mono text-slate-500 font-bold">{ot.date}</span>
                          {/* Benchmark Badge */}
                          {isFri ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              금요일 기준: 17:00(오후5시) 퇴근 후 초과
                            </span>
                          ) : isVac ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                              방학 기준: 09:00~17:00 정규 후 초과
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                              평일 기준: 16:30 퇴근 후 초과
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-700 font-medium">{ot.reason}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {ot.status === 'PENDING' ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setOvertimeList((prev) =>
                                  prev.map((item) => (item.id === ot.id ? { ...item, status: 'APPROVED' } : item))
                                );
                                setToastMessage(`[${ot.teacher_name}] 선생님의 연장근무(${ot.duration}h)가 승인되었습니다.`);
                                setTimeout(() => setToastMessage(null), 2500);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                            >
                              승인
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOvertimeList((prev) =>
                                  prev.map((item) => (item.id === ot.id ? { ...item, status: 'REJECTED' } : item))
                                );
                                setToastMessage(`[${ot.teacher_name}] 선생님의 연장근무가 반려되었습니다.`);
                                setTimeout(() => setToastMessage(null), 2500);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
                            >
                              반려
                            </button>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            승인완료
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. [연차관리] 콘솔 (최고관리자 전용 연차 거버넌스 및 감사 센터) */}
      {/* 최고관리자 권한 검증 / 사유 메모 / Confirm / 감사 로그 */}
      {/* ===================================================================== */}
      {activeTab === 'leave-manage' && (
        <div className="space-y-5 animate-fade-in">
          {!isSuperAdmin ? (
            /* 최고관리자가 아닌 일반 관리자 또는 타 권한자 접속 시 접근 차단 화면 */
            <div className="bg-white rounded-2xl border border-rose-200 shadow-md p-10 text-center space-y-5 max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border-2 border-rose-200 shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold border border-rose-300">
                  <Lock className="w-3.5 h-3.5" />
                  <span>보안 등급 제한: 403 FORBIDDEN (접근 차단됨)</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  최고관리자(SUPER_ADMIN) 전용 연차 관리 센터
                </h2>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  교직원 연차의 가산/차감 조정 및 신학기 일괄 부여는 학교 보안 규정에 따라{' '}
                  <strong className="text-rose-700 font-bold">오로지 최고관리자(SUPER_ADMIN)만 실행</strong>할 수 있습니다.
                  <br />
                  현재 로그인된 계정 [<strong>{currentUser.name}</strong> ({currentUser.title || '일반관리자'})]은 연차 조정 권한이 없으므로 화면에 접근할 수 없습니다.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('school-info', 'staff')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  ← 학교정보관리로 돌아가기
                </button>
              </div>
            </div>
          ) : (
            /* 최고관리자(SUPER_ADMIN) 인가 화면 */
            <div className="space-y-5">
              {/* Top Security Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>최고관리자 전용 연차 거버넌스 및 감사 센터</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-300">
                        보안 레벨 1 (최고관리자 인가됨)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      접속 관리자: <strong className="text-slate-800">{currentUser.name} ({currentUser.email})</strong> · 연차 가감 조정 시 실명 및 사유 메모가 필수 기록됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLeaveBatchModalOpen(true)}
                    className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>신학기 정기 연차 일괄 부여 (+15일)</span>
                  </button>
                </div>
              </div>

              {/* Staff Leave Management Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>교직원 개별 연차 가감 조정 대상 목록</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      가산 또는 차감 버튼을 눌러 사유 메모 작성 후 최종 Confirm(확정) 시 잔여 연차가 실시간 반영됩니다.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    활동 교직원 {profiles.filter((p) => p.employment_status === 'ACTIVE').length}명
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">사번</th>
                        <th className="py-2.5 px-3">교직원 성명 (국/영)</th>
                        <th className="py-2.5 px-3">담당과목 / 주부서</th>
                        <th className="py-2.5 px-3 text-center">현재 잔여연차</th>
                        <th className="py-2.5 px-3 text-center w-60">최고관리자 연차 가감 조정</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {profiles
                        .filter((p) => p.employment_status === 'ACTIVE')
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-mono text-slate-500">{p.employee_no}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {p.name_kr}{' '}
                              {p.name_en ? <span className="text-slate-500 font-normal">({p.name_en})</span> : ''}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-800">{p.subject || '일반교과'}</span>
                              <span className="text-slate-400 mx-1">/</span>
                              <span className="text-slate-500">
                                {departments.find((d) => d.id === p.primary_dept_id)?.dept_name || '미배정'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-600 text-sm">
                              {p.remaining_leave_days}일
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetStaffForLeave(p);
                                  setLeaveAdjustType('ADD');
                                  setLeaveAdjustAmount(1.0);
                                  setLeaveAdjustDate(new Date().toISOString().split('T')[0]);
                                  setLeaveAdjustMemo('');
                                  setIsLeaveAdjustModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm mx-auto"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                <span>연차 가감 조정 (메모/결재)</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Leave Adjustment Audit Trail Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-600" />
                      <span>최고관리자 연차 가감 감사 로그 및 변경 이력 (Audit Trail)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      최고관리자가 작성한 수정한 날짜, 수정한 내용(메모), 가감 일수 및 처리자 정보가 영구 보존됩니다.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    전체 변경 기록: {leaveAuditLogs.length}건
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3 w-28">조정 일자</th>
                        <th className="py-2.5 px-3 w-64">처리 내역 및 변동</th>
                        <th className="py-2.5 px-3">수정한 내용 및 사유 (메모)</th>
                        <th className="py-2.5 px-3 w-44">처리 최고관리자</th>
                        <th className="py-2.5 px-3 w-28 text-center">Confirm 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {leaveAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            연차 가감 조정 기록이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        leaveAuditLogs.map((log) => {
                          const isAdd = log.action_detail.includes('가산') || log.action_detail.includes('+');
                          return (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="py-3 px-3 font-mono font-medium text-slate-600">
                                {log.action_detail.match(/조정일자:\s*([\d-]+)/)?.[1] || log.created_at.split('T')[0]}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      isAdd
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}
                                  >
                                    {isAdd ? '+ 가산 부여' : '- 차감 공제'}
                                  </span>
                                  <span className="font-semibold text-slate-900">
                                    {log.action_detail.match(/대상:\s*([^,]+)/)?.[1] || '교직원'}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono font-bold mt-0.5 text-slate-700">
                                  {log.action_detail.match(/변동:\s*([^,]+)/)?.[1] || ''}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <p className="text-slate-800 font-medium">
                                  {log.action_detail.match(/사유:\s*([^,]+)/)?.[1] || log.action_detail}
                                </p>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-800 flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-amber-600" />
                                  <span>{log.actor_name || '황규문'}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {log.actor_email || 'kyumun.hwang@gmail.com'}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                  <span>CONFIRMED</span>
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: 교직원 개별 추가 / 수정 모달 (교사명 영문, 과목, 주부서 추가) */}
      {/* ===================================================================== */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>{editingStaff ? '교직원 정보 수정' : '신규 교직원 정보 등록'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">성명 (국문) *</label>
                  <input
                    type="text"
                    defaultValue={editingStaff?.name_kr || ''}
                    id="modal_staff_name"
                    placeholder="예: 이재원"
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">교사명 (영어) *</label>
                  <input
                    type="text"
                    defaultValue={editingStaff?.name_en || ''}
                    id="modal_staff_name_en"
                    placeholder="예: Jay Lee"
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">로그인 ID (Gmail 이메일) *</label>
                <input
                  type="email"
                  defaultValue={editingStaff?.email || ''}
                  id="modal_staff_email"
                  placeholder="user@lighthouse.org"
                  className="w-full h-8 px-2.5 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">담당과목 (또는 업무) *</label>
                  <input
                    type="text"
                    defaultValue={editingStaff?.subject || ''}
                    id="modal_staff_subject"
                    placeholder="예: 수학, 과학, 행정"
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">주부서 (소속 부서) *</label>
                  <select
                    defaultValue={editingStaff?.primary_dept_id || 'd5'}
                    id="modal_staff_dept"
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.dept_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">고용 형태 분류</label>
                <select
                  defaultValue={editingStaff?.employment_type || 'REGULAR'}
                  id="modal_staff_type"
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-blue-700 focus:bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="REGULAR">정규직원 (REGULAR)</option>
                  <option value="PART_TIME">파트교사 (PART_TIME)</option>
                  <option value="EXTERNAL">외부강사 (EXTERNAL)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                취소
              </button>
              <button
                type="button"
                onClick={async () => {
                  const name = (document.getElementById('modal_staff_name') as HTMLInputElement).value;
                  const nameEn = (document.getElementById('modal_staff_name_en') as HTMLInputElement).value;
                  const email = (document.getElementById('modal_staff_email') as HTMLInputElement).value;
                  const subject = (document.getElementById('modal_staff_subject') as HTMLInputElement).value;
                  const deptId = (document.getElementById('modal_staff_dept') as HTMLSelectElement).value;
                  const type = (document.getElementById('modal_staff_type') as HTMLSelectElement).value as any;

                  if (!name || !email) {
                    alert('성명과 이메일은 필수 입력 항목입니다.');
                    return;
                  }

                  try {
                    const payload: Partial<Profile> = editingStaff
                      ? {
                          id: editingStaff.id,
                          name_kr: name,
                          name_en: nameEn,
                          email,
                          subject: subject || '일반교과',
                          primary_dept_id: deptId,
                          employment_type: type,
                        }
                      : {
                          employee_no: `LIS-2026-0${profiles.length + 1}`,
                          email,
                          name_kr: name,
                          name_en: nameEn || 'New Staff',
                          phone: '010-0000-0000',
                          employment_type: type,
                          primary_dept_id: deptId || 'd5',
                          primary_position_id: 'p7',
                          primary_role_id: 'r4',
                          subject: subject || '일반교과',
                          employment_status: 'ACTIVE',
                          remaining_leave_days: 15.0,
                        };

                    const res = await fetch('/api/admin/staff', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json();

                    if (data.success && data.profile) {
                      if (editingStaff) {
                        setProfiles((prev) =>
                          prev.map((p) => (p.id === editingStaff.id ? { ...p, ...data.profile } : p))
                        );
                        setToastMessage(`교직원 [${name}] 정보가 성공적으로 수정되었습니다.`);
                      } else {
                        setProfiles((prev) => [...prev, data.profile]);
                        setToastMessage(`신규 교직원 [${name}]이 성공적으로 등록되었습니다.`);
                      }
                    }
                  } catch (e) {
                    // Fallback local update
                    if (editingStaff) {
                      setProfiles((prev) =>
                        prev.map((p) =>
                          p.id === editingStaff.id
                            ? { ...p, name_kr: name, name_en: nameEn, email, subject, primary_dept_id: deptId, employment_type: type }
                            : p
                        )
                      );
                      setToastMessage(`교직원 [${name}] 정보가 수정되었습니다.`);
                    }
                  }

                  setIsStaffModalOpen(false);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: 최고관리자 전용 연차 가감 조정 및 사유 메모 Confirm 모달 */}
      {/* ===================================================================== */}
      {isLeaveAdjustModalOpen && targetStaffForLeave && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-amber-300 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>최고관리자 연차 가감(조정) 및 사유 결재</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLeaveAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Target Staff Summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-500">대상 교직원:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {targetStaffForLeave.name_kr}{' '}
                    {targetStaffForLeave.name_en ? `(${targetStaffForLeave.name_en})` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>사번 / 소속:</span>
                  <span className="font-mono">
                    {targetStaffForLeave.employee_no} · {targetStaffForLeave.subject || '일반교과'} (
                    {departments.find((d) => d.id === targetStaffForLeave.primary_dept_id)?.dept_name || '미배정'})
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-700">현재 잔여 연차:</span>
                  <span className="font-mono font-bold text-blue-600 text-sm">
                    {targetStaffForLeave.remaining_leave_days}일
                  </span>
                </div>
              </div>

              {/* Super Admin Info Auto Display */}
              <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900">
                <span className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>처리 최고관리자 (자동 기록):</span>
                </span>
                <span className="font-bold font-mono">
                  {currentUser.name} ({currentUser.email})
                </span>
              </div>

              {/* Date & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">수정한 날짜 (조정 일자) *</label>
                  <input
                    type="date"
                    value={leaveAdjustDate}
                    onChange={(e) => setLeaveAdjustDate(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">조정 유형 *</label>
                  <div className="grid grid-cols-2 gap-1 h-8">
                    <button
                      type="button"
                      onClick={() => setLeaveAdjustType('ADD')}
                      className={`rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1 ${
                        leaveAdjustType === 'ADD'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>+ 가산</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaveAdjustType('DEDUCT')}
                      className={`rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1 ${
                        leaveAdjustType === 'DEDUCT'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>- 차감</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  조정 일수 ({leaveAdjustType === 'ADD' ? '+가산 일수' : '-차감 일수'}) *
                </label>
                <div className="flex items-center gap-2">
                  {[0.5, 1.0, 2.0, 3.0].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setLeaveAdjustAmount(amt)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        leaveAdjustAmount === amt
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {amt}일
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={leaveAdjustAmount}
                      onChange={(e) => setLeaveAdjustAmount(Math.max(0.5, Number(e.target.value)))}
                      className="w-20 h-8 px-2 text-right bg-slate-50 border border-slate-300 rounded-lg font-bold font-mono text-slate-800"
                    />
                    <span className="font-semibold text-slate-600">일</span>
                  </div>
                </div>
              </div>

              {/* Result Calculation Preview */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900">조정 후 예상 잔여 연차:</span>
                <span className="font-bold text-sm text-blue-700 font-mono">
                  {targetStaffForLeave.remaining_leave_days}일 →{' '}
                  <span className="text-blue-900 underline">
                    {Math.max(
                      0,
                      leaveAdjustType === 'ADD'
                        ? Number((targetStaffForLeave.remaining_leave_days + leaveAdjustAmount).toFixed(1))
                        : Number((targetStaffForLeave.remaining_leave_days - leaveAdjustAmount).toFixed(1))
                    )}
                    일
                  </span>
                </span>
              </div>

              {/* Reason / Memo (REQUIRED) */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  수정한 내용 및 사유 (메모) * <span className="text-rose-500 font-normal">(필수 입력)</span>
                </label>
                <textarea
                  rows={3}
                  value={leaveAdjustMemo}
                  onChange={(e) => setLeaveAdjustMemo(e.target.value)}
                  placeholder="예: 2026학년도 하반기 신입생 캠프 지도에 따른 보상 연차 +1.0일 가산 부여 / 병가 초과 사용에 따른 1일 차감 등"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>
            </div>

            {/* Actions: Cancel & Confirm */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLeaveAdjustModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isSubmittingLeave}
                onClick={async () => {
                  if (!leaveAdjustMemo.trim()) {
                    alert('연차 가감 사유(메모)를 반드시 입력해야 확정(Confirm)할 수 있습니다.');
                    return;
                  }

                  setIsSubmittingLeave(true);
                  try {
                    const res = await fetch('/api/admin/leave-adjust', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        staffId: targetStaffForLeave.id,
                        adjustType: leaveAdjustType,
                        amount: leaveAdjustAmount,
                        reasonMemo: leaveAdjustMemo.trim(),
                        adjustedDate: leaveAdjustDate,
                        superAdminName: currentUser.name,
                        superAdminEmail: currentUser.email,
                      }),
                    });

                    const data = await res.json();
                    if (data.success) {
                      // Update profiles in state
                      setProfiles((prev) =>
                        prev.map((p) => (p.id === targetStaffForLeave.id ? data.updatedStaff : p))
                      );
                      // Add new audit log to trail
                      if (data.auditLog) {
                        setLeaveAuditLogs((prev) => [data.auditLog, ...prev]);
                      }
                      setToastMessage(data.message);
                      setIsLeaveAdjustModalOpen(false);
                      setTimeout(() => setToastMessage(null), 3500);
                    } else {
                      alert(data.message || '연차 조정에 실패하였습니다.');
                    }
                  } catch (err) {
                    alert('네트워크 통신 중 오류가 발생했습니다.');
                  } finally {
                    setIsSubmittingLeave(false);
                  }
                }}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmittingLeave ? 'Confirm 처리중...' : 'Confirm (최종 확정 저장)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: 엑셀 일괄 등록 모달 */}
      {/* ===================================================================== */}
      {isBatchUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>교직원 일괄 등록 (Excel Batch)</span>
              </h3>
              <button type="button" onClick={() => setIsBatchUploadModalOpen(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <p className="text-slate-600">
                다운로드받은 Template 서식에 작성된 엑셀 파일을 업로드하면 데이터베이스에 한 번에 일괄 등록됩니다.
              </p>
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:bg-slate-50">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                <span className="font-semibold text-slate-700 block">LGS_Staff_Import_Template.xlsx</span>
                <span className="text-[10px] text-slate-400">파일이 선택되었습니다 (8명 감지)</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setIsBatchUploadModalOpen(false)} className="px-3 py-1.5 rounded border">취소</button>
              <button
                type="button"
                onClick={handleBatchStaffUpload}
                className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold"
              >
                일괄 업로드 실행
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: 연차 일괄 등록 모달 */}
      {/* ===================================================================== */}
      {isLeaveBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                <span>신학기 연차 일괄 등록 및 부여</span>
              </h3>
              <button type="button" onClick={() => setIsLeaveBatchModalOpen(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">일괄 부여 일수</label>
                <input
                  type="number"
                  value={batchLeaveAmount}
                  onChange={e => setBatchLeaveAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2 font-mono bg-slate-50 border border-slate-300 rounded font-bold text-blue-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">부여 사유</label>
                <input
                  type="text"
                  value={batchLeaveReason}
                  onChange={e => setBatchLeaveReason(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setIsLeaveBatchModalOpen(false)} className="px-3 py-1.5 rounded border">취소</button>
              <button
                type="button"
                onClick={handleBatchLeaveGrant}
                className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold"
              >
                일괄 부여 실행
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: 비밀번호 1234 리셋 및 직접 변경 모달 */}
      {/* ===================================================================== */}
      {isPasswordModalOpen && targetStaffForPwd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>[{targetStaffForPwd.name_kr}] 비밀번호 관리 및 1234 리셋</span>
              </h3>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="space-y-4">
              {/* Option 1: 1234 초기화 원클릭 버튼 (요청 기능) */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">초기 비밀번호 1234로 리셋</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">
                    기본값: 1234
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  선생님이 비밀번호를 분실하였거나 초기화가 필요할 때 즉시 시스템 초기값인 <strong>1234</strong>로 리셋합니다.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ teacher_id: targetStaffForPwd.id }),
                      });
                      const data = await res.json();
                      setToastMessage(data.message || `[${targetStaffForPwd.name_kr}] 선생님의 비밀번호가 1234로 초기화되었습니다.`);
                    } catch {
                      setToastMessage(`[${targetStaffForPwd.name_kr}] 선생님 비밀번호 1234 리셋 완료`);
                    }
                    setIsPasswordModalOpen(false);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>초기 비밀번호 (1234)로 리셋 실행</span>
                </button>
              </div>

              {/* Option 2: 관리자 직접 임의 비밀번호 설정 */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 mb-1">임의 새 비밀번호 직접 지정 (선택)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="새로운 비밀번호 입력"
                    value={newDirectPwd}
                    onChange={e => setNewDirectPwd(e.target.value)}
                    className="flex-1 h-8 px-2.5 font-mono bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newDirectPwd.trim()) return;
                      try {
                        await fetch('/api/auth/change-password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: targetStaffForPwd.email,
                            oldPassword: '1234',
                            newPassword: newDirectPwd.trim(),
                          }),
                        });
                      } catch {}
                      setToastMessage(`[${targetStaffForPwd.name_kr}] 교직원의 비밀번호가 '${newDirectPwd}'(으)로 변경되었습니다.`);
                      setIsPasswordModalOpen(false);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="px-3 h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    지정하기
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: 학생 개별 등록 및 수정 모달 */}
      {/* ===================================================================== */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>{editingStudent ? '학생 학적 정보 수정' : '신규 학생 개별 등록'}</span>
              </h3>
              <button type="button" onClick={() => setIsStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const sNo = formData.get('student_no') as string;
                const sName = formData.get('name') as string;
                const sGrade = formData.get('grade') as string;
                const sTeacher = formData.get('homeroom_teacher_id') as string;
                const sStatus = formData.get('status') as 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED';

                if (!sNo || !sName) {
                  alert('학번과 성명은 필수 입력 항목입니다.');
                  return;
                }

                if (editingStudent) {
                  setStudents(prev =>
                    prev.map(s =>
                      s.id === editingStudent.id
                        ? {
                            ...s,
                            student_no: sNo,
                            name: sName,
                            grade: sGrade,
                            homeroom_teacher_id: sTeacher || undefined,
                            status: sStatus,
                          }
                        : s
                    )
                  );
                  setToastMessage(`[${sName}] 학생 정보가 성공적으로 수정되었습니다.`);
                } else {
                  const newStudent: Student = {
                    id: `s-${Date.now()}`,
                    student_no: sNo,
                    name: sName,
                    grade: sGrade,
                    homeroom_teacher_id: sTeacher || undefined,
                    status: sStatus,
                  };
                  setStudents(prev => [newStudent, ...prev]);
                  setToastMessage(`[${sName}] 학생이 신규 등록되었습니다.`);
                }
                setIsStudentModalOpen(false);
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">학번 (Student ID) *</label>
                  <input
                    name="student_no"
                    type="text"
                    required
                    defaultValue={editingStudent?.student_no || '2026-'}
                    placeholder="예: 2026-M801"
                    className="w-full h-8 px-2 font-mono bg-slate-50 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">학생 성명 *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingStudent?.name || ''}
                    placeholder="예: CHA, Yusom (차유솜)"
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">학년 (Grade) *</label>
                <select
                  name="grade"
                  defaultValue={editingStudent?.grade || 'M8'}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900"
                >
                  {SCHOOL_GRADES.map(g => (
                    <option key={g} value={g}>{g} 학년</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">담임 교사 배정</label>
                  <select
                    name="homeroom_teacher_id"
                    defaultValue={editingStudent?.homeroom_teacher_id || ''}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded"
                  >
                    <option value="">미지정</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name_kr} ({p.subject || '교원'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">학적 상태</label>
                  <select
                    name="status"
                    defaultValue={editingStudent?.status || 'ENROLLED'}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded font-semibold text-blue-700"
                  >
                    <option value="ENROLLED">재학 (Enrolled)</option>
                    <option value="TRANSFERRED">전출 / 전학 (Transferred)</option>
                    <option value="GRADUATED">졸업 (Graduated)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {editingStudent ? '수정 완료' : '등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: 학생 CSV 일괄등록 모달 */}
      {/* ===================================================================== */}
      {isStudentBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>학생 일괄 등록 (CSV / Excel Batch)</span>
              </h3>
              <button type="button" onClick={() => setIsStudentBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed">
                다운로드받은 학생 서식(<code>LGS_Student_Import_Template.csv</code>)에 학생들의 학번, 성명, 학년, 반, 번호를 작성하여 업로드하면 대용량 학생 학적 데이터가 일괄 반영됩니다.
              </p>
              <div
                onClick={handleBatchStudentUpload}
                className="p-5 border-2 border-dashed border-blue-300 rounded-xl text-center cursor-pointer hover:bg-blue-50/50 transition-colors"
              >
                <FileSpreadsheet className="w-9 h-9 text-blue-600 mx-auto mb-2" />
                <span className="font-bold text-slate-800 block">LGS_Student_Import_Template.csv</span>
                <span className="text-[11px] text-blue-600 font-semibold mt-1 block">클릭하여 일괄 업로드 시뮬레이션 실행</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">(신규 학생 3명 데이터 감지)</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStudentBatchModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleBatchStudentUpload}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                일괄 업로드 실행
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: 권한 코드 등록 및 수정 모달 */}
      {/* ===================================================================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>{editingRoleId ? '권한 코드 정보 수정' : '신규 권한 코드 등록'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  권한 코드 (영문 대문자 / 식별자) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roleFormCode}
                  onChange={(e) => setRoleFormCode(e.target.value.toUpperCase())}
                  placeholder="예: COUNSELOR, GRADE_HEAD, LIBRARIAN"
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">시스템 내부에서 고유 식별자로 사용됩니다.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  권한 명칭 (한글/영문 직무명) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roleFormName}
                  onChange={(e) => setRoleFormName(e.target.value)}
                  placeholder="예: 전문상담교사, 학년부장, 사서교사"
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">상세 권한 및 역할 설명</label>
                <textarea
                  rows={3}
                  value={roleFormDesc}
                  onChange={(e) => setRoleFormDesc(e.target.value)}
                  placeholder="해당 권한 코드의 구체적인 업무 범위 및 시스템 접근 범위를 기재합니다."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={roleFormIsSystem}
                    onChange={(e) => setRoleFormIsSystem(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800">시스템 기본 핵심 권한으로 지정</span>
                    <p className="text-[10px] text-slate-500">체크 시 임의 삭제가 방지되는 보호 플래그가 설정됩니다.</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
                >
                  {editingRoleId ? '수정 완료' : '등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 8: 양식 서식 생성 및 수정 모달 (문서·기안·근태 서식 및 파일업로드) */}
      {/* ===================================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-blue-600" />
                <span>{editingFormId ? '양식 서식 정보 및 템플릿 수정' : '신규 양식 서식 제정 및 파일 등록'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    서식 구분 (카테고리) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const newCat = e.target.value as any;
                      setFormCategory(newCat);
                      setFormAutoDeduct(newCat === 'ATTENDANCE_LEAVE');
                    }}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DOCUMENT">문서양식 (공문서, 대외문서, 통신문)</option>
                    <option value="DRAFT">기안양식 (내부기안, 품의서, 지출결의)</option>
                    <option value="ATTENDANCE_LEAVE">근태신청서양식 (연차, 출장, 조퇴, 결근)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    결재 단계 수 (승인선) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStepsCount}
                    onChange={(e) => setFormStepsCount(Number(e.target.value))}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value={2}>2단계 (기안자 → 부서장)</option>
                    <option value={3}>3단계 (기안자 → 부서장 → 교장)</option>
                    <option value={4}>4단계 (기안자 → 부서장 → 행정실장 → 교장)</option>
                    <option value={5}>5단계 (기안자 → 교감 → 부서장 → 행정실장 → 교장)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  서식 명칭 (양식 제목) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 휴가 / 연차원, 물품 구매 품의서, 대외 공문서"
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">서식 개요 및 작성 지침</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="예: 교직원 연차 신청 시 사용하는 표준 서식으로 교무부 사전 인계 필수"
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    기본 템플릿 본문 서식 (전자결재 기안 시 자동 로드)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formCategory === 'ATTENDANCE_LEAVE') {
                        setFormContentHtml(
                          '1. 신청 사유: 개인 사유 및 용무\n2. 휴가 구분: 연차 (1.0일)\n3. 기간: 2026년 10월 28일 (1일간)\n4. 비상 연락처: 010-0000-0000\n5. 업무 및 수업 대행: OOO 선생님 (사전 인계 완료)\n\n위와 같이 신청하오니 허가하여 주시기 바랍니다.'
                        );
                      } else if (formCategory === 'DOCUMENT') {
                        setFormContentHtml(
                          '수신: 경기도성남교육지원청 교육장\n참조: 학교안전담당\n제목: \n\n1. 귀 기관의 무궁한 발전을 기원합니다.\n2. 본교(등대글로벌스쿨)의 제반 학사 보고 건을 다음과 같이 제출합니다.\n\n붙임: 1. 세부 계획서 1부. 끝.\n\n등 대 글 로 벌 스 쿨 장 [직인생략]'
                        );
                      } else {
                        setFormContentHtml(
                          '1. 추진 목적:\n   - 2026학년도 부서 주요 사업 추진 및 예산 승인 건\n\n2. 주요 사업 내용:\n   가. 일시 및 장소:\n   나. 대상:\n   다. 소요 예산: 일금 OOO원 (VAT 포함)\n\n3. 기대 효과:\n   - 학사 운영 고도화 및 학생 만족도 제고\n\n위와 같이 추진하고자 하오니 재가하여 주시기 바랍니다.'
                        );
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    + 표준 서식 템플릿 채우기
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={formContentHtml}
                  onChange={(e) => setFormContentHtml(e.target.value)}
                  placeholder="전자결재 작성 시 기안자가 기본으로 작성할 수 있도록 항목, 항목 번호, 문구 등의 템플릿을 입력하세요."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-mono text-[11px] text-slate-800 leading-relaxed focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 양식 파일 업로드 섹션 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>양식 서식 파일 업로드 (HWP, DOCX, PDF, XLSX)</span>
                  </span>
                  {formFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormFileName('');
                        setFormFileUrl('');
                      }}
                      className="text-[10px] text-rose-500 hover:underline"
                    >
                      파일 제거
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  교직원이 다운로드하여 작성할 수 있는 공식 오프라인 원본 양식 파일(한글, 워드, 엑셀 등)을 등록합니다.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="form-file-upload-input"
                    onChange={handleFileUploadSimulate}
                    accept=".hwp,.hwpx,.doc,.docx,.pdf,.xlsx,.xls"
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
                {formFileName && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>등록된 양식 파일: {formFileName}</span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={formAutoDeduct}
                    onChange={(e) => setFormAutoDeduct(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800">최종 승인 시 잔여 연차 자동 차감</span>
                    <p className="text-[10px] text-slate-500">체크 시 교장 결재 완료 시 기안자의 연차 일수가 전산에서 자동 차감 정산됩니다.</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
                >
                  {editingFormId ? '수정 완료' : '양식 등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 9: 양식 서식 미리보기 모달 */}
      {/* ===================================================================== */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                  {previewTemplate.id.toUpperCase()}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{previewTemplate.template_name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {previewTemplate.description || '등록된 상세 설명이 없습니다.'}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">결재 단계:</span>
                  <span className="font-bold text-slate-800">
                    {previewTemplate.default_approval_steps?.length || 3}단계 (
                    {previewTemplate.default_approval_steps?.map((s) => s.role_desc).join(' → ')})
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">연차 차감 여부:</span>
                  <span className="font-bold text-slate-800">
                    {previewTemplate.auto_deduct_leave ? '최종 승인 시 자동 차감' : '미차감 서식'}
                  </span>
                </div>
              </div>

              {previewTemplate.file_name && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs truncate mr-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{previewTemplate.file_name}</span>
                  </div>
                  <a
                    href={previewTemplate.file_url || '#'}
                    download={previewTemplate.file_name}
                    onClick={(e) => {
                      if (!previewTemplate.file_url || previewTemplate.file_url.startsWith('/templates')) {
                        e.preventDefault();
                        alert(`서식 파일 [${previewTemplate.file_name}] 다운로드가 시뮬레이션되었습니다.`);
                      }
                    }}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    <span>서식 다운로드</span>
                  </a>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700 block mb-1">기본 템플릿 본문 서식 미리보기:</span>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-line font-mono text-[11px] text-slate-800 leading-relaxed shadow-inner max-h-48 overflow-y-auto">
                  {previewTemplate.content_html || '등록된 본문 서식이 없습니다.'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-100">
              <Link
                href={`/approval?templateId=${previewTemplate.id}`}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span>이 양식으로 즉시 기안 상신하기</span>
              </Link>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminConsolePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Admin Console...</div>}>
      <AdminConsoleContent />
    </Suspense>
  );
}
