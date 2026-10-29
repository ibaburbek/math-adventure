/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Level, ShopItem, Language } from '../types/game';
import { translations } from '../i18n/translations';
import { soundManager } from '../utils/sound';
import { Sparkles, Trophy, Gift, ArrowRight } from 'lucide-react';

interface LevelCompleteModalProps {
  level: Level;
  rewardItem?: ShopItem;
  language: Language;
  soundEnabled: boolean;
  onClose: () => void;
  onNextLevel?: () => void;
  hasAlreadyClaimedChest: boolean;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  rewardItem,
  language,
  soundEnabled,
  onClose,
  onNextLevel,
  hasAlreadyClaimedChest
}) => {
  const t = translations[language];

  useEffect(() => {
    soundManager.playFanfare(soundEnabled);
    try {
      // Fire double confetti volley
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FBBF24']
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    } catch {
      // Confetti fallback
    }
  }, [soundEnabled]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 text-center items-center">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Big Animated Treasure Chest Illustration */}
        <div className="relative w-36 h-36 my-2 animate-bounce">
          <img
            src="/src/assets/images/treasure_chest_gold_1793243135293.jpg"
            alt="Golden Treasure Chest"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-2xl drop-shadow-2xl"
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-black text-amber-300">
            {t.chestRewardTitle}
          </h2>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        <p className="text-sm font-semibold text-slate-200 mt-1">
          {level.title[language]}
        </p>

        <p className="text-xs text-slate-300 mt-2 max-w-sm">
          {t.chestBonusMsg}
        </p>

        {/* Rewards Box */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950/70 border border-amber-500/40 flex flex-col items-center gap-2">
          {/* Bonus Points */}
          <div className="flex items-center gap-2 text-base font-extrabold text-amber-400">
            <Gift className="w-5 h-5" />
            <span>+{level.rewardChestBonus} {t.pointsReward}</span>
          </div>

          {/* Bonus Cosmetic Item if defined and not already owned */}
          {rewardItem && (
            <div className="text-xs text-emerald-300 mt-1 font-semibold flex items-center gap-1.5">
              <span>🎁 {t.ownedLabel}:</span>
              <span className="font-bold underline text-white">
                {rewardItem.name[language]}
              </span>
            </div>
          )}

          {hasAlreadyClaimedChest && (
            <p className="text-[11px] text-slate-400 mt-1">
              ({t.practiceModeNote})
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow cursor-pointer transition-all"
          >
            {t.continueAdventure}
          </button>

          {onNextLevel && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick(soundEnabled);
                onNextLevel();
              }}
              className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t.nextLevelBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
