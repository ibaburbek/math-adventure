/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Question, Language, StudentProgress, ReviewSubmission } from '../types/game';
import { translations } from '../i18n/translations';
import { CharacterAvatar } from './CharacterAvatar';
import { soundManager } from '../utils/sound';
import { X, CheckCircle2, AlertCircle, Clock, Sparkles, Send, RotateCcw } from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  language: Language;
  progress: StudentProgress;
  soundEnabled: boolean;
  onClose: () => void;
  onAnswerCorrect: (questionId: string, pointsAwarded: number) => void;
  onAnswerIncorrect: (questionId: string) => void;
  onSubmitForReview: (submission: Omit<ReviewSubmission, 'id' | 'submittedAt'>) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  language,
  progress,
  soundEnabled,
  onClose,
  onAnswerCorrect,
  onAnswerIncorrect,
  onSubmitForReview
}) => {
  const t = translations[language];

  // Check if question was already completed earlier
  const isAlreadyCompleted = progress.completedQuestionIds.includes(question.id);

  // Check if there is an active teacher review submission for this question
  const existingSubmission = progress.reviewSubmissions.find(
    s => s.questionId === question.id
  );

  const [inputAnswer, setInputAnswer] = useState(
    existingSubmission ? existingSubmission.studentAnswer : ''
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong' | 'review_sent' | null;
    message: string;
  }>({ type: null, message: '' });

  const pointsValue =
    question.difficulty === 'easy' ? 10 : question.difficulty === 'medium' ? 20 : 30;

  // Sound and confetti celebration
  const triggerCelebration = () => {
    soundManager.playCorrect(soundEnabled);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6']
      });
    } catch {
      // Confetti fallback
    }
  };

  const normalize = (str: string) =>
    str.trim().toLowerCase().replace(/\s+/g, ' ').replace(',', '.');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const answerToCheck = question.answerMode === 'multiple_choice'
      ? selectedOption
      : inputAnswer;

    if (!answerToCheck || !answerToCheck.trim()) return;

    // Handle Manual Checking Mode
    if (question.checkingMode === 'manual') {
      soundManager.playClick(soundEnabled);
      onSubmitForReview({
        questionId: question.id,
        levelId: question.levelId,
        questionTitle: question.text,
        studentAnswer: answerToCheck.trim(),
        status: 'pending',
        points: pointsValue
      });
      setFeedback({
        type: 'review_sent',
        message: t.sentToTeacherReview
      });
      return;
    }

    // Handle Automatic Checking Mode
    const isCorrect = normalize(answerToCheck) === normalize(question.correctAnswer);

    if (isCorrect) {
      triggerCelebration();
      setFeedback({
        type: 'correct',
        message: t.correctAnswerMsg
      });

      // Award points only if not previously completed
      const pointsToAward = isAlreadyCompleted ? 0 : pointsValue;
      onAnswerCorrect(question.id, pointsToAward);
    } else {
      soundManager.playWrong(soundEnabled);
      setFeedback({
        type: 'wrong',
        message: t.wrongAnswerMsg
      });
      onAnswerIncorrect(question.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                question.difficulty === 'easy'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : question.difficulty === 'medium'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {question.difficulty === 'easy'
                ? t.difficultyEasy
                : question.difficulty === 'medium'
                ? t.difficultyMedium
                : t.difficultyHard}
            </span>

            <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4" />
              {isAlreadyCompleted ? `+0 (${t.ownedLabel})` : `+${pointsValue} ${t.pointsReward}`}
            </span>

            <span className="text-xs text-slate-400">
              {question.checkingMode === 'manual' ? `[${t.manualCheckMode}]` : `[${t.autoCheckMode}]`}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Practice Mode Notice */}
          {isAlreadyCompleted && (
            <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{t.practiceModeNote}</span>
            </div>
          )}

          {/* Teacher Review Pending Notice */}
          {existingSubmission && existingSubmission.status === 'pending' && (
            <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-xs text-purple-200 flex items-start gap-3">
              <Clock className="w-5 h-5 shrink-0 text-purple-400 mt-0.5 animate-pulse" />
              <div>
                <p className="font-bold text-purple-300">{t.underTeacherReview}</p>
                <p className="mt-1">{t.sentToTeacherReview}</p>
              </div>
            </div>
          )}

          {/* Teacher Requested Correction Notice */}
          {existingSubmission && existingSubmission.status === 'needs_correction' && (
            <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">{t.teacherNeedsCorrection}</p>
                {existingSubmission.teacherFeedback && (
                  <p className="mt-1 p-2 rounded bg-amber-900/40 border border-amber-600/30 font-medium">
                    {t.teacherFeedbackTitle} &quot;{existingSubmission.teacherFeedback}&quot;
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Question Text and Character Mascot */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40">
            <div className="flex flex-col items-center shrink-0">
              <CharacterAvatar
                avatarId={progress.selectedCharacterId}
                size="lg"
                equippedHat={progress.equippedHat}
                equippedClothing={progress.equippedClothing}
                equippedAccessory={progress.equippedAccessory}
                points={progress.points}
                animationState={
                  feedback.type === 'correct'
                    ? 'celebrating'
                    : feedback.type === 'wrong'
                    ? 'oops'
                    : 'thinking'
                }
                isAnimated={true}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
                {question.text[language]}
              </p>
            </div>
          </div>

          {/* Question Image (if present) */}
          {question.image && (
            <div className="flex justify-center">
              <img
                src={question.image}
                alt="Question diagram"
                className="max-h-56 rounded-xl border border-slate-700 object-contain shadow-md"
              />
            </div>
          )}

          {/* Multiple Choice Options */}
          {question.answerMode === 'multiple_choice' && question.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {question.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundManager.playClick(soundEnabled);
                      setSelectedOption(option);
                      setFeedback({ type: null, message: '' });
                    }}
                    className={`p-4 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-700/40 scale-[1.02]'
                        : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span>{option}</span>
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">
                      {isSelected ? '✓' : String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Typed Answer Field */}
          {question.answerMode === 'typed' && (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-300">
                {question.checkingMode === 'manual' ? t.studentAnswerLabel : t.enterYourAnswer}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputAnswer}
                  onChange={e => {
                    setInputAnswer(e.target.value);
                    setFeedback({ type: null, message: '' });
                  }}
                  placeholder={t.enterYourAnswer}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-base font-medium shadow-inner"
                />
              </div>
            </form>
          )}

          {/* Feedback Area */}
          {feedback.type && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in text-sm font-medium ${
                feedback.type === 'correct'
                  ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300'
                  : feedback.type === 'wrong'
                  ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300'
                  : 'bg-purple-950/80 border border-purple-500/60 text-purple-300'
              }`}
            >
              {feedback.type === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : feedback.type === 'wrong' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-purple-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Explanation if answered correctly or practice mode */}
          {(feedback.type === 'correct' || isAlreadyCompleted) && question.explanation && (
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
              <span className="font-bold text-amber-400">{t.explanationLabel}: </span>
              {question.explanation[language]}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-emerald-800/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t.close}
          </button>

          <div className="flex items-center gap-3">
            {feedback.type === 'correct' ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>{t.continueAdventure}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={
                  question.answerMode === 'multiple_choice'
                    ? !selectedOption
                    : !inputAnswer.trim()
                }
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-emerald-700/30 cursor-pointer transition-all flex items-center gap-2"
              >
                {question.checkingMode === 'manual' ? (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{existingSubmission ? t.resubmitAnswer : t.submitAnswer}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.submitAnswer}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
