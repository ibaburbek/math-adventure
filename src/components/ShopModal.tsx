/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Character, ShopItem, StudentProgress, Language } from '../types/game';
import { translations } from '../i18n/translations';
import { CharacterAvatar } from './CharacterAvatar';
import { soundManager } from '../utils/sound';
import {
  X,
  Sparkles,
  ShoppingBag,
  Check,
  Crown,
  Shirt,
  Shield,
  Coins,
  Smile
} from 'lucide-react';

interface ShopModalProps {
  characters: Character[];
  shopItems: ShopItem[];
  progress: StudentProgress;
  language: Language;
  soundEnabled: boolean;
  onClose: () => void;
  onBuyItem: (item: ShopItem) => void;
  onBuyCharacter: (character: Character) => void;
  onEquipItem: (category: 'hat' | 'clothing' | 'accessory', itemId?: string) => void;
  onSelectCharacter: (characterId: string) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  characters,
  shopItems,
  progress,
  language,
  soundEnabled,
  onClose,
  onBuyItem,
  onBuyCharacter,
  onEquipItem,
  onSelectCharacter
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'characters' | 'hat' | 'clothing' | 'accessory'>('characters');

  const ownedItemsSet = new Set(progress.ownedItems);
  const unlockedCharsSet = new Set(progress.unlockedCharacters);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Title and Coin Counter */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/70 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t.shopTitle}</h2>
              <p className="text-xs text-slate-400">{t.shopDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Point Counter Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-sm font-extrabold text-amber-300 tabular-nums">
                {progress.points} {t.pointsLabel}
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
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(soundEnabled);
              setActiveTab('characters');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'characters'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>{t.tabCharacters}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick(soundEnabled);
              setActiveTab('hat');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'hat'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>{t.tabHats}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick(soundEnabled);
              setActiveTab('clothing');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'clothing'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>{t.tabClothing}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick(soundEnabled);
              setActiveTab('accessory');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'accessory'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{t.tabAccessories}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* CHARACTERS TAB */}
          {activeTab === 'characters' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {characters.map(character => {
                const isUnlocked = unlockedCharsSet.has(character.id);
                const isSelected = progress.selectedCharacterId === character.id;
                const canAfford = progress.points >= character.cost;

                return (
                  <div
                    key={character.id}
                    className={`relative rounded-2xl p-4 border flex flex-col justify-between transition-all duration-200 ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-900/30'
                        : isUnlocked
                        ? 'bg-slate-800/60 border-slate-700/60'
                        : 'bg-slate-900/40 border-slate-800 opacity-90'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative my-2">
                        <CharacterAvatar
                          avatarId={character.avatarId}
                          size="lg"
                          points={progress.points}
                          isAnimated={true}
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow">
                            ✓ {t.equippedLabel}
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-slate-100 mt-1">
                        {character.name[language]}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {character.description[language]}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/40">
                      {isUnlocked ? (
                        isSelected ? (
                          <div className="py-2 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                            <Check className="w-4 h-4" />
                            <span>{t.equippedLabel}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playClick(soundEnabled);
                              onSelectCharacter(character.id);
                            }}
                            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer transition-all"
                          >
                            {t.equipBtn}
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (canAfford) {
                              soundManager.playBuy(soundEnabled);
                              onBuyCharacter(character);
                            }
                          }}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>
                            {t.buyBtn} ({character.cost} {t.pointsLabel})
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* EQUIPMENT TABS (Hats, Clothing, Accessories) */}
          {activeTab !== 'characters' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {shopItems
                .filter(item => item.category === activeTab)
                .map(item => {
                  const isOwned = ownedItemsSet.has(item.id);
                  const isEquipped =
                    (item.category === 'hat' && progress.equippedHat === item.id) ||
                    (item.category === 'clothing' && progress.equippedClothing === item.id) ||
                    (item.category === 'accessory' && progress.equippedAccessory === item.id);
                  const canAfford = progress.points >= item.cost;

                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-2xl p-4 border flex flex-col justify-between transition-all duration-200 ${
                        isEquipped
                          ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-900/30'
                          : isOwned
                          ? 'bg-slate-800/60 border-slate-700/60'
                          : 'bg-slate-900/40 border-slate-800 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        {/* Live Avatar Preview showing this item on the student's character */}
                        <div className="relative my-2">
                          <CharacterAvatar
                            avatarId={progress.selectedCharacterId}
                            size="md"
                            equippedHat={item.category === 'hat' ? item.id : progress.equippedHat}
                            equippedClothing={
                              item.category === 'clothing' ? item.id : progress.equippedClothing
                            }
                            equippedAccessory={
                              item.category === 'accessory' ? item.id : progress.equippedAccessory
                            }
                            points={progress.points}
                          />
                          {isEquipped && (
                            <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow">
                              ✓ {t.equippedLabel}
                            </div>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-slate-100 mt-1">
                          {item.name[language]}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {item.description[language]}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/40">
                        {isOwned ? (
                          isEquipped ? (
                            <button
                              type="button"
                              onClick={() => {
                                soundManager.playClick(soundEnabled);
                                onEquipItem(item.category, undefined);
                              }}
                              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/40 shadow cursor-pointer transition-all"
                            >
                              {t.unequipBtn}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                soundManager.playClick(soundEnabled);
                                onEquipItem(item.category, item.id);
                              }}
                              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer transition-all"
                            >
                              {t.equipBtn}
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (canAfford) {
                                soundManager.playBuy(soundEnabled);
                                onBuyItem(item);
                              }
                            }}
                            disabled={!canAfford}
                            className={`w-full py-2 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>
                              {t.buyBtn} ({item.cost} {t.pointsLabel})
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
