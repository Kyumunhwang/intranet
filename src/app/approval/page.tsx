'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Download,
  FileSpreadsheet,
  Upload,
  FileSignature,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useUser } from '@/lib/user-context';
import { ApprovalTemplate } from '@/lib/types';
import rawApprovalTemplates from '../../../data/approval_templates.json';

interface SubmittedApprovalDoc {
  id: string;
  doc_no: string;
  template_id: string;
  template_name: string;
  category: string;
  title: string;
  drafter_name: string;
  drafter_dept: string;
  created_at: string;
  content: string;
  special_notes: string;
  leave_days?: number;
  leave_type?: string;
  date_range?: string;
  attached_file_name?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  step2_status: 'WAITING' | 'APPROVED' | 'REJECTED';
  step3_status: 'WAITING' | 'APPROVED' | 'REJECTED';
  step2_time?: string | null;
  step3_time?: string | null;
  is_delegated?: boolean;
}

function ApprovalContent() {
  const { lang, t } = useLanguage();
  const { currentUser } = useUser();
  const searchParams = useSearchParams();
  const initialTemplateId = searchParams.get('templateId') || 't1';

  // Available Form Templates
  const [templates, setTemplates] = useState<ApprovalTemplate[]>(
    rawApprovalTemplates as unknown as ApprovalTemplate[]
  );

  // Selected template & category
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'ATTENDANCE_LEAVE' | 'DRAFT' | 'DOCUMENT'>('ALL');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId);

  // Draft inputs
  const [docTitle, setDocTitle] = useState('2026학년도 하반기 연차 휴가 신청서 (1일)');
  const [leaveType, setLeaveType] = useState('연차 (1.0일 차감)');
  const [leaveDays, setLeaveDays] = useState(1.0);
  const [startDate, setStartDate] = useState('2026-10-28');
  const [endDate, setEndDate] = useState('2026-10-28');
  const [content, setContent] = useState(
    '1. 신청 사유: 개인 사유 및 가족 행사 참석\n2. 휴가 종류: 연차 (1.0일)\n3. 휴가 기간: 2026년 10월 28일 (1일간)\n4. 비상 연락처: 010-3344-5566\n5. 업무 및 수업 대행: 정성수 선생님 배정 및 교무부 사전 인계 완료\n\n위와 같이 휴가를 신청하오니 허가하여 주시기 바랍니다.'
  );
  const [specialNotes, setSpecialNotes] = useState('수업 보강 계획서 교무부 사전 제출 완료');
  const [userAttachedFile, setUserAttachedFile] = useState<string | null>(null);

  // Submitted documents list
  const [submittedDocs, setSubmittedDocs] = useState<SubmittedApprovalDoc[]>([
    {
      id: 'doc-init',
      doc_no: 'LIS-2026-교무-0042',
      template_id: 't1',
      template_name: '휴가 / 연차원 (Leave Request)',
      category: 'ATTENDANCE_LEAVE',
      title: '2026학년도 하반기 연차 휴가 신청서 (1일)',
      drafter_name: '이재원 (Jay Lee)',
      drafter_dept: '중고등학사팀',
      created_at: '2026.10.23 08:35',
      content:
        '1. 신청 사유: 개인 사유 및 가족 행사 참석\n2. 휴가 종류: 연차 (1.0일)\n3. 휴가 기간: 2026년 10월 28일 (1일간)\n4. 비상 연락처: 010-3344-5566\n5. 업무 및 수업 대행: 정성수 선생님 배정 및 교무부 사전 인계 완료\n\n위와 같이 휴가를 신청하오니 허가하여 주시기 바랍니다.',
      special_notes: '수업 보강 계획서 교무부 사전 제출 완료',
      leave_days: 1.0,
      leave_type: '연차 (1.0일)',
      date_range: '2026.10.28 ~ 2026.10.28',
      status: 'PENDING',
      step2_status: 'WAITING',
      step3_status: 'WAITING',
    },
  ]);

  // For Approver view: selected document to review
  const [selectedDocId, setSelectedDocId] = useState<string>('LIS-2026-교무-0042');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync templates from backend API
  useEffect(() => {
    fetch('/api/approval/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.templates) && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      })
      .catch(() => {});
  }, []);

  // When initialTemplateId changes or loads
  useEffect(() => {
    const target = templates.find((t) => t.id === initialTemplateId);
    if (target) {
      applyTemplate(target);
    }
  }, [initialTemplateId, templates]);

  const applyTemplate = (tpl: ApprovalTemplate) => {
    setSelectedTemplateId(tpl.id);
    setDocTitle(`[기안] ${tpl.template_name}`);
    if (tpl.content_html) {
      setContent(tpl.content_html);
    }
    if (tpl.auto_deduct_leave) {
      setLeaveDays(1.0);
      setLeaveType('연차 (1.0일 차감)');
    }
  };

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const activeReviewDoc = submittedDocs.find((d) => d.doc_no === selectedDocId) || submittedDocs[0];

  const handleUserFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserAttachedFile(file.name);
      setToastMessage(`기안 첨부파일 [${file.name}]이 등록되었습니다.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSubmitDraft = () => {
    const randomSeq = String(Math.floor(Math.random() * 900) + 100);
    const newDocNo = `LIS-2026-교무-${randomSeq}`;
    const newDoc: SubmittedApprovalDoc = {
      id: `doc-${Date.now()}`,
      doc_no: newDocNo,
      template_id: currentTemplate.id,
      template_name: currentTemplate.template_name,
      category: currentTemplate.template_category,
      title: docTitle,
      drafter_name: currentUser.name || '이재원 (Jay Lee)',
      drafter_dept: '중고등학사팀',
      created_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      content,
      special_notes: specialNotes,
      leave_days: currentTemplate.auto_deduct_leave ? leaveDays : undefined,
      leave_type: currentTemplate.auto_deduct_leave ? leaveType : undefined,
      date_range: currentTemplate.auto_deduct_leave ? `${startDate} ~ ${endDate}` : undefined,
      attached_file_name: userAttachedFile || currentTemplate.file_name,
      status: 'PENDING',
      step2_status: 'WAITING',
      step3_status: 'WAITING',
    };

    setSubmittedDocs((prev) => [newDoc, ...prev]);
    setSelectedDocId(newDocNo);
    setToastMessage(
      t(
        `선택하신 [${currentTemplate.template_name}] 양식에 맞춰 전자결재 기안이 상신되었습니다. (문서번호: ${newDocNo})`,
        `Draft submitted successfully based on template [${currentTemplate.template_name}].`
      )
    );
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleDeptHeadApprove = (action: 'APPROVE' | 'DELEGATE' | 'REJECT') => {
    setSubmittedDocs((prev) =>
      prev.map((doc) => {
        if (doc.doc_no === selectedDocId) {
          if (action === 'REJECT') {
            return { ...doc, status: 'REJECTED', step2_status: 'REJECTED' };
          }
          if (action === 'DELEGATE') {
            return {
              ...doc,
              status: 'APPROVED',
              step2_status: 'APPROVED',
              step3_status: 'APPROVED',
              step2_time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              step3_time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              is_delegated: true,
            };
          }
          return {
            ...doc,
            step2_status: 'APPROVED',
            step2_time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return doc;
      })
    );

    if (action === 'REJECT') {
      setToastMessage(t('교무부장이 문서를 반려하였습니다.', 'Rejected by Dept Head.'));
    } else if (action === 'DELEGATE') {
      setToastMessage(t('교무부장 [전결(대리결재)] 승인 완료! 최종 승인되어 연차가 자동 차감되었습니다.', 'Delegated & fully approved.'));
    } else {
      setToastMessage(t('교무부장 [승인] 완료! 도장이 날인되었으며 교장 최종 결재 대기로 전환되었습니다.', 'Approved by Dept Head.'));
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePrincipalApprove = (action: 'APPROVE' | 'REJECT') => {
    setSubmittedDocs((prev) =>
      prev.map((doc) => {
        if (doc.doc_no === selectedDocId) {
          if (action === 'REJECT') {
            return { ...doc, status: 'REJECTED', step3_status: 'REJECTED' };
          }
          return {
            ...doc,
            status: 'APPROVED',
            step3_status: 'APPROVED',
            step3_time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return doc;
      })
    );

    if (action === 'REJECT') {
      setToastMessage(t('교장이 문서를 반려하였습니다.', 'Rejected by Principal.'));
    } else {
      setToastMessage(t('교장 최종 [승인] 완료! 도장이 날인되고 잔여 연차가 자동 차감 처리되었습니다.', 'Fully approved by Principal.'));
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const isDrafter = currentUser.role === 'TEACHER';
  const isDeptHead = currentUser.role === 'DEPT_HEAD';
  const isPrincipal = currentUser.role === 'PRINCIPAL';

  const filteredTemplates = templates.filter(
    (t) => selectedCategory === 'ALL' || t.template_category === selectedCategory
  );

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
            {isDrafter && t('관리자가 제정한 표준 양식 서식을 선택하여 기안을 작성하고 상신합니다.', 'Select registered form template and submit your draft.')}
            {isDeptHead && t('교무부 결재 대기 문서를 열람하고 승인/전결/반려 처리합니다.', 'Review and approve department drafts.')}
            {isPrincipal && t('최종 결재 대기 문서를 열람하고 최종 승인 처리합니다.', 'Review and give final approval.')}
          </p>
        </div>

        {/* Action Buttons for Drafter */}
        {isDrafter && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setToastMessage('작성 중인 기안이 임시저장되었습니다.');
                setTimeout(() => setToastMessage(null), 2500);
              }}
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

      {/* CASE 1: 기안자(교직원) 화면 */}
      {isDrafter && (
        <div className="space-y-5">
          {/* 1. 표준 양식 선택 툴바 (카테고리 & 템플릿 목록) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-xs">
                  {t('기본 Template 양식 선택 (문서양식 · 기안양식 · 근태신청서양식)', 'Select Document Template')}
                </span>
              </div>
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                {(['ALL', 'ATTENDANCE_LEAVE', 'DRAFT', 'DOCUMENT'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                      selectedCategory === cat ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'ALL' && '전체 양식'}
                    {cat === 'ATTENDANCE_LEAVE' && '근태신청서양식'}
                    {cat === 'DRAFT' && '기안양식'}
                    {cat === 'DOCUMENT' && '문서양식'}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Buttons Carousel/Grid */}
            <div className="flex flex-wrap items-center gap-2">
              {filteredTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    selectedTemplateId === tpl.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 ${selectedTemplateId === tpl.id ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tpl.template_name}</span>
                </button>
              ))}
            </div>

            {/* Selected Template Guide Banner & File Download */}
            {currentTemplate && (
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-blue-950 flex items-center gap-1.5">
                    <span className="bg-blue-600 text-white px-1.5 py-0.2 rounded text-[10px]">적용된 서식</span>
                    <span>{currentTemplate.template_name}</span>
                    <span className="text-slate-400 font-normal">| {currentTemplate.default_approval_steps?.length || 3}단계 결재선</span>
                    {currentTemplate.auto_deduct_leave && (
                      <span className="text-rose-600 font-semibold text-[11px]">(최종승인 시 연차 자동 차감)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">{currentTemplate.description}</p>
                </div>

                {currentTemplate.file_name && (
                  <a
                    href={currentTemplate.file_url || '#'}
                    download={currentTemplate.file_name}
                    onClick={(e) => {
                      if (!currentTemplate.file_url || currentTemplate.file_url.startsWith('/templates')) {
                        e.preventDefault();
                        alert(`학교 공식 표준 양식 원본 서식 파일 [${currentTemplate.file_name}] 다운로드가 시뮬레이션되었습니다.`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>공식 표준 양식 다운로드 ({currentTemplate.file_name})</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 2. 기안서 본체 (Paper Style Form) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-8 max-w-[1050px] mx-auto space-y-6">
            {/* Header & 결재선 도장 박스 */}
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
                    <div>
                      {t('문서번호:', 'Doc No:')}{' '}
                      <span className="font-mono text-slate-900 font-bold">LIS-2026-교무-자동발번</span>
                    </div>
                    <div>
                      {t('기안일자:', 'Date:')}{' '}
                      <span className="font-mono text-slate-900">{new Date().toISOString().slice(0, 10)}</span>
                    </div>
                    <div>
                      {t('기안부서:', 'Dept:')} <span className="text-slate-900">중고등학사팀</span>
                    </div>
                    <div>
                      {t('기안자:', 'Drafter:')}{' '}
                      <span className="font-bold text-slate-900">{currentUser.name || '이재원 (Jay Lee)'}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Approval Steps Table */}
                <div className="border border-slate-300 rounded overflow-hidden text-center text-xs">
                  <div className="bg-slate-100 px-3 py-1 font-bold text-slate-700 border-b border-slate-300 text-[11px]">
                    {t(`지정 결재선 (${currentTemplate.default_approval_steps?.length || 3}단계)`, 'Approval Line')}
                  </div>
                  <div className="flex divide-x divide-slate-300">
                    {currentTemplate.default_approval_steps?.map((step, idx) => (
                      <div key={idx} className="w-24">
                        <div className="bg-slate-50 py-1 text-[11px] font-semibold text-slate-600 border-b border-slate-300">
                          {step.role_desc}
                        </div>
                        <div className="h-14 flex flex-col items-center justify-center p-1 text-[11px]">
                          {step.type === 'DRAFTER' ? (
                            <>
                              <span className="text-[11px] font-bold text-rose-700 border border-rose-600 rounded-full px-2 py-0.2">
                                {currentUser.name?.slice(0, 3) || '이재원'} [印]
                              </span>
                              <span className="text-[9px] text-slate-400 mt-1">상신 예정</span>
                            </>
                          ) : (
                            <span className="text-slate-400">
                              {step.order === 2 ? '황규문' : step.order === 3 ? '김바울' : '행정실'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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

              {/* 근태신청서 양식인 경우 세부 일자/연차 입력란 활성화 */}
              {currentTemplate.template_category === 'ATTENDANCE_LEAVE' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/70 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">{t('신청 구분', 'Leave Type')}</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full h-7 px-2 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-800"
                    >
                      <option value="연차 (1.0일 차감)">연차 (1.0일 차감)</option>
                      <option value="오전 반차 (0.5일 차감)">오전 반차 (0.5일 차감)</option>
                      <option value="오후 반차 (0.5일 차감)">오후 반차 (0.5일 차감)</option>
                      <option value="공무 출장">공무 출장 (차감 없음)</option>
                      <option value="병가 / 결근">병가 / 결근 (진단서 첨부)</option>
                      <option value="조퇴 / 외출">조퇴 / 외출 (근무시간 외출)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">{t('기간 선택', 'Date Range')}</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-7 px-1.5 text-xs bg-white border border-slate-300 rounded w-full font-mono"
                      />
                      <span>~</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-7 px-1.5 text-xs bg-white border border-slate-300 rounded w-full font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">{t('차감 일수', 'Deduction')}</label>
                    <input
                      type="number"
                      step="0.5"
                      value={leaveDays}
                      onChange={(e) => setLeaveDays(Number(e.target.value))}
                      className="w-full h-7 px-2 text-xs bg-white border border-slate-300 rounded font-bold text-blue-700"
                    />
                  </div>
                </div>
              )}

              {/* 기안 본문 내용 에디터 (선택한 템플릿의 양식 구조 자동 로드) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('기안 본문 내용 (Template Body)', 'Content')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentTemplate.content_html) {
                        setContent(currentTemplate.content_html);
                        setToastMessage('서식 본문이 템플릿 기본값으로 재설정되었습니다.');
                        setTimeout(() => setToastMessage(null), 2000);
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    양식 기본 서식으로 초기화
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 leading-relaxed font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 기안자 첨부파일 업로드란 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    <span>기안 첨부 서류 / 작성 완료 양식 파일 업로드</span>
                  </label>
                  {userAttachedFile && (
                    <button
                      type="button"
                      onClick={() => setUserAttachedFile(null)}
                      className="text-[10px] text-rose-500 hover:underline"
                    >
                      첨부 취소
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  onChange={handleUserFileUpload}
                  accept=".hwp,.hwpx,.doc,.docx,.pdf,.xlsx,.xls,.png,.jpg"
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {userAttachedFile && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-800 font-bold bg-white p-2 rounded border border-blue-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>첨부된 파일: {userAttachedFile}</span>
                  </div>
                )}
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

      {/* CASE 2: 결재자(교무부장 또는 교장) 화면 */}
      {!isDrafter && (
        <div className="space-y-5">
          {/* 결재 대기 문서 리스트 위젯 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Inbox className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {isDeptHead && t(`교무부장 결재 대기 문서함 (${submittedDocs.length}건)`, `Dept Head Approval Inbox (${submittedDocs.length})`)}
                {isPrincipal && t(`교장 최종 결재 대기 문서함 (${submittedDocs.length}건)`, `Principal Approval Inbox (${submittedDocs.length})`)}
              </h2>
            </div>
            <div className="space-y-2">
              {submittedDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.doc_no)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex flex-wrap items-center justify-between gap-3 text-xs ${
                    selectedDocId === doc.doc_no
                      ? 'border-blue-300 bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === 'APPROVED'
                          ? 'bg-emerald-600 text-white'
                          : doc.status === 'REJECTED'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {doc.status === 'APPROVED' ? '승인 완료' : doc.status === 'REJECTED' ? '반려됨' : '결재 대기'}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-[13px]">
                        [{doc.doc_no}] {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        서식: <span className="font-semibold text-slate-700">{doc.template_name}</span> · 기안자: {doc.drafter_name} ({doc.drafter_dept}) · {doc.created_at}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-white px-2.5 py-1 rounded border border-blue-200">
                    {selectedDocId === doc.doc_no ? '기안서 상세 열람 중' : '클릭하여 열람'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 결재권자 승인/반려/전결 액션 바 */}
          {isDeptHead && (
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-blue-700" />
                <div>
                  <span className="font-bold text-blue-900 block text-xs">
                    [1차 결재권자: 교감 황규문] 결재 처리 (문서번호: {activeReviewDoc.doc_no})
                  </span>
                  <span className="text-[11px] text-blue-700">
                    기안자가 작성한 템플릿 원문을 검토하신 후 승인 또는 전결을 처리해 주십시오.
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
                    [최종 결재권자: 교장 김바울] 최종 결재 처리 (문서번호: {activeReviewDoc.doc_no})
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

          {/* 기안자가 올린 글 상세 열람 뷰 */}
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
                    <div>문서번호: <span className="font-mono text-slate-900 font-bold">{activeReviewDoc.doc_no}</span></div>
                    <div>기안서식: <span className="font-bold text-blue-700">{activeReviewDoc.template_name}</span></div>
                    <div>기안일자: <span className="font-mono text-slate-900">{activeReviewDoc.created_at}</span></div>
                    <div>기안자: <span className="font-bold text-slate-900">{activeReviewDoc.drafter_name}</span></div>
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
                        <span className="text-[9px] text-slate-400 mt-1">상신완료</span>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="bg-slate-50 py-1 text-[11px] font-semibold text-slate-600 border-b border-slate-300">
                        교감
                      </div>
                      <div className="h-16 flex flex-col items-center justify-center p-1 text-[11px]">
                        {activeReviewDoc.step2_status === 'APPROVED' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-bold text-rose-700 border border-rose-600 rounded-full px-2 py-0.2">
                              {activeReviewDoc.is_delegated ? '황규문 [전결]' : '황규문 [印]'}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1">{activeReviewDoc.step2_time || '승인'}</span>
                          </div>
                        ) : activeReviewDoc.step2_status === 'REJECTED' ? (
                          <span className="text-xs font-bold text-rose-600">반려됨</span>
                        ) : (
                          <span className="text-slate-400">결재 대기</span>
                        )}
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="bg-slate-50 py-1 text-[11px] font-semibold text-slate-600 border-b border-slate-300">
                        교장
                      </div>
                      <div className="h-16 flex flex-col items-center justify-center p-1 text-[11px]">
                        {activeReviewDoc.step3_status === 'APPROVED' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-bold text-rose-700 border border-rose-600 rounded-full px-2 py-0.2">
                              김바울 [印]
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1">{activeReviewDoc.step3_time || '최종승인'}</span>
                          </div>
                        ) : activeReviewDoc.step3_status === 'REJECTED' ? (
                          <span className="text-xs font-bold text-rose-600">반려됨</span>
                        ) : (
                          <span className="text-slate-400">결재 대기</span>
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
                  {activeReviewDoc.title}
                </div>
              </div>

              {activeReviewDoc.leave_days !== undefined && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50/70 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">휴가 구분:</span>
                    <span className="font-bold text-slate-900">{activeReviewDoc.leave_type || '연차'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">기간:</span>
                    <span className="font-mono font-bold text-slate-900">{activeReviewDoc.date_range}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">신청 차감 일수:</span>
                    <span className="font-bold text-blue-700">{activeReviewDoc.leave_days}일</span>
                  </div>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-500 block mb-1">기안 상세 내용 (서식 본문):</span>
                <div className="p-4 bg-white border border-slate-200 rounded-lg whitespace-pre-line font-mono text-slate-800 leading-relaxed shadow-inner">
                  {activeReviewDoc.content}
                </div>
              </div>

              {activeReviewDoc.attached_file_name && (
                <div>
                  <span className="font-bold text-slate-500 block mb-1">첨부 서류 및 서식 파일:</span>
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900 font-bold">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      <span>{activeReviewDoc.attached_file_name}</span>
                    </div>
                    <span className="text-[10px] bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
                      첨부 완료
                    </span>
                  </div>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-500 block mb-1">특이 사항:</span>
                <div className="p-2.5 bg-amber-50/50 border border-amber-200 rounded text-slate-800">
                  {activeReviewDoc.special_notes || '특이사항 없음'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApprovalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Electronic Approval...</div>}>
      <ApprovalContent />
    </Suspense>
  );
}
