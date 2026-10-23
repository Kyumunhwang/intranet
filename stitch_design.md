# 🎨 DESIGN.md — 교직원 인트라넷 UI/UX 디자인 시스템 & Google Stitch 프롬프트 북

본 문서는 **Google Stitch**에 그대로 복사하여 화면을 생성하거나, **Antigravity / Claude Code**가 프론트엔드 컴포넌트(Next.js + Tailwind CSS + shadcn/ui)를 생성할 때 참조하는 표준 디자인 명세서입니다.

---

## 1. 디자인 톤앤매너 & 스타일 가이드 (Notion & Linear Style)

* **디자인 컨셉:** 교무실 와이드 모니터(PC) 환경에 최적화된 고밀도(High-density), 깔끔하고 차분한 업무용 워크스페이스. 불필요한 장식을 배제하고 데이터 가독성과 빠른 업무 처리에 집중한 **Notion + Linear 하이브리드 스타일**.
* **색상 팔레트 (Tailwind CSS 기준):**
  * **Background:** `#F8FAFC` (Slate-50, 전체 배경) / `#FFFFFF` (순백색 카드 및 테이블 배경)
  * **Sidebar (LNB):** `#0F172A` (Slate-900, 차분한 다크 네이비 사이드바) 또는 `#F1F5F9` (관리자 테마 설정에 따라 동적 변경 지원)
  * **Primary Accent:** `#2563EB` (Blue-600, 주요 액션 버튼 및 활성 메뉴)
  * **Semantic Status Colors:**
    * 출석 / 승인완료 / 정상: `#10B981` (Emerald-500, 배경 `#ECFDF5`)
    * 지각 / 결재대기 / 진행중: `#F59E0B` (Amber-500, 배경 `#FFFBEB`)
    * 결석 / 반려 / 차단IP: `#EF4444` (Red-500, 배경 `#FEF2F2`)
    * 병결 / 조퇴 / 전결: `#6366F1` (Indigo-500, 배경 `#EEF2FF`)
* **타이포그래피:** `Pretendard` 또는 `Inter`, 본문 `14px (text-sm)`, 표 내부 데이터 `13px`, 대시보드 핵심 숫자 `24px (text-2xl font-bold)`.
* **공통 레이아웃 구조 (Desktop First - 1920x1080 최적화):**
  * **좌측 고정 사이드바 (Width: 250px):** 학교 로고(상단), 핵심 메뉴 네비게이션(대시보드, 출퇴근/근태, 학생출결, 전자결재, 일정관리, 전자게시판, 조직도).
  * **상단 고정 헤더 (Height: 60px):**
    * 좌측: 현재 페이지 Breadcrumb 및 **학교 공인 IP 접속 상태 배지** (`🟢 학교 IP 접속중: 211.xxx.xxx.xxx` + `[출근하기]` / `[퇴근하기]` 원클릭 버튼).
    * 우측: 통합 기록 검색창(`Cmd+K`), 알림 아이콘, 교사 프로필/다중역할 배지(예: `중3 담임 · 과학교과`), 그리고 **관리자 권한 보유자에게만 노출되는 최상단 우측 `🔒 관리자 화면 이동 (Admin Console)` 버튼**.

---

## 2. Google Stitch 입력용 화면별 상세 프롬프트 (총 6개 핵심 화면)

아래의 각 프롬프트 블록을 **Google Stitch**에 하나씩 복사하여 붙여넣으면 일관된 고품질 UI와 React/Tailwind 코드를 얻을 수 있습니다.

---

### 🖥️ [Stitch 프롬프트 1] 교직원 메인 대시보드 (로그인 직후 첫 화면)

