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
} from 'lucide-react';
import { Profile, AllowedIP, AuditLog, Department, Position, Role, Student } from '@/lib/types';
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
  const [schoolBasicInfo, setSchoolBasicInfo] = useState<SchoolBasicInfo>({
    school_name: '등대글로벌스쿨 (Lighthouse Global School)',
    slogan: 'Light to the World, Salt of the Earth',
    login_notice: '2026학년도 교직원 인트라넷입니다. 인가된 학교 IP망에서만 접속 및 출퇴근이 가능합니다.',
    global_announcement: '2026학년도 1학기 신학기 학사일정 및 교직원 워크숍 안내',
    admin_contact: '031-123-4567 (교무행정실)',
    logo_type: '2026_STANDARD',
  });

  // 부서 및 직책 마스터
  const [departments, setDepartments] = useState<Department[]>([
    { id: 'd1', dept_code: 'ACAD', dept_name: '교무기획부', sort_order: 1 },
    { id: 'd2', dept_code: 'ADMIN', dept_name: '행정실 / 재정부', sort_order: 2 },
    { id: 'd3', dept_code: 'SEC', dept_name: '중등학사팀', sort_order: 3 },
    { id: 'd4', dept_code: 'ELEM', dept_name: '초등학사팀', sort_order: 4 },
    { id: 'd5', dept_code: 'SAFE', dept_name: '학생생활안전부', sort_order: 5 },
  ]);

  const [positions, setPositions] = useState<Position[]>([
    { id: 'p1', position_code: 'PRIN', position_name: '학교장', is_approver: true, approval_rank: 1, sort_order: 1 },
    { id: 'p2', position_code: 'V_PRIN', position_name: '교감', is_approver: true, approval_rank: 2, sort_order: 2 },
    { id: 'p6', position_code: 'HEAD', position_name: '부장교사', is_approver: true, approval_rank: 3, sort_order: 3 },
    { id: 'p7', position_code: 'TEACH', position_name: '정규교사', is_approver: false, approval_rank: 4, sort_order: 4 },
    { id: 'p8', position_code: 'PART', position_name: '파트교사 / 외부강사', is_approver: false, approval_rank: 5, sort_order: 5 },
  ]);

  // 교직원 DB 목록 (검색 및 CRUD 연동)
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: 'u1',
      employee_no: 'LIS-2024-001',
      email: 'admin@lighthouse.org',
      name_kr: '정총괄',
      name_en: 'David Jung',
      phone: '010-1234-5678',
      employment_type: 'REGULAR',
      primary_dept_id: 'd2',
      primary_position_id: 'p6',
      primary_role_id: 'r1',
      subject: '행정총괄',
      employment_status: 'ACTIVE',
      remaining_leave_days: 15.0,
    },
    {
      id: 'u2',
      employee_no: 'LIS-2025-014',
      email: 'kim.teacher@lighthouse.org',
      name_kr: '김교사',
      name_en: 'Grace Kim',
      phone: '010-9876-5432',
      employment_type: 'REGULAR',
      primary_dept_id: 'd3',
      primary_position_id: 'p6',
      primary_role_id: 'r4',
      subject: '과학 (Science)',
      homeroom_grade: 3,
      homeroom_class: 2,
      employment_status: 'ACTIVE',
      remaining_leave_days: 11.5,
    },
    {
      id: 'u3',
      employee_no: 'LIS-2022-003',
      email: 'lee.principal@lighthouse.org',
      name_kr: '이교장',
      name_en: 'Samuel Lee',
      phone: '010-5555-4321',
      employment_type: 'REGULAR',
      primary_dept_id: 'd1',
      primary_position_id: 'p1',
      primary_role_id: 'r3',
      subject: '학교경영',
      employment_status: 'ACTIVE',
      remaining_leave_days: 20.0,
    },
    {
      id: 'u4',
      employee_no: 'LIS-2023-009',
      email: 'park.head@lighthouse.org',
      name_kr: '박교무',
      name_en: 'Peter Park',
      phone: '010-7777-8888',
      employment_type: 'REGULAR',
      primary_dept_id: 'd1',
      primary_position_id: 'p6',
      primary_role_id: 'r3',
      subject: '수학 (Math)',
      employment_status: 'ACTIVE',
      remaining_leave_days: 13.0,
    },
    {
      id: 'u5',
      employee_no: 'LIS-2026-031',
      email: 'choi.part@lighthouse.org',
      name_kr: '최파트',
      name_en: 'Chloe Choi',
      phone: '010-3333-2222',
      employment_type: 'PART_TIME',
      primary_dept_id: 'd4',
      primary_position_id: 'p8',
      primary_role_id: 'r4',
      subject: '음악 (Music)',
      employment_status: 'ACTIVE',
      remaining_leave_days: 7.0,
    },
    {
      id: 'u6',
      employee_no: 'LIS-2026-052',
      email: 'john.ext@lighthouse.org',
      name_kr: '존강사',
      name_en: 'John External',
      phone: '010-4444-1111',
      employment_type: 'EXTERNAL',
      primary_dept_id: 'd3',
      primary_position_id: 'p8',
      primary_role_id: 'r5',
      subject: 'SAT Writing',
      employment_status: 'ACTIVE',
      remaining_leave_days: 0.0,
    },
    {
      id: 'u7',
      employee_no: 'LIS-2023-099',
      email: 'retired.kim@lighthouse.org',
      name_kr: '김퇴직',
      name_en: 'Retired Kim',
      phone: '010-0000-0000',
      employment_type: 'REGULAR',
      primary_dept_id: 'd3',
      primary_position_id: 'p7',
      primary_role_id: 'r4',
      subject: '사회 (History)',
      employment_status: 'RESIGNED', // 퇴사자
      remaining_leave_days: 0.0,
    },
  ]);

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
  // [1-5. 학생등록관리] 상태 및 데이터 (T1 ~ H12 등대글로벌스쿨 전용 학년 편제)
  // =========================================================================
  const [students, setStudents] = useState<Student[]>([
    { id: 's1', student_no: '2026-M801', name: '강서준', grade: 'M8', homeroom_teacher_id: 'u2', status: 'ENROLLED' },
    { id: 's2', student_no: '2026-M802', name: '김민재', grade: 'M8', homeroom_teacher_id: 'u2', status: 'ENROLLED' },
    { id: 's3', student_no: '2026-M803', name: '이지우', grade: 'M8', homeroom_teacher_id: 'u2', status: 'ENROLLED' },
    { id: 's4', student_no: '2026-M701', name: '박도윤', grade: 'M7', homeroom_teacher_id: 'u2', status: 'ENROLLED' },
    { id: 's5', student_no: '2026-M601', name: '정하은', grade: 'M6', homeroom_teacher_id: 'u2', status: 'ENROLLED' },
    { id: 's6', student_no: '2026-E501', name: '최예준', grade: 'E5', homeroom_teacher_id: 'u3', status: 'ENROLLED' },
    { id: 's7', student_no: '2026-E101', name: '한지아', grade: 'E1', homeroom_teacher_id: 'u3', status: 'ENROLLED' },
    { id: 's8', student_no: '2026-T101', name: '송민호', grade: 'T1', homeroom_teacher_id: 'u4', status: 'ENROLLED' },
    { id: 's9', student_no: '2026-H1201', name: '임수빈', grade: 'H12', homeroom_teacher_id: 'u5', status: 'ENROLLED' },
    { id: 's10', student_no: '2025-H1299', name: '윤유학', grade: 'H12', homeroom_teacher_id: 'u3', status: 'TRANSFERRED' },
  ]);

  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState<'ALL' | string>('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED'>('ALL');

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isStudentBatchModalOpen, setIsStudentBatchModalOpen] = useState(false);

  // =========================================================================
  // [2. 권한관리] 상태
  // =========================================================================
  const [roles, setRoles] = useState<Role[]>([
    { id: 'r1', role_code: 'SUPER_ADMIN', role_name: '최고관리자 (Super Admin)', is_system_role: true },
    { id: 'r2', role_code: 'ADMIN', role_name: '기관행정관리자 (Admin)', is_system_role: true },
    { id: 'r3', role_code: 'APPROVER', role_name: '결재권자 / 부서장', is_system_role: false },
    { id: 'r4', role_code: 'TEACHER', role_name: '정규/담임 교직원', is_system_role: false },
    { id: 'r5', role_code: 'VIEWER', role_name: '파트/외부강사 열람전용', is_system_role: false },
  ]);

  // 메뉴별 권한 매트릭스 (조회, 저장, 인쇄)
  const [menuPermissions, setMenuPermissions] = useState([
    { menu: '교직원 근태 / 출퇴근', adminRead: true, adminWrite: true, adminPrint: true, teacherRead: true, teacherWrite: true, teacherPrint: false },
    { menu: '반별 학생출결 Confirm', adminRead: true, adminWrite: true, adminPrint: true, teacherRead: true, teacherWrite: true, teacherPrint: true },
    { menu: '전자결재 기안 및 승인', adminRead: true, adminWrite: true, adminPrint: true, teacherRead: true, teacherWrite: true, teacherPrint: true },
    { menu: '학사일정 캘린더', adminRead: true, adminWrite: true, adminPrint: true, teacherRead: true, teacherWrite: false, teacherPrint: true },
    { menu: '전자게시판 및 회의록', adminRead: true, adminWrite: true, adminPrint: true, teacherRead: true, teacherWrite: true, teacherPrint: true },
    { menu: '최고관리자 콘솔', adminRead: true, adminWrite: true, adminPrint: true, teacherRead: false, teacherWrite: false, teacherPrint: false },
  ]);

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

  // 전자결재 목록 및 강제 삭제
  const [approvalDocs, setApprovalDocs] = useState<ApprovalDocAdmin[]>([
    { id: 'doc-1', doc_no: 'LIS-2026-0324', title: '중등 AP Physics 실험 비품 구입 품의서', drafter_name: '김교사', form_name: '지출결의서', created_at: '2026-03-24', status: 'PENDING' },
    { id: 'doc-2', doc_no: 'LIS-2026-0323', title: '2026학년도 봄 정기연차 신청원', drafter_name: '박교무', form_name: '휴가원', created_at: '2026-03-23', status: 'APPROVED' },
    { id: 'doc-3', doc_no: 'LIS-2026-0320', title: '잘못 기안된 테스트 결재문서', drafter_name: '정총괄', form_name: '일반기안문', created_at: '2026-03-20', status: 'PENDING' },
  ]);

  // 전자게시판 목록 및 강제 삭제
  const [boardArticles, setBoardArticles] = useState([
    { id: 'art-1', category: '공지사항', title: '2026학년도 1학기 신학기 학사일정 및 교직원 워크숍 안내', author: '박교무', created_at: '2026-03-24' },
    { id: 'art-2', category: '교무회의록', title: '제3차 교무기획위원회 정기 회의록 (생활지도)', author: '김교사', created_at: '2026-03-22' },
    { id: 'art-3', category: '자료실', title: '수업/행정 불필요 중복 테스트 파일', author: '정총괄', created_at: '2026-03-21' },
  ]);

  // 3대 양식 관리 (문서양식, 기안양식, 근태신청서양식)
  const [managedForms, setManagedForms] = useState<ManagedFormTemplate[]>([
    { id: 'f-1', type: 'ATTENDANCE_LEAVE', form_code: 'HR-LV-01', title: '휴가원 (연차/반차/병가/공가)', steps: 3, deducts_leave: true, description: '연차 자동 차감 연동 근태신청 서식' },
    { id: 'f-2', type: 'ATTENDANCE_LEAVE', form_code: 'HR-OT-02', title: '초과근무/연장근무 신청서', steps: 2, deducts_leave: false, description: '방과후 수업 및 야간자습 감독 승인 서식' },
    { id: 'f-3', type: 'DRAFT', form_code: 'DRF-GEN-01', title: '표준 일반기안문', steps: 3, deducts_leave: false, description: '학교 행정 및 학사 주요 정책 표준 기안 서식' },
    { id: 'f-4', type: 'DOCUMENT', form_code: 'FIN-EX-01', title: '지출결의서 및 물품구입품의서', steps: 4, deducts_leave: false, description: '예산 집행 및 행정실 경유 4단계 재정 서식' },
  ]);

  // =========================================================================
  // [4. 업무지원] 상태 (사원별, 부서별, 일별, 월별, 퇴사자, 월별연장근무)
  // =========================================================================

  // =========================================================================
  // [5. 근태관리] 상태 (근무기초, 근무일, 연장근무승인)
  // =========================================================================
  const [attConfigCheckIn, setAttConfigCheckIn] = useState('08:30:00');
  const [attConfigCheckOut, setAttConfigCheckOut] = useState('16:30:00');
  const [attWorkDays, setAttWorkDays] = useState(['월', '화', '수', '목', '금']);
  const [isIpEnforced, setIsIpEnforced] = useState(true);

  // 연장근무 신청 목록
  const [overtimeList, setOvertimeList] = useState<OvertimeRequest[]>([
    { id: 'ot-1', teacher_name: '김교사 (Grace Kim)', department: '중등학사팀', category: '방과후 수업', date: '2026-03-24', duration: 2.0, reason: '중등 AP Physics 심화 랩실습 지도', status: 'PENDING' },
    { id: 'ot-2', teacher_name: '박교무 (Peter Park)', department: '교무기획부', category: '야간 자습감독', date: '2026-03-23', duration: 3.0, reason: '고등부 야간 자기주도학습 지도', status: 'PENDING' },
    { id: 'ot-3', teacher_name: '정총괄 (David Jung)', department: '행정실', category: '입학설명회 지원', date: '2026-03-20', duration: 4.0, reason: '2026 신입생 설명회 학부모 상담', status: 'APPROVED' },
  ]);

  // =========================================================================
  // [6. 연차관리] 상태 (연차조정, 연차일괄등록)
  // =========================================================================
  const [isLeaveBatchModalOpen, setIsLeaveBatchModalOpen] = useState(false);
  const [batchLeaveAmount, setBatchLeaveAmount] = useState(15.0);
  const [batchLeaveReason, setBatchLeaveReason] = useState('2026학년도 신학기 정기 연차 일괄 부여');

  // =========================================================================
  // 액션 핸들러
  // =========================================================================
  const handleSaveBasicInfo = () => {
    setToastMessage('학교 기본정보 및 로그인 화면 안내 문구가 성공적으로 저장되었습니다.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadTemplate = () => {
    setToastMessage('교직원 일괄등록 엑셀 양식 [LGS_Staff_Import_Template.xlsx] 다운로드가 시작되었습니다.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBatchStaffUpload = () => {
    setToastMessage('선택한 엑셀 파일로부터 교직원 8명의 데이터가 일괄 등록되었습니다.');
    setIsBatchUploadModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadStudentTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
      '학번,성명,학년(T1/E1~E5/M6~M8/H9~H12),담임사번,학적상태(ENROLLED/TRANSFERRED/GRADUATED)\n' +
      '2026-M804,이새롬,M8,LIS-2025-014,ENROLLED\n' +
      '2026-H902,홍길동,H9,LIS-2025-014,ENROLLED\n';
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
                          <td className="py-2.5 px-3 font-bold text-slate-900">{p.name_kr} ({p.name_en})</td>
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
                          <td className="py-2.5 px-3 font-semibold">{p.subject || '행정'}</td>
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
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                              >
                                비번변경
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

          {/* Subtab 1: 권한코드 등록 (기본 Default 서브탭) */}
          {permSubTab === 'codes' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                권한 코드 등록 및 관리 (관리자, 교직원)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {roles.map(r => (
                  <div key={r.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-bold">
                        {r.role_code}
                      </span>
                      {r.is_system_role && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">고정</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1.5">{r.role_name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 2: 메뉴별 권한설정 (조회, 저장, 인쇄) */}
          {permSubTab === 'menu-matrix' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>모든 메뉴에 대한 조회(Read), 저장(Write), 인쇄(Print) 기능 권한 매트릭스</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage('메뉴별 조회/저장/인쇄 권한 설정이 전산에 동기화 저장되었습니다.');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  권한 변경사항 저장
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">시스템 메뉴 명</th>
                      <th className="py-2.5 px-3 text-center" colSpan={3}>최고관리자 (Admin)</th>
                      <th className="py-2.5 px-3 text-center" colSpan={3}>일반 교직원 (Staff/Teacher)</th>
                    </tr>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 text-center font-mono">
                      <th></th>
                      <th className="py-1">조회</th>
                      <th className="py-1">저장</th>
                      <th className="py-1">인쇄</th>
                      <th className="py-1">조회</th>
                      <th className="py-1">저장</th>
                      <th className="py-1">인쇄</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {menuPermissions.map((mp, idx) => (
                      <tr key={mp.menu} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{mp.menu}</td>
                        <td className="text-center"><input type="checkbox" defaultChecked={mp.adminRead} /></td>
                        <td className="text-center"><input type="checkbox" defaultChecked={mp.adminWrite} /></td>
                        <td className="text-center"><input type="checkbox" defaultChecked={mp.adminPrint} /></td>
                        <td className="text-center"><input type="checkbox" defaultChecked={mp.teacherRead} /></td>
                        <td className="text-center"><input type="checkbox" defaultChecked={mp.teacherWrite} /></td>
                        <td className="text-center"><input type="checkbox" defaultChecked={mp.teacherPrint} /></td>
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
                            <option value="r1">최고관리자 (Super Admin)</option>
                            <option value="r2">기관행정관리자 (Admin)</option>
                            <option value="r3">결재권자 / 부서장</option>
                            <option value="r4">일반 교직원 (Teacher)</option>
                            <option value="r5">열람전용 (Viewer)</option>
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
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    문서양식관리 · 기안양식관리 · 근태신청서양식관리 (생성, 변경, 삭제)
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    {(['ALL', 'DOCUMENT', 'DRAFT', 'ATTENDANCE_LEAVE'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormCategoryFilter(cat)}
                        className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                          formCategoryFilter === cat ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        {cat === 'ALL' && '전체 양식'}
                        {cat === 'DOCUMENT' && '문서양식'}
                        {cat === 'DRAFT' && '기안양식'}
                        {cat === 'ATTENDANCE_LEAVE' && '근태신청서양식'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newTitle = prompt('생성할 서식 명칭을 입력하세요:');
                    if (newTitle) {
                      setManagedForms([...managedForms, {
                        id: `f-${Date.now()}`,
                        type: formCategoryFilter === 'ALL' ? 'DRAFT' : formCategoryFilter,
                        form_code: 'NEW-01',
                        title: newTitle,
                        steps: 3,
                        deducts_leave: formCategoryFilter === 'ATTENDANCE_LEAVE',
                        description: '신규 제정 서식',
                      }]);
                      setToastMessage(`새 서식 [${newTitle}]이 등록되었습니다.`);
                      setTimeout(() => setToastMessage(null), 2500);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  + 신규 양식 생성
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {managedForms
                  .filter(fmt => formCategoryFilter === 'ALL' || fmt.type === formCategoryFilter)
                  .map(fmt => (
                  <div key={fmt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-bold">
                          {fmt.form_code}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          fmt.type === 'ATTENDANCE_LEAVE' ? 'bg-amber-100 text-amber-800' : fmt.type === 'DRAFT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {fmt.type === 'ATTENDANCE_LEAVE' && '근태신청서 양식'}
                          {fmt.type === 'DRAFT' && '기안 양식'}
                          {fmt.type === 'DOCUMENT' && '문서 양식'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">{fmt.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{fmt.description}</p>
                      <div className="text-[11px] text-slate-600 mt-2">
                        결재 단계: <strong>{fmt.steps}단계</strong> · 연차 차감: <strong>{fmt.deducts_leave ? '자동 차감' : '미차감'}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          const newName = prompt('서식 제목을 변경하세요:', fmt.title);
                          if (newName) {
                            setManagedForms(prev => prev.map(f => f.id === fmt.id ? { ...f, title: newName } : f));
                            setToastMessage('서식 제목이 변경되었습니다.');
                            setTimeout(() => setToastMessage(null), 2000);
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        변경
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManagedForms(managedForms.filter(f => f.id !== fmt.id));
                          setToastMessage('서식이 삭제되었습니다.');
                          setTimeout(() => setToastMessage(null), 2000);
                        }}
                        className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 text-xs font-semibold"
                      >
                        삭제
                      </button>
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
      {/* 사원별근태현황 / 부서별근태집계 / 일별근태현황 / 월별근태현황 / 퇴사자근태확인 / 월별연장근무현황 */}
      {/* ===================================================================== */}
      {activeTab === 'work-support' && (
        <div className="space-y-4 animate-fade-in">
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
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            {/* 1. 사원별 근태현황 */}
            {workSupportView === 'staff' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                  사원별 실시간 근태 및 잔여 연차 현황
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2 px-3">사번</th>
                      <th className="py-2 px-3">성명</th>
                      <th className="py-2 px-3">오늘 출퇴근 기록</th>
                      <th className="py-2 px-3 text-center">당월 지각/조퇴</th>
                      <th className="py-2 px-3 text-center">잔여 연차</th>
                      <th className="py-2 px-3 text-center">출결 상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {profiles.filter(p => p.employment_status === 'ACTIVE').map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{p.employee_no}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.name_kr}</td>
                        <td className="py-2.5 px-3 font-mono">08:15:20 ~ 16:30:00</td>
                        <td className="py-2.5 px-3 text-center font-mono">0건</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-600">{p.remaining_leave_days}일</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">정상출근</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. 부서별 근태집계 */}
            {workSupportView === 'dept' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                  2026학년도 부서별 근태 집계 결산표
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {departments.map(d => (
                    <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                      <span className="text-xs font-bold text-slate-900 block">{d.dept_name}</span>
                      <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">98.8%</div>
                      <span className="text-[11px] text-slate-500 block mt-1">정상출근율 (지각 1건 / 휴가 2건)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. 일별 근태현황 */}
            {workSupportView === 'daily' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                  일별 근태 현황 (2026년 3월 24일 기준)
                </h3>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs">
                  전체 재직 112명 중 출근 108명 (96.4%), 연차/출장 4명 (3.6%)
                </div>
              </div>
            )}

            {/* 4. 월별 근태현황 */}
            {workSupportView === 'monthly' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                  2026년 3월 정기 월별 근태 현황 결산
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex-1">
                    <span className="text-slate-500 block">총 근무일수</span>
                    <strong className="text-base text-slate-900 font-mono">22일</strong>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex-1">
                    <span className="text-slate-500 block">평균 출근율</span>
                    <strong className="text-base text-emerald-600 font-mono">98.4%</strong>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex-1">
                    <span className="text-slate-500 block">월간 마감 상태</span>
                    <strong className="text-base text-blue-600">정산 진행 중</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 5. 퇴사자 근태확인 */}
            {workSupportView === 'retired' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center justify-between">
                  <span>퇴사자 및 계약만료 교직원 근태 이력 확인 모드</span>
                  <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">퇴사 교원 1명 조회됨</span>
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2 px-3">사번</th>
                      <th className="py-2 px-3">퇴사 교원 성명</th>
                      <th className="py-2 px-3">최종 담당과목</th>
                      <th className="py-2 px-3 text-center">재직 상태</th>
                      <th className="py-2 px-3 font-mono">과거 최종 근태 기록</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {profiles.filter(p => p.employment_status === 'RESIGNED').map(p => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{p.employee_no}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.name_kr} ({p.name_en})</td>
                        <td className="py-2.5 px-3">{p.subject}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">퇴사/만료</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">2026-02-28 16:30:00 (정상퇴근)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. 월별 연장근무 현황 */}
            {workSupportView === 'overtime' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                  2026년 3월 부서별 / 개인별 월별 연장근무(초과근무) 총계
                </h3>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex justify-between items-center">
                  <span>금월 총 누적 연장근무 인정 시간: <strong>342.0시간</strong></span>
                  <span className="font-semibold text-slate-600">교원당 평균 3.1h 인정</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. [근태관리] 콘솔 */}
      {/* 근태기초설정 / 근무일설정 / 근무기초 설정 / 근태승인연장 / 연장근무승인 */}
      {/* ===================================================================== */}
      {activeTab === 'attendance-manage' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Section A: 근태기초설정 & 근무일설정 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span>근태 기초 설정 (work_settings) & 주간 근무일 설정</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">정규 출근 기준 시간</label>
                    <input
                      type="text"
                      value={attConfigCheckIn}
                      onChange={e => setAttConfigCheckIn(e.target.value)}
                      className="w-full h-8 px-2 font-mono bg-slate-50 border border-slate-300 rounded font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">08:30:00 초과 시 자동 지각 처리</span>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">정규 퇴근 기준 시간</label>
                    <input
                      type="text"
                      value={attConfigCheckOut}
                      onChange={e => setAttConfigCheckOut(e.target.value)}
                      className="w-full h-8 px-2 font-mono bg-slate-50 border border-slate-300 rounded font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">16:30:00 이전 퇴근 시 조퇴 판정</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">주간 법정 근무일 설정</label>
                  <div className="flex items-center gap-1.5">
                    {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (attWorkDays.includes(day)) {
                            setAttWorkDays(attWorkDays.filter(d => d !== day));
                          } else {
                            setAttWorkDays([...attWorkDays, day]);
                          }
                        }}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                          attWorkDays.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-blue-600 mt-1 block">현재 설정: 주 {attWorkDays.length}일 ({attWorkDays.join(', ')})</span>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isIpEnforced}
                      onChange={e => setIsIpEnforced(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>학교 공인 IP망 접속 강제 (보안 규정)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setToastMessage('근무 기초 및 근무일 설정이 저장되었습니다.');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold"
                >
                  기초 설정 저장
                </button>
              </div>
            </div>

            {/* Section B: 근태승인연장 & 연장근무 승인 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>근태 승인 연장 & 연장(초과)근무 승인 센터</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setOvertimeList(prev => prev.map(o => ({ ...o, status: 'APPROVED' })));
                    setToastMessage('대기 중인 모든 연장근무 신청이 일괄 승인되었습니다.');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold"
                >
                  전체 일괄 승인
                </button>
              </div>

              <div className="space-y-2">
                {overtimeList.map(ot => (
                  <div key={ot.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{ot.teacher_name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          {ot.category} ({ot.duration}h)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{ot.reason}</p>
                      <span className="text-[10px] font-mono text-slate-400">{ot.date}</span>
                    </div>

                    <div>
                      {ot.status === 'PENDING' ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setOvertimeList(prev => prev.map(item => item.id === ot.id ? { ...item, status: 'APPROVED' } : item));
                              setToastMessage('연장근무가 승인되었습니다.');
                              setTimeout(() => setToastMessage(null), 2000);
                            }}
                            className="px-2 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold"
                          >
                            승인
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOvertimeList(prev => prev.map(item => item.id === ot.id ? { ...item, status: 'REJECTED' } : item));
                              setToastMessage('연장근무가 반려되었습니다.');
                              setTimeout(() => setToastMessage(null), 2000);
                            }}
                            className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold"
                          >
                            반려
                          </button>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          승인완료
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. [연차관리] 콘솔 */}
      {/* 연차조정 / 연차일괄등록 */}
      {/* ===================================================================== */}
      {activeTab === 'leave-manage' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>교직원 연차 조정 및 신학기 연차 일괄 등록 센터</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                개별 교직원 잔여 연차 가감(+/-) 조정 및 신학기 전 교직원 대상 정기 연차를 일괄 부여합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLeaveBatchModalOpen(true)}
              className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Award className="w-3.5 h-3.5" />
              <span>연차 일괄 등록 (+15일 일괄 부여)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">사번</th>
                  <th className="py-2.5 px-3">교직원 성명</th>
                  <th className="py-2.5 px-3">소속 부서 / 직책</th>
                  <th className="py-2.5 px-3 text-center">현재 잔여연차</th>
                  <th className="py-2.5 px-3 text-center w-52">개별 연차 조정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {profiles.filter(p => p.employment_status === 'ACTIVE').map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.employee_no}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.name_kr}</td>
                    <td className="py-2.5 px-3">{p.subject || '행정'}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-600">{p.remaining_leave_days}일</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setProfiles(prev => prev.map(item => item.id === p.id ? { ...item, remaining_leave_days: Number((item.remaining_leave_days + 1.0).toFixed(1)) } : item));
                            setToastMessage(`[${p.name_kr}] 교직원에게 연차 +1.0일이 가산 조정되었습니다.`);
                            setTimeout(() => setToastMessage(null), 2500);
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200"
                        >
                          +1일 가산
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfiles(prev => prev.map(item => item.id === p.id ? { ...item, remaining_leave_days: Number((item.remaining_leave_days - 0.5).toFixed(1)) } : item));
                            setToastMessage(`[${p.name_kr}] 교직원 연차 -0.5일이 차감 조정되었습니다.`);
                            setTimeout(() => setToastMessage(null), 2500);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-200"
                        >
                          -0.5일 차감
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

      {/* ===================================================================== */}
      {/* MODAL 1: 교직원 개별 추가 / 수정 모달 */}
      {/* ===================================================================== */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStaff ? '교직원 정보 수정' : '신규 교직원 정보 등록'}
              </h3>
              <button type="button" onClick={() => setIsStaffModalOpen(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">성명 (국문)</label>
                <input
                  type="text"
                  defaultValue={editingStaff?.name_kr || ''}
                  id="modal_staff_name"
                  placeholder="예: 홍길동"
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">로그인 ID (Gmail 이메일)</label>
                <input
                  type="email"
                  defaultValue={editingStaff?.email || ''}
                  id="modal_staff_email"
                  placeholder="user@lighthouse.org"
                  className="w-full h-8 px-2.5 font-mono bg-slate-50 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">고용 형태 분류</label>
                <select
                  defaultValue={editingStaff?.employment_type || 'REGULAR'}
                  id="modal_staff_type"
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded font-semibold text-blue-700"
                >
                  <option value="REGULAR">정규직원 (REGULAR)</option>
                  <option value="PART_TIME">파트교사 (PART_TIME)</option>
                  <option value="EXTERNAL">외부강사 (EXTERNAL)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-3 py-1.5 rounded border">취소</button>
              <button
                type="button"
                onClick={() => {
                  const name = (document.getElementById('modal_staff_name') as HTMLInputElement).value;
                  const email = (document.getElementById('modal_staff_email') as HTMLInputElement).value;
                  const type = (document.getElementById('modal_staff_type') as HTMLSelectElement).value as any;
                  if (!name || !email) return;

                  if (editingStaff) {
                    setProfiles(prev => prev.map(p => p.id === editingStaff.id ? { ...p, name_kr: name, email, employment_type: type } : p));
                    setToastMessage('교직원 정보가 수정되었습니다.');
                  } else {
                    const newP: Profile = {
                      id: `u-${Date.now()}`,
                      employee_no: `LIS-2026-0${profiles.length + 1}`,
                      email,
                      name_kr: name,
                      name_en: 'New Staff',
                      phone: '010-0000-0000',
                      employment_type: type,
                      primary_dept_id: 'd1',
                      primary_position_id: 'p7',
                      primary_role_id: 'r4',
                      subject: '일반교과',
                      employment_status: 'ACTIVE',
                      remaining_leave_days: 15.0,
                    };
                    setProfiles([...profiles, newP]);
                    setToastMessage(`신규 교직원 [${name}]이 등록되었습니다.`);
                  }
                  setIsStaffModalOpen(false);
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold"
              >
                저장하기
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
      {/* MODAL 4: 비밀번호 직접 변경 모달 */}
      {/* ===================================================================== */}
      {isPasswordModalOpen && targetStaffForPwd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>[{targetStaffForPwd.name_kr}] 비밀번호 직접 변경</span>
              </h3>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">새 비밀번호 입력</label>
                <input
                  type="text"
                  placeholder="새로운 비밀번호를 입력하세요"
                  value={newDirectPwd}
                  onChange={e => setNewDirectPwd(e.target.value)}
                  className="w-full h-8 px-2 font-mono bg-slate-50 border border-slate-300 rounded font-bold text-blue-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-3 py-1.5 rounded border">취소</button>
              <button
                type="button"
                onClick={() => {
                  if (!newDirectPwd.trim()) return;
                  setToastMessage(`[${targetStaffForPwd.name_kr}] 교직원의 비밀번호가 정상 변경되었습니다.`);
                  setIsPasswordModalOpen(false);
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold"
              >
                저장하기
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
                    placeholder="예: 홍길동"
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
