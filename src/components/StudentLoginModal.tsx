/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language, LoginResult } from '../types/game';
import { translations } from '../i18n/translations';
import { studentLogin } from '../lib/supabase';
import { soundManager } from '../utils/sound';
import {
  Sparkles,
  KeyRound,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Languages,
  Eye,
  EyeOff,
  Compass
} from 'lucide-react';

interface StudentLoginModalProps {
  language: Language;
  soundEnabled: boolean;
  onSuccess: (result: LoginResult) => void;
  onPlayGuest: () => void;
  onToggleLanguage: () => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  language,
  soundEnabled,
  onSuccess,
  onPlayGuest,
  onToggleLanguage
}) => {
  const t = translations[language];

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !pin.trim()) return;

    soundManager.playClick(soundEnabled);
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await studentLogin(identifier, pin);

      if (res.success) {
        soundManager.playCorrect(soundEnabled);
        onSuccess(res);
      } else {
        soundManager.playWrong(soundEnabled);
        if (res.code === 'STUDENT_NOT_FOUND') {
          setErrorMessage(t.studentNotFound);
        } else if (res.code === 'ACCOUNT_LOCKED') {
          setErrorMessage(t.accountLocked);
        } else if (res.code === 'INVALID_PIN') {
          setErrorMessage(t.invalidPin);
          if (typeof res.remainingAttempts === 'number') {
            setRemainingAttempts(res.remainingAttempts);
          }
        } else {
          setErrorMessage(res.message || 'Login failed.');
        }
      }
    } catch (err: any) {
      soundManager.playWrong(soundEnabled);
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Controls: Language Switch */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              Math Adventure
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'kk' ? 'ҚАЗ' : 'РУС'}</span>
          </button>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t.studentLoginTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            {t.studentLoginDesc}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{errorMessage}</p>
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <p className="text-[11px] text-rose-300/80 mt-1">
                  {t.attemptsRemaining} {remainingAttempts}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Student Code or Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.studentCodeLabel}</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder={t.studentCodePlaceholder}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all uppercase tracking-wide"
            />
          </div>

          {/* PIN Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.studentPinLabel}</span>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                maxLength={8}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder={t.studentPinPlaceholder}
                className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-950 border border-slate-700 text-sm font-mono tracking-widest text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !identifier.trim() || !pin.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-emerald-950/60 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{language === 'kk' ? 'Тексерілуде...' : 'Проверка...'}</span>
              </>
            ) : (
              <>
                <span>{t.loginBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Mode option */}
        <div className="pt-5 mt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onPlayGuest}
            className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t.loginGuestBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
