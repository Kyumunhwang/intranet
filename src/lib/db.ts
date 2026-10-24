// Server-side Local JSON Persistence and Business Logic Repository
// Fulfills all 4 key business flows from 1_db_antigravity.md

import fs from 'fs';
import path from 'path';
import {
  SchoolSettings,
  AllowedIP,
  Department,
  Position,
  Role,
  Profile,
  TeacherMultiRole,
  WorkSettings,
  StaffAttendance,
  Student,
  ClassAttendanceConfirm,
  StudentDailyAttendance,
  ApprovalTemplate,
  ApprovalDocument,
  ApprovalStep,
  CalendarEvent,
  BoardPost,
  BoardPostRead,
  AuditLog,
  AttendanceStatus,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

function readJson<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

function writeJson<T>(filename: string, data: T): void {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

// -------------------------------------------------------------
// 1. Core Data Accessors
// -------------------------------------------------------------
export function getSchoolSettings(): SchoolSettings {
  const list = readJson<SchoolSettings[]>('school_settings.json', []);
  return list[0] || {
    id: 's1',
    school_name: '등대글로벌스쿨 (Lighthouse International School)',
    logo_url: '/logo/lighthouse_logo.png',
    banner_logo_url: '/logo/lis_logo_2026.png',
    login_notice: '등대글로벌스쿨 교직원 전용 업무 포털입니다.',
    global_notice: '2026학년도 1학기 신학기 학사일정 안내',
    primary_color: '#2563EB',
    theme_mode: 'light',
  };
}

export function updateSchoolSettings(data: Partial<SchoolSettings>): SchoolSettings {
  const current = getSchoolSettings();
  const updated = { ...current, ...data };
  writeJson('school_settings.json', [updated]);
  logAuditAction({
    action_category: 'ADMIN_CHANGE',
    action_detail: '학교 기본 설정 및 공지 변경',
    client_ip: '211.104.88.24',
  });
  return updated;
}

export function getAllowedIPs(): AllowedIP[] {
  return readJson<AllowedIP[]>('allowed_ips.json', []);
}

export function addAllowedIP(ip_address: string, description: string, ip_type: 'SCHOOL_ALLOWED' | 'BLOCKED'): AllowedIP {
  const ips = getAllowedIPs();
  const newIp: AllowedIP = {
    id: `ip_${Date.now()}`,
    ip_address,
    description,
    ip_type,
    is_active: true,
  };
  ips.push(newIp);
  writeJson('allowed_ips.json', ips);
  logAuditAction({
    action_category: 'ADMIN_CHANGE',
    action_detail: `접속 IP 정책 등록 [${ip_type}]: ${ip_address} (${description})`,
    client_ip: '211.104.88.24',
  });
  return newIp;
}

export function deleteAllowedIP(id: string): void {
  const ips = getAllowedIPs().filter((ip) => ip.id !== id);
  writeJson('allowed_ips.json', ips);
}

export function getProfiles(): Profile[] {
  return readJson<Profile[]>('profiles.json', []);
}

export function getDepartments(): Department[] {
  return readJson<Department[]>('departments.json', []);
}

export function getPositions(): Position[] {
  return readJson<Position[]>('positions.json', []);
}

export function getRoles(): Role[] {
  return readJson<Role[]>('roles.json', []);
}

export function getTeacherMultiRoles(teacherId?: string): TeacherMultiRole[] {
  const list = readJson<TeacherMultiRole[]>('teacher_multi_roles.json', []);
  return teacherId ? list.filter((r) => r.teacher_id === teacherId) : list;
}

// -------------------------------------------------------------
// 2. IP Verification & Attendance Logic (1_db_antigravity.md 핵심 로직 ②)
// -------------------------------------------------------------
export function checkIsSchoolIP(ip: string): boolean {
  const allowedList = getAllowedIPs().filter((item) => item.is_active && item.ip_type === 'SCHOOL_ALLOWED');
  return allowedList.some((item) => item.ip_address === ip || ip.startsWith('127.0.0') || ip === '::1');
}

export function logAuditAction(params: {
  actor_id?: string;
  actor_email?: string;
  actor_name?: string;
  action_category: 'AUTH_LOGIN' | 'ATTENDANCE_CLICK' | 'APPROVAL_ACT' | 'ADMIN_CHANGE' | 'PASSWORD_RESET' | 'DATA_DELETE';
  action_detail: string;
  client_ip: string;
}): AuditLog {
  const logs = readJson<AuditLog[]>('audit_and_access_logs.json', []);
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actor_id: params.actor_id || 'u8',
    actor_email: params.actor_email || 'jay.lee@lighthouse.org',
    actor_name: params.actor_name || '이재원',
    action_category: params.action_category,
    action_detail: params.action_detail,
    client_ip: params.client_ip,
    created_at: new Date().toISOString(),
  };
  logs.unshift(newLog);
  writeJson('audit_and_access_logs.json', logs.slice(0, 500)); // keep recent 500
  return newLog;
}

export function getAuditLogs(): AuditLog[] {
  return readJson<AuditLog[]>('audit_and_access_logs.json', []);
}

export function recordStaffAttendance(params: {
  teacher_id: string;
  action: 'CHECK_IN' | 'CHECK_OUT';
  client_ip: string;
}): { success: boolean; message: string; record?: StaffAttendance } {
  const isSchoolIP = checkIsSchoolIP(params.client_ip);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const list = readJson<StaffAttendance[]>('staff_attendance.json', []);
  let record = list.find((r) => r.teacher_id === params.teacher_id && r.work_date === todayStr);

  if (!isSchoolIP) {
    logAuditAction({
      actor_id: params.teacher_id,
      action_category: 'ATTENDANCE_CLICK',
      action_detail: `출퇴근 체크 실패 - 외부 비인가 IP 접속 차단 (${params.client_ip})`,
      client_ip: params.client_ip,
    });
    return {
      success: false,
      message: `학교 네트워크(공인 IP) 환경에서만 출퇴근 체크가 가능합니다. (현재 접속 IP: ${params.client_ip})`,
    };
  }

  if (params.action === 'CHECK_IN') {
    if (record && record.check_in_time) {
      return { success: false, message: '이미 오늘 출근 체크를 완료하였습니다.' };
    }
    if (!record) {
      record = {
        id: `sa_${Date.now()}`,
        teacher_id: params.teacher_id,
        work_date: todayStr,
        check_in_time: now.toISOString(),
        check_in_ip: params.client_ip,
        is_valid_school_ip: true,
        attendance_status: 'PRESENT',
        overtime_minutes: 0,
        memo: '정상 출근',
      };
      list.push(record);
    } else {
      record.check_in_time = now.toISOString();
      record.check_in_ip = params.client_ip;
      record.is_valid_school_ip = true;
    }
    logAuditAction({
      actor_id: params.teacher_id,
      action_category: 'ATTENDANCE_CLICK',
      action_detail: `정상 출근 체크 완료 (${now.toLocaleTimeString('ko-KR')})`,
      client_ip: params.client_ip,
    });
  } else {
    // CHECK_OUT
    if (!record) {
      return { success: false, message: '출근 기록이 존재하지 않아 퇴근 처리를 할 수 없습니다.' };
    }
    record.check_out_time = now.toISOString();
    record.check_out_ip = params.client_ip;
    logAuditAction({
      actor_id: params.teacher_id,
      action_category: 'ATTENDANCE_CLICK',
      action_detail: `퇴근 체크 완료 (${now.toLocaleTimeString('ko-KR')})`,
      client_ip: params.client_ip,
    });
  }

  writeJson('staff_attendance.json', list);
  return {
    success: true,
    message: params.action === 'CHECK_IN' ? '정상 출근 처리되었습니다.' : '정상 퇴근 처리되었습니다.',
    record,
  };
}

export function getStaffAttendanceToday(teacherId: string): StaffAttendance | null {
  const todayStr = new Date().toISOString().split('T')[0];
  const list = readJson<StaffAttendance[]>('staff_attendance.json', []);
  return list.find((r) => r.teacher_id === teacherId && r.work_date === todayStr) || null;
}

// -------------------------------------------------------------
// 3. Student Attendance Logic (1_db_antigravity.md 핵심 로직 ④)
// -------------------------------------------------------------
export function getStudentsByClass(grade: string | number, class_no?: number): Student[] {
  const students = readJson<Student[]>('students.json', []);
  return students.filter((s) => String(s.grade) === String(grade) && s.status === 'ENROLLED');
}

export function getClassAttendanceConfirm(grade: string | number, class_no?: number, dateStr?: string): ClassAttendanceConfirm | null {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  const confirms = readJson<ClassAttendanceConfirm[]>('class_attendance_confirms.json', []);
  return confirms.find((c) => String(c.grade) === String(grade) && c.attendance_date === targetDate) || null;
}

export function getStudentDailyAttendance(grade: string | number, class_no?: number, dateStr?: string): Record<string, { status: string; comment: string }> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  const students = getStudentsByClass(grade, class_no);
  const records = readJson<StudentDailyAttendance[]>('student_daily_attendance.json', []);
  
  const map: Record<string, { status: string; comment: string }> = {};
  for (const s of students) {
    const found = records.find((r) => r.student_id === s.id && r.attendance_date === targetDate);
    map[s.id] = {
      status: found ? found.status : 'PRESENT', // default to PRESENT
      comment: found ? found.comment || '' : '',
    };
  }
  return map;
}

