/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'kk' | 'ru';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type AnswerMode = 'typed' | 'multiple_choice';

export type CheckingMode = 'auto' | 'manual';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_correction';

export type CharacterAnimationState = 'idle' | 'walking' | 'jumping' | 'celebrating' | 'thinking' | 'oops';

export type WorldTheme =
  | 'forest'
  | 'crystal_caves'
  | 'ice_kingdom'
  | 'desert'
  | 'sky_islands'
  | 'dragon_valley'
  | 'ancient_temple'
  | 'magic_castle';

export interface CloudSyncStatus {
  configured: boolean;
  connected: boolean;
  lastSyncedAt?: number;
  syncing: boolean;
  error?: string;
}

export interface LocalizedString {
  kk: string;
  ru: string;
}

export interface Question {
  id: string;
  levelId: string;
  order: number;
  text: LocalizedString;
  image?: string; // Data URL or asset image
  diagramType?: 'arithmetic' | 'fraction' | 'equation' | 'geometry' | 'logic';
  diagramData?: Record<string, any>;
  difficulty: Difficulty;
  answerMode: AnswerMode;
  checkingMode: CheckingMode;
  options?: string[]; // 3-4 options for multiple choice
  correctAnswer: string; // Trimmed string or number
  explanation?: LocalizedString;
}

export interface Level {
  id: string;
  order: number;
  title: LocalizedString;
  description: LocalizedString;
  worldTheme?: WorldTheme;
  isPublished: boolean;
  rewardChestBonus: number;
  rewardItem?: string; // ShopItem ID
  questions: Question[];
}

export interface Character {
  id: string;
  name: LocalizedString;
  type: 'hero' | 'animal' | 'creature';
  description: LocalizedString;
  cost: number;
  unlockedByDefault: boolean;
  themeColor: string;
  accentColor: string;
  avatarId: string;
}

export type ItemCategory = 'hat' | 'clothing' | 'accessory';

export interface ShopItem {
  id: string;
  category: ItemCategory;
  name: LocalizedString;
  cost: number;
  description: LocalizedString;
  iconName: string;
  visualTag: string;
}

export interface ReviewSubmission {
  id: string;
  questionId: string;
  levelId: string;
  questionTitle: LocalizedString;
  studentAnswer: string;
  submittedAt: number;
  status: ReviewStatus;
  teacherFeedback?: string;
  points: number;
  studentId?: string;
  studentName?: string;
}

export interface StudentAccount {
  student_id: string;
  student_code: string;
  display_name: string;
  selected_character_id?: string;
  points?: number;
  completed_levels_count?: number;
  completed_questions_count?: number;
  last_active_at?: string;
  last_login_at?: string;
  failed_attempts?: number;
  is_locked?: boolean;
}

export interface LoginResult {
  success: boolean;
  code?: 'STUDENT_NOT_FOUND' | 'INVALID_PIN' | 'ACCOUNT_LOCKED' | 'NO_PIN_SET' | 'SERVER_ERROR';
  message?: string;
  student?: {
    student_id: string;
    student_code: string;
    display_name: string;
    selected_character_id?: string;
  };
  progress?: Partial<StudentProgress>;
  remainingAttempts?: number;
  lockedUntil?: string;
}

export interface StudentProgress {
  studentId?: string;
  studentCode?: string;
  studentName?: string;
  selectedCharacterId: string;
  equippedHat?: string;
  equippedClothing?: string;
  equippedAccessory?: string;
  points: number;
  completedQuestionIds: string[];
  completedLevelIds: string[];
  openedChestLevelIds: string[];
  unlockedCharacters: string[];
  ownedItems: string[];
  currentLevelId: string;
  reviewSubmissions: ReviewSubmission[];
  incorrectAttemptsCount: Record<string, number>;
  totalAttempts: number;
  hasFinishedFirstSetup: boolean;
  lastSyncedAt?: number;
}

export interface TeacherSettings {
  pin: string;
  pinCreated: boolean;
  teacherEmail?: string;
}

export interface CloudSettings {
  supabaseUrl?: string;
  supabaseKey?: string;
  autoSync: boolean;
  lastSyncTime?: number;
  teacherEmail?: string;
  isConfigured: boolean;
}

export interface GameState {
  language: Language;
  soundEnabled: boolean;
  progress: StudentProgress;
  levels: Level[];
  characters: Character[];
  shopItems: ShopItem[];
  teacherSettings: TeacherSettings;
  cloudSettings?: CloudSettings;
}
