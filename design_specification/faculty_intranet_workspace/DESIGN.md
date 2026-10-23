---
name: Faculty Intranet Workspace
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  canvas-bg: '#F8FAFC'
  surface-white: '#FFFFFF'
  sidebar-bg: '#0F172A'
  status-success: '#10B981'
  status-success-bg: '#ECFDF5'
  status-warning: '#F59E0B'
  status-warning-bg: '#FFFBEB'
  status-danger: '#EF4444'
  status-danger-bg: '#FEF2F2'
  status-info: '#6366F1'
  status-info-bg: '#EEF2FF'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-default:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  table-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  table-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  metric-stat:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

# 🎨 DESIGN.md — 교직원 인트라넷 UI/UX 디자인 시스템 & Google Stitch 프롬프트 북

## 1. 디자인 톤앤매너 & 스타일 가이드 (Notion & Linear Style)
* **디자인 컨셉:** 교무실 와이드 모니터(PC) 환경에 최적화된 고밀도(High-density), 깔끔하고 차분한 업무용 워크스페이스. 불필요한 장식을 배제하고 데이터 가독성과 빠른 업무 처리에 집중한 Notion + Linear 하이브리드 스타일.
* **색상 팔레트:**
  * **Background:** #F8FAFC (Slate-50) / #FFFFFF (순백색 카드 및 테이블)
  * **Sidebar (LNB):** #0F172A (Slate-900 다크 네이비)
  * **Primary Accent:** #2563EB (Blue-600 주요 액션 버튼 및 활성 메뉴)
  * **Semantic Status Colors:**
    * 출석 / 승인완료 / 정상: #10B981 (Emerald-500, 배경 #ECFDF5)
    * 지각 / 결재대기 / 진행중: #F59E0B (Amber-500, 배경 #FFFBEB)
    * 결석 / 반려 / 차단IP: #EF4444 (Red-500, 배경 #FEF2F2)
    * 병결 / 조퇴 / 전결: #6366F1 (Indigo-500, 배경 #EEF2FF)
* **타이포그래피:** Pretendard, 본문 14px (text-sm), 표 내부 데이터 13px, 핵심 숫자 24px (text-2xl font-bold).
* **레이아웃 구조 (Desktop First - 1920x1080 최적화):**
  * 좌측 고정 사이드바 (250px): 학교 로고, 홈 대시보드, 교직원 근태/연차, 반별 학생출결, 전자결재, 학사 일정관리, 전자게시판, 교직원 조직도.
  * 상단 고정 헤더 (60px): 학교 공인 IP 접속 배지(🟢 211.104.xx.xx) + 출퇴근 퀵버튼, 전사 검색(Cmd+K), 알림, 프로필 배지, 최상단 우측 [🔒 관리자 화면 이동 (Admin Console)] 버튼.