export function confirmClassAttendance(params: {
  grade: string | number;
  class_no?: number;
  confirmed_by: string;
  records: { student_id: string; status: any; comment?: string }[];
}): ClassAttendanceConfirm {
  const todayStr = new Date().toISOString().split('T')[0];
  const allConfirms = readJson<ClassAttendanceConfirm[]>('class_attendance_confirms.json', []);
  const allDaily = readJson<StudentDailyAttendance[]>('student_daily_attendance.json', []);

  // Compute counts
  let present = 0;
  let late = 0;
  let absent = 0;
  let sick = 0;

  for (const item of params.records) {
    if (item.status === 'PRESENT') present++;
    else if (item.status === 'LATE') late++;
    else if (item.status === 'ABSENT' || item.status === 'UNAUTH_ABSENT') absent++;
    else if (item.status === 'SICK' || item.status === 'EARLY_LEAVE' || item.status === 'UNAUTH_EARLY') sick++;

    const existingDailyIndex = allDaily.findIndex(
      (d) => d.student_id === item.student_id && d.attendance_date === todayStr
    );
    if (existingDailyIndex >= 0) {
      allDaily[existingDailyIndex].status = item.status;
      allDaily[existingDailyIndex].comment = item.comment || '';
    } else {
      allDaily.push({
        id: `sda_${Date.now()}_${item.student_id}`,
        student_id: item.student_id,
        attendance_date: todayStr,
        status: item.status,
        comment: item.comment || '',
      });
    }
  }

  writeJson('student_daily_attendance.json', allDaily);

  const existingConfirmIndex = allConfirms.findIndex(
    (c) => c.grade === params.grade && c.class_no === params.class_no && c.attendance_date === todayStr
  );

  const confirmObj: ClassAttendanceConfirm = {
    id: existingConfirmIndex >= 0 ? allConfirms[existingConfirmIndex].id : `cac_${Date.now()}`,
    attendance_date: todayStr,
    grade: params.grade,
    class_no: params.class_no,
    is_confirmed: true,
    confirmed_by: params.confirmed_by,
    confirmed_at: new Date().toISOString(),
    total_students: params.records.length,
    present_count: present,
    late_count: late,
    absent_count: absent,
    sick_count: sick,
  };

  if (existingConfirmIndex >= 0) {
    allConfirms[existingConfirmIndex] = confirmObj;
  } else {
    allConfirms.push(confirmObj);
  }

  writeJson('class_attendance_confirms.json', allConfirms);

  logAuditAction({
    actor_id: params.confirmed_by,
    action_category: 'ATTENDANCE_CLICK',
    action_detail: `[중등 ${params.grade}-${params.class_no}] 학생 일일 출결 최종 Confirm 확정 (출석 ${present}, 지각 ${late}, 결석 ${absent}, 병결 ${sick})`,
    client_ip: '211.104.88.24',
  });

  return confirmObj;
}

