/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Level, Question, StudentProgress, Language } from '../types/game';
import { translations } from '../i18n/translations';
import { CharacterAvatar } from './CharacterAvatar';
import { WORLD_THEMES } from '../data/worldThemes';
import { Check, Lock, Sparkles, Trophy, Gift, ArrowRight } from 'lucide-react';

interface MapPathProps {
  level: Level;
  progress: StudentProgress;
  language: Language;
  onSelectQuestion: (question: Question) => void;
  onOpenChest: () => void;
  onNextLevel: () => void;
  isNextLevelAvailable: boolean;
}

export const MapPath: React.FC<MapPathProps> = ({
  level,
  progress,
  language,
  onSelectQuestion,
  onOpenChest,
  onNextLevel,
  isNextLevelAvailable
}) => {
  const t = translations[language];
  const questions = level.questions;

  // Retrieve world configuration
  const themeKey = level.worldTheme || 'forest';
  const worldConfig = WORLD_THEMES[themeKey] || WORLD_THEMES.forest;

  // State to track if image failed to load, triggering smooth CSS fallback
  const [imageError, setImageError] = useState(false);

  // Calculate status of each question
  const completedSet = new Set(progress.completedQuestionIds);
  const pendingSet = new Set(
    progress.reviewSubmissions
      .filter(r => r.levelId === level.id && r.status === 'pending')
      .map(r => r.questionId)
  );

  let firstIncompleteIndex = -1;
  for (let i = 0; i < questions.length; i++) {
    if (!completedSet.has(questions[i].id)) {
      firstIncompleteIndex = i;
      break;
    }
  }

  const isLevelCompleted = firstIncompleteIndex === -1 && questions.length > 0;
  const isChestOpened = progress.openedChestLevelIds.includes(level.id);

  // Deterministic trail coordinates from the world configuration
  const pathCoordinates = worldConfig.coordinates;

  // Build SVG path data for winding cobblestone trail
  const pathD = questions
    .map((q, idx) => {
      const coord = pathCoordinates[idx] || { x: 50, y: 50 };
      return `${idx === 0 ? 'M' : 'L'} ${coord.x * 10} ${coord.y * 10}`;
    })
    .join(' ');

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-emerald-800/40 shadow-2xl bg-slate-950 transition-all duration-700">
      {/* Background Illustrated World Landscape */}
      <div
        className={`relative w-full h-[620px] md:h-[680px] bg-gradient-to-b ${worldConfig.fallbackGradient} overflow-hidden select-none transition-all duration-700`}
      >
        {/* Thematic Background Image with Fade Transition */}
        {!imageError && (
          <img
            key={worldConfig.id}
            src={worldConfig.bgImage}
            alt={worldConfig.name[language]}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen pointer-events-none filter saturate-125 transition-opacity duration-700 animate-fade-in"
          />
        )}

        {/* Ambient atmospheric lighting overlays specific to world */}
        <div
          className={`absolute inset-0 bg-radial ${worldConfig.ambientGlow} pointer-events-none`}
        />

        {/* Decorative World Badge in the Map */}
        <div className="absolute top-6 left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{worldConfig.name[language]}</span>
          <span className="text-slate-400 font-normal">·</span>
          <span className="text-slate-300 font-medium">{level.title[language]}</span>
        </div>

        {/* Landmark Badges (World Elements) */}
        <div className="hidden lg:flex absolute top-6 left-1/2 -translate-x-1/2 items-center gap-2">
          {worldConfig.landmarkBadges.map((badge, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-sm border border-white/10 text-[11px] font-medium text-slate-300"
            >
              {badge[language]}
            </span>
          ))}
        </div>

        {/* Level Stats Bar */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/15 text-xs font-medium text-slate-300 shadow-lg">
          <span className="text-amber-400 font-bold">
            {questions.filter(q => completedSet.has(q.id)).length}
          </span>
          <span>/</span>
          <span>
            {questions.length} {t.stepNumber.toLowerCase()}
          </span>
        </div>

        {/* SVG Winding Thematic Path */}
        <svg
          viewBox="0 0 1000 1000"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* Path Shadow / Underbed */}
          <path
            d={pathD}
            fill="none"
            stroke={worldConfig.pathUnderbedColor}
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Outer Trail Border */}
          <path
            d={pathD}
            fill="none"
            stroke={worldConfig.pathBorderColor}
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cobblestone / Paver Core with World Color */}
          <path
            d={pathD}
            fill="none"
            stroke={worldConfig.pathCoreColor}
            strokeWidth="14"
            strokeDasharray={worldConfig.pathDashArray}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Magic Trail Center Glow */}
          <path
            d={pathD}
            fill="none"
            stroke={worldConfig.magicTrailGlow}
            strokeWidth="4"
            strokeDasharray="6 14"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse opacity-90"
          />
        </svg>

        {/* Trail Nodes (Questions) */}
        {questions.map((question, index) => {
          const coord = pathCoordinates[index] || { x: 50, y: 50 };
          const isCompleted = completedSet.has(question.id);
          const isPending = pendingSet.has(question.id);
          const isCurrent = index === firstIncompleteIndex;
          const isLocked = !isCompleted && !isPending && !isCurrent;

          return (
            <div
              key={question.id}
              style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              {/* If Current: show the 2.5D player avatar standing gracefully on the active node */}
              {isCurrent && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                  <CharacterAvatar
                    avatarId={progress.selectedCharacterId}
                    size="md"
                    equippedHat={progress.equippedHat}
                    equippedClothing={progress.equippedClothing}
                    equippedAccessory={progress.equippedAccessory}
                    points={progress.points}
                    animationState="jumping"
                  />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-0.5 shadow-lg shadow-amber-400/80 animate-ping" />
                </div>
              )}

              {/* Node Button */}
              <button
                type="button"
                onClick={() => {
                  if (!isLocked) {
                    onSelectQuestion(question);
                  }
                }}
                disabled={isLocked}
                title={
                  isCompleted
                    ? `${t.stepNumber} ${index + 1} (${t.practiceModeNote})`
                    : isLocked
                    ? t.lockedStep
                    : `${t.stepNumber} ${index + 1}`
                }
                className={`relative flex items-center justify-center rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 ${
                  isCurrent
                    ? `w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-xl ${worldConfig.activeNodeRing} scale-110 cursor-pointer`
                    : isCompleted
                    ? `w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr ${worldConfig.completedNodeBg} text-white shadow-md hover:scale-105 cursor-pointer ring-2 ring-white/30`
                    : isPending
                    ? 'w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md animate-pulse cursor-pointer ring-2 ring-purple-300/40'
                    : 'w-11 h-11 md:w-12 md:h-12 bg-slate-900/90 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-80'
                }`}
              >
                {/* Node Interior Content */}
                {isCompleted ? (
                  <div className="flex flex-col items-center justify-center">
                    <Check className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
                    <span className="text-[10px] font-black leading-none mt-0.5">{index + 1}</span>
                  </div>
                ) : isPending ? (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold">⏳</span>
                    <span className="text-[9px] font-bold">{index + 1}</span>
                  </div>
                ) : isCurrent ? (
                  <div className="flex flex-col items-center justify-center font-black">
                    <span className="text-base md:text-lg leading-tight font-black">{index + 1}</span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-950">
                      {question.difficulty === 'easy' ? '10p' : question.difficulty === 'medium' ? '20p' : '30p'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Lock className="w-4 h-4" />
                    <span className="text-[9px] font-bold opacity-75">{index + 1}</span>
                  </div>
                )}

                {/* Difficulty color dot on top */}
                <div
                  className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border border-slate-900 flex items-center justify-center ${
                    question.difficulty === 'easy'
                      ? 'bg-emerald-400'
                      : question.difficulty === 'medium'
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  title={`${t.difficultyLabel}: ${
                    question.difficulty === 'easy'
                      ? t.difficultyEasy
                      : question.difficulty === 'medium'
                      ? t.difficultyMedium
                      : t.difficultyHard
                  }`}
                />
              </button>
            </div>
          );
        })}

        {/* Finish Treasure Chest at the end of the trail */}
        <div className="absolute top-12 right-12 z-20 flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenChest}
            disabled={!isLevelCompleted}
            className={`group relative flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
              isLevelCompleted && !isChestOpened
                ? 'cursor-pointer animate-bounce scale-110 bg-amber-500/25 border-2 border-amber-400 shadow-2xl shadow-amber-500/40'
                : isChestOpened
                ? 'bg-emerald-950/70 border border-emerald-500/40 cursor-pointer opacity-90'
                : 'bg-slate-900/60 border border-slate-700/40 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="relative w-16 h-16 md:w-20 md:h-20">
              <img
                src="/src/assets/images/treasure_chest_gold_1793243135293.jpg"
                alt="Treasure Chest"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-contain rounded-xl drop-shadow-lg ${
                  !isLevelCompleted ? 'grayscale opacity-70' : ''
                }`}
              />
              {isChestOpened && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/70 rounded-xl">
                  <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
                </div>
              )}
            </div>

            <span className="mt-1 text-xs font-bold text-amber-300 whitespace-nowrap">
              {isChestOpened ? '✓ ' + t.ownedLabel : isLevelCompleted ? t.openChestBtn : level.rewardChestBonus + ' ' + t.pointsLabel}
            </span>
          </button>
        </div>

        {/* Level Complete / Next Level Floating Banner */}
        {isLevelCompleted && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-md w-[90%] bg-slate-900/95 backdrop-blur-md border border-amber-400/50 p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-300">{t.levelCompletedNotice}</p>
                <p className="text-xs text-slate-300">
                  {isChestOpened ? '✓ ' + t.chestRewardTitle : '+ ' + level.rewardChestBonus + ' ' + t.pointsLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isChestOpened && (
                <button
                  type="button"
                  onClick={onOpenChest}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Gift className="w-4 h-4" />
                  {t.openChestBtn}
                </button>
              )}

              {isNextLevelAvailable && (
                <button
                  type="button"
                  onClick={onNextLevel}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {t.nextLevelBtn}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
