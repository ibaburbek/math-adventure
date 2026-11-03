/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  Language,
  Question,
  Level,
  ShopItem,
  Character,
  ReviewSubmission,
  CloudSyncStatus,
  LoginResult
} from './types/game';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  testSupabaseConnection,
  fetchCloudLevels,
  syncLevelsToCloud,
  fetchStudentProgressFromCloud,
  syncStudentProgressToCloud,
  submitReviewToCloud,
  fetchTeacherSettingsFromCloud
} from './lib/supabase';
import {
  INITIAL_CHARACTERS,
  INITIAL_SHOP_ITEMS,
  INITIAL_LEVELS,
  INITIAL_PROGRESS,
  INITIAL_TEACHER_SETTINGS
} from './data/initialData';
import { translations } from './i18n/translations';
import { soundManager } from './utils/sound';
import { TopNav, BottomNav } from './components/Navigation';
import { MapPath } from './components/MapPath';
import { QuestionModal } from './components/QuestionModal';
import { ShopModal } from './components/ShopModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { ProgressView } from './components/ProgressView';
import { TeacherPanel } from './components/TeacherPanel';
import { StudentLoginModal } from './components/StudentLoginModal';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Cloud,
  CloudAlert,
  Loader2,
  RefreshCw,
  Database,
  CheckCircle2,
  ShieldCheck,
  Languages
} from 'lucide-react';

const SESSION_STORAGE_KEY = 'math_adventure_active_student_session_v1';
const LANG_STORAGE_KEY = 'math_adventure_lang_v1';
const SOUND_STORAGE_KEY = 'math_adventure_sound_v1';

