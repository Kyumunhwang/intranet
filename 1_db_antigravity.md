# 🏫 교직원 인트라넷 구축 1단계: DB 스키마(ERD), RLS 보안 정책 및 개발 명세서

본 문서는 `demand.md` 요구사항을 바탕으로 설계된 **Supabase PostgreSQL 데이터베이스 스키마, RLS(Row Level Security) 정책, 그리고 Antigravity / Claude Code 용 백엔드 구현 가이드**입니다.

---

## 1. 시스템 아키텍처 및 기술 스택 요약
* **Frontend & Hosting:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Vercel
* **Backend & DB:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage, Edge Functions/Server Actions)
* **협업 환경:** GitHub (3인 협업), Antigravity, Claude Code, Google Stitch (UI 생성)
* **핵심 설계 원칙:**
  1. **모든 변경/접속 기록 보존:** 삭제 시 물리적 삭제 대신 Soft Delete(`deleted_at`) 또는 감사 로그(`audit_logs`) 테이블에 영구 기록 및 검색 지원.
  2. **유연한 확장성:** 커스텀 프로필 필드(`JSONB`), 동적 결재선, 동적 양식 생성기 지원.
  3. **철저한 IP 및 권한 검증:** 학교 공인 IP 대역 비교 로직 및 메뉴별 세분화된 RBAC(조회/저장/인쇄/삭제) 제어.

---

## 2. 데이터베이스 ERD 및 테이블 상세 정의 ( 총 24개 핵심 테이블 )

아래 SQL 스크립트는 Supabase SQL Editor에 바로 복사하여 실행할 수 있도록 작성되었습니다.

