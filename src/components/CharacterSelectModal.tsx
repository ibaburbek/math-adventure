/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Character, Language } from '../types/game';
import { translations } from '../i18n/translations';
import { CharacterAvatar } from './CharacterAvatar';
import { soundManager } from '../utils/sound';
import { Sparkles, Check, Lock, ChevronRight } from 'lucide-react';

interface CharacterSelectModalProps {
  characters: Character[];
  unlockedCharacterIds: string[];
  selectedCharacterId: string;
  language: Language;
  soundEnabled: boolean;
  onSelectCharacter: (characterId: string) => void;
  onConfirm: () => void;
  isFirstLaunch?: boolean;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  characters,
  unlockedCharacterIds,
  selectedCharacterId,
  language,
  soundEnabled,
  onSelectCharacter,
  onConfirm,
  isFirstLaunch = false
}) => {
  const t = translations[language];
  const [currentChoice, setCurrentChoice] = useState(selectedCharacterId);

  const selectedCharObj = characters.find(c => c.id === currentChoice) || characters[0];
  const isCurrentChoiceUnlocked = unlockedCharacterIds.includes(currentChoice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-950/70 border-b border-emerald-800/40 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100">{t.welcomeTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {t.welcomeDesc}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Spotlight Selected Hero Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-800/60 to-emerald-950/60 border border-emerald-500/40 flex flex-col sm:flex-row items-center gap-5">
            <CharacterAvatar
              avatarId={selectedCharObj.avatarId}
              size="xl"
              points={0}
              isAnimated={true}
            />

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-bold text-slate-100">
                  {selectedCharObj.name[language]}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold">
                  {isCurrentChoiceUnlocked ? t.freeHero : `${selectedCharObj.cost} ${t.costPoints}`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {selectedCharObj.description[language]}
              </p>
            </div>
          </div>

          {/* Character Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {t.chooseCharacter}:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {characters.map(char => {
                const isUnlocked = unlockedCharacterIds.includes(char.id);
                const isSelected = char.id === currentChoice;

                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => {
                      if (isUnlocked) {
                        soundManager.playClick(soundEnabled);
                        setCurrentChoice(char.id);
                        onSelectCharacter(char.id);
                      }
                    }}
                    className={`relative p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400/50 scale-102'
                        : isUnlocked
                        ? 'bg-slate-800/70 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                        : 'bg-slate-900/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative my-1">
                      <CharacterAvatar avatarId={char.avatarId} size="md" points={0} />
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 rounded-full">
                          <Lock className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-200 mt-1 line-clamp-1">
                      {char.name[language]}
                    </span>

                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {isUnlocked ? t.freeHero : `${char.cost} ${t.costPoints}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/70 border-t border-emerald-800/40 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (isCurrentChoiceUnlocked) {
                soundManager.playCorrect(soundEnabled);
                onConfirm();
              }
            }}
            disabled={!isCurrentChoiceUnlocked}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/30 cursor-pointer transition-all flex items-center gap-2"
          >
            <span>{t.selectHero}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
