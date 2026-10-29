/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterAnimationState } from '../types/game';

interface CharacterAvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  equippedHat?: string;
  equippedClothing?: string;
  equippedAccessory?: string;
  points?: number;
  animationState?: CharacterAnimationState;
  isAnimated?: boolean;
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  avatarId,
  size = 'md',
  equippedHat,
  equippedClothing,
  equippedAccessory,
  points = 0,
  animationState = 'idle',
  isAnimated = false,
  className = ''
}) => {
  // Dimensions map
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    '2xl': 'w-48 h-48'
  };

  // Progression tier:
  // Tier 1: 0 - 49 pts (Apprentice)
  // Tier 2: 50 - 149 pts (Guardian)
  // Tier 3: 150+ pts (Master)
  const isTier2 = points >= 50 && points < 150;
  const isTier3 = points >= 150;

  // Determine CSS animation class based on animationState
  let animClass = 'animate-character-idle';
  if (animationState === 'celebrating') animClass = 'animate-character-celebrate';
  else if (animationState === 'thinking') animClass = 'animate-character-think';
  else if (animationState === 'oops') animClass = 'animate-character-oops';
  else if (animationState === 'jumping') animClass = 'animate-character-jump';
  else if (animationState === 'walking') animClass = 'animate-character-walk';

  // Eye and mouth expression helpers based on state
  const isHappy = animationState === 'celebrating' || animationState === 'jumping';
  const isThinking = animationState === 'thinking';
  const isOops = animationState === 'oops';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}
    >
      {/* Tier 3: Golden Sunburst Halo */}
      {isTier3 && (
        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-70 blur-md animate-pulse pointer-events-none" />
      )}

      {/* Tier 2: Shimmering Rune Circle */}
      {isTier2 && !isTier3 && (
        <div className="absolute -inset-2 rounded-full border border-emerald-400/60 border-dashed animate-spin-slow pointer-events-none opacity-80" />
      )}

      {/* Main Vector SVG */}
      <div className={`w-full h-full relative ${animClass}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 2.5D Shading Gradients */}
            <radialGradient id="grad-disc-bg" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#065F46" />
              <stop offset="70%" stopColor="#022C22" />
              <stop offset="100%" stopColor="#011710" />
            </radialGradient>

            <linearGradient id="grad-rim-light" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
            </linearGradient>

            <radialGradient id="skin-light" cx="45%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="70%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>

            <radialGradient id="skin-ayla" cx="45%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="70%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#F97316" />
            </radialGradient>

            <radialGradient id="gold-shimmer" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>

            <radialGradient id="fox-coat" cx="45%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="70%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#9A3412" />
            </radialGradient>

            <radialGradient id="dragon-scales" cx="45%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="70%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064E3B" />
            </radialGradient>

            <radialGradient id="bear-fur" cx="45%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="70%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </radialGradient>

            <radialGradient id="iris-glow" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0369A1" />
            </radialGradient>
          </defs>

          {/* Pedestal Disc with 2.5D Rim Light */}
          <circle cx="50" cy="50" r="46" fill="url(#grad-disc-bg)" stroke="url(#grad-rim-light)" strokeWidth="3" />
          <ellipse cx="50" cy="84" rx="24" ry="6" fill="#000000" opacity="0.35" />

          {/* 1. ALEN (Brave Explorer Boy) */}
          {avatarId === 'alen' && (
            <g id="char-alen">
              {/* Torso & Explorer Scarf */}
              <path d="M 30 76 Q 50 86 70 76 L 73 95 L 27 95 Z" fill="#047857" />
              <path d="M 32 76 Q 50 84 68 76 L 66 94 L 34 94 Z" fill="#065F46" opacity="0.5" />
              {/* Gold Buckle */}
              <rect x="46" y="86" width="8" height="6" rx="1.5" fill="url(#gold-shimmer)" />
              {/* Head with 2.5D dimensional shading */}
              <circle cx="50" cy="52" r="28" fill="url(#skin-light)" />
              <ellipse cx="50" cy="66" rx="16" ry="6" fill="#D97706" opacity="0.15" />
              {/* Cheeks */}
              <ellipse cx="34" cy="56" rx="4" ry="2.5" fill="#FB7185" opacity="0.6" />
              <ellipse cx="66" cy="56" rx="4" ry="2.5" fill="#FB7185" opacity="0.6" />
              {/* Hair strands with volume */}
              <path d="M 26 44 C 26 22 74 22 74 44 C 74 32 64 24 50 24 C 36 24 26 32 26 44 Z" fill="#78350F" />
              <path d="M 28 38 Q 40 28 50 34" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
              <path d="M 52 32 Q 62 26 70 38" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
              <path d="M 24 44 Q 28 36 38 38" stroke="#5E2305" strokeWidth="3" strokeLinecap="round" />

              {/* Eyes Expression */}
              {isHappy ? (
                // Happy arc eyes
                <>
                  <path d="M 38 48 Q 43 42 48 48" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M 52 48 Q 57 42 62 48" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
                </>
              ) : isThinking ? (
                // Thinking eyes glancing up
                <>
                  <ellipse cx="44" cy="45" rx="3.5" ry="4" fill="#1E293B" />
                  <ellipse cx="60" cy="45" rx="3.5" ry="4" fill="#1E293B" />
                  <circle cx="45" cy="43" r="1.3" fill="#FFFFFF" />
                  <circle cx="61" cy="43" r="1.3" fill="#FFFFFF" />
                  <path d="M 38 41 Q 43 38 48 41" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 53 43 Q 58 41 63 44" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
                </>
              ) : isOops ? (
                // Oops / sad cute eyes
                <>
                  <ellipse cx="43" cy="49" rx="3" ry="3.5" fill="#1E293B" />
                  <ellipse cx="57" cy="49" rx="3" ry="3.5" fill="#1E293B" />
                  <circle cx="44" cy="47.5" r="1.2" fill="#FFFFFF" />
                  <circle cx="58" cy="47.5" r="1.2" fill="#FFFFFF" />
                  {/* Sweatdrop */}
                  <path d="M 68 44 Q 71 40 73 44 Q 73 48 70 48 Q 67 48 68 44 Z" fill="#38BDF8" opacity="0.9" />
                </>
              ) : (
                // Confident, sparkling 2.5D eyes
                <>
                  <ellipse cx="42" cy="48" rx="4" ry="4.5" fill="#1E293B" />
                  <ellipse cx="58" cy="48" rx="4" ry="4.5" fill="#1E293B" />
                  <circle cx="41" cy="47" r="2" fill="#047857" />
                  <circle cx="57" cy="47" r="2" fill="#047857" />
                  <circle cx="43.5" cy="45.5" r="1.5" fill="#FFFFFF" />
                  <circle cx="59.5" cy="45.5" r="1.5" fill="#FFFFFF" />
                  <circle cx="40.5" cy="49" r="0.8" fill="#FFFFFF" />
                  <circle cx="56.5" cy="49" r="0.8" fill="#FFFFFF" />
                </>
              )}

              {/* Mouth */}
              {isHappy ? (
                <path d="M 42 57 Q 50 67 58 57 Z" fill="#BE123C" stroke="#881337" strokeWidth="1.5" />
              ) : isThinking ? (
                <ellipse cx="50" cy="60" rx="2" ry="2.5" fill="#9A3412" />
              ) : isOops ? (
                <path d="M 44 62 Q 50 58 56 62" stroke="#9A3412" strokeWidth="2.2" strokeLinecap="round" />
              ) : (
                <path d="M 44 58 Q 50 64 56 58" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
              )}

              {/* Gold Scarf */}
              <path d="M 33 70 Q 50 80 67 70 Q 50 83 33 70" fill="url(#gold-shimmer)" />
            </g>
          )}

          {/* 2. AYLA (Clever Girl Mage) */}
          {avatarId === 'ayla' && (
            <g id="char-ayla">
              {/* Torso & Robe */}
              <path d="M 28 76 Q 50 86 72 76 L 75 95 L 25 95 Z" fill="#6D28D9" />
              {/* Braids and Dimensional Hair */}
              <path d="M 22 52 C 22 22 78 22 78 52 C 78 30 64 22 50 22 C 36 22 22 30 22 52 Z" fill="#2E1065" />
              <path d="M 20 54 Q 14 74 24 88" stroke="#2E1065" strokeWidth="6" strokeLinecap="round" />
              <path d="M 80 54 Q 86 74 76 88" stroke="#2E1065" strokeWidth="6" strokeLinecap="round" />
              {/* Braid Ribbons */}
              <circle cx="23" cy="80" r="3" fill="#EC4899" />
              <circle cx="77" cy="80" r="3" fill="#EC4899" />
              {/* Head */}
              <circle cx="50" cy="52" r="28" fill="url(#skin-ayla)" />
              {/* Cheeks */}
              <circle cx="34" cy="56" r="3.5" fill="#F472B6" opacity="0.6" />
              <circle cx="66" cy="56" r="3.5" fill="#F472B6" opacity="0.6" />
              {/* Star on forehead */}
              <polygon points="50,30 51.5,33.5 55,34 52.5,36.5 53,40 50,38 47,40 47.5,36.5 45,34 48.5,33.5" fill="url(#gold-shimmer)" />

              {/* Eyes Expression */}
              {isHappy ? (
                <>
                  <path d="M 38 48 Q 43 42 48 48" stroke="#4C1D95" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M 52 48 Q 57 42 62 48" stroke="#4C1D95" strokeWidth="3" strokeLinecap="round" fill="none" />
                </>
              ) : isThinking ? (
                <>
                  <ellipse cx="44" cy="45" rx="4" ry="4.5" fill="#4C1D95" />
                  <ellipse cx="60" cy="45" rx="4" ry="4.5" fill="#4C1D95" />
                  <circle cx="45" cy="43" r="1.5" fill="#FFFFFF" />
                  <circle cx="61" cy="43" r="1.5" fill="#FFFFFF" />
                </>
              ) : isOops ? (
                <>
                  <ellipse cx="43" cy="49" rx="3.5" ry="4" fill="#4C1D95" />
                  <ellipse cx="57" cy="49" rx="3.5" ry="4" fill="#4C1D95" />
                  <circle cx="44" cy="47.5" r="1.2" fill="#FFFFFF" />
                  <circle cx="58" cy="47.5" r="1.2" fill="#FFFFFF" />
                  <path d="M 68 44 Q 71 40 73 44 Q 73 48 70 48 Q 67 48 68 44 Z" fill="#C084FC" opacity="0.9" />
                </>
              ) : (
                <>
                  <ellipse cx="41" cy="48" rx="4.5" ry="5" fill="#4C1D95" />
                  <ellipse cx="59" cy="48" rx="4.5" ry="5" fill="#4C1D95" />
                  <circle cx="41" cy="48" r="2.5" fill="#A855F7" />
                  <circle cx="59" cy="48" r="2.5" fill="#A855F7" />
                  <circle cx="42.5" cy="46" r="1.5" fill="#FFFFFF" />
                  <circle cx="60.5" cy="46" r="1.5" fill="#FFFFFF" />
                  <circle cx="39.5" cy="49.5" r="0.8" fill="#FFFFFF" />
                  <circle cx="57.5" cy="49.5" r="0.8" fill="#FFFFFF" />
                </>
              )}

              {/* Mouth */}
              {isHappy ? (
                <path d="M 43 57 Q 50 67 57 57 Z" fill="#BE123C" stroke="#881337" strokeWidth="1.5" />
              ) : isThinking ? (
                <ellipse cx="50" cy="60" rx="2" ry="2.5" fill="#831843" />
              ) : isOops ? (
                <path d="M 44 62 Q 50 58 56 62" stroke="#831843" strokeWidth="2.2" strokeLinecap="round" />
              ) : (
                <path d="M 44 58 Q 50 64 56 58" stroke="#831843" strokeWidth="2.4" strokeLinecap="round" />
              )}
            </g>
          )}

          {/* 3. BARSHYN (Snow Leopard) */}
          {avatarId === 'barshyn' && (
            <g id="char-barshyn">
              {/* Ears */}
              <polygon points="20,38 27,16 42,28" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
              <polygon points="25,34 29,20 38,28" fill="#FDA4AF" />
              <polygon points="80,38 73,16 58,28" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
              <polygon points="75,34 71,20 62,28" fill="#FDA4AF" />
              {/* Head with volume */}
              <circle cx="50" cy="54" r="30" fill="#F8FAFC" />
              <ellipse cx="50" cy="56" rx="28" ry="26" fill="#F1F5F9" />
              {/* Leopard Spots */}
              <circle cx="32" cy="38" r="3" fill="#64748B" />
              <circle cx="68" cy="38" r="3" fill="#64748B" />
              <circle cx="50" cy="32" r="2.5" fill="#64748B" />
              <circle cx="26" cy="55" r="3" fill="#64748B" />
              <circle cx="74" cy="55" r="3" fill="#64748B" />
              {/* Turquoise Eyes */}
              <ellipse cx="39" cy="50" rx="5" ry="6" fill="#06B6D4" />
              <ellipse cx="61" cy="50" rx="5" ry="6" fill="#06B6D4" />
              <ellipse cx="39" cy="50" rx="2.5" ry="4.5" fill="#082F49" />
              <ellipse cx="61" cy="50" rx="2.5" ry="4.5" fill="#082F49" />
              <circle cx="37.5" cy="48" r="1.8" fill="#FFFFFF" />
              <circle cx="59.5" cy="48" r="1.8" fill="#FFFFFF" />
              {/* Nose & Whiskers */}
              <polygon points="50,59 45,54 55,54" fill="#FB7185" />
              <path d="M 50 59 L 50 64 Q 44 68 40 65 M 50 64 Q 56 68 60 65" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              <line x1="18" y1="62" x2="35" y2="63" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="20" y1="67" x2="36" y2="66" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="82" y1="62" x2="65" y2="63" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="80" y1="67" x2="64" y2="66" stroke="#94A3B8" strokeWidth="1.5" />
            </g>
          )}

          {/* 4. TULKI (Clever Red Fox) */}
          {avatarId === 'tulki' && (
            <g id="char-tulki">
              {/* Big fluffy ears */}
              <polygon points="16,42 24,12 42,28" fill="#EA580C" />
              <polygon points="21,36 26,18 36,28" fill="#1E293B" />
              <polygon points="84,42 76,12 58,28" fill="#EA580C" />
              <polygon points="79,36 74,18 64,28" fill="#1E293B" />
              {/* Fox Face base */}
              <path d="M 18 48 Q 50 28 82 48 Q 86 74 50 84 Q 14 74 18 48 Z" fill="url(#fox-coat)" />
              {/* White muzzle cheeks */}
              <path d="M 18 48 Q 36 68 50 84 Q 64 68 82 48 Q 66 54 50 56 Q 34 54 18 48 Z" fill="#FFFBEB" />
              {/* Fox Amber Eyes */}
              <ellipse cx="37" cy="47" rx="4.5" ry="4" fill="#78350F" />
              <ellipse cx="63" cy="47" rx="4.5" ry="4" fill="#78350F" />
              <circle cx="37" cy="47" r="2.2" fill="#F59E0B" />
              <circle cx="63" cy="47" r="2.2" fill="#F59E0B" />
              <circle cx="38.5" cy="45.5" r="1.4" fill="#FFFFFF" />
              <circle cx="64.5" cy="45.5" r="1.4" fill="#FFFFFF" />
              {/* Nose */}
              <ellipse cx="50" cy="80" rx="4.5" ry="3.5" fill="#0F172A" />
              {/* Whiskers */}
              <line x1="14" y1="64" x2="33" y2="65" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="86" y1="64" x2="67" y2="65" stroke="#CBD5E1" strokeWidth="1.5" />
            </g>
          )}

          {/* 5. SAMRUK (Golden Phoenix) */}
          {avatarId === 'samruk' && (
            <g id="char-samruk">
              {/* Crest Feathers with Golden Light */}
              <path d="M 50 10 Q 42 22 50 32" stroke="#FDE047" strokeWidth="5" strokeLinecap="round" />
              <path d="M 57 12 Q 52 24 53 32" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
              <path d="M 43 12 Q 48 24 47 32" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
              {/* Body */}
              <circle cx="50" cy="52" r="28" fill="url(#gold-shimmer)" />
              {/* Golden Wings with Feathers */}
              <path d="M 22 52 Q 6 38 10 72 Q 22 68 26 60 Z" fill="#F59E0B" />
              <path d="M 78 52 Q 94 38 90 72 Q 78 68 74 60 Z" fill="#F59E0B" />
              {/* Majestic Eyes */}
              <circle cx="39" cy="46" r="5" fill="#7C2D12" />
              <circle cx="61" cy="46" r="5" fill="#7C2D12" />
              <circle cx="39" cy="46" r="2.8" fill="#FDE047" />
              <circle cx="61" cy="46" r="2.8" fill="#FDE047" />
              <circle cx="41" cy="44.5" r="1.6" fill="#FFFFFF" />
              <circle cx="63" cy="44.5" r="1.6" fill="#FFFFFF" />
              {/* Beak */}
              <polygon points="45,54 55,54 50,66" fill="#EA580C" stroke="#7C2D12" strokeWidth="1.2" />
              {/* Sun Radiance Halo */}
              <circle cx="50" cy="52" r="32" stroke="#FEF08A" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />
            </g>
          )}

          {/* 6. TULPAR (Winged Pegasus) */}
          {avatarId === 'tulpar' && (
            <g id="char-tulpar">
              {/* Wing Feathers */}
              <path d="M 20 42 Q 4 18 12 64 Q 22 56 25 48 Z" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
              <path d="M 80 42 Q 96 18 88 64 Q 78 56 75 48 Z" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
              {/* Steed Face */}
              <path d="M 33 30 Q 50 20 67 30 L 63 68 Q 50 80 37 68 Z" fill="#FFFFFF" />
              {/* Cyan Mane */}
              <path d="M 50 18 Q 58 34 50 48" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" />
              {/* Ears */}
              <polygon points="33,28 37,16 43,26" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              <polygon points="67,28 63,16 57,26" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              {/* Eyes */}
              <circle cx="41" cy="44" r="4" fill="#0284C7" />
              <circle cx="59" cy="44" r="4" fill="#0284C7" />
              <circle cx="42" cy="43" r="1.5" fill="#FFFFFF" />
              <circle cx="60" cy="43" r="1.5" fill="#FFFFFF" />
              {/* Muzzle */}
              <ellipse cx="50" cy="70" rx="8" ry="6" fill="#F1F5F9" />
              <circle cx="47" cy="70" r="1.5" fill="#64748B" />
              <circle cx="53" cy="70" r="1.5" fill="#64748B" />
            </g>
          )}

          {/* 7. AYU (Guardian Brown Bear) */}
          {avatarId === 'ayu' && (
            <g id="char-ayu">
              {/* Round Ears */}
              <circle cx="26" cy="28" r="11" fill="url(#bear-fur)" />
              <circle cx="26" cy="28" r="6" fill="#FCD34D" opacity="0.6" />
              <circle cx="74" cy="28" r="11" fill="url(#bear-fur)" />
              <circle cx="74" cy="28" r="6" fill="#FCD34D" opacity="0.6" />
              {/* Big Head */}
              <circle cx="50" cy="54" r="31" fill="url(#bear-fur)" />
              {/* Honey Muzzle */}
              <ellipse cx="50" cy="63" rx="15" ry="12" fill="#FDE68A" />
              {/* Nose */}
              <ellipse cx="50" cy="58" rx="6" ry="4" fill="#451A03" />
              {/* Mouth */}
              <path d="M 50 62 L 50 67 Q 44 71 40 68 M 50 67 Q 56 71 60 68" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
              {/* Kind Eyes */}
              <circle cx="38" cy="47" r="4" fill="#451A03" />
              <circle cx="62" cy="47" r="4" fill="#451A03" />
              <circle cx="39.5" cy="45.5" r="1.5" fill="#FFFFFF" />
              <circle cx="63.5" cy="45.5" r="1.5" fill="#FFFFFF" />
              {/* Cheeks */}
              <circle cx="30" cy="56" r="3.5" fill="#F87171" opacity="0.5" />
              <circle cx="70" cy="56" r="3.5" fill="#F87171" opacity="0.5" />
            </g>
          )}

          {/* 8. AYDAHAR (Emerald Forest Dragon) */}
          {avatarId === 'aydahar' && (
            <g id="char-aydahar">
              {/* Golden Horns */}
              <path d="M 30 30 Q 18 16 14 10 Q 26 18 34 26" fill="url(#gold-shimmer)" />
              <path d="M 70 30 Q 82 16 86 10 Q 74 18 66 26" fill="url(#gold-shimmer)" />
              {/* Head with Emerald Scales */}
              <circle cx="50" cy="52" r="29" fill="url(#dragon-scales)" />
              {/* Dragon Wings */}
              <path d="M 20 54 Q 6 42 10 72 Q 22 66 26 60 Z" fill="#047857" />
              <path d="M 80 54 Q 94 42 90 72 Q 78 66 74 60 Z" fill="#047857" />
              {/* Belly Plates */}
              <ellipse cx="50" cy="74" rx="14" ry="12" fill="#A7F3D0" />
              {/* Big Golden Dragon Eyes */}
              <ellipse cx="37" cy="45" rx="5.5" ry="6.5" fill="#FBBF24" />
              <ellipse cx="63" cy="45" rx="5.5" ry="6.5" fill="#FBBF24" />
              <ellipse cx="37" cy="45" rx="2" ry="5" fill="#064E3B" />
              <ellipse cx="63" cy="45" rx="2" ry="5" fill="#064E3B" />
              <circle cx="35" cy="43" r="1.8" fill="#FFFFFF" />
              <circle cx="61" cy="43" r="1.8" fill="#FFFFFF" />
              {/* Cute Snout Nostrils */}
              <circle cx="47" cy="58" r="1.5" fill="#064E3B" />
              <circle cx="53" cy="58" r="1.5" fill="#064E3B" />
              <path d="M 44 63 Q 50 67 56 63" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* CLOTHING LAYER */}
          {equippedClothing === 'cloth_cloak_green' && (
            <g id="equip-cloak-green">
              <path d="M 23 75 Q 50 86 77 75 L 81 96 L 19 96 Z" fill="#059669" />
              <circle cx="50" cy="76" r="4.5" fill="url(#gold-shimmer)" />
            </g>
          )}
          {equippedClothing === 'cloth_robe_star' && (
            <g id="equip-robe-star">
              <path d="M 21 73 Q 50 88 79 73 L 85 96 L 15 96 Z" fill="#4338CA" />
              <circle cx="35" cy="85" r="1.8" fill="#FDE047" />
              <circle cx="65" cy="85" r="1.8" fill="#FDE047" />
              <circle cx="50" cy="90" r="1.5" fill="#FDE047" />
            </g>
          )}
          {equippedClothing === 'cloth_tunic_gold' && (
            <g id="equip-tunic-gold">
              <path d="M 25 75 Q 50 85 75 75 L 79 96 L 21 96 Z" fill="url(#gold-shimmer)" />
              <path d="M 45 75 L 45 96 M 55 75 L 55 96" stroke="#FEF08A" strokeWidth="2" />
            </g>
          )}

          {/* HAT LAYER */}
          {equippedHat === 'hat_wizard' && (
            <g id="equip-hat-wizard">
              <polygon points="50,2 24,30 76,30" fill="#7C3AED" />
              <ellipse cx="50" cy="30" rx="30" ry="7" fill="#6D28D9" />
              <ellipse cx="50" cy="27" rx="16" ry="3.5" fill="url(#gold-shimmer)" />
              <polygon points="46,14 47,17 50,17 48,19 49,22 46,20 44,22 45,19 43,17 46,17" fill="#FEF08A" />
            </g>
          )}
          {equippedHat === 'hat_crown' && (
            <g id="equip-hat-crown">
              <polygon points="26,28 33,12 50,20 67,12 74,28" fill="url(#gold-shimmer)" stroke="#B45309" strokeWidth="1.5" />
              <circle cx="33" cy="12" r="2.5" fill="#EF4444" />
              <circle cx="50" cy="20" r="3" fill="#3B82F6" />
              <circle cx="67" cy="12" r="2.5" fill="#10B981" />
            </g>
          )}
          {equippedHat === 'hat_explorer' && (
            <g id="equip-hat-explorer">
              <path d="M 28 26 C 28 12 72 12 72 26 Z" fill="#B45309" />
              <ellipse cx="50" cy="26" rx="28" ry="6" fill="#92400E" />
              <path d="M 64 26 Q 74 8 76 4" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}
          {equippedHat === 'hat_flower' && (
            <g id="equip-hat-flower">
              <circle cx="34" cy="24" r="4.5" fill="#F472B6" />
              <circle cx="34" cy="24" r="1.8" fill="#FDE047" />
              <circle cx="50" cy="20" r="5.5" fill="#FB7185" />
              <circle cx="50" cy="20" r="2.2" fill="#FDE047" />
              <circle cx="66" cy="24" r="4.5" fill="#F472B6" />
              <circle cx="66" cy="24" r="1.8" fill="#FDE047" />
              <path d="M 30 26 Q 50 18 70 26" stroke="#22C55E" strokeWidth="3" fill="none" />
            </g>
          )}

          {/* ACCESSORY LAYER */}
          {equippedAccessory === 'acc_magic_wand' && (
            <g id="equip-wand">
              <line x1="72" y1="78" x2="89" y2="38" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="89,32 84,39 89,44 94,39" fill="#22D3EE" stroke="#0891B2" strokeWidth="1" />
              <circle cx="89" cy="32" r="4" fill="#67E8F9" opacity="0.8" className="animate-pulse" />
            </g>
          )}
          {equippedAccessory === 'acc_golden_ruler' && (
            <g id="equip-ruler">
              <rect x="74" y="42" width="9" height="36" transform="rotate(-20 74 42)" fill="url(#gold-shimmer)" stroke="#92400E" strokeWidth="1.2" rx="2" />
              <line x1="77" y1="48" x2="82" y2="46" stroke="#92400E" strokeWidth="1" />
              <line x1="80" y1="56" x2="85" y2="54" stroke="#92400E" strokeWidth="1" />
              <line x1="83" y1="64" x2="88" y2="62" stroke="#92400E" strokeWidth="1" />
            </g>
          )}
          {equippedAccessory === 'acc_star_glasses' && (
            <g id="equip-glasses">
              <polygon points="41,45 42,47 45,47 43,49 44,52 41,50 38,52 39,49 37,47 40,47" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" opacity="0.9" />
              <polygon points="59,45 60,47 63,47 61,49 62,52 59,50 56,52 57,49 55,47 58,47" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" opacity="0.9" />
              <line x1="45" y1="47" x2="55" y2="47" stroke="#CA8A04" strokeWidth="1.5" />
            </g>
          )}
          {equippedAccessory === 'acc_lantern' && (
            <g id="equip-lantern">
              <rect x="75" y="55" width="13" height="19" rx="2.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
              <circle cx="81.5" cy="64.5" r="4" fill="#FEF08A" className="animate-pulse" />
              <path d="M 81.5 55 L 81.5 47" stroke="#78350F" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Progression Rank Badge */}
        {isTier3 && (
          <span
            title="Master of Mathematics"
            className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-yellow-100 shadow-lg"
          >
            ★
          </span>
        )}
        {isTier2 && !isTier3 && (
          <span
            title="Forest Guardian"
            className="absolute -bottom-1 -right-1 bg-emerald-500 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border border-emerald-200 shadow"
          >
            ✦
          </span>
        )}
      </div>
    </div>
  );
};