// -------------------------------------------------------------
// 4. Electronic Approval & Leave Auto-Deduct (1_db_antigravity.md 핵심 로직 ③)
// -------------------------------------------------------------
export function getApprovalTemplates(): ApprovalTemplate[] {
  return readJson<ApprovalTemplate[]>('approval_templates.json', []);
}

export function getApprovalDocuments(): ApprovalDocument[] {
  return readJson<ApprovalDocument[]>('approval_documents.json', []);
}

export function getApprovalSteps(docId?: string): ApprovalStep[] {
  const list = readJson<ApprovalStep[]>('approval_steps.json', []);
  return docId ? list.filter((s) => s.doc_id === docId) : list;
}

export function createApprovalDocument(params: {
  template_id: string;
  drafter_id: string;
  dept_id: string;
  title: string;
  content_html: string;
  form_data?: Record<string, any>;
  special_notes?: string;
  steps: { approver_id: string; step_type?: string }[];
}): ApprovalDocument {
  const docs = getApprovalDocuments();
  const allSteps = readJson<ApprovalStep[]>('approval_steps.json', []);
  const docId = `doc_${Date.now()}`;
  const docNumber = `LIS-2026-기안-${String(docs.length + 1).padStart(4, '0')}`;

  const newDoc: ApprovalDocument = {
    id: docId,
    doc_number: docNumber,
    template_id: params.template_id,
    drafter_id: params.drafter_id,
    dept_id: params.dept_id,
    title: params.title,
    content_html: params.content_html,
    form_data: params.form_data || {},
    special_notes: params.special_notes || '',
    doc_status: 'PENDING',
    current_step_order: 2, // 1 is drafter, so waiting on step 2
    created_at: new Date().toISOString(),
  };

  // Add drafter as step 1
  allSteps.push({
    id: `step_${Date.now()}_1`,
    doc_id: docId,
    step_order: 1,
    step_type: 'APPROVAL',
    approver_id: params.drafter_id,
    step_status: 'APPROVED',
    comment: '기안 상신 완료',
    signature_snapshot: '이재원 [印]',
    acted_at: new Date().toISOString(),
  });

  // Add customized/default approver steps
  params.steps.forEach((step, idx) => {
    allSteps.push({
      id: `step_${Date.now()}_${idx + 2}`,
      doc_id: docId,
      step_order: idx + 2,
      step_type: (step.step_type as any) || 'APPROVAL',
      approver_id: step.approver_id,
      step_status: 'WAITING',
      comment: null,
      signature_snapshot: null,
      acted_at: null,
    });
  });

  docs.unshift(newDoc);
  writeJson('approval_documents.json', docs);
  writeJson('approval_steps.json', allSteps);

  logAuditAction({
    actor_id: params.drafter_id,
    action_category: 'APPROVAL_ACT',
    action_detail: `전자결재 기안 상신: [${docNumber}] ${params.title}`,
    client_ip: '211.104.88.24',
  });

  return newDoc;
}

