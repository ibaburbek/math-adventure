/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition } from 'react';
import {
  GameState,
  Language,
  Question,
  Level,
  ShopItem,
  Character,
  ReviewSubmission,
  CloudSyncStatus
} from './types/game';
import {
  isSupabaseConfigured,
  syncStudentProgressToCloud,
  fetchStudentProgressFromCloud,
  submitReviewToCloud
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
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'math_adventure_game_state_v1';

export default function App() {
  const [isPending, startTransition] = useTransition();

  // Initialize GameState with localStorage or defaults
  const [state, setState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.levels && parsed.progress) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to load saved state from localStorage:', err);
      }
    }
    return {
      language: 'kk', // default Kazakh
      soundEnabled: true,
      progress: INITIAL_PROGRESS,
      levels: INITIAL_LEVELS,
      characters: INITIAL_CHARACTERS,
      shopItems: INITIAL_SHOP_ITEMS,
      teacherSettings: INITIAL_TEACHER_SETTINGS
    };
  });

  // Automatically save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save state to localStorage:', err);
    }
  }, [state]);

  // UI Navigation & Modal states
  const [currentTab, setCurrentTab] = useState<'map' | 'character' | 'shop' | 'progress'>('map');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isChestModalOpen, setIsChestModalOpen] = useState(false);
  const [isTeacherPanelOpen, setIsTeacherPanelOpen] = useState(false);
  const [teacherInitialTab, setTeacherInitialTab] = useState<'levels' | 'reviews' | 'analytics' | 'backup' | 'cloud'>('levels');

  // Supabase Cloud Sync State
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>({
    configured: isSupabaseConfigured(),
    connected: false,
    syncing: false
  });

  // On Mount: Initial check and sync from/to Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCloudStatus({ configured: false, connected: false, syncing: false });
      return;
    }

    setCloudStatus(prev => ({ ...prev, configured: true, syncing: true }));

    const studentId = state.progress.studentId || 'default_student';

    // Attempt to pull student progress from cloud or register student
    fetchStudentProgressFromCloud(studentId)
      .then(cloudData => {
        if (cloudData) {
          // Cloud has existing record; if cloud points are higher or equal, sync into local state
          if (typeof cloudData.points === 'number' && cloudData.points >= state.progress.points) {
            setState(prev => ({
              ...prev,
              progress: {
                ...prev.progress,
                ...cloudData,
                studentId: prev.progress.studentId,
                studentName: prev.progress.studentName
              }
            }));
          }
          setCloudStatus({
            configured: true,
            connected: true,
            syncing: false,
            lastSyncedAt: Date.now()
          });
        } else {
          // New student, push local progress to cloud
          syncStudentProgressToCloud(state.progress).then(success => {
            setCloudStatus({
              configured: true,
              connected: success,
              syncing: false,
              lastSyncedAt: success ? Date.now() : undefined
            });
          });
        }
      })
      .catch(err => {
        setCloudStatus({
          configured: true,
          connected: false,
          syncing: false,
          error: String(err)
        });
      });
  }, []);

  // Background auto-sync to Supabase when progress changes
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const timer = setTimeout(() => {
      setCloudStatus(prev => ({ ...prev, syncing: true }));
      syncStudentProgressToCloud(state.progress)
        .then(success => {
          if (success) {
            setCloudStatus(prev => ({
              ...prev,
              connected: true,
              syncing: false,
              lastSyncedAt: Date.now(),
              error: undefined
            }));
          } else {
            setCloudStatus(prev => ({
              ...prev,
              syncing: false,
              error: 'Sync error'
            }));
          }
        })
        .catch(err => {
          setCloudStatus(prev => ({
            ...prev,
            syncing: false,
            error: String(err)
          }));
        });
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    state.progress.points,
    state.progress.completedQuestionIds,
    state.progress.completedLevelIds,
    state.progress.openedChestLevelIds,
    state.progress.selectedCharacterId,
    state.progress.equippedHat,
    state.progress.equippedClothing,
    state.progress.equippedAccessory,
    state.progress.ownedItems
  ]);

  const t = translations[state.language];

  // Current active level object
  const publishedLevels = state.levels.filter(l => l.isPublished);
  const currentLevel =
    publishedLevels.find(l => l.id === state.progress.currentLevelId) ||
    publishedLevels[0] ||
    state.levels[0];

  // Helpers to navigate levels
  const currentLevelIndex = publishedLevels.findIndex(l => l.id === currentLevel.id);
  const isNextLevelAvailable = currentLevelIndex < publishedLevels.length - 1;
  const isPrevLevelAvailable = currentLevelIndex > 0;

  const handleSelectLevel = (levelId: string) => {
    soundManager.playClick(state.soundEnabled);
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        currentLevelId: levelId
      }
    }));
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

  // Language & Sound toggles
  const handleToggleLanguage = () => {
    soundManager.playClick(state.soundEnabled);
    setState(prev => ({
      ...prev,
      language: prev.language === 'kk' ? 'ru' : 'kk'
    }));
  };

  const handleToggleSound = () => {
    const nextVal = !state.soundEnabled;
    soundManager.playClick(nextVal);
    setState(prev => ({
      ...prev,
      soundEnabled: nextVal
    }));
  };

  // Question Answer handlers
  const handleAnswerCorrect = (questionId: string, pointsAwarded: number) => {
    setState(prev => {
      const alreadyCompleted = prev.progress.completedQuestionIds.includes(questionId);
      const newCompleted = alreadyCompleted
        ? prev.progress.completedQuestionIds
        : [...prev.progress.completedQuestionIds, questionId];

      // Check if all questions in current level are now complete
      const lvl = prev.levels.find(l => l.id === prev.progress.currentLevelId);
      const allDoneInLevel = lvl
        ? lvl.questions.every(q => newCompleted.includes(q.id))
        : false;

      const newCompletedLevels =
        allDoneInLevel && !prev.progress.completedLevelIds.includes(prev.progress.currentLevelId)
          ? [...prev.progress.completedLevelIds, prev.progress.currentLevelId]
          : prev.progress.completedLevelIds;

      return {
        ...prev,
        progress: {
          ...prev.progress,
          points: prev.progress.points + pointsAwarded,
          completedQuestionIds: newCompleted,
          completedLevelIds: newCompletedLevels,
          totalAttempts: prev.progress.totalAttempts + 1
        }
      };
    });
  };

  const handleAnswerIncorrect = (questionId: string) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        totalAttempts: prev.progress.totalAttempts + 1,
        incorrectAttemptsCount: {
          ...prev.progress.incorrectAttemptsCount,
          [questionId]: (prev.progress.incorrectAttemptsCount[questionId] || 0) + 1
        }
      }
    }));
  };

  const handleSubmitForReview = (submissionData: Omit<ReviewSubmission, 'id' | 'submittedAt'>) => {
    const newSubmission: ReviewSubmission = {
      ...submissionData,
      id: `sub_${Date.now()}`,
      submittedAt: Date.now()
    };

    // If Supabase is configured, also post to cloud review submissions table
    if (isSupabaseConfigured()) {
      submitReviewToCloud(newSubmission).catch(err => {
        console.warn('Failed to submit review to cloud:', err);
      });
    }

    setState(prev => {
      // Replace existing submission for this question if any, or append
      const filtered = prev.progress.reviewSubmissions.filter(
        s => s.questionId !== submissionData.questionId
      );
      return {
        ...prev,
        progress: {
          ...prev.progress,
          reviewSubmissions: [...filtered, newSubmission],
          totalAttempts: prev.progress.totalAttempts + 1
        }
      };
    });
  };

  // Treasure Chest Handler
  const handleOpenChest = () => {
    const alreadyOpened = state.progress.openedChestLevelIds.includes(currentLevel.id);
    if (!alreadyOpened) {
      soundManager.playChest(state.soundEnabled);
      setState(prev => {
        const bonus = currentLevel.rewardChestBonus || 50;
        const newOwnedItems =
          currentLevel.rewardItem && !prev.progress.ownedItems.includes(currentLevel.rewardItem)
            ? [...prev.progress.ownedItems, currentLevel.rewardItem]
            : prev.progress.ownedItems;

        return {
          ...prev,
          progress: {
            ...prev.progress,
            points: prev.progress.points + bonus,
            openedChestLevelIds: [...prev.progress.openedChestLevelIds, currentLevel.id],
            ownedItems: newOwnedItems
          }
        };
      });
    }
    setIsChestModalOpen(true);
  };

  // Shop item purchase & equip handlers
  const handleBuyShopItem = (item: ShopItem) => {
    if (state.progress.points < item.cost) return;
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        points: prev.progress.points - item.cost,
        ownedItems: [...prev.progress.ownedItems, item.id]
      }
    }));
  };

  const handleBuyCharacter = (character: Character) => {
    if (state.progress.points < character.cost) return;
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        points: prev.progress.points - character.cost,
        unlockedCharacters: [...prev.progress.unlockedCharacters, character.id],
        selectedCharacterId: character.id
      }
    }));
  };

  const handleEquipItem = (category: 'hat' | 'clothing' | 'accessory', itemId?: string) => {
    setState(prev => {
      const p = { ...prev.progress };
      if (category === 'hat') p.equippedHat = itemId;
      if (category === 'clothing') p.equippedClothing = itemId;
      if (category === 'accessory') p.equippedAccessory = itemId;
      return { ...prev, progress: p };
    });
  };

  const handleSelectCharacter = (characterId: string) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        selectedCharacterId: characterId
      }
    }));
  };

  // Reset Progress for testing
  const handleResetProgress = () => {
    setState(prev => ({
      ...prev,
      progress: {
        ...INITIAL_PROGRESS,
        hasFinishedFirstSetup: true
      }
    }));
  };

  // Reset everything to factory default
  const handleResetAllDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState({
      language: 'kk',
      soundEnabled: true,
      progress: { ...INITIAL_PROGRESS, hasFinishedFirstSetup: true },
      levels: INITIAL_LEVELS,
      characters: INITIAL_CHARACTERS,
      shopItems: INITIAL_SHOP_ITEMS,
      teacherSettings: INITIAL_TEACHER_SETTINGS
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Navigation */}
      <TopNav
        language={state.language}
        soundEnabled={state.soundEnabled}
        points={state.progress.points}
        currentLevelTitle={currentLevel ? currentLevel.title[state.language] : ''}
        cloudStatus={cloudStatus}
        onToggleSound={handleToggleSound}
        onToggleLanguage={handleToggleLanguage}
        onOpenTeacherPanel={(initialTab) => {
          soundManager.playClick(state.soundEnabled);
          if (initialTab === 'cloud') {
            setTeacherInitialTab('cloud');
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

            {/* Central Illustrated 2D Winding Forest Path */}
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

        {/* VIEW: PROGRESS */}
        {currentTab === 'progress' && (
          <ProgressView
            state={state}
            language={state.language}
            onOpenQuestionById={qId => {
              const foundQ = currentLevel.questions.find(q => q.id === qId);
              if (foundQ) {
                setSelectedQuestion(foundQ);
              }
            }}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
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
      {!state.progress.hasFinishedFirstSetup && (
        <CharacterSelectModal
          characters={state.characters}
          unlockedCharacterIds={state.progress.unlockedCharacters}
          selectedCharacterId={state.progress.selectedCharacterId}
          language={state.language}
          soundEnabled={state.soundEnabled}
          onSelectCharacter={handleSelectCharacter}
          onConfirm={() => {
            setState(prev => ({
              ...prev,
              progress: {
                ...prev.progress,
                hasFinishedFirstSetup: true
              }
            }));
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
          onResetAllDefault={handleResetAllDefault}
        />
      )}
    </div>
  );
}
