/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameState, Language } from '../types/game';
import { translations } from '../i18n/translations';
import { CharacterAvatar } from './CharacterAvatar';
import {
  Trophy,
  Coins,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface ProgressViewProps {
  state: GameState;
  language: Language;
  onOpenQuestionById?: (questionId: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  state,
  language,
  onOpenQuestionById
}) => {
  const t = translations[language];
  const { progress, levels, characters, shopItems } = state;

  const totalQuestionsInGame = levels.reduce(
    (sum, lvl) => sum + lvl.questions.length,
    0
  );
  const completedQuestionsCount = progress.completedQuestionIds.length;
  const completedLevelsCount = progress.completedLevelIds.length;

  const currentChar =
    characters.find(c => c.id === progress.selectedCharacterId) || characters[0];

  // Character rank title
  const rankTitle =
    progress.points >= 150
      ? t.characterRank3
      : progress.points >= 50
      ? t.characterRank2
      : t.characterRank1;

  // Equipped item names
  const equippedHatObj = shopItems.find(i => i.id === progress.equippedHat);
  const equippedClothObj = shopItems.find(i => i.id === progress.equippedClothing);
  const equippedAccObj = shopItems.find(i => i.id === progress.equippedAccessory);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Top Profile Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <CharacterAvatar
            avatarId={currentChar.avatarId}
            size="xl"
            equippedHat={progress.equippedHat}
            equippedClothing={progress.equippedClothing}
            equippedAccessory={progress.equippedAccessory}
            points={progress.points}
            isAnimated={true}
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-100">
              {currentChar.name[language]}
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {rankTitle}
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-xl">
            {currentChar.description[language]}
          </p>

          {/* Equipped gears tags */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
            <span className="text-xs font-bold text-slate-400">{t.equippedSummary}:</span>
            {equippedHatObj ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700 text-xs">
                🎩 {equippedHatObj.name[language]}
              </span>
            ) : null}
            {equippedClothObj ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700 text-xs">
                🥋 {equippedClothObj.name[language]}
              </span>
            ) : null}
            {equippedAccObj ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 text-xs">
                🔮 {equippedAccObj.name[language]}
              </span>
            ) : null}
            {!equippedHatObj && !equippedClothObj && !equippedAccObj && (
              <span className="text-xs text-slate-500 italic">—</span>
            )}
          </div>
        </div>

        {/* Big Points Box */}
        <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center shrink-0">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            {t.totalPoints}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <Coins className="w-6 h-6 text-amber-400 animate-pulse" />
            <span className="text-3xl font-black text-amber-300 tabular-nums">
              {progress.points}
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Stats Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Questions Solved */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{t.questionsCompleted}</p>
            <p className="text-xl font-bold text-slate-100 tabular-nums">
              {completedQuestionsCount} / {totalQuestionsInGame}
            </p>
          </div>
        </div>

        {/* Levels Conquered */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{t.levelsCompleted}</p>
            <p className="text-xl font-bold text-slate-100 tabular-nums">
              {completedLevelsCount} / {levels.length}
            </p>
          </div>
        </div>

        {/* Characters & Items Owned */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{t.tabCharacters} / {t.tabClothing}</p>
            <p className="text-xl font-bold text-slate-100 tabular-nums">
              {progress.unlockedCharacters.length} / {characters.length}
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Review Submissions Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-slate-100">{t.reviewQueueTitle}</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
            {progress.reviewSubmissions.length}
          </span>
        </div>

        {progress.reviewSubmissions.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">{t.noPendingReviews}</p>
        ) : (
          <div className="space-y-3">
            {progress.reviewSubmissions.map(submission => {
              return (
                <div
                  key={submission.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {submission.questionTitle[language]}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          submission.status === 'pending'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : submission.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {submission.status === 'pending'
                          ? t.pendingStatus
                          : submission.status === 'approved'
                          ? t.approvedStatus
                          : t.rejectedStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      <span className="font-semibold">{t.studentAnswerLabel} </span>
                      &quot;{submission.studentAnswer}&quot;
                    </p>

                    {submission.teacherFeedback && (
                      <p className="text-xs text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-600/30">
                        <span className="font-bold">{t.teacherFeedbackTitle} </span>
                        {submission.teacherFeedback}
                      </p>
                    )}
                  </div>

                  {onOpenQuestionById && (
                    <button
                      type="button"
                      onClick={() => onOpenQuestionById(submission.questionId)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer self-start sm:self-center transition-colors"
                    >
                      {t.questionTitle}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