export function processApprovalStep(params: {
  doc_id: string;
  step_id: string;
  approver_id: string;
  action: 'APPROVE' | 'DELEGATE' | 'REJECT';
  comment?: string;
  signature_text?: string;
}): { success: boolean; message: string; doc?: ApprovalDocument } {
  const docs = getApprovalDocuments();
  const steps = readJson<ApprovalStep[]>('approval_steps.json', []);
  const doc = docs.find((d) => d.id === params.doc_id);
  const step = steps.find((s) => s.id === params.step_id);

  if (!doc || !step) {
    return { success: false, message: '결재 문서 또는 결재 단계를 찾을 수 없습니다.' };
  }

  const now = new Date();
  const profiles = getProfiles();
  const approver = profiles.find((p) => p.id === params.approver_id);
  const sigText = params.signature_text || approver?.signature_text || `${approver?.name_kr || '결재자'} [印]`;

  if (params.action === 'REJECT') {
    step.step_status = 'REJECTED';
    step.comment = params.comment || '반려';
    step.acted_at = now.toISOString();
    doc.doc_status = 'REJECTED';
    writeJson('approval_documents.json', docs);
    writeJson('approval_steps.json', steps);

    logAuditAction({
      actor_id: params.approver_id,
      action_category: 'APPROVAL_ACT',
      action_detail: `전자결재 반려: [${doc.doc_number}] 사유: ${step.comment}`,
      client_ip: '211.104.88.24',
    });
    return { success: true, message: '문서가 반려 처리되었습니다.', doc };
  }

  // APPROVE or DELEGATE
  step.step_status = 'APPROVED';
  step.comment = params.comment || (params.action === 'DELEGATE' ? '전결 승인' : '승인 완료');
  step.signature_snapshot = sigText;
  step.acted_at = now.toISOString();
  if (params.action === 'DELEGATE') {
    step.is_delegated = true;
  }

  // Check next step
  const docSteps = steps.filter((s) => s.doc_id === params.doc_id).sort((a, b) => a.step_order - b.step_order);
  const currentOrder = step.step_order;
  const nextStep = docSteps.find((s) => s.step_order > currentOrder && s.step_status === 'WAITING');

  if (nextStep && params.action !== 'DELEGATE') {
    // Advance to next step
    doc.current_step_order = nextStep.step_order;
    doc.doc_status = 'IN_PROGRESS';
  } else {
    // Final approved (either last step approved OR delegated)
    doc.doc_status = 'APPROVED';
    doc.final_approved_at = now.toISOString();

    // Auto Deduct Leave if template has auto_deduct_leave
    const templates = getApprovalTemplates();
    const tpl = templates.find((t) => t.id === doc.template_id);
    if (tpl?.auto_deduct_leave && doc.form_data?.days) {
      const deductDays = Number(doc.form_data.days) || 1.0;
      const drafter = profiles.find((p) => p.id === doc.drafter_id);
      if (drafter) {
        drafter.remaining_leave_days = Math.max(0, drafter.remaining_leave_days - deductDays);
        writeJson('profiles.json', profiles);

        // Record leave history
        const leaveHistories = readJson<any[]>('leave_histories.json', []);
        leaveHistories.push({
          id: `lh_${Date.now()}`,
          teacher_id: drafter.id,
          change_type: 'USED_BY_APPROVAL',
          change_days: -deductDays,
          balance_after: drafter.remaining_leave_days,
          reason: `[${doc.doc_number}] ${doc.title} 결재 완료 자동 차감`,
          approval_doc_id: doc.id,
          processed_by: params.approver_id,
          created_at: now.toISOString(),
        });
        writeJson('leave_histories.json', leaveHistories);
      }
    }
  }

  writeJson('approval_documents.json', docs);
  writeJson('approval_steps.json', steps);

  logAuditAction({
    actor_id: params.approver_id,
    action_category: 'APPROVAL_ACT',
    action_detail: `전자결재 ${params.action === 'DELEGATE' ? '전결' : '승인'}: [${doc.doc_number}] ${doc.title}`,
    client_ip: '211.104.88.24',
  });

  return { success: true, message: '결재가 정상 처리되었습니다.', doc };
}

