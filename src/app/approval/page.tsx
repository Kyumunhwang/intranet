'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Send,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Paperclip,
  Link as LinkIcon,
  Stamp,
  Eye,
  Inbox,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';

export default function ApprovalPage() {
  const { lang, t } = useLanguage();
  const { currentUser } = useUser();

  // Active Category for Drafter
  const [activeCategory, setActiveCategory] = useState<'LEAVE' | 'EXPENSE' | 'TRIP' | 'PURCHASE'>('LEAVE');
  const [docTitle, setDocTitle] = useState('2026학년도 하반기 연차 휴가 신청서 (1일)');
  const [leaveDays, setLeaveDays] = useState(1.0);
  const [startDate, setStartDate] = useState('2026-10-28');
  const [endDate, setEndDate] = useState('2026-10-28');
  const [content, setContent] = useState(
    '개인 사유로 인하여 아래와 같이 연차 휴가를 신청하오니 결재 바랍니다.\n- 일시: 2026년 10월 28일 (1일간)\n- 사유: 가족 행사 및 개인 건강검진\n- 수업 대강: 정성수 선생님 배정 완료'
  );
  const [specialNotes, setSpecialNotes] = useState('수업 보강 계획서 교무부 사전 제출 완료');

  // Approval step statuses (Server state simulation)
  const [step2Status, setStep2Status] = useState<'WAITING' | 'APPROVED' | 'REJECTED'>('WAITING');
  const [step3Status, setStep3Status] = useState<'WAITING' | 'APPROVED' | 'REJECTED'>('WAITING');
  const [step2Time, setStep2Time] = useState<string | null>(null);
  const [step3Time, setStep3Time] = useState<string | null>(null);
  const [isDelegated, setIsDelegated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // For Approver view: selected document to review
  const [selectedDocId, setSelectedDocId] = useState<string>('LIS-2026-교무-0042');

  const handleSubmitDraft = () => {
    setToastMessage(t('전자결재 기안이 성공적으로 상신되었습니다. (문서번호: LIS-2026-교무-0042)', 'Draft submitted successfully.'));
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeptHeadApprove = (action: 'APPROVE' | 'DELEGATE' | 'REJECT') => {
    if (action === 'REJECT') {
      setStep2Status('REJECTED');
      setToastMessage(t('교무부장이 문서를 반려하였습니다.', 'Rejected by Dept Head.'));
    } else if (action === 'DELEGATE') {
      setStep2Status('APPROVED');
      setStep3Status('APPROVED');
      setIsDelegated(true);
      setStep2Time('10.23 09:15');
      setToastMessage(t('교무부장 [전결(대리결재)] 처리 완료! 최종 승인되어 연차가 자동 차감되었습니다.', 'Delegated & fully approved.'));
    } else {
      setStep2Status('APPROVED');
      setStep2Time('10.23 09:10');
      setToastMessage(t('교무부장 [승인] 완료! 도장이 날인되었으며 교장 결재 대기로 전환되었습니다.', 'Approved by Dept Head.'));
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePrincipalApprove = (action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT') {
      setStep3Status('REJECTED');
      setToastMessage(t('교장이 문서를 반려하였습니다.', 'Rejected by Principal.'));
    } else {
      setStep3Status('APPROVED');
      setStep3Time('10.23 09:30');
      setToastMessage(t('교장 최종 [승인] 완료! 도장이 날인되고 잔여 연차 1.0일이 자동 차감되었습니다.', 'Fully approved by Principal.'));
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const isDrafter = currentUser.role === 'TEACHER';
  const isDeptHead = currentUser.role === 'DEPT_HEAD';
  const isPrincipal = currentUser.role === 'PRINCIPAL';

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('전자결재 시스템', 'Electronic Approval System')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
              {currentUser.name} ({currentUser.title})
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isDrafter && t('기안 작성 및 본인의 상신 문서 진행 상태를 확인합니다.', 'Draft and track your approval documents.')}
            {isDeptHead && t('교무부 결재 대기 문서를 열람하고 승인/전결/반려 처리합니다.', 'Review and approve department drafts.')}
            {isPrincipal && t('최종 결재 대기 문서를 열람하고 최종 승인 처리합니다.', 'Review and give final approval.')}
          </p>
        </div>

        {/* Action Buttons for Drafter */}
        {isDrafter && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 px-3 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('임시저장', 'Save Draft')}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="h-8 px-3 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('공문서 인쇄/미리보기', 'Print / PDF')}</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitDraft}
              className="h-8 px-4 rounded-lg bg-primary-container hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('결재 상신하기', 'Submit Draft')}</span>
            </button>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CASE 1: 기안자(이재원) 화면 - 결재권자 탭이나 결재 버튼은 절대 보이지 않음! */}
      {isDrafter && (
        <div className="space-y-5">
          {/* Category Switcher */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-500 mr-2">{t('양식 선택:', 'Form:')}</span>
            <button
              onClick={() => setActiveCategory('LEAVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCategory === 'LEAVE'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              {t('휴가/연차계', 'Leave Request')}
            </button>
            <button
              onClick={() => setActiveCategory('EXPENSE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCategory === 'EXPENSE'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              {t('지출결의서', 'Expense')}
            </button>
            <button
              onClick={() => setActiveCategory('TRIP')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCategory === 'TRIP'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              {t('출장신청서', 'Business Trip')}
            </button>
            <button
              onClick={() => setActiveCategory('PURCHASE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCategory === 'PURCHASE'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              {t('구매기안문', 'Purchase')}
            </button>
          </div>

          {/* Drafter Document Creation Form (Paper Style) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-8 max-w-[1050px] mx-auto space-y-6">
            {/* Header & Stamp Box Preview */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo/lighthouse_logo.png" alt="로고" className="w-8 h-8 object-contain" />
                    <span className="text-sm font-bold text-slate-900">
                      {t('등대글로벌스쿨 전자결재 기안서', 'Lighthouse Official Approval Draft')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-slate-600 font-medium">
                    <div>{t('문서번호:', 'Doc No:')} <span className="font-mono text-slate-900 font-bold">LIS-2026-교무-0042 (자동생성)</span></div>
                    <div>{t('기안일자:', 'Date:')} <span className="font-mono text-slate-900">2026.10.23</span></div>
                    <div>{t('기안부서:', 'Dept:')} <span className="text-slate-900">중고등학사팀</span></div>
                    <div>{t('기안자:', 'Drafter:')} <span className="font-bold text-slate-900">이재원 (Jay Lee)</span></div>
                  </div>
                </div>

                {/* Expected Approval Steps Table */}
                <div className="border border-slate-300 rounded overflow-hidden text-center text-xs">
                  <div className="bg-slate-100 px-3 py-1 font-bold text-slate-700 border-b border-slate-300 text-[11px]">
                    {t('지정 결재선 (3단계)', 'Approval Line')}
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-300">
                    <div className="w-24">
                      <div className="bg-slate-50 py-1 text-[11px] font-semibold text-slate-600 border-b border-slate-300">
                        {t('기안자', 'Drafter')}
                      </div>
                      <div className="h-14 flex flex-col items-center justify-center p-1">
                        <span className="text-[11px] font-bold text-rose-700 border border-rose-600 rounded-full px-2 py-0.2">
                          이재원 [印]
                        </span>
                        <span className="text-[9px] text-slate-400 mt-1">상신 예정</span>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="bg-slate-50 py-1 text-[11px] font-semibold text-slate-600 border-b border-slate-300">
                        {t('교감', 'Vice Principal')}
                      </div>
                      <div className="h-14 flex flex-col items-center justify-center p-1 text-[11px] text-slate-400">
                        황규문
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="bg-slate-50 py-1 text-[11px] font-semibold text-slate-600 border-b border-slate-300">
                        {t('교장', 'Principal')}
                      </div>
                      <div className="h-14 flex flex-col items-center justify-center p-1 text-[11px] text-slate-400">
                        김바울
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('문서 제목 (Document Title)', 'Title')}
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full h-8 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white"
                />
              </div>

              {activeCategory === 'LEAVE' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/70 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">{t('휴가 종류', 'Leave Type')}</label>
                    <select aria-label="휴가 종류" className="w-full h-7 px-2 text-xs bg-white border border-slate-300 rounded">
                      <option>연차 (1.0일 차감)</option>
                      <option>오전 반차 (0.5일 차감)</option>
                      <option>오후 반차 (0.5일 차감)</option>
                      <option>병가</option>
                      <option>공가</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">{t('기간 선택', 'Date Range')}</label>
                    <div className="flex items-center gap-1">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-7 px-1.5 text-xs bg-white border border-slate-300 rounded w-full font-mono" />
                      <span>~</span>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-7 px-1.5 text-xs bg-white border border-slate-300 rounded w-full font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">{t('차감 일수', 'Deduction')}</label>
                    <input type="number" step="0.5" value={leaveDays} onChange={(e) => setLeaveDays(Number(e.target.value))} className="w-full h-7 px-2 text-xs bg-white border border-slate-300 rounded font-bold text-blue-700" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('기안 본문 내용', 'Content')}
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 leading-relaxed font-sans focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('특이사항 기재란', 'Special Notes')}
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full h-8 px-3 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASE 2: 결재자(교무부장 또는 교장) 화면 - 기안자가 올린 글을 먼저 보고, 본인 권한 액션 바 노출 */}
      {!isDrafter && (
        <div className="space-y-5">
          {/* 결재 대기 문서 리스트 위젯 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Inbox className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {isDeptHead && t('교무부장 결재 대기 문서함 (1건)', 'Dept Head Approval Inbox (1)')}
                {isPrincipal && t('교장 최종 결재 대기 문서함 (1건)', 'Principal Approval Inbox (1)')}
              </h2>
            </div>
            <div
              onClick={() => setSelectedDocId('LIS-2026-교무-0042')}
              className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40 hover:bg-blue-50 cursor-pointer transition-colors flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                  결재 대기
                </span>
                <div>
                  <div className="font-bold text-slate-900 text-[13px]">
                    [LIS-2026-교무-0042] 2026학년도 하반기 연차 휴가 신청서 (1일)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    기안자: 이재원 (중고등부) · 기안일시: 2026.10.23 08:35
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-white px-2.5 py-1 rounded border border-blue-200">
                기안서 상세 열람 중
              </span>
            </div>
          </div>

          {/* 결재권자 승인/반려/전결 액션 바 */}
          {isDeptHead && (
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-blue-700" />
                <div>
                  <span className="font-bold text-blue-900 block text-xs">
                    [1차 결재권자: 교감 황규문] 결재 처리
                  </span>
                  <span className="text-[11px] text-blue-700">
                    아래 기안자 작성 원문을 검토하신 후 승인 또는 전결을 처리해 주십시오.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeptHeadApprove('APPROVE')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm text-xs"
                >
                  교감 승인 (도장 찍기)
                </button>
                <button
                  type="button"
                  onClick={() => handleDeptHeadApprove('DELEGATE')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm text-xs"
                >
                  전결(대리결재) 승인
                </button>
                <button
                  type="button"
                  onClick={() => handleDeptHeadApprove('REJECT')}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs"
                >
                  반려
                </button>
              </div>
            </div>
          )}

          {isPrincipal && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="font-bold text-emerald-900 block text-xs">
                    [최종 결재권자: 교장 김바울] 최종 결재 처리
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    교감 검토 승인 완료 문서를 확인 후 최종 승인 시 결재 도장이 날인되고 교사 연차가 자동 차감됩니다.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrincipalApprove('APPROVE')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-xs"
                >
                  교장 최종 승인 (도장 날인 & 연차 자동 차감)
                </button>
                <button
                  type="button"
                  onClick={() => handlePrincipalApprove('REJECT')}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs"
                >
                  반려
                </button>
              </div>
            </div>
          )}

          {/* 기안자가 올린 글 상세 열람 뷰 (결재자들은 이 내용을 먼저 읽음) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-8 max-w-[1050px] mx-auto space-y-6">
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo/lighthouse_logo.png" alt="로고" className="w-8 h-8 object-contain" />
                    <span className="text-sm font-bold text-slate-900">
                      등대글로벌스쿨 전자결재 시스템
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-slate-600 font-medium">
                    <div>문서번호: <span className="font-mono text-slate-900 font-bold">LIS-2026-교무-0042</span></div>
                    <div>기안일자: <span className="font-mono text-slate-900">2026.10.23</span></div>
                    <div>기안부서: <span className="text-slate-900">중고등학사팀</span></div>
                    <div>기안자: <span className="font-bold text-slate-900">이재원 (Jay Lee)</span></div>
                  </div>
                </div>

                {/* 결재선 박스 */}
                <div className="border border-slate-300 rounded overflow-hidden text-center text-xs">
                  <div className="bg-slate-100 px-3 py-1 font-bold text-slate-700 border-b border-slate-300 text-[11px]">
                    결 재 선
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-300">
                    <div className="w-24">
                      <div className="bg-slate-50 py-1 text-[11px] font-semibold text-slate-600 border-b border-slate-300">
                        기안자
                      </div>
                      <div className="h-16 flex flex-col items-center justify-center p-1">
                        <span className="text-[11px] font-bold text-rose-700 border border-rose-600 rounded-full px-2 py-0.2">
                          이재원 [印]
                        </span>
                        <span className="text-[9px] text-slate-400 mt-1 font-mono">10.23 08:35</span>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="bg-slate-50 py-1 text-[11px] font-semibold text-slate-600 border-b border-slate-300">
                        교감
                      </div>
                      <div className="h-16 flex flex-col items-center justify-center p-1">
                        {step2Status === 'APPROVED' ? (
                          <>
                            <span className="text-[11px] font-bold text-rose-700 border border-rose-600 rounded-full px-2 py-0.2">
                              {isDelegated ? '황규문 [전결]' : '황규문 [印]'}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1 font-mono">{step2Time || '10.23 09:10'}</span>
                          </>
                        ) : step2Status === 'REJECTED' ? (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">반려</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">결재 대기</span>
                        )}
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="bg-slate-50 py-1 text-[11px] font-semibold text-slate-600 border-b border-slate-300">
                        교장
                      </div>
                      <div className="h-16 flex flex-col items-center justify-center p-1">
                        {step3Status === 'APPROVED' ? (
                          <>
                            <span className="text-[11px] font-bold text-rose-700 border border-rose-600 rounded-full px-2 py-0.2">
                              김바울 [印]
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1 font-mono">{step3Time || '10.23 09:30'}</span>
                          </>
                        ) : step3Status === 'REJECTED' ? (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">반려</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">대기</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 기안 원문 표시 */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 block mb-1">문서 제목:</span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900 text-sm">
                  {docTitle}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50/70 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">휴가 구분:</span>
                  <span className="font-bold text-slate-900">연차 (1.0일)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">기간:</span>
                  <span className="font-mono font-bold text-slate-900">2026.10.28 ~ 2026.10.28</span>
                </div>
                <div>
                  <span className="text-slate-500 block">차감 후 잔여:</span>
                  <span className="font-bold text-blue-700">10.5일 예정</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 block mb-1">기안 상세 내용:</span>
                <div className="p-4 bg-white border border-slate-200 rounded-lg whitespace-pre-line text-slate-800 leading-relaxed shadow-inner">
                  {content}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 block mb-1">특이 사항:</span>
                <div className="p-2.5 bg-amber-50/50 border border-amber-200 rounded text-slate-800">
                  {specialNotes}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