```text
Create a clean, professional desktop web application dashboard for a school intranet in a Notion and Linear inspired minimal style using Tailwind CSS and shadcn/ui components.

Layout Structure:
1. Left Fixed Sidebar (250px wide, dark slate #0F172A):
   - Top: School Logo placeholder and School Name ("우리학교 인트라넷").
   - Navigation Links: 홈 대시보드 (Active), 교직원 근태/연차, 반별 학생출결, 전자결재 (with badge "3"), 학사 일정관리, 전자게시판, 교직원 조직도.
2. Top Header Bar (60px high, white background with bottom border):
   - Left side: Live IP status badge ("🟢 학교 공인 IP 인증됨: 211.104.xx.xx") next to quick action buttons "[출근 체크 08:15]" and "[퇴근 체크]".
   - Right side: Global search input ("모든 문서, 게시글, 기록 검색..."), notification bell, user profile ("김교사 · 중3 담임 / 과학교과"), and a prominent dark red/indigo button at the very top right: "[🔒 관리자 로그인 / 관리자 화면]".
3. Main Content Area (3-column Bento Grid layout on #F8FAFC background):
   - Top Summary Row (3 KPI Cards):
     a) [내가 결재할 문서 건수]: Big number "4건" (긴급 1건, 일반 3건) with a quick "결재함 이동" link.
     b) [사용 가능한 연차 현황]: Big number "11.5일 / 15일" with a progress bar and "[휴가/연차 기안하기]" button.
     c) [오늘의 내 근태 상태]: "정상 출근 (08:12)" and cumulative overtime this month.
   - Middle Left Widget (Span 2 columns): [반별 학생 출결 리스트 및 일일 Confirm]
     - Header with Grade/Class selector ("중등 3학년 2반") and a primary button "[✅ 오늘 출결 최종 Confirm]".
     - Compact table of students: 번호, 이름, 출결상태 radio pills (출석 Default selected in green, 지각, 결석, 병결), and an inline "코멘트/메모" text input per student.
   - Middle Right Widget (Span 1 column): [오늘의 학사일정]
     - Filter pills (전체 학사, 부서별, 개인) and a timeline list of today's school events.
   - Bottom Full-Width Widget: [최신 필독 공지 5개]
     - Table showing "[필독]" red badge, post title, author (교무부장), date, attachment icon, and a read-receipt status column ("열람 42/50명").
```

---

### 🖥️ [Stitch 프롬프트 2] 전자결재 기안 작성 및 동적 결재선/전자서명 화면

```text
Design an Electronic Approval System (전자결재 기안 및 결재 상세 화면) for a school intranet in a clean Linear/Notion style for desktop widescreen.

Key UI Components to include:
1. Top Action Bar: Document Category Selector Dropdown ("휴가/연차계", "지출결의서", "출장신청서", "구매기안문"), "[임시저장]", "[결재 상신하기 (Primary Blue)]", and "[🖨️ 공문서 PDF 출력/인쇄]".
2. Official Document Header & Stamp Box (공문서 결재선 도장란):
   - Left: 문서번호 (자동생성), 기안부서 (교무부), 기안자 (김교사), 기안일자.
   - Right: A traditional Korean official approval stamp table (결재선 박스) supporting 3 to 4 dynamic steps: [기안자] -> [부서장] -> [재정실장 (선택)] -> [부교장/교장]. Inside approved boxes, show a realistic digital signature/stamp image (전자서명 도장 이미지) and approval date/time; also include a badge for "[전결]" (Delegated Approval) if applicable.
3. Dynamic Approval Line Controls:
   - Button "[+ 결재선 변경 / 단축 지정]" allowing the user to customize approvers, add "[합의/협조 부서]", and select "[참조자 지정]" tags.
   - Special Action Buttons for Approvers: "[승인]", "[전결 승인]", "[반려 (사유 입력 모달)]".
4. Main Form Area:
   - Document Title input.
   - Structured fields based on template (e.g., for Leave Request: 휴가종류 [연차/반차/병가/공가], 기간 선택, 차감 연차 일수 자동계산 "1.0일").
   - Rich Text Editor area for main draft content (기안 내용).
   - Special Notes section (특이사항 기재란 - collapsible or highlighted box).
   - Attachments & External Links section: Drag-and-drop file upload box (Supabase Storage) and an "[+ 참조 링크(URL) 추가]" list.
```

---

