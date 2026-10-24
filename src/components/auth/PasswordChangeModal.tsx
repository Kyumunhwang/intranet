'use client';

import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useUser } from '@/lib/user-context';
import { useLanguage } from '@/lib/language-context';

export default function PasswordChangeModal() {
  const { currentUser, isPasswordModalOpen, setIsPasswordModalOpen } = useUser();
  const { lang, t } = useLanguage();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isPasswordModalOpen) return null;

  const handleClose = () => {
    setIsPasswordModalOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!oldPassword) {
      setErrorMessage(t('현재 비밀번호를 입력해 주십시오.', 'Please enter current password.'));
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setErrorMessage(t('새 비밀번호는 4자리 이상이어야 합니다.', 'New password must be at least 4 characters.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(t('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.', 'New passwords do not match.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(t('비밀번호가 성공적으로 변경되었습니다. 다음 로그인부터 적용됩니다.', 'Password changed successfully.'));
        setTimeout(() => {
          handleClose();
        }, 1600);
      } else {
        setErrorMessage(data.message || t('비밀번호 변경에 실패했습니다.', 'Failed to change password.'));
      }
    } catch {
      setErrorMessage(t('네트워크 통신 오류가 발생했습니다.', 'Network communication error.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {t('교직원 비밀번호 변경', 'Change Password')}
              </h3>
              <p className="text-[11px] text-slate-300">
                {currentUser.name} 선생님 ({currentUser.email})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
            <div className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('비밀번호 보안 수칙', 'Security Notice')}</span>
            </div>
            <span>{t('초기 비밀번호(1234)를 사용 중이신 경우 안전한 개인 비밀번호로 즉시 변경하여 주십시오.', 'Please change initial password (1234) to your secure private password.')}</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('현재 비밀번호 (Current Password)', 'Current Password')} *
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t('현재 비밀번호 입력 (초기값 1234)', 'Enter current password')}
                className="w-full h-9 px-3 pr-9 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('새 비밀번호 (New Password)', 'New Password')} *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('새로운 비밀번호 입력 (4자리 이상)', 'Enter new password (4+ chars)')}
                className="w-full h-9 px-3 pr-9 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('새 비밀번호 확인 (Confirm New Password)', 'Confirm New Password')} *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('새로운 비밀번호 다시 입력', 'Confirm new password')}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              {t('취소', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isSubmitting ? t('저장 중...', 'Saving...') : t('비밀번호 변경하기', 'Change Password')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
