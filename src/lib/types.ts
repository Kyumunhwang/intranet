// Core Type Definitions for Lighthouse Global School Intranet
// Based on 1_db_antigravity.md (24 Core Tables)

export type RoleCode = 'SUPER_ADMIN' | 'ADMIN' | 'APPROVER' | 'TEACHER' | 'VIEWER';
export type EmploymentType = 'REGULAR' | 'PART_TIME' | 'EXTERNAL';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'EARLY_LEAVE' | 'ANNUAL_LEAVE' | 'HALF_LEAVE' | 'SICK_LEAVE' | 'BUSINESS_TRIP' | 'OFFICIAL_LEAVE' | 'ABSENT';
export type StudentAttendanceStatus =
  | 'PRESENT'        // 출석
  | 'LATE'           // 지각
  | 'ABSENT'         // 결석
  | 'SICK'           // 병결
  | 'EARLY_LEAVE'    // 조퇴
  | 'UNAUTH_EARLY'   // 무단조퇴
  | 'UNAUTH_ABSENT'; // 무단결석
export type DocStatus = 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'RETURNED';
export type StepStatus = 'WAITING' | 'APPROVED' | 'REJECTED' | 'HOLD';

export interface SchoolSettings {
  id: string;
  school_name: string;
  logo_url: string;
  banner_logo_url?: string;
  login_notice: string;
  global_notice: string;
  primary_color: string;
  theme_mode: string;
}

export interface AllowedIP {
  id: string;
  ip_address: string;
  description: string;
  ip_type: 'SCHOOL_ALLOWED' | 'BLOCKED';
  is_active: boolean;
}

export interface Department {
  id: string;
  dept_code: string;
  dept_name: string;
  sort_order: number;
}

export interface Position {
  id: string;
  position_code: string;
  position_name: string;
  is_approver: boolean;
  approval_rank: number;
  sort_order: number;
}

export interface Role {
  id: string;
  role_code: RoleCode;
  role_name: string;
  is_system_role: boolean;
}

export interface Profile {
  id: string;
  employee_no: string;
  email: string;
  name_kr: string;
  name_en?: string;
  phone?: string;
  extension_no?: string;
  employment_type: EmploymentType;
  primary_dept_id: string;
  primary_position_id: string;
  primary_role_id: string;
  subject?: string;
  homeroom_grade?: number | null;
  homeroom_class?: number | null;
  hire_date?: string;
  employment_status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  remaining_leave_days: number;
  must_change_password?: boolean;
  signature_text?: string;
}

export interface TeacherMultiRole {
  id: string;
  teacher_id: string;
  dept_id: string;
  position_id: string;
  role_description: string;
  is_primary: boolean;
}

export interface WorkSettings {
  id: string;
  work_start_time: string;
  work_end_time: string;
  working_days: string[];
  require_school_ip_for_attendance: boolean;
}

export interface StaffAttendance {
  id: string;
  teacher_id: string;
  work_date: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  check_in_ip?: string | null;
  check_out_ip?: string | null;
  is_valid_school_ip: boolean;
  attendance_status: AttendanceStatus;
  overtime_minutes: number;
  memo?: string;
}

export const SCHOOL_GRADES = [
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

export type SchoolGrade = (typeof SCHOOL_GRADES)[number];

export interface Student {
  id: string;
  student_no: string;
  name: string;
  grade: string | number; // T1, E1~E5, M6~M8, H9~H12
  class_no?: number;
  number_in_class?: number;
  homeroom_teacher_id?: string;
  status: 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED';
}

export interface ClassAttendanceConfirm {
  id: string;
  attendance_date: string;
  grade: string | number;
  class_no?: number;
  is_confirmed: boolean;
  confirmed_by?: string;
  confirmed_at?: string;
  total_students: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  sick_count: number;
}

export interface StudentDailyAttendance {
  id: string;
  student_id: string;
  attendance_date: string;
  status: StudentAttendanceStatus;
  comment?: string;
}

export interface ApprovalTemplate {
  id: string;
  template_category: 'GENERAL_DRAFT' | 'ATTENDANCE_REQ' | 'EXPENSE' | 'PURCHASE' | 'OFFICIAL_DOC';
  template_name: string;
  auto_deduct_leave: boolean;
  default_approval_steps: {
    order: number;
    role_desc: string;
    approver_id?: string;
    type: string;
  }[];
}

export interface ApprovalDocument {
  id: string;
  doc_number: string;
  template_id: string;
  drafter_id: string;
  dept_id: string;
  title: string;
  content_html: string;
  form_data?: Record<string, any>;
  special_notes?: string;
  doc_status: DocStatus;
  current_step_order: number;
  final_approved_at?: string;
  created_at: string;
}

export interface ApprovalStep {
  id: string;
  doc_id: string;
  step_order: number;
  step_type: 'APPROVAL' | 'AGREEMENT' | 'COOPERATION' | 'REFERENCE';
  approver_id: string;
  delegate_approver_id?: string;
  is_delegated?: boolean;
  step_status: StepStatus;
  comment?: string | null;
  signature_snapshot?: string | null;
  acted_at?: string | null;
}

export interface CalendarEvent {
  id: string;
  category_id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  is_all_day?: boolean;
  location?: string;
  owner_id?: string;
}

export interface BoardPost {
  id: string;
  board_id: string;
  author_id: string;
  title: string;
  content_html: string;
  is_must_read: boolean;
  is_pinned: boolean;
  view_count: number;
  created_at: string;
}

export interface BoardPostRead {
  id: string;
  post_id: string;
  reader_id: string;
  read_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_email?: string;
  actor_name?: string;
  action_category: 'AUTH_LOGIN' | 'ATTENDANCE_CLICK' | 'APPROVAL_ACT' | 'ADMIN_CHANGE' | 'PASSWORD_RESET' | 'DATA_DELETE' | 'LEAVE_ADJUSTMENT';
  action_detail: string;
  client_ip: string;
  created_at: string;
}