### 🖥️ [Stitch 프롬프트 3] 학사 일정관리 (캘린더 뷰) & 전자게시판 (열람 확인 포함)

```text
Design a split or tabbed workspace for School Calendar (일정관리) and Electronic Board (전자게시판) in a clean Notion/Linear desktop UI.

Section A - Calendar View (일정관리):
- Top Toolbar: Month/Week/Day switcher, Category Dropdown filter ("전체 일정 보기", "학사일정 전체 (Blue)", "부서별 일정 (Emerald)", "교사 개인 일정 (Purple)"), and "[+ 새 일정 등록]" button (enabled only for authorized writers).
- Full Monthly Calendar Grid showing color-coded event bars. Clicking a date or event opens a slide-over modal to add, edit, or delete the schedule.

Section B - Electronic Board Detail & Read-Receipt Tracker (전자게시판 및 열람 확인):
- Left Sub-navigation: 전체 공지사항, 교무회의록, 수업/행정 자료실.
- Pinned Must-Read Banner at top of post list.
- Post Detail View: Title with "[필독 고정]" badge, Author info, Large Attachment download cards (with file size), Comment thread at bottom, and a special collapsible panel "[👁️ 교사별 열람(읽음) 확인 현황: 45/50명 완료]" showing badges of teachers who have read vs. not yet read the notice.
```

---

### 🖥️ [Stitch 프롬프트 4] 관리자 전용 콘솔 — 첫 화면 & 학교정보/조직도/권한 관리

```text
Design a comprehensive "Admin Console (관리자 전용 화면)" for a 50-teacher school intranet, using a high-density, structured enterprise UI (Linear/Vercel dashboard style).

1. Admin Sidebar Navigation (6 Categorized Groups from demand.md):
   - 🌟 관리자 홈 (테마/공지/학생출결 요약)
   - [학교정보관리] 기본정보 등록, 조직도/다중역할 등록, 교직원 일괄등록/관리, 부서할당
   - [권한관리] 권한코드 등록, 메뉴별 권한설정(조회/저장/인쇄/삭제), 사용자별 권한설정
   - [인트라넷 관리] 접속 IP 관리(출퇴근 IP 기록), 전자결재/게시판 삭제, 문서/기안/근태 양식관리
   - [업무지원] 사원별/부서별/일별/월별 근태현황, 퇴사자 근태확인, 월별 연장근무 현황
   - [근태 및 연차관리] 근무기초/근무일 설정, 연장근무 승인, 연차조정, 연차 일괄등록

2. Main Area Content (Admin Home + School HR & Role Management):
   - Top Row Widgets:
     a) [전체 반별 학생 출결 실시간 현황판]: Grid of classes (초등~중고등) showing "Confirm 완료 (Green)" vs "미확정 (Amber)" and total present/absent counts.
     b) [화면 테마 및 로그인 화면 커스텀]: Primary color picker, Theme toggle, School Logo uploader, Login background image manager, and Global Notice editor.
   - Bottom Section (교직원 DB 및 계정/다중역할 관리 테이블):
     - Search bar (이름, 부서, 과목, 고용형태 필터), "[📥 엑셀 템플릿 다운로드]", "[📤 교직원 일괄 등록]", "[+ 교직원 개별 추가]".
     - Data Table columns: 사번, 성명(국/영), 이메일(Gmail ID), 고용형태 배지(정규직원/파트교사/외부강사), 주부서/직책, 다중역할 태그(예: "중3담임 + 과학교과"), 잔여연차, 권한등급 Dropdown(Superuser/관리자/결재권자/일반교사), and Action buttons: "[수정]", "[🔄 비밀번호 1234 Reset]", "[삭제]".
   - Menu Permission Matrix Sub-panel: Table with rows as Menus and columns as Checkboxes for [조회], [저장], [인쇄], [삭제].
```

---

### 🖥️ [Stitch 프롬프트 5] 관리자 전용 콘솔 — 인트라넷(공인 IP/양식) 및 근태/연차 통합 관리

```text
Design the "Intranet IP Security, Form Builder & Staff Attendance/Leave Management" screen inside the School Admin Console in a clean desktop UI.

Layout split into 3 functional tabs/panels:
1. [접속 IP 관리 및 출퇴근 공인 IP 로그 검색]:
   - Left card: "학교 허용 공인 IP 및 차단 IP 등록" (IP 주소 입력, 설명, 허용/차단 상태 토글, 추가/삭제).
   - Right card: "일별 교직원 출퇴근 공인 IP 접속 기록 검색" — Date range picker, Teacher search, IP filter, showing a detailed log table: 일시, 교사명, 구분(출근/퇴근/외부접속), 접속 공인 IP, 학교 IP 일치 여부(정상/외부IP경고), 단말기 정보.
2. [업무지원 및 근태/연차 통합 관리]:
   - Filter bar for 사원별 / 부서별 / 일별 / 월별 근태집계 및 "퇴사자 근태확인" toggle, plus "월별 연장근무 승인 대기 목록".
   - Annual Leave Adjustment Panel (연차조정 및 연차일괄등록): Select teachers, input "+/- 조정 일수", reason input, and "[연차 일괄 부여/조정]" button.
3. [기안/문서/근태양식 빌더]:
   - List of templates (휴가/연차계, 지출결의서, 출장신청서, 구매기안문) with buttons to Add, Edit, or Delete templates and configure default 3-step or 4-step approval lines.
```

---

## 3. Antigravity 프로젝트 폴더 구조 권장안 (GitHub 3인 협업용)

3명의 개발자가 충돌 없이 동시에 작업할 수 있도록 모듈별로 분리된 Next.js App Router 디렉토리 구조입니다.

```text
school-intranet/
├── DESIGN.md                         # UI/UX 가이드 및 Stitch 프롬프트
├── STAGE1_DB_AND_DEV_SPEC.md         # DB 스키마, RLS 및 백엔드 명세서
├── supabase/
│   └── migrations/
│       └── 0001_init_intranet.sql    # 위 1단계 SQL 스크립트 전체
├── src/
│   ├── app/
│   │   ├── (auth)/login/             # 로그인 전 화면 (관리자 설정 이미지/공지 반영)
│   │   ├── (workspace)/              # 일반 교직원 업무 공간 (LNB + Header)
│   │   │   ├── page.tsx              # 메인 대시보드 (5대 핵심 위젯)
│   │   │   ├── attendance/           # 교직원 출퇴근(IP검증) 및 반별 학생 출결 Confirm
│   │   │   ├── approval/             # 전자결재 기안, 결재함, 도장/PDF 출력
│   │   │   ├── calendar/             # 학사/부서/개인 일정 캘린더
│   │   │   └── board/                # 전자게시판 (필독고정, 교사별 읽음 확인)
│   │   └── (admin)/admin/            # 🔒 관리자 전용 콘솔 (상단 버튼 진입)
│   │       ├── page.tsx              # 관리자 첫 화면 (학생출결현황, 테마/공지 변경)
│   │       ├── school-info/          # 기본정보, 조직도, 다중역할, 교직원 일괄등록, 1234 리셋
│   │       ├── permissions/          # 권한코드, 메뉴별(조회/저장/인쇄)/사용자별 권한
│   │       ├── intranet/             # 공인 IP 관리/검색, 결재/게시판 삭제, 양식 관리
│   │       ├── attendance-stat/      # 사원/부서/일/월별 근태, 퇴사자 근태, 연장근무
│   │       └── leave-manage/         # 근무기초설정, 연차조정, 연차일괄등록
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 공통 컴포넌트
│   │   ├── layout/                   # Sidebar, Header(출퇴근/IP배지/관리자버튼)
│   │   └── pdf/                      # 전자결재 공문서 PDF 인쇄용 레이아웃
│   └── lib/
│       ├── supabase/                 # client.ts, server.ts, admin.ts (Service Role)
│       └── ip-check.ts               # 공인 IP 추출 및 허용 IP 대조 유틸리티
```