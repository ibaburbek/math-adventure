/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types/game';
import { translations } from '../i18n/translations';
import { soundManager } from '../utils/sound';
import {
  Compass,
  Smile,
  ShoppingBag,
  Award,
  KeyRound,
  Volume2,
  VolumeX,
  Coins,
  Languages,
  Sparkles,
  Cloud,
  CloudCheck,
  CloudAlert,
  Loader2,
  User,
  LogOut
} from 'lucide-react';
import { CloudSyncStatus } from '../types/game';

interface TopNavProps {
  language: Language;
  soundEnabled: boolean;
  points: number;
  currentLevelTitle: string;
  cloudStatus?: CloudSyncStatus;
  studentName?: string;
  studentCode?: string;
  onLogout?: () => void;
  onToggleSound: () => void;
  onToggleLanguage: () => void;
  onOpenTeacherPanel: (initialTab?: 'levels' | 'reviews' | 'analytics' | 'cloud' | 'data' | 'students') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  language,
  soundEnabled,
  points,
  currentLevelTitle,
  cloudStatus,
  studentName,
  studentCode,
  onLogout,
  onToggleSound,
  onToggleLanguage,
  onOpenTeacherPanel
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-emerald-900/40 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
              {t.appTitle}
            </h1>
            <p className="text-[10px] text-emerald-400/80 font-medium tracking-wide leading-none mt-1 hidden sm:block">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Current Level Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-emerald-700/40 text-xs font-semibold text-emerald-300">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span className="truncate max-w-[200px]">{currentLevelTitle}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Cloud Sync Status Badge */}
          {cloudStatus?.configured ? (
            <button
              type="button"
              onClick={() => onOpenTeacherPanel('cloud')}
              title={
                cloudStatus.syncing
                  ? t.cloudSyncing
                  : cloudStatus.error
                  ? `${t.cloudSyncError}: ${cloudStatus.error}`
                  : t.cloudConnected
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                cloudStatus.syncing
                  ? 'bg-sky-950/60 border-sky-500/40 text-sky-300'
                  : cloudStatus.error
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
              }`}
            >
              {cloudStatus.syncing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              ) : cloudStatus.error ? (
                <CloudAlert className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden sm:inline">
                {cloudStatus.syncing
                  ? language === 'kk' ? 'Синх...' : 'Синх...'
                  : cloudStatus.error
                  ? language === 'kk' ? 'Бұлт!' : 'Облако!'
                  : language === 'kk' ? 'Бұлт' : 'Облако'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenTeacherPanel('cloud')}
              title={t.cloudUnconfigured}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs font-medium transition-colors cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 opacity-60" />
              <span className="hidden md:inline text-[11px] opacity-75">
                {language === 'kk' ? 'Жергілікті' : 'Локал'}
              </span>
            </button>
          )}

          {/* Student Profile & Logout Badge */}
          {studentName && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-teal-950/60 border border-teal-500/40 text-teal-300 text-xs">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-bold max-w-[120px] truncate">{studentName}</span>
              {studentCode && (
                <span className="text-[10px] text-teal-400/80 font-mono hidden md:inline">
                  ({studentCode})
                </span>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title={t.logoutBtn}
                  className="p-1 rounded-md hover:bg-teal-900/80 text-teal-300 hover:text-white transition-colors cursor-pointer ml-0.5"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Live Points Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-extrabold tabular-nums">
              {points}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? t.soundOn : t.soundOff}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Language Switch: Kazakh / Russian */}
          <button
            type="button"
            onClick={onToggleLanguage}
            title={t.switchLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>{language === 'kk' ? 'ҚАЗ' : 'РУС'}</span>
          </button>

          {/* Teacher Mode Button */}
          <button
            type="button"
            onClick={() => onOpenTeacherPanel()}
            title={t.teacherTitle}
            className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-white border border-purple-800/40 transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

interface BottomNavProps {
  currentTab: 'map' | 'character' | 'shop' | 'progress';
  language: Language;
  onSelectTab: (tab: 'map' | 'character' | 'shop' | 'progress') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  language,
  onSelectTab
}) => {
  const t = translations[language];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-emerald-900/40 px-4 py-2 sm:py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around gap-2">
        {/* Map */}
        <button
          type="button"
          onClick={() => onSelectTab('map')}
          className={`flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === 'map'
              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[11px] font-bold">{t.navMap}</span>
        </button>

        {/* Character */}
        <button
          type="button"
          onClick={() => onSelectTab('character')}
          className={`flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === 'character'
              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smile className="w-5 h-5" />
          <span className="text-[11px] font-bold">{t.navCharacter}</span>
        </button>

        {/* Shop */}
        <button
          type="button"
          onClick={() => onSelectTab('shop')}
          className={`flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === 'shop'
              ? 'text-amber-400 bg-amber-950/50 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px] font-bold">{t.navShop}</span>
        </button>

        {/* Progress */}
        <button
          type="button"
          onClick={() => onSelectTab('progress')}
          className={`flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === 'progress'
              ? 'text-purple-400 bg-purple-950/50 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[11px] font-bold">{t.navProgress}</span>
        </button>
      </div>
    </nav>
  );
};
