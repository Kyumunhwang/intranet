'use client';

import React, { useState } from 'react';
import {
  FileText,
  Pin,
  Eye,
  Paperclip,
  CheckCircle2,
  Clock,
  User,
  Search,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

type BoardType = 'NOTICE' | 'MEETING' | 'ARCHIVE';

interface PostItem {
  id: string;
  boardType: BoardType;
  category: string;
  title: string;
  author: string;
  dept: string;
  date: string;
  views: number;
  readCount: number;
  totalTeachers: number;
  isMustRead: boolean;
  hasAttachment: boolean;
  attachmentName?: string;
  attachmentSize?: string;
  commentsCount: number;
  content: string;
}

export default function BoardPage() {
  const { lang, t } = useLanguage();
  const [selectedBoard, setSelectedBoard] = useState<BoardType>('NOTICE');
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [showReadTracker, setShowReadTracker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 3개 게시판별 완전히 독립된 고유 게시글 데이터
  const allPosts: Record<BoardType, PostItem[]> = {
    // 1. 전체 공지사항 게시판
    NOTICE: [
      {
        id: 'notice-1',
        boardType: 'NOTICE',
        category: '전체공지',
        title: '[필독] 2026학년도 1학기 교직원 복무 규정 및 학교 공인 IP 출퇴근 지침',
        author: '박교무',
        dept: '교무부',
        date: '2026.10.23',
        views: 42,
        readCount: 42,
        totalTeachers: 50,
        isMustRead: true,
        hasAttachment: true,
        attachmentName: '2026학년도_교직원_복무규정_전문.pdf',
        attachmentSize: '1.8 MB',
        commentsCount: 1,
        content: `선생님 여러분 안녕하십니까. 교무부입니다.
2026학년도 1학기 등대글로벌스쿨 복무 관리 지침 및 출퇴근 인정 정책을 안내해 드립니다.

📌 주요 출결 및 복무 준수 사항:
1. 출퇴근 체크는 학교 공인 IP(211.104.xx.xx) 대역에서만 정상 인정됩니다.
2. 정규 근무시간: 08:30 ~ 16:30 (지각 시 사유 기재 필수)
3. 반별 학생 일일 출결은 매일 08:50 이전까지 담임교사께서 최종 Confirm 확정해 주셔야 합니다. (출석, 지각, 결석, 병결, 조퇴, 무단조퇴, 무단결석 7개 상태 지원)
4. 연차 및 반차 사용 시 최소 1일 전 전자결재(휴가/연차원) 상신 및 최종 승인을 완료하여 주십시오.

문의 사항은 교무부(내선 201) 또는 행정실(내선 101)로 연락 바랍니다. 감사합니다.`,
      },
      {
        id: 'notice-2',
        boardType: 'NOTICE',
        category: '행정공지',
        title: '[행정실] 10월 연차 정기 사용 독려 및 전자결재 사전 상신 안내',
        author: '정총괄',
        dept: '행정실',
        date: '2026.10.23',
        views: 38,
        readCount: 38,
        totalTeachers: 50,
        isMustRead: false,
        hasAttachment: false,
        commentsCount: 0,
        content: `교직원 여러분 안녕하십니까. 행정실입니다.
당해 잔여 연차 일수를 확인하시고 계획적인 연차 사용을 권장합니다. 전자결재 시스템에서 휴가/연차계를 상신해 주시기 바랍니다.`,
      },
      {
        id: 'notice-3',
        boardType: 'NOTICE',
        category: '총무공지',
        title: '신학기 교직원 단체 피복(유니폼) 신청 및 치수 조사 안내',
        author: '정총괄',
        dept: '행정실',
        date: '2026.10.21',
        views: 47,
        readCount: 47,
        totalTeachers: 50,
        isMustRead: false,
        hasAttachment: true,
        attachmentName: '교직원_단체유니폼_치수표.xlsx',
        attachmentSize: '45 KB',
        commentsCount: 3,
        content: `2026학년도 1학기 교직원 춘추용 단체 유니폼 신청을 받습니다. 첨부된 서식을 작성하셔서 행정실로 제출해 주시기 바랍니다.`,
      },
    ],

    // 2. 교무회의록 게시판
    MEETING: [
      {
        id: 'meeting-1',
        boardType: 'MEETING',
        category: '정기회의',
        title: '10월 3주차 정기 교무회의 회의록 및 안건 의결 사항',
        author: '박교무',
        dept: '교무부',
        date: '2026.10.20',
        views: 49,
        readCount: 49,
        totalTeachers: 50,
        isMustRead: true,
        hasAttachment: true,
        attachmentName: '2026-10-3주차_교무회의록_의결본.pdf',
        attachmentSize: '840 KB',
        commentsCount: 0,
        content: `[10월 3주차 정기 교무회의 의결 사항]
일시: 2026년 10월 20일 16:30
장소: 본관 제1회의실
주재: 이교장, 박교무 부장

1. 신학기 방과후 자율동아리 개설 승인의 건: 원안 가결
2. 학생 출결 7단계 구분(조퇴, 무단조퇴, 무단결석) 인트라넷 전산 적용의 건: 승인 및 시행
3. 11월 학부모 상담주간 일정 확정의 건: 11월 10일 ~ 14일 진행`,
      },
      {
        id: 'meeting-2',
        boardType: 'MEETING',
        category: '교육과정',
        title: '2026학년도 1학기 교육과정 편성·운영 위원회 협의록',
        author: '박교무',
        dept: '교무부',
        date: '2026.10.15',
        views: 44,
        readCount: 44,
        totalTeachers: 50,
        isMustRead: false,
        hasAttachment: true,
        attachmentName: '교육과정_편성운영_협의록.pdf',
        attachmentSize: '1.2 MB',
        commentsCount: 1,
        content: `중고등부 및 초등부 교과 진도 및 블록 타임제 수업 편성에 관한 협의 결과입니다.`,
      },
      {
        id: 'meeting-3',
        boardType: 'MEETING',
        category: '생활지도',
        title: '학생생활지도 및 학교폭력 예방 교원 자율연수 협의록',
        author: '김교사',
        dept: '중고등부',
        date: '2026.10.10',
        views: 50,
        readCount: 50,
        totalTeachers: 50,
        isMustRead: false,
        hasAttachment: false,
        commentsCount: 0,
        content: `교내 상담실 및 담임교사 연계 생활지도 체계 강화 방안에 대한 회의 내용입니다.`,
      },
    ],

    // 3. 수업 및 행정 자료실 게시판
    ARCHIVE: [
      {
        id: 'archive-1',
        boardType: 'ARCHIVE',
        category: '수업서식',
        title: '2026학년도 중고등부 교과 진도 계획표 및 평가 기준 표준 서식',
        author: '박교무',
        dept: '교무부',
        date: '2026.10.22',
        views: 65,
        readCount: 46,
        totalTeachers: 50,
        isMustRead: true,
        hasAttachment: true,
        attachmentName: '2026_교과진도계획표_표준서식.hwp',
        attachmentSize: '120 KB',
        commentsCount: 2,
        content: `각 교과 담당 교사께서는 본 표준 서식을 다운로드하여 1학기 진도 계획 및 수행평가 기준안을 작성하여 교무부로 제출해 주시기 바랍니다.`,
      },
      {
        id: 'archive-2',
        boardType: 'ARCHIVE',
        category: '행정서식',
        title: '교직원 관외 출장보고서 양식 및 여비 정산 신청서 (엑셀)',
        author: '정총괄',
        dept: '행정실',
        date: '2026.10.18',
        views: 52,
        readCount: 41,
        totalTeachers: 50,
        isMustRead: false,
        hasAttachment: true,
        attachmentName: '출장보고서_여비정산서식.xlsx',
        attachmentSize: '68 KB',
        commentsCount: 0,
        content: `출장 완료 후 3일 이내에 영수증을 첨부하여 행정실로 제출할 수 있도록 구비된 정산 양식입니다.`,
      },
      {
        id: 'archive-3',
        boardType: 'ARCHIVE',
        category: '안전매뉴얼',
        title: '과학 실험실 안전 수칙 및 비상 대피 행동 매뉴얼 (2026 개정판)',
        author: '김교사',
        dept: '중고등부',
        date: '2026.10.12',
        views: 40,
        readCount: 40,
        totalTeachers: 50,
        isMustRead: false,
        hasAttachment: true,
        attachmentName: '과학실험실_안전대피매뉴얼_2026.pdf',
        attachmentSize: '3.4 MB',
        commentsCount: 1,
        content: `과학 실험 수업 시 비치해야 할 화학물질 관리 및 안전보호구 착용 지침서입니다.`,
      },
    ],
  };

  // 현재 선택된 게시판의 게시글 목록
  const currentBoardPosts = allPosts[selectedBoard] || [];

  const filteredPosts = currentBoardPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Title & Board Categories */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {selectedBoard === 'NOTICE' && t('전체 공지사항 게시판', 'School Notice Board')}
              {selectedBoard === 'MEETING' && t('교무회의록 게시판', 'Faculty Meeting Logs')}
              {selectedBoard === 'ARCHIVE' && t('수업 및 행정 자료실', 'Academic & Admin Archive')}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {selectedBoard === 'NOTICE' && t('전교직원 필독 공지 및 학사/행정 안내 사항을 열람합니다.', 'General school notices and announcements.')}
            {selectedBoard === 'MEETING' && t('주간 교무회의 및 교육과정 위원회 의결 사항 회의록을 확인합니다.', 'Official weekly faculty meeting records.')}
            {selectedBoard === 'ARCHIVE' && t('각종 교과 진도표, 출장 서식, 안전 매뉴얼을 다운로드합니다.', 'Templates, course syllabi, and administrative forms.')}
          </p>
        </div>

        {/* Board Category Switcher (각각의 게시판으로 즉시 전환) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedBoard('NOTICE');
              setSelectedPost(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              selectedBoard === 'NOTICE'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('전체 공지사항', 'Notice Board')}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedBoard('MEETING');
              setSelectedPost(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              selectedBoard === 'MEETING'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('교무회의록', 'Meeting Logs')}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedBoard('ARCHIVE');
              setSelectedPost(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              selectedBoard === 'ARCHIVE'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('수업/행정 자료실', 'Archive')}
          </button>
        </div>
      </div>

      {/* View Switch: List View vs Post Detail View */}
      {!selectedPost ? (
        /* Board Table List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 font-mono">
                {selectedBoard === 'NOTICE' && '공지사항 '}
                {selectedBoard === 'MEETING' && '교무회의록 '}
                {selectedBoard === 'ARCHIVE' && '자료실 '}
                등록글: {filteredPosts.length}건
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('제목, 작성자 검색...', 'Search...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 h-8 pl-8 pr-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-container"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="button"
                className="h-8 px-3 rounded-lg bg-primary-container hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('글쓰기', 'New Post')}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-4 w-14 text-center">{t('번호', 'No')}</th>
                  <th className="py-2.5 px-4 w-24 text-center">{t('분류', 'Category')}</th>
                  <th className="py-2.5 px-4">{t('제목', 'Title')}</th>
                  <th className="py-2.5 px-4 w-28">{t('작성자', 'Author')}</th>
                  <th className="py-2.5 px-4 w-24 text-center">{t('작성일', 'Date')}</th>
                  <th className="py-2.5 px-4 w-16 text-center">{t('조회', 'Views')}</th>
                  <th className="py-2.5 px-4 w-36 text-center">{t('교사별 열람 상태', 'Read Receipts')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPosts.map((post, idx) => (
                  <tr
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      post.isMustRead ? 'bg-rose-50/25 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {post.isMustRead ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-status-danger text-white">
                          필독
                        </span>
                      ) : (
                        currentBoardPosts.length - idx
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 hover:text-blue-600 transition-colors">
                          {post.title}
                        </span>
                        {post.hasAttachment && (
                          <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                        {post.commentsCount > 0 && (
                          <span className="text-[10px] text-blue-600 font-bold font-mono">
                            [{post.commentsCount}]
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {post.author} <span className="text-slate-400 text-[10px]">({post.dept})</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{post.date}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{post.views}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                          post.readCount >= 40
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        {post.readCount}/{post.totalTeachers}명 ({Math.round((post.readCount / post.totalTeachers) * 100)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Post Detail View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in space-y-4">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('목록으로 돌아가기', 'Back to List')}</span>
            </button>

            <div className="flex items-center gap-2 mb-2">
              {selectedPost.isMustRead && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-danger text-white flex items-center gap-1">
                  <Pin className="w-2.5 h-2.5" />
                  필독
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                {selectedPost.category}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{selectedPost.title}</h2>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>
                  작성자: <strong className="text-slate-800">{selectedPost.author}</strong> ({selectedPost.dept})
                </span>
                <span className="font-mono">작성일: {selectedPost.date}</span>
                <span>조회수: {selectedPost.views}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowReadTracker(!showReadTracker)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5 text-xs transition-all shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  교사별 열람 확인: {selectedPost.readCount}/{selectedPost.totalTeachers}명 완료
                </span>
                {showReadTracker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showReadTracker && (
            <div className="p-4 bg-emerald-50/50 border-y border-emerald-200 animate-fade-in text-xs">
              <div className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>실시간 교직원 열람(읽음) 확인 명단</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <div className="font-bold text-emerald-800 mb-1.5">열람 완료 교직원 (Read)</div>
                  <div className="space-y-1 text-slate-700">
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span>정총괄 (행정실)</span>
                      <span className="font-mono text-[10px] text-slate-400">10.23 08:05</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span>김교사 (중고등부)</span>
                      <span className="font-mono text-[10px] text-slate-400">10.23 08:16</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span>박교무 (교무부)</span>
                      <span className="font-mono text-[10px] text-slate-400">10.23 08:00</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>이교장 (교장실)</span>
                      <span className="font-mono text-[10px] text-slate-400">10.23 08:22</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-rose-200">
                  <div className="font-bold text-rose-800 mb-1.5">미열람 교사 (Unread)</div>
                  <div className="space-y-1 text-slate-700">
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span>최상담 (상담실)</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-50 text-rose-600 font-bold">미확인</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>한영어 (중고등부)</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-50 text-rose-600 font-bold">미확인</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-800 whitespace-pre-line">
            {selectedPost.content}

            {selectedPost.hasAttachment && (
              <div className="pt-4 border-t border-slate-200 mt-4">
                <span className="font-bold text-slate-700 block mb-2">첨부파일:</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg inline-flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-bold text-slate-900">{selectedPost.attachmentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {selectedPost.attachmentSize} · 파일 다운로드
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
