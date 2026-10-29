/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorldTheme, LocalizedString } from '../types/game';

export interface WorldConfig {
  id: WorldTheme;
  name: LocalizedString;
  description: LocalizedString;
  bgImage: string;
  fallbackGradient: string;
  ambientGlow: string;
  pathUnderbedColor: string;
  pathBorderColor: string;
  pathCoreColor: string;
  pathDashArray: string;
  magicTrailGlow: string;
  activeNodeRing: string;
  completedNodeBg: string;
  landmarkBadges: { kk: string; ru: string }[];
  coordinates: { x: number; y: number }[];
}

export const WORLD_THEMES: Record<WorldTheme, WorldConfig> = {
  forest: {
    id: 'forest',
    name: { kk: 'Сиқырлы орман', ru: 'Волшебный лес' },
    description: {
      kk: 'Жасыл желектер мен саңырауқұлақ шамдары бар ертегі соқпағы.',
      ru: 'Сказочная тропа среди цветущих деревьев и грибных фонариков.'
    },
    bgImage: '/src/assets/images/magical_forest_banner_1793243134237.jpg',
    fallbackGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    ambientGlow: 'from-emerald-500/20 via-transparent to-slate-950/80',
    pathUnderbedColor: '#022C22',
    pathBorderColor: '#064E3B',
    pathCoreColor: '#D97706',
    pathDashArray: '16 12',
    magicTrailGlow: '#FDE047',
    activeNodeRing: 'ring-yellow-400/60 shadow-amber-500/50',
    completedNodeBg: 'from-emerald-600 to-teal-400',
    landmarkBadges: [
      { kk: '🍄 Шампиньон алаңы', ru: '🍄 Грибная поляна' },
      { kk: '🌉 Ағаш көпір', ru: '🌉 Деревянный мост' },
      { kk: '🌊 Сыбдыр өзен', ru: '🌊 Журчащий ручей' }
    ],
    // Classic S-curve winding trail
    coordinates: [
      { x: 14, y: 82 },
      { x: 34, y: 76 },
      { x: 56, y: 78 },
      { x: 80, y: 68 },
      { x: 74, y: 48 },
      { x: 50, y: 44 },
      { x: 26, y: 46 },
      { x: 18, y: 26 },
      { x: 44, y: 20 },
      { x: 72, y: 18 }
    ]
  },

  crystal_caves: {
    id: 'crystal_caves',
    name: { kk: 'Кристалл үңгірлері', ru: 'Кристальные пещеры' },
    description: {
      kk: 'Жарқыраған аметисттер мен жер асты көлдерінің құпия әлемі.',
      ru: 'Таинственный подземный мир с сияющими кристаллами и лазурными озёрами.'
    },
    bgImage: '/src/assets/images/world_crystal_caves_1793244634568.jpg',
    fallbackGradient: 'from-purple-950 via-indigo-950 to-slate-950',
    ambientGlow: 'from-purple-500/25 via-cyan-500/10 to-slate-950/80',
    pathUnderbedColor: '#1E1B4B',
    pathBorderColor: '#312E81',
    pathCoreColor: '#818CF8',
    pathDashArray: '12 14',
    magicTrailGlow: '#38BDF8',
    activeNodeRing: 'ring-cyan-400/70 shadow-cyan-500/50',
    completedNodeBg: 'from-indigo-600 to-purple-500',
    landmarkBadges: [
      { kk: '💎 Аметист баспалдағы', ru: '💎 Аметистовые ступени' },
      { kk: '💧 Терең жер көлі', ru: '💧 Подземное озеро' },
      { kk: '✨ Кристалл аркасы', ru: '✨ Хрустальная арка' }
    ],
    // Descending cave tunnel zig-zag
    coordinates: [
      { x: 16, y: 80 },
      { x: 36, y: 82 },
      { x: 62, y: 74 },
      { x: 82, y: 62 },
      { x: 66, y: 52 },
      { x: 40, y: 54 },
      { x: 22, y: 42 },
      { x: 38, y: 30 },
      { x: 62, y: 26 },
      { x: 80, y: 20 }
    ]
  },

  ice_kingdom: {
    id: 'ice_kingdom',
    name: { kk: 'Мұз патшалығы', ru: 'Ледяное королевство' },
    description: {
      kk: 'Полярлық шұғыла мен мұзды қамал үстіндегі сынақ соқпағы.',
      ru: 'Тропа над замёрзшей рекой под сиянием северной авроры.'
    },
    bgImage: '/src/assets/images/world_ice_kingdom_1793244635424.jpg',
    fallbackGradient: 'from-sky-950 via-cyan-950 to-slate-950',
    ambientGlow: 'from-cyan-400/20 via-sky-500/10 to-slate-950/80',
    pathUnderbedColor: '#082F49',
    pathBorderColor: '#0C4A6E',
    pathCoreColor: '#38BDF8',
    pathDashArray: '20 10',
    magicTrailGlow: '#E0F2FE',
    activeNodeRing: 'ring-sky-300/80 shadow-sky-400/50',
    completedNodeBg: 'from-cyan-600 to-blue-500',
    landmarkBadges: [
      { kk: '❄️ Мұзды көпір', ru: '❄️ Ледяной виадук' },
      { kk: '🌌 Аврора шыңы', ru: '🌌 Пик Авроры' },
      { kk: '🏰 Мұз қамалы', ru: '🏰 Замок Ветров' }
    ],
    // Glacial bridge ascent
    coordinates: [
      { x: 18, y: 84 },
      { x: 28, y: 70 },
      { x: 46, y: 74 },
      { x: 72, y: 80 },
      { x: 84, y: 62 },
      { x: 64, y: 50 },
      { x: 38, y: 46 },
      { x: 20, y: 34 },
      { x: 42, y: 22 },
      { x: 68, y: 18 }
    ]
  },

  desert: {
    id: 'desert',
    name: { kk: 'Құмды шөл шытырманы', ru: 'Песчаное приключение' },
    description: {
      kk: 'Алтын құмдар, көне жазбалар және құпия оазистер жолы.',
      ru: 'Дюны, древние храмы с сияющими рунами и скрытые оазисы.'
    },
    bgImage: '/src/assets/images/world_desert_ruins_1793244635397.jpg',
    fallbackGradient: 'from-amber-950 via-orange-950 to-slate-950',
    ambientGlow: 'from-amber-500/25 via-orange-500/10 to-slate-950/80',
    pathUnderbedColor: '#451A03',
    pathBorderColor: '#78350F',
    pathCoreColor: '#F59E0B',
    pathDashArray: '14 10',
    magicTrailGlow: '#FEF08A',
    activeNodeRing: 'ring-amber-400/70 shadow-amber-500/50',
    completedNodeBg: 'from-amber-600 to-yellow-500',
    landmarkBadges: [
      { kk: '🌴 Сиқырлы Оазис', ru: '🌴 Оазис Мудрецов' },
      { kk: '🏛️ Көне Руна қақпасы', ru: '🏛️ Рунные врата' },
      { kk: '⏳ Алтын мұнара', ru: '⏳ Золотой обелиск' }
    ],
    // Serpentine desert dune track
    coordinates: [
      { x: 15, y: 80 },
      { x: 32, y: 82 },
      { x: 50, y: 72 },
      { x: 76, y: 74 },
      { x: 82, y: 52 },
      { x: 60, y: 46 },
      { x: 34, y: 48 },
      { x: 22, y: 32 },
      { x: 48, y: 24 },
      { x: 76, y: 20 }
    ]
  },

  sky_islands: {
    id: 'sky_islands',
    name: { kk: 'Аспан аралдары', ru: 'Небесные острова' },
    description: {
      kk: 'Бұлттар арасында қалқыған жасыл аралдар мен арқанды көпірлер.',
      ru: 'Парящие в небесах изумрудные острова и подвесные канатные мосты.'
    },
    bgImage: '/src/assets/images/world_sky_islands_1793244636181.jpg',
    fallbackGradient: 'from-blue-950 via-teal-950 to-slate-950',
    ambientGlow: 'from-sky-400/25 via-teal-400/15 to-slate-950/80',
    pathUnderbedColor: '#082F49',
    pathBorderColor: '#075985',
    pathCoreColor: '#22D3EE',
    pathDashArray: '18 12',
    magicTrailGlow: '#67E8F9',
    activeNodeRing: 'ring-teal-400/70 shadow-cyan-500/50',
    completedNodeBg: 'from-teal-500 to-cyan-500',
    landmarkBadges: [
      { kk: '☁️ Бұлтты бекет', ru: '☁️ Облачная гавань' },
      { kk: '🌉 Аспалы көпір', ru: '🌉 Подвесной мост' },
      { kk: '⛲ Аспан субұрқағы', ru: '⛲ Парящий водопад' }
    ],
    // Island hopping path
    coordinates: [
      { x: 14, y: 78 },
      { x: 28, y: 68 },
      { x: 48, y: 72 },
      { x: 70, y: 76 },
      { x: 84, y: 58 },
      { x: 68, y: 44 },
      { x: 46, y: 40 },
      { x: 24, y: 38 },
      { x: 38, y: 20 },
      { x: 66, y: 16 }
    ]
  },

  dragon_valley: {
    id: 'dragon_valley',
    name: { kk: 'Айдаһар алқабы', ru: 'Долина драконов' },
    description: {
      kk: 'Жанартау шыңдары, лава бұлақтары және мейірімді кішкентай айдаһарлар мекені.',
      ru: 'Огненные скалы, струящаяся лава и гнездовья дружелюбных драконов.'
    },
    bgImage: '/src/assets/images/world_dragon_valley_1793244664313.jpg',
    fallbackGradient: 'from-stone-950 via-orange-950 to-slate-950',
    ambientGlow: 'from-rose-500/25 via-amber-500/15 to-slate-950/80',
    pathUnderbedColor: '#1C1917',
    pathBorderColor: '#44403C',
    pathCoreColor: '#EA580C',
    pathDashArray: '14 12',
    magicTrailGlow: '#F97316',
    activeNodeRing: 'ring-orange-400/70 shadow-orange-500/50',
    completedNodeBg: 'from-orange-600 to-red-500',
    landmarkBadges: [
      { kk: '🌋 Жанартау қырқасы', ru: '🌋 Вулканический гребень' },
      { kk: '🔥 Лава бұлағы', ru: '🔥 Лавовый каскад' },
      { kk: '🐉 Айдаһар ұясы', ru: '🐉 Гнездо Драконов' }
    ],
    coordinates: [
      { x: 16, y: 82 },
      { x: 34, y: 78 },
      { x: 54, y: 80 },
      { x: 76, y: 70 },
      { x: 82, y: 50 },
      { x: 62, y: 44 },
      { x: 36, y: 46 },
      { x: 22, y: 30 },
      { x: 44, y: 22 },
      { x: 74, y: 18 }
    ]
  },

  ancient_temple: {
    id: 'ancient_temple',
    name: { kk: 'Көне ғибадатхана', ru: 'Древний храм' },
    description: {
      kk: 'Джунгли ішіндегі тас барыстар мен көне математикалық рәміздер.',
      ru: 'Затерянный в джунглях храм со светящимися математическими тотемами.'
    },
    bgImage: '/src/assets/images/world_ancient_temple_1793244663819.jpg',
    fallbackGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    ambientGlow: 'from-cyan-400/20 via-emerald-500/15 to-slate-950/80',
    pathUnderbedColor: '#064E3B',
    pathBorderColor: '#047857',
    pathCoreColor: '#10B981',
    pathDashArray: '16 10',
    magicTrailGlow: '#2DD4BF',
    activeNodeRing: 'ring-emerald-400/70 shadow-emerald-500/50',
    completedNodeBg: 'from-emerald-600 to-teal-500',
    landmarkBadges: [
      { kk: '🐆 Тас Барыс тотемі', ru: '🐆 Тотем Снежного Барса' },
      { kk: '🪨 Руналы баспалдақ', ru: '🪨 Рунические ступени' },
      { kk: '🔮 Қасиетті қорған', ru: '🔮 Святилище Знаний' }
    ],
    coordinates: [
      { x: 14, y: 80 },
      { x: 36, y: 76 },
      { x: 58, y: 78 },
      { x: 80, y: 66 },
      { x: 72, y: 48 },
      { x: 52, y: 44 },
      { x: 26, y: 48 },
      { x: 18, y: 28 },
      { x: 42, y: 22 },
      { x: 72, y: 18 }
    ]
  },

  magic_castle: {
    id: 'magic_castle',
    name: { kk: 'Сиқырлы сарай', ru: 'Волшебный замок' },
    description: {
      kk: 'Күлгін мұнаралар, жұлдызды аспан және математика жеңімпаздарының бағы.',
      ru: 'Величественный замок с пурпурными шпилями и праздничным салютом.'
    },
    bgImage: '/src/assets/images/world_magic_castle_1793244664718.jpg',
    fallbackGradient: 'from-purple-950 via-fuchsia-950 to-slate-950',
    ambientGlow: 'from-purple-400/25 via-pink-500/15 to-slate-950/80',
    pathUnderbedColor: '#3B0764',
    pathBorderColor: '#581C87',
    pathCoreColor: '#A855F7',
    pathDashArray: '14 10',
    magicTrailGlow: '#F472B6',
    activeNodeRing: 'ring-fuchsia-400/70 shadow-purple-500/50',
    completedNodeBg: 'from-purple-600 to-pink-500',
    landmarkBadges: [
      { kk: '🌿 Лабиринт бағы', ru: '🌿 Садовый лабиринт' },
      { kk: '🎆 Мерекелік салют', ru: '🎆 Праздничный салют' },
      { kk: '👑 Жеңіс тағы', ru: '👑 Трон Мудрости' }
    ],
    coordinates: [
      { x: 18, y: 82 },
      { x: 38, y: 76 },
      { x: 60, y: 78 },
      { x: 82, y: 64 },
      { x: 70, y: 48 },
      { x: 48, y: 46 },
      { x: 24, y: 46 },
      { x: 20, y: 28 },
      { x: 44, y: 22 },
      { x: 70, y: 18 }
    ]
  }
};