```sql
-- 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- [영역 1] 학교 기본정보, 테마 설정 및 접속 IP 관리
-- ============================================================================

-- 1. 학교 기본 설정 및 로그인/테마 관리 (관리자 첫 화면 연동)
CREATE TABLE public.school_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_name TEXT NOT NULL DEFAULT '우리학교',
    logo_url TEXT,
    login_bg_images JSONB DEFAULT '[]'::jsonb, -- 로그인 전 화면 이미지 리스트
    login_notice TEXT,                         -- 로그인 전 화면 안내 문구
    global_notice TEXT,                        -- 관리자 첫 화면 전체 공지
    primary_color TEXT DEFAULT '#0F172A',      -- 화면 대표 색상
    theme_mode TEXT DEFAULT 'light',           -- light, dark, system
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID
);

-- 2. 접속 허용/차단 IP 관리 (학교 공인 IP 등록용)
CREATE TABLE public.allowed_ips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address TEXT NOT NULL UNIQUE,           -- 예: '211.xxx.xxx.xxx' 또는 CIDR
    description TEXT NOT NULL,                 -- 예: '본관 교무실 공인 IP', '차단 IP'
    ip_type TEXT NOT NULL CHECK (ip_type IN ('SCHOOL_ALLOWED', 'BLOCKED')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- ============================================================================
-- [영역 2] 조직도, 권한(RBAC), 교직원 프로필 및 다중 역할 (Multi-role)
-- ============================================================================

-- 3. 부서 테이블 (교무부, 행정실, 재정실, 상담실 등)
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dept_code TEXT UNIQUE NOT NULL,
    dept_name TEXT NOT NULL,
    parent_dept_id UUID REFERENCES public.departments(id),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 직책 테이블 (교장, 부교장, 중고등교감, 초등교감, 교목, 담임교사, 교과교사, 팀장, 직원 등)
CREATE TABLE public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_code TEXT UNIQUE NOT NULL,
    position_name TEXT NOT NULL,
    is_approver BOOLEAN DEFAULT FALSE,         -- 결재권자 여부
    approval_rank INT DEFAULT 0,               -- 기본 결재 서열 (숫자가 높을수록 상위 결재자)
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 권한 등급 테이블 (Superuser, System Admin, 결재권자, 일반교사, 열람전용 등 동적 추가/변경)
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_code TEXT UNIQUE NOT NULL,            -- 'SUPER_ADMIN', 'ADMIN', 'APPROVER', 'TEACHER', 'VIEWER'
    role_name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 메뉴별 권한 설정 테이블 (모든 메뉴에 대해 조회, 저장, 인쇄, 삭제 권한 제어)
CREATE TABLE public.menu_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    menu_code TEXT NOT NULL,                   -- 'ATTENDANCE', 'APPROVAL', 'CALENDAR', 'BOARD', 'ADMIN_HR' 등
    can_view BOOLEAN DEFAULT TRUE,
    can_save BOOLEAN DEFAULT FALSE,
    can_print BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    UNIQUE(role_id, menu_code)
);

-- 7. 교직원 프로필 테이블 (Supabase auth.users 와 1:1 매핑)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_no TEXT UNIQUE NOT NULL,          -- 사번
    email TEXT UNIQUE NOT NULL,                -- 개인 Gmail 계정 (로그인 ID)
    name_kr TEXT NOT NULL,                     -- 국문 이름
    name_en TEXT,                              -- 영문 이름
    phone TEXT,                                -- 휴대폰 번호
    extension_no TEXT,                         -- 내선번호
    employment_type TEXT NOT NULL CHECK (employment_type IN ('REGULAR', 'PART_TIME', 'EXTERNAL')), -- 정규직원, 파트교사, 외부강사
    primary_dept_id UUID REFERENCES public.departments(id),
    primary_position_id UUID REFERENCES public.positions(id),
    primary_role_id UUID REFERENCES public.roles(id),
    subject TEXT,                              -- 담당 과목
    homeroom_grade INT,                        -- 담당 학년
    homeroom_class INT,                        -- 담당 반
    hire_date DATE,                            -- 입사일
    resign_date DATE,                          -- 퇴사일 (퇴사자 근태확인용)
    employment_status TEXT DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE', 'ON_LEAVE', 'RESIGNED')),
    remaining_leave_days NUMERIC(4,1) DEFAULT 15.0, -- 잔여 연차 일수 (0.5일 반차 지원)
    profile_image_url TEXT,                    -- 프로필 사진 (Supabase Storage)
    signature_image_url TEXT,                  -- 전자서명/도장 이미지 (Supabase Storage)
    must_change_password BOOLEAN DEFAULT TRUE, -- 초기 비밀번호(1234) 변경 필요 여부
    custom_fields JSONB DEFAULT '{}'::jsonb,   -- 관리자가 동적으로 추가하는 프로필 항목 저장소
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 교직원 다중 역할 매핑 테이블 (Multi-role: 예 - 중3 담임 + 과학 교과 + 부서 팀장 동시 부여)
CREATE TABLE public.teacher_multi_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    dept_id UUID REFERENCES public.departments(id),
    position_id UUID REFERENCES public.positions(id),
    role_description TEXT NOT NULL,            -- 예: '중3-2 담임', '과학교과 전담'
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- [영역 3] 교직원 근태, 연차, 연장근무 및 접속 IP 로그
-- ============================================================================

-- 9. 근무 기초 설정 테이블 (근태기초설정, 근무일설정)
CREATE TABLE public.work_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_start_time TIME NOT NULL DEFAULT '08:30:00',
    work_end_time TIME NOT NULL DEFAULT '16:30:00',
    working_days JSONB DEFAULT '["MON","TUE","WED","THU","FRI"]'::jsonb,
    require_school_ip_for_attendance BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 교직원 일일 출퇴근 및 근태 기록 테이블
CREATE TABLE public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    work_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    check_in_ip TEXT,                          -- 출근 클릭 시 공인 IP
    check_out_ip TEXT,                         -- 퇴근 클릭 시 공인 IP
    is_valid_school_ip BOOLEAN DEFAULT FALSE,  -- 학교 허용 IP 일치 여부
    attendance_status TEXT NOT NULL DEFAULT 'PRESENT' 
        CHECK (attendance_status IN ('PRESENT', 'LATE', 'EARLY_LEAVE', 'ANNUAL_LEAVE', 'HALF_LEAVE', 'SICK_LEAVE', 'BUSINESS_TRIP', 'OFFICIAL_LEAVE', 'ABSENT')),
    approval_doc_id UUID,                      -- 전자결재 연동 ID (연차/출장 등 자동 연동)
    overtime_minutes INT DEFAULT 0,            -- 연장근무 시간(분)
    overtime_approved BOOLEAN DEFAULT FALSE,   -- 연장근무 승인 여부
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, work_date)
);

-- 11. 연차 조정 및 이력 관리 테이블 (연차일괄등록, 연차조정, 전자결재 차감 내역)
CREATE TABLE public.leave_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('INITIAL_GRANT', 'USED_BY_APPROVAL', 'MANUAL_ADJUST', 'CANCEL_RESTORE')),
    change_days NUMERIC(4,1) NOT NULL,         -- 예: -1.0, -0.5, +15.0
    balance_after NUMERIC(4,1) NOT NULL,       -- 변경 후 잔여 연차
    reason TEXT NOT NULL,
    approval_doc_id UUID,                      -- 연동된 전자결재 문서 ID
    processed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- [영역 4] 학생 명단 및 반별 일일 출결 관리
-- ============================================================================

-- 12. 학생 명렬표 테이블
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_no TEXT UNIQUE NOT NULL,           -- 학번
    name TEXT NOT NULL,
    grade INT NOT NULL,                        -- 학년
    class_no INT NOT NULL,                     -- 반
    number_in_class INT NOT NULL,              -- 번호
    homeroom_teacher_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'TRANSFERRED', 'GRADUATED', 'DROPPED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. 반별 일일 출결 최종 Confirm 마스터 테이블
CREATE TABLE public.class_attendance_confirms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    grade INT NOT NULL,
    class_no INT NOT NULL,
    is_confirmed BOOLEAN DEFAULT FALSE,        -- 반별 출결 Confirm 여부
    confirmed_by UUID REFERENCES public.profiles(id),
    confirmed_at TIMESTAMPTZ,
    total_students INT DEFAULT 0,
    present_count INT DEFAULT 0,
    late_count INT DEFAULT 0,
    absent_count INT DEFAULT 0,
    sick_count INT DEFAULT 0,
    UNIQUE(attendance_date, grade, class_no)
);

-- 14. 학생 개별 일일 출결 상세 테이블 (Default: PRESENT)
CREATE TABLE public.student_daily_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    confirm_id UUID REFERENCES public.class_attendance_confirms(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'LATE', 'ABSENT', 'SICK')), -- 출석, 지각, 결석, 병결
    comment TEXT,                              -- 간단한 코멘트 메모칸
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, attendance_date)
);

-- ============================================================================
-- [영역 5] 전자결재 시스템 (양식, 결재선 템플릿, 기안문서, 결재단계, 참조/합의)
-- ============================================================================

-- 15. 기안/문서/근태신청서 양식 관리 테이블 (휴가/연차계, 지출결의서, 출장신청서, 구매기안문 등)
CREATE TABLE public.approval_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_category TEXT NOT NULL CHECK (template_category IN ('GENERAL_DRAFT', 'ATTENDANCE_REQ', 'EXPENSE', 'PURCHASE', 'OFFICIAL_DOC')),
    template_name TEXT NOT NULL,
    form_schema JSONB NOT NULL DEFAULT '[]'::jsonb, -- 양식 입력 필드 구조 (JSON Schema)
    default_html_content TEXT,                      -- 기본 에디터 양식 HTML
    default_approval_steps JSONB DEFAULT '[]'::jsonb, -- 기본 결재선 단계 설정 (3단계, 4단계 등)
    auto_deduct_leave BOOLEAN DEFAULT FALSE,        -- 결재 완료 시 연차 자동 차감 여부
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- 16. 전자결재 기안 문서 마스터 테이블
CREATE TABLE public.approval_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_number TEXT UNIQUE NOT NULL,           -- 문서번호 (예: 2026-교무-0042)
    template_id UUID REFERENCES public.approval_templates(id),
    drafter_id UUID REFERENCES public.profiles(id),
    dept_id UUID REFERENCES public.departments(id),
    title TEXT NOT NULL,
    content_html TEXT NOT NULL,                -- 기안 내용 본문
    form_data JSONB DEFAULT '{}'::jsonb,       -- 휴가일자, 지출금액, 연차일수 등 구조화된 데이터
    special_notes TEXT,                        -- 특이 사항 선택 기재란
    external_links JSONB DEFAULT '[]'::jsonb,  -- 외부 참조 링크 리스트
    attachments JSONB DEFAULT '[]'::jsonb,     -- 첨부파일 메타데이터 (Supabase Storage URL)
    doc_status TEXT NOT NULL DEFAULT 'PENDING' 
        CHECK (doc_status IN ('DRAFT', 'PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'RETURNED')),
    current_step_order INT DEFAULT 1,
    final_approved_at TIMESTAMPTZ,
    pdf_storage_url TEXT,                      -- 결재 완료 후 생성된 인쇄/보관용 PDF 경로
    is_deleted BOOLEAN DEFAULT FALSE,          -- 관리자 삭제 시 Soft Delete
    deleted_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. 전자결재 결재선 단계 및 서명 기록 테이블 (일반결재, 전결, 합의/협조, 반려 지원)
CREATE TABLE public.approval_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id UUID REFERENCES public.approval_documents(id) ON DELETE CASCADE,
    step_order INT NOT NULL,                   -- 1: 부서장, 2: 재정(선택), 3: 부교장/교장 등
    step_type TEXT NOT NULL DEFAULT 'APPROVAL' CHECK (step_type IN ('APPROVAL', 'AGREEMENT', 'COOPERATION', 'REFERENCE')), -- 결재, 합의, 협조, 참조
    approver_id UUID REFERENCES public.profiles(id),
    delegate_approver_id UUID REFERENCES public.profiles(id), -- 전결(대리 결재) 수행자
    is_delegated BOOLEAN DEFAULT FALSE,        -- 전결 여부
    step_status TEXT NOT NULL DEFAULT 'WAITING' CHECK (step_status IN ('WAITING', 'APPROVED', 'REJECTED', 'HOLD')),
    comment TEXT,                              -- 결재 의견 또는 반려 사유
    signature_snapshot_url TEXT,               -- 결재 당시 찍힌 전자서명(도장) 이미지 스냅샷
    acted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- [영역 6] 일정 관리 (Calendar) 및 전자게시판 (Board)
-- ============================================================================

-- 18. 일정 카테고리 및 작성 권한 관리 테이블 (학사일정 전체, 부서별 일정, 교사 개인 일정)
CREATE TABLE public.calendar_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_code TEXT UNIQUE NOT NULL,        -- 'ACADEMIC_ALL', 'DEPT', 'PERSONAL'
    category_name TEXT NOT NULL,
    color_hex TEXT NOT NULL DEFAULT '#2563EB',
    allowed_writer_roles JSONB DEFAULT '["SUPER_ADMIN", "ADMIN"]'::jsonb,
    allowed_writer_users JSONB DEFAULT '[]'::jsonb, -- 관리자가 지정한 특정 일정 작성 가능 교직원 ID 목록
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. 일정(이벤트) 테이블
CREATE TABLE public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.calendar_categories(id) ON DELETE CASCADE,
    dept_id UUID REFERENCES public.departments(id), -- 부서별 일정일 경우 대상 부서
    owner_id UUID REFERENCES public.profiles(id),   -- 작성자 (개인 일정일 경우 본인)
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. 전자게시판 마스터 테이블 (전체 공지사항, 교무회의록, 수업/행정 자료실 등)
CREATE TABLE public.boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_code TEXT UNIQUE NOT NULL,           -- 'NOTICE_ALL', 'MEETING_LOG', 'ARCHIVE'
    board_name TEXT NOT NULL,
    description TEXT,
    allowed_writer_roles JSONB DEFAULT '["SUPER_ADMIN", "ADMIN", "APPROVER"]'::jsonb,
    allowed_writer_users JSONB DEFAULT '[]'::jsonb,
    allow_comments BOOLEAN DEFAULT TRUE,
    allow_attachments BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. 게시글 테이블 (필독 상단 고정, 대용량 첨부파일 연동)
CREATE TABLE public.board_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    content_html TEXT NOT NULL,
    is_must_read BOOLEAN DEFAULT FALSE,        -- 필독 공지 상단 고정 여부
    is_pinned BOOLEAN DEFAULT FALSE,           -- 일반 상단 고정
    attachments JSONB DEFAULT '[]'::jsonb,     -- Supabase Storage 대용량 첨부파일 리스트
    view_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. 교사별 게시글 열람(읽음) 확인 테이블 (누가 언제 공지를 읽었는지 추적)
CREATE TABLE public.board_post_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.board_posts(id) ON DELETE CASCADE,
    reader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, reader_id)
);

-- 23. 게시글 댓글 테이블
CREATE TABLE public.board_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.board_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- [영역 7] 전사 통합 감사 로그 및 접속 IP 기록 (모든 활동 영구 보존 및 검색)
-- ============================================================================

-- 24. 시스템 통합 감사 및 접속 IP 기록 테이블
CREATE TABLE public.audit_and_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    actor_email TEXT,
    actor_name TEXT,
    action_category TEXT NOT NULL CHECK (action_category IN ('AUTH_LOGIN', 'ATTENDANCE_CLICK', 'APPROVAL_ACT', 'ADMIN_CHANGE', 'PASSWORD_RESET', 'DATA_DELETE')),
    action_detail TEXT NOT NULL,               -- 상세 수행 내역 (검색 대상)
    target_table TEXT,
    target_id UUID,
    client_ip TEXT NOT NULL,                   -- 접속 공인 IP
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,        -- 변경 전/후 데이터 스냅샷
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 검색 성능을 위한 인덱스 생성
CREATE INDEX idx_staff_attendance_date ON public.staff_attendance(work_date, teacher_id);
CREATE INDEX idx_student_attendance_date ON public.student_daily_attendance(attendance_date, student_id);
CREATE INDEX idx_approval_docs_status ON public.approval_documents(doc_status, drafter_id);
CREATE INDEX idx_board_posts_must_read ON public.board_posts(board_id, is_must_read, created_at DESC);
CREATE INDEX idx_audit_logs_search ON public.audit_and_access_logs(action_category, client_ip, created_at DESC);
```