export default function App() {
  // 1. Harmless UI Preferences (Language & Sound)
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
      if (savedLang === 'kk' || savedLang === 'ru') return savedLang;
    }
    return 'kk';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
      if (savedSound !== null) return savedSound === 'true';
    }
    return true;
  });

  const t = translations[language];

  // 2. Cloud Initialization State
  // 'checking' | 'error' | 'unconfigured' | 'ready'
  const [cloudInitStatus, setCloudInitStatus] = useState<'checking' | 'error' | 'unconfigured' | 'ready'>('checking');
  const [initErrorMessage, setInitErrorMessage] = useState('');
  const [retryCounter, setRetryCounter] = useState(0);

  // 3. Supabase-Only Game State (No localStorage for game content/levels/progress)
  const [state, setState] = useState<GameState>({
    language: language,
    soundEnabled: soundEnabled,
    progress: INITIAL_PROGRESS,
    levels: INITIAL_LEVELS,
    characters: INITIAL_CHARACTERS,
    shopItems: INITIAL_SHOP_ITEMS,
    teacherSettings: INITIAL_TEACHER_SETTINGS
  });

  // Keep state language and sound in sync
  useEffect(() => {
    setState(prev => ({ ...prev, language, soundEnabled }));
  }, [language, soundEnabled]);

  // 4. Authenticated Student Session State
  const [activeStudent, setActiveStudent] = useState<{
    student_id: string;
    student_code: string;
    display_name: string;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  // 5. Cloud Save State Indicator ('idle' | 'saving' | 'saved' | 'error')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // 6. UI Navigation & Modal states
  const [currentTab, setCurrentTab] = useState<'map' | 'character' | 'shop' | 'progress'>('map');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isChestModalOpen, setIsChestModalOpen] = useState(false);
  const [isTeacherPanelOpen, setIsTeacherPanelOpen] = useState(false);
  const [teacherInitialTab, setTeacherInitialTab] = useState<'levels' | 'reviews' | 'analytics' | 'backup' | 'cloud' | 'students'>('levels');

  // 7. INITIALIZE SUPABASE CLOUD (Mandatory Single Data Source)
  const initCloudDatabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setCloudInitStatus('unconfigured');
      return;
    }

    setCloudInitStatus('checking');
    setInitErrorMessage('');

    try {
      // Step A: Test connection & check core tables
      const connTest = await testSupabaseConnection();
      if (!connTest.success) {
        setCloudInitStatus('error');
        setInitErrorMessage(connTest.message);
        return;
      }

      // Step B: Load levels and questions from Supabase
      let cloudLevels = await fetchCloudLevels();

      // If math_levels table is brand new/empty, seed the initial levels to Supabase
      if (!cloudLevels || cloudLevels.length === 0) {
        console.info('Seeding initial levels to Supabase Cloud...');
        await syncLevelsToCloud(INITIAL_LEVELS);
        cloudLevels = await fetchCloudLevels();
      }

      if (!cloudLevels || cloudLevels.length === 0) {
        setCloudInitStatus('error');
        setInitErrorMessage('Failed to load levels from Supabase Cloud. Please run the SQL migration.');
        return;
      }

      // Step C: Load teacher settings from Supabase
      const cloudTeacher = await fetchTeacherSettingsFromCloud();

      // Step D: If student session is stored, verify and fetch latest progress directly from Supabase
      let restoredProgress = INITIAL_PROGRESS;
      if (activeStudent?.student_id) {
        const cloudProgress = await fetchStudentProgressFromCloud(activeStudent.student_id);
        if (cloudProgress) {
          restoredProgress = {
            ...INITIAL_PROGRESS,
            ...cloudProgress,
            studentId: activeStudent.student_id,
            studentCode: activeStudent.student_code,
            studentName: activeStudent.display_name
          };
        } else {
          // Student account was removed or not found in cloud; clear session
          setActiveStudent(null);
          try {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          } catch {}
        }
      }

      // Populate fresh state directly from Supabase
      setState(prev => ({
        ...prev,
        levels: cloudLevels!,
        teacherSettings: cloudTeacher || INITIAL_TEACHER_SETTINGS,
        progress: restoredProgress
      }));

      setCloudInitStatus('ready');
    } catch (err: any) {
      console.error('Database connection error:', err);
      setCloudInitStatus('error');
      setInitErrorMessage(err.message || 'Unknown network error connecting to Supabase Cloud');
    }
  }, [activeStudent?.student_id]);

  useEffect(() => {
    initCloudDatabase();
  }, [initCloudDatabase, retryCounter]);

  // Handle successful student login via Supabase RPC
  const handleStudentLoginSuccess = (loginResult: LoginResult) => {
    if (loginResult.student) {
      const studentSession = {
        student_id: loginResult.student.student_id,
        student_code: loginResult.student.student_code,
        display_name: loginResult.student.display_name
      };
      setActiveStudent(studentSession);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(studentSession));
      } catch {}
    }

    if (loginResult.progress) {
      setState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          ...loginResult.progress,
          studentId: loginResult.student?.student_id,
          studentCode: loginResult.student?.student_code,
          studentName: loginResult.student?.display_name,
          hasFinishedFirstSetup: loginResult.progress?.hasFinishedFirstSetup ?? true
        }
      }));
    }
  };

  // Handle Student Logout
  const handleLogout = () => {
    soundManager.playClick(state.soundEnabled);
    if (window.confirm(t.logoutConfirm)) {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {}
      setActiveStudent(null);
      setState(prev => ({
        ...prev,
        progress: {
          ...INITIAL_PROGRESS,
          hasFinishedFirstSetup: false
        }
      }));
    }
  };

  // Save student progress to Supabase with real status indicator
  const saveProgressToCloud = async (updatedProgress: typeof state.progress) => {
    if (!activeStudent?.student_id) return;
    setSaveStatus('saving');
    try {
      const success = await syncStudentProgressToCloud(updatedProgress);
      if (success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  // Published levels & active level
  const publishedLevels = state.levels.filter(l => l.isPublished);
  const currentLevel =
    publishedLevels.find(l => l.id === state.progress.currentLevelId) ||
    publishedLevels[0] ||
    state.levels[0];

  const currentLevelIndex = publishedLevels.findIndex(l => l.id === currentLevel.id);
  const isNextLevelAvailable = currentLevelIndex < publishedLevels.length - 1;
  const isPrevLevelAvailable = currentLevelIndex > 0;

  const handleSelectLevel = (levelId: string) => {
    soundManager.playClick(state.soundEnabled);
    const updated = { ...state.progress, currentLevelId: levelId };
    setState(prev => ({ ...prev, progress: updated }));
    saveProgressToCloud(updated);
  };

  const handleNextLevel = () => {
    if (isNextLevelAvailable) {
      const nextLvl = publishedLevels[currentLevelIndex + 1];
      handleSelectLevel(nextLvl.id);
    }
  };

  const handlePrevLevel = () => {
    if (isPrevLevelAvailable) {
      const prevLvl = publishedLevels[currentLevelIndex - 1];
      handleSelectLevel(prevLvl.id);
    }
  };

  // Language & Sound Toggles
  const handleToggleLanguage = () => {
    soundManager.playClick(state.soundEnabled);
    const nextLang: Language = language === 'kk' ? 'ru' : 'kk';
    setLanguage(nextLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch {}
  };

  const handleToggleSound = () => {
    const nextSound = !soundEnabled;
    soundManager.playClick(nextSound);
    setSoundEnabled(nextSound);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(nextSound));
    } catch {}
  };

  // Question Answer handlers
  const handleAnswerCorrect = async (questionId: string, pointsAwarded: number) => {
    const alreadyCompleted = state.progress.completedQuestionIds.includes(questionId);
    const newCompleted = alreadyCompleted
      ? state.progress.completedQuestionIds
      : [...state.progress.completedQuestionIds, questionId];

    // Check if level is complete
    const lvl = state.levels.find(l => l.id === state.progress.currentLevelId);
    const allDoneInLevel = lvl ? lvl.questions.every(q => newCompleted.includes(q.id)) : false;

    const newCompletedLevels =
      allDoneInLevel && !state.progress.completedLevelIds.includes(state.progress.currentLevelId)
        ? [...state.progress.completedLevelIds, state.progress.currentLevelId]
        : state.progress.completedLevelIds;

    // Prevent duplicate points! Only award points on first correct solve
    const pointsToAdd = alreadyCompleted ? 0 : pointsAwarded;

    const updatedProgress = {
      ...state.progress,
      points: state.progress.points + pointsToAdd,
      completedQuestionIds: newCompleted,
      completedLevelIds: newCompletedLevels,
      totalAttempts: state.progress.totalAttempts + 1
    };

    setState(prev => ({ ...prev, progress: updatedProgress }));
    await saveProgressToCloud(updatedProgress);
  };

  const handleAnswerIncorrect = async (questionId: string) => {
    const updatedProgress = {
      ...state.progress,
      totalAttempts: state.progress.totalAttempts + 1,
      incorrectAttemptsCount: {
        ...state.progress.incorrectAttemptsCount,
        [questionId]: (state.progress.incorrectAttemptsCount[questionId] || 0) + 1
      }
    };
    setState(prev => ({ ...prev, progress: updatedProgress }));
    await saveProgressToCloud(updatedProgress);
  };

  const handleSubmitForReview = async (submissionData: Omit<ReviewSubmission, 'id' | 'submittedAt'>) => {
    const newSubmission: ReviewSubmission = {
      ...submissionData,
      id: `sub_${Date.now()}`,
      submittedAt: Date.now()
    };

    // Save directly to Supabase cloud review submissions table
    await submitReviewToCloud(newSubmission);

    const filtered = state.progress.reviewSubmissions.filter(
      s => s.questionId !== submissionData.questionId
    );
    const updatedProgress = {
      ...state.progress,
      reviewSubmissions: [...filtered, newSubmission],
      totalAttempts: state.progress.totalAttempts + 1
    };

    setState(prev => ({ ...prev, progress: updatedProgress }));
    await saveProgressToCloud(updatedProgress);
  };

  // Treasure Chest Handler
  const handleOpenChest = async () => {
    const alreadyOpened = state.progress.openedChestLevelIds.includes(currentLevel.id);
    if (!alreadyOpened) {
      soundManager.playChest(state.soundEnabled);
      const bonus = currentLevel.rewardChestBonus || 50;
      const newOwnedItems =
        currentLevel.rewardItem && !state.progress.ownedItems.includes(currentLevel.rewardItem)
          ? [...state.progress.ownedItems, currentLevel.rewardItem]
          : state.progress.ownedItems;

      const updatedProgress = {
        ...state.progress,
        points: state.progress.points + bonus,
        openedChestLevelIds: [...state.progress.openedChestLevelIds, currentLevel.id],
        ownedItems: newOwnedItems
      };

      setState(prev => ({ ...prev, progress: updatedProgress }));
      await saveProgressToCloud(updatedProgress);
    }
    setIsChestModalOpen(true);
  };

  // Shop item purchase & equip handlers
  const handleBuyShopItem = async (item: ShopItem) => {
    // Prevent duplicate item purchase
    if (state.progress.ownedItems.includes(item.id)) return;
    if (state.progress.points < item.cost) return;

    const updatedProgress = {
      ...state.progress,
      points: state.progress.points - item.cost,
      ownedItems: [...state.progress.ownedItems, item.id]
    };

    setState(prev => ({ ...prev, progress: updatedProgress }));
    await saveProgressToCloud(updatedProgress);
  };

  const handleBuyCharacter = async (character: Character) => {
    // Prevent duplicate character unlock
    if (state.progress.unlockedCharacters.includes(character.id)) return;
    if (state.progress.points < character.cost) return;

    const updatedProgress = {
      ...state.progress,
      points: state.progress.points - character.cost,
      unlockedCharacters: [...state.progress.unlockedCharacters, character.id],
      selectedCharacterId: character.id
    };

    setState(prev => ({ ...prev, progress: updatedProgress }));
    await saveProgressToCloud(updatedProgress);
  };

  const handleEquipItem = async (category: 'hat' | 'clothing' | 'accessory', itemId?: string) => {
    const updatedProgress = {
      ...state.progress,
      equippedHat: category === 'hat' ? itemId : state.progress.equippedHat,
      equippedClothing: category === 'clothing' ? itemId : state.progress.equippedClothing,
      equippedAccessory: category === 'accessory' ? itemId : state.progress.equippedAccessory
    };

    setState(prev => ({ ...prev, progress: updatedProgress }));
    await saveProgressToCloud(updatedProgress);
  };

  const handleSelectCharacter = async (charId: string) => {
    const updatedProgress = {
      ...state.progress,
      selectedCharacterId: charId
    };

    setState(prev => ({ ...prev, progress: updatedProgress }));
    await saveProgressToCloud(updatedProgress);
  };

  const handleResetProgress = async () => {
    const updatedProgress = {
      ...INITIAL_PROGRESS,
      studentId: activeStudent?.student_id,
      studentCode: activeStudent?.student_code,
      studentName: activeStudent?.display_name,
      hasFinishedFirstSetup: true
    };
    setState(prev => ({ ...prev, progress: updatedProgress }));
    await saveProgressToCloud(updatedProgress);
  };

  // Format cloudStatus for Navigation
  const navCloudStatus: CloudSyncStatus = {
    configured: true,
    connected: cloudInitStatus === 'ready',
    syncing: saveStatus === 'saving',
    error: saveStatus === 'error' ? 'Cloud save error' : undefined
  };

  // =========================================================================
  // VIEW: 1. UNCONFIGURED DEVELOPER SCREEN
  // =========================================================================
  if (cloudInitStatus === 'unconfigured') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-amber-500/50 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">{t.devConfigTitle}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'kk'
                ? 'Math Adventure ойыны тек Supabase бұлтымен жұмыс істейді. Қолданбаның жұмыс істеуі үшін қоршаған орта айнымалыларын (Environment Variables) орнатыңыз.'
                : 'Math Adventure работает исключительно через Supabase Cloud. Для запуска настройте переменные окружения.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left font-mono text-xs text-emerald-400 space-y-2">
            <p className="text-[11px] text-slate-400 font-sans font-bold">.env.local / Vercel Environment Variables:</p>
            <p className="break-all select-all">VITE_SUPABASE_URL=https://your-project.supabase.co</p>
            <p className="break-all select-all">VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key</p>
          </div>

          <button
            type="button"
            onClick={() => setRetryCounter(c => c + 1)}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t.retryConnectionBtn}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: 2. CLOUD CONNECTION ERROR SCREEN
  // =========================================================================
  if (cloudInitStatus === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-rose-500/50 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
            <CloudAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">{t.cloudErrorTitle}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{t.cloudErrorDesc}</p>
          </div>

          {initErrorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-left text-xs font-mono text-rose-300 break-words">
              {initErrorMessage}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setRetryCounter(c => c + 1)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.retryConnectionBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleLanguage}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer pt-2"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{t.switchLang}: {language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: 3. CLOUD LOADING SCREEN
  // =========================================================================
  if (cloudInitStatus === 'checking') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping opacity-50" />
            <div className="relative w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-xl">
              <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">{t.appTitle}</h2>
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.cloudConnecting}</span>
            </div>
            <p className="text-[11px] text-slate-400">{t.cloudLoadingData}</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: 4. MAIN APPLICATION
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Navigation */}
      <TopNav
        language={state.language}
        soundEnabled={state.soundEnabled}
        points={state.progress.points}
        currentLevelTitle={currentLevel ? currentLevel.title[state.language] : ''}
        cloudStatus={navCloudStatus}
        studentName={activeStudent?.display_name}
        studentCode={activeStudent?.student_code}
        onLogout={activeStudent ? handleLogout : undefined}
        onToggleSound={handleToggleSound}
        onToggleLanguage={handleToggleLanguage}
        onOpenTeacherPanel={(initialTab) => {
          soundManager.playClick(state.soundEnabled);
          if (initialTab === 'cloud') {
            setTeacherInitialTab('cloud');
          } else if (initialTab === 'students') {
            setTeacherInitialTab('students');
          } else {
            setTeacherInitialTab('levels');
          }
          setIsTeacherPanelOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* VIEW: MAP */}
        {currentTab === 'map' && (
          <div className="space-y-4">
            {/* Level Switcher Header */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-sm">
              <button
                type="button"
                onClick={handlePrevLevel}
                disabled={!isPrevLevelAvailable}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 transition-colors cursor-pointer"
                title="Алдыңғы деңгей / Предыдущий уровень"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {t.levelLabel} {currentLevelIndex + 1} / {publishedLevels.length}
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  {currentLevel.title[state.language]}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleNextLevel}
                disabled={!isNextLevelAvailable}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 transition-colors cursor-pointer"
                title="Келесі деңгей / Следующий уровень"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Winding Adventure Path */}
            <MapPath
              level={currentLevel}
              progress={state.progress}
              language={state.language}
              onSelectQuestion={q => {
                soundManager.playClick(state.soundEnabled);
                setSelectedQuestion(q);
              }}
              onOpenChest={handleOpenChest}
              onNextLevel={handleNextLevel}
              isNextLevelAvailable={isNextLevelAvailable}
            />
          </div>
        )}

        {/* VIEW: PROGRESS / ACHIEVEMENTS */}
        {currentTab === 'progress' && (
          <ProgressView
            state={state}
            language={state.language}
          />
        )}
      </main>

      {/* Bottom Floating Navigation */}
      <BottomNav
        currentTab={currentTab}
        language={state.language}
        onSelectTab={tab => {
          soundManager.playClick(state.soundEnabled);
          setCurrentTab(tab);
        }}
      />

      {/* MODAL: Question Card */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          language={state.language}
          progress={state.progress}
          soundEnabled={state.soundEnabled}
          onClose={() => setSelectedQuestion(null)}
          onAnswerCorrect={handleAnswerCorrect}
          onAnswerIncorrect={handleAnswerIncorrect}
          onSubmitForReview={handleSubmitForReview}
        />
      )}

      {/* MODAL: Shop */}
      {currentTab === 'shop' && (
        <ShopModal
          characters={state.characters}
          shopItems={state.shopItems}
          progress={state.progress}
          language={state.language}
          soundEnabled={state.soundEnabled}
          onClose={() => setCurrentTab('map')}
          onBuyItem={handleBuyShopItem}
          onBuyCharacter={handleBuyCharacter}
          onEquipItem={handleEquipItem}
          onSelectCharacter={handleSelectCharacter}
        />
      )}

      {/* MODAL: Character Selector (from Nav) */}
      {currentTab === 'character' && (
        <CharacterSelectModal
          characters={state.characters}
          unlockedCharacterIds={state.progress.unlockedCharacters}
          selectedCharacterId={state.progress.selectedCharacterId}
          language={state.language}
          soundEnabled={state.soundEnabled}
          onSelectCharacter={handleSelectCharacter}
          onConfirm={() => setCurrentTab('map')}
        />
      )}

      {/* FIRST LAUNCH: Welcome Character Picker */}
      {activeStudent && !state.progress.hasFinishedFirstSetup && (
        <CharacterSelectModal
          characters={state.characters}
          unlockedCharacterIds={state.progress.unlockedCharacters}
          selectedCharacterId={state.progress.selectedCharacterId}
          language={state.language}
          soundEnabled={state.soundEnabled}
          onSelectCharacter={handleSelectCharacter}
          onConfirm={() => {
            const updated = { ...state.progress, hasFinishedFirstSetup: true };
            setState(prev => ({ ...prev, progress: updated }));
            saveProgressToCloud(updated);
          }}
          isFirstLaunch={true}
        />
      )}

      {/* MODAL: Level Complete / Treasure Chest */}
      {isChestModalOpen && (
        <LevelCompleteModal
          level={currentLevel}
          rewardItem={state.shopItems.find(i => i.id === currentLevel.rewardItem)}
          language={state.language}
          soundEnabled={state.soundEnabled}
          onClose={() => setIsChestModalOpen(false)}
          onNextLevel={
            isNextLevelAvailable
              ? () => {
                  setIsChestModalOpen(false);
                  handleNextLevel();
                }
              : undefined
          }
          hasAlreadyClaimedChest={state.progress.openedChestLevelIds.includes(currentLevel.id)}
        />
      )}

      {/* MODAL: Teacher Panel */}
      {isTeacherPanelOpen && (
        <TeacherPanel
          state={state}
          language={state.language}
          soundEnabled={state.soundEnabled}
          initialTab={teacherInitialTab}
          onClose={() => setIsTeacherPanelOpen(false)}
          onUpdateState={setState}
          onResetProgress={handleResetProgress}
          onResetAllDefault={handleResetProgress}
        />
      )}

      {/* MANDATORY STUDENT LOGIN MODAL (No guest bypass) */}
      {!activeStudent && (
        <StudentLoginModal
          language={state.language}
          soundEnabled={state.soundEnabled}
          onSuccess={handleStudentLoginSuccess}
          onToggleLanguage={handleToggleLanguage}
        />
      )}
    </div>
  );
}