// -------------------------------------------------------------
// 5. Password Reset 1234 & Auth (1_db_antigravity.md 핵심 로직 ①)
// -------------------------------------------------------------
export function getPasswords(): Record<string, string> {
  return readJson<Record<string, string>>('passwords.json', {});
}

export function savePasswords(passwords: Record<string, string>): void {
  writeJson('passwords.json', passwords);
}

export function verifyLogin(email: string, passwordAttempt: string): { success: boolean; message: string; profile?: Profile } {
  const cleanEmail = (email || '').trim().toLowerCase();
  const profiles = getProfiles();
  const profile = profiles.find((p) => p.email && p.email.toLowerCase() === cleanEmail);

  if (!profile) {
    return { success: false, message: '등록되지 않은 교직원 이메일입니다.' };
  }

  const passwords = getPasswords();
  const correctPassword = passwords[cleanEmail] || '1234';

  if (passwordAttempt !== correctPassword) {
    return { success: false, message: '비밀번호가 일치하지 않습니다. (초기 비밀번호: 1234)' };
  }

  logAuditAction({
    actor_id: profile.id,
    actor_email: profile.email,
    actor_name: profile.name_kr,
    action_category: 'AUTH_LOGIN',
    action_detail: `교직원 인트라넷 로그인 성공 (${profile.name_kr} / ${profile.subject || ''})`,
    client_ip: '211.104.88.24',
  });

  return { success: true, message: `${profile.name_kr}님 로그인 성공`, profile };
}

export function changeTeacherPassword(
  email: string,
  oldPass: string,
  newPass: string
): { success: boolean; message: string } {
  const cleanEmail = (email || '').trim().toLowerCase();
  const profiles = getProfiles();
  const profile = profiles.find((p) => p.email && p.email.toLowerCase() === cleanEmail);

  if (!profile) {
    return { success: false, message: '교직원 계정을 찾을 수 없습니다.' };
  }

  const passwords = getPasswords();
  const currentPass = passwords[cleanEmail] || '1234';

  if (oldPass !== currentPass) {
    return { success: false, message: '현재 비밀번호가 일치하지 않습니다.' };
  }

  if (!newPass || newPass.trim().length < 4) {
    return { success: false, message: '새 비밀번호는 최소 4자 이상 입력해 주십시오.' };
  }

  passwords[cleanEmail] = newPass.trim();
  savePasswords(passwords);

  profile.must_change_password = false;
  writeJson('profiles.json', profiles);

  logAuditAction({
    actor_id: profile.id,
    actor_email: profile.email,
    actor_name: profile.name_kr,
    action_category: 'PASSWORD_RESET',
    action_detail: `교직원 본인 비밀번호 변경 완료 (${profile.name_kr} / ${profile.email})`,
    client_ip: '211.104.88.24',
  });

  return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
}

export function resetTeacherPasswordTo1234(teacherId: string): { success: boolean; message: string } {
  const profiles = getProfiles();
  const target = profiles.find((p) => p.id === teacherId);
  if (!target) {
    return { success: false, message: '교직원을 찾을 수 없습니다.' };
  }
  target.must_change_password = true;
  writeJson('profiles.json', profiles);

  const passwords = getPasswords();
  if (target.email) {
    passwords[target.email.toLowerCase()] = '1234';
    savePasswords(passwords);
  }

  logAuditAction({
    action_category: 'PASSWORD_RESET',
    action_detail: `관리자에 의한 초기 비밀번호 '1234' 리셋 완료 (대상: ${target.name_kr} / ${target.email})`,
    client_ip: '211.104.88.24',
  });

  return { success: true, message: `${target.name_kr} 선생님의 비밀번호가 1234로 초기화되었습니다.` };
}

export function saveProfile(profile: Partial<Profile>): Profile {
  const profiles = getProfiles();
  let updated: Profile;
  if (profile.id) {
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile } as Profile;
      updated = profiles[idx];
    } else {
      updated = profile as Profile;
      profiles.push(updated);
    }
  } else {
    updated = {
      id: `u_${Date.now()}`,
      employee_no: `LIS-2026-${String(profiles.length + 1).padStart(3, '0')}`,
      email: profile.email || 'teacher@lighthouse.org',
      name_kr: profile.name_kr || '신규교사',
      employment_type: profile.employment_type || 'REGULAR',
      primary_dept_id: profile.primary_dept_id || 'd5',
      primary_position_id: profile.primary_position_id || 'p8',
      primary_role_id: profile.primary_role_id || 'r4',
      employment_status: 'ACTIVE',
      remaining_leave_days: 15.0,
      must_change_password: true,
      signature_text: `${profile.name_kr || '신규교사'} [印]`,
      ...profile,
    } as Profile;
    profiles.push(updated);
  }
  writeJson('profiles.json', profiles);
  return updated;
}

// -------------------------------------------------------------
// 6. Calendar & Board Accessors
// -------------------------------------------------------------
export function getCalendarEvents(): CalendarEvent[] {
  return readJson<CalendarEvent[]>('calendar_events.json', []);
}

export function addCalendarEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
  const events = getCalendarEvents();
  const newEv: CalendarEvent = {
    id: `ev_${Date.now()}`,
    ...event,
  };
  events.push(newEv);
  writeJson('calendar_events.json', events);
  return newEv;
}

export function getBoardPosts(): (BoardPost & { author_name?: string; read_count: number })[] {
  const posts = readJson<BoardPost[]>('board_posts.json', []);
  const reads = readJson<BoardPostRead[]>('board_post_reads.json', []);
  const profiles = getProfiles();

  return posts.map((p) => {
    const author = profiles.find((prof) => prof.id === p.author_id);
    const postReads = reads.filter((r) => r.post_id === p.id);
    return {
      ...p,
      author_name: author ? author.name_kr : '관리자',
      read_count: postReads.length,
    };
  });
}

export function getPostReadStatus(postId: string): { readList: Profile[]; unreadList: Profile[] } {
  const reads = readJson<BoardPostRead[]>('board_post_reads.json', []).filter((r) => r.post_id === postId);
  const profiles = getProfiles().filter((p) => p.employment_status === 'ACTIVE');
  const readTeacherIds = new Set(reads.map((r) => r.reader_id));

  const readList = profiles.filter((p) => readTeacherIds.has(p.id));
  const unreadList = profiles.filter((p) => !readTeacherIds.has(p.id));
  return { readList, unreadList };
}

export function markPostAsRead(postId: string, readerId: string): void {
  const reads = readJson<BoardPostRead[]>('board_post_reads.json', []);
  const exists = reads.some((r) => r.post_id === postId && r.reader_id === readerId);
  if (!exists) {
    reads.push({
      id: `bpr_${Date.now()}`,
      post_id: postId,
      reader_id: readerId,
      read_at: new Date().toISOString(),
    });
    writeJson('board_post_reads.json', reads);
  }
}