---

## 3. Supabase RLS (Row Level Security) 보안 정책 초안

관리자(Superuser 및 일반 Admin)와 교직원 권한을 명확히 분리하고, 본인의 데이터 및 허용된 범위만 수정할 수 있도록 하는 RLS 정책입니다.

```sql
-- 모든 테이블 RLS 활성화
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_multi_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_attendance_confirms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_post_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_and_access_logs ENABLE ROW LEVEL SECURITY;

-- [헬퍼 함수] 현재 로그인한 사용자가 관리자(SUPER_ADMIN 또는 ADMIN)인지 판별
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_role_code TEXT;
BEGIN
    SELECT r.role_code INTO v_role_code
    FROM public.profiles p
    JOIN public.roles r ON p.primary_role_id = r.id
    WHERE p.id = auth.uid();
    
    RETURN v_role_code IN ('SUPER_ADMIN', 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. 교직원 프로필(profiles) 정책: 모든 인증된 교직원은 조직도/연락처 열람 가능, 수정은 본인(비밀번호/서명 등) 또는 관리자만 가능
CREATE POLICY "교직원 프로필 전체 조회 허용" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "교직원 본인 정보 및 관리자 수정 허용" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "관리자만 교직원 추가/삭제 가능" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin());

-- 2. 교직원 근태(staff_attendance) 정책: 본인은 본인 근태 조회 및 생성 가능, 관리자는 전체 조회/수정 가능
CREATE POLICY "본인 및 관리자 근태 조회" ON public.staff_attendance
    FOR SELECT TO authenticated USING (teacher_id = auth.uid() OR public.is_admin());

CREATE POLICY "본인 출퇴근 기록 생성" ON public.staff_attendance
    FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid() OR public.is_admin());

CREATE POLICY "본인 퇴근 업데이트 및 관리자 근태 수정" ON public.staff_attendance
    FOR UPDATE TO authenticated USING (teacher_id = auth.uid() OR public.is_admin());

-- 3. 학생 출결(student_daily_attendance & class_attendance_confirms) 정책: 모든 교직원 조회 및 당일 출결 체크/Confirm 가능
CREATE POLICY "교직원 학생 출결 조회 및 입력" ON public.student_daily_attendance
    FOR ALL TO authenticated USING (true);

CREATE POLICY "교직원 반별 출결 Confirm 처리" ON public.class_attendance_confirms
    FOR ALL TO authenticated USING (true);

-- 4. 전자결재 문서(approval_documents) 정책: 기안자, 결재선/참조자에 포함된 교사, 또는 관리자만 열람 가능
CREATE POLICY "결재 관련자 및 관리자만 결재문서 열람" ON public.approval_documents
    FOR SELECT TO authenticated USING (
        drafter_id = auth.uid() 
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.approval_steps s 
            WHERE s.doc_id = id AND (s.approver_id = auth.uid() OR s.delegate_approver_id = auth.uid())
        )
    );

CREATE POLICY "교직원 기안 상신 허용" ON public.approval_documents
    FOR INSERT TO authenticated WITH CHECK (drafter_id = auth.uid());

CREATE POLICY "기안자, 결재자 및 관리자 문서 상태 업데이트" ON public.approval_documents
    FOR UPDATE TO authenticated USING (
        drafter_id = auth.uid() OR public.is_admin() OR EXISTS (
            SELECT 1 FROM public.approval_steps s WHERE s.doc_id = id AND s.approver_id = auth.uid()
        )
    );

-- 5. 일정관리(calendar_events) 정책: 전체/부서 일정은 모두 조회, 개인 일정은 본인만 조회
CREATE POLICY "일정 조회 정책" ON public.calendar_events
    FOR SELECT TO authenticated USING (
        owner_id = auth.uid() 
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.calendar_categories c 
            WHERE c.id = category_id AND c.category_code IN ('ACADEMIC_ALL', 'DEPT')
        )
    );

-- 6. 전자게시판(board_posts & board_post_reads) 정책: 삭제되지 않은 게시글 전체 조회, 읽음 확인은 본인 ID로 기록
CREATE POLICY "게시글 조회" ON public.board_posts
    FOR SELECT TO authenticated USING (is_deleted = FALSE OR public.is_admin());

CREATE POLICY "본인 읽음 확인 기록" ON public.board_post_reads
    FOR ALL TO authenticated USING (reader_id = auth.uid() OR public.is_admin());

-- 7. 감사 및 IP 로그(audit_and_access_logs) 정책: 오직 관리자만 조회 가능, 시스템(모두) INSERT 가능
CREATE POLICY "관리자만 감사/IP 로그 검색 가능" ON public.audit_and_access_logs
    FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "로그 기록 생성 허용" ON public.audit_and_access_logs
    FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 4. Antigravity & Claude Code 구현용 핵심 비즈니스 로직 가이드

3명의 개발자가 Antigravity 환경에서 바로 구현해야 할 4가지 핵심 Server Actions / API 명세입니다.

### ① 초기 비밀번호(`1234`) 생성 및 관리자 Reset 로직
* **요구사항:** 개인 Gmail을 ID로 사용하며 초기 비밀번호는 `1234`. 관리자가 계정 생성 및 `1234`로 Reset 가능해야 함.
* **구현 방법 (`app/actions/admin-auth.ts`):**
  * Supabase 기본 Auth 정책은 최소 6자리 비밀번호를 요구하므로, **Supabase Dashboard -> Authentication -> Providers -> Email -> Minimum password length를 `4`로 설정**합니다.
  * 관리자가 교사 계정을 추가하거나 `[비밀번호 1234 초기화]` 버튼을 누르면, Next.js Server Action에서 `SUPABASE_SERVICE_ROLE_KEY`를 사용한 `supabaseAdmin.auth.admin.updateUserById(userId, { password: '1234' })`를 호출하고 `profiles.must_change_password = true`로 업데이트합니다.
  * 교직원 일괄 등록(Excel/CSV 템플릿 다운로드 및 업로드) 시에도 루프를 돌며 `supabaseAdmin.auth.admin.createUser()`를 실행합니다.

### ② 학교 공인 IP 판별 기반 출퇴근 버튼 로직
* **요구사항:** 외부에서도 인트라넷 접속은 가능하지만, 출퇴근 버튼은 **학교 공인 IP**에서 클릭했을 때만 정상 출퇴근으로 인정하며 모든 접속 IP 기록을 남김.
* **구현 방법 (`app/actions/attendance.ts`):**
  * Next.js Server Action에서 요청 헤더 `headers().get('x-forwarded-for')?.split(',')[0]`를 통해 사용자의 공인 IP를 추출합니다.
  * `allowed_ips` 테이블에서 `ip_type = 'SCHOOL_ALLOWED'` 및 `is_active = true`인 IP 목록과 대조합니다.
  * 일치하지 않을 경우 `"학교 네트워크(공인 IP) 환경에서만 출퇴근 체크가 가능합니다. (현재 접속 IP: xxx.xxx.xxx.xxx)"` 알림을 띄우고, 시도 기록은 `audit_and_access_logs`에 즉시 기록합니다.

### ③ 전자결재 완료 시 연차 자동 차감 및 근태 연동 트리거
* **요구사항:** 휴가/연차계 기안이 최종 결재(`APPROVED`) 완료되면 교사의 잔여 연차가 자동 차감되고 교직원 근태 현황에 자동 반영됨.
* **구현 방법 (PostgreSQL Trigger 또는 Server Action 트랜잭션):**
  * 마지막 결재자(예: 교장/부교장 또는 전결권자)가 `[승인]`을 누르면:
    1. 결재자의 `profiles.signature_image_url`을 `approval_steps.signature_snapshot_url`에 복사하여 도장 이미지를 박제합니다.
    2. `approval_documents.doc_status = 'APPROVED'`로 변경합니다.
    3. 양식이 `auto_deduct_leave = true`인 경우, `profiles.remaining_leave_days`에서 신청 일수를 차감하고, `leave_histories`에 차감 이력을 남기며, 해당 휴가 일자의 `staff_attendance` 테이블에 `ANNUAL_LEAVE` 또는 `HALF_LEAVE` 레코드를 자동 생성합니다.

### ④ 반별 학생 출결 Default 체크 및 일괄 Confirm 로직
* **요구사항:** 매일 반별로 모든 학생이 기본값 `출석(PRESENT)`으로 세팅되어 있고, 교사가 지각/결석/병결 및 코멘트를 수정한 뒤 `[출결 Confirm]` 버튼을 누르면 그날의 반 출결이 확정됨(재수정 후 다시 Confirm 가능).
* **구현 방법:**
  * 교사가 반별 출결 화면에 진입하면 해당 학년/반 학생 명단을 불러오며, 당일 데이터가 아직 없으면 UI 상에서 전체 `출석(PRESENT)`으로 기본 체크된 상태를 보여줍니다.
  * `[출결 Confirm]` 클릭 시 `class_attendance_confirms` 테이블에 통계(출석/지각/결석/병결 수)와 `confirmed_at`, `confirmed_by`를 Upsert하고, 관리자 대시보드의 `[반별 학생 출결 현황]` 위젯에 실시간 반영합니다.