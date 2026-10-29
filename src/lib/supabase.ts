/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Level, StudentProgress, ReviewSubmission, ReviewStatus } from '../types/game';

// Check environment variables first, then fallback to teacher runtime settings if stored
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

let activeClient: SupabaseClient | null = null;
let activeUrl = ENV_URL;
let activeKey = ENV_KEY;

// Check if credentials are stored in localStorage from teacher settings
const RUNTIME_SUPABASE_KEY = 'math_adventure_supabase_config_v1';
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(RUNTIME_SUPABASE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.key) {
        activeUrl = parsed.url;
        activeKey = parsed.key;
      }
    }
  } catch {
    // Ignore parse error
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (activeClient) return activeClient;
  if (!activeUrl || !activeKey) return null;

  try {
    activeClient = createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return activeClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(activeUrl && activeKey);
}

export function getSupabaseConfig(): { url: string; key: string } {
  return { url: activeUrl, key: activeKey };
}

export function updateSupabaseConfig(url: string, key: string) {
  activeUrl = url.trim();
  activeKey = key.trim();
  activeClient = null;

  if (typeof window !== 'undefined') {
    if (activeUrl && activeKey) {
      localStorage.setItem(
        RUNTIME_SUPABASE_KEY,
        JSON.stringify({ url: activeUrl, key: activeKey })
      );
    } else {
      localStorage.removeItem(RUNTIME_SUPABASE_KEY);
    }
  }
}

/**
 * Tests connection to the Supabase instance
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY or enter them in Cloud Settings.'
    };
  }

  try {
    const { error } = await client
      .from('math_levels')
      .select('id')
      .limit(1);

    if (error) {
      // Table might not exist yet if migration hasn't been run
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase, but math_levels table was not found. Please run the SQL migration in supabase/migrations/.'
        };
      }
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase Cloud!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network error connecting to Supabase: ${err.message || 'Unknown error'}`
    };
  }
}

/**
 * Fetch levels and questions from Supabase
 */
export async function fetchCloudLevels(): Promise<Level[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: levelsData, error: levelsErr } = await client
      .from('math_levels')
      .select('*')
      .order('level_order', { ascending: true });

    if (levelsErr || !levelsData) return null;

    const { data: questionsData, error: qErr } = await client
      .from('math_questions')
      .select('*')
      .order('question_order', { ascending: true });

    if (qErr) return null;

    return levelsData.map((lvl: any) => ({
      id: lvl.id,
      order: lvl.level_order,
      worldTheme: lvl.world_theme || 'forest',
      title: { kk: lvl.title_kk, ru: lvl.title_ru },
      description: { kk: lvl.description_kk, ru: lvl.description_ru },
      isPublished: lvl.is_published,
      rewardChestBonus: lvl.reward_chest_bonus,
      rewardItem: lvl.reward_item,
      questions: (questionsData || [])
        .filter((q: any) => q.level_id === lvl.id)
        .map((q: any) => ({
          id: q.id,
          levelId: q.level_id,
          order: q.question_order,
          text: { kk: q.text_kk, ru: q.text_ru },
          image: q.image_url,
          difficulty: q.difficulty,
          answerMode: q.answer_mode,
          checkingMode: q.checking_mode,
          options: q.options || undefined,
          correctAnswer: q.correct_answer,
          explanation: q.explanation_kk ? { kk: q.explanation_kk, ru: q.explanation_ru } : undefined
        }))
    }));
  } catch (err) {
    console.error('Failed to fetch cloud levels:', err);
    return null;
  }
}

/**
 * Sync levels and questions to Supabase (Teacher action)
 */
export async function syncLevelsToCloud(levels: Level[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    for (const lvl of levels) {
      await client.from('math_levels').upsert({
        id: lvl.id,
        level_order: lvl.order,
        title_kk: lvl.title.kk,
        title_ru: lvl.title.ru,
        description_kk: lvl.description.kk,
        description_ru: lvl.description.ru,
        world_theme: lvl.worldTheme || 'forest',
        is_published: lvl.isPublished,
        reward_chest_bonus: lvl.rewardChestBonus,
        reward_item: lvl.rewardItem,
        updated_at: new Date().toISOString()
      });

      for (const q of lvl.questions) {
        await client.from('math_questions').upsert({
          id: q.id,
          level_id: lvl.id,
          question_order: q.order,
          text_kk: q.text.kk,
          text_ru: q.text.ru,
          image_url: q.image,
          difficulty: q.difficulty,
          answer_mode: q.answerMode,
          checking_mode: q.checkingMode,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation_kk: q.explanation?.kk,
          explanation_ru: q.explanation?.ru,
          updated_at: new Date().toISOString()
        });
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to sync levels to cloud:', err);
    return false;
  }
}

/**
 * Fetch student progress from Supabase
 */
export async function fetchStudentProgressFromCloud(
  studentId: string
): Promise<Partial<StudentProgress> | null> {
  const client = getSupabaseClient();
  if (!client || !studentId) return null;

  try {
    const { data, error } = await client
      .from('math_student_progress')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error || !data) return null;

    return {
      studentId: data.student_id,
      points: data.points,
      completedQuestionIds: data.completed_question_ids || [],
      completedLevelIds: data.completed_level_ids || [],
      openedChestLevelIds: data.opened_chest_level_ids || [],
      unlockedCharacters: data.unlocked_characters || [],
      ownedItems: data.owned_items || [],
      equippedHat: data.equipped_hat || undefined,
      equippedClothing: data.equipped_clothing || undefined,
      equippedAccessory: data.equipped_accessory || undefined,
      currentLevelId: data.current_level_id || 'lvl_1_arithmetic',
      totalAttempts: data.total_attempts || 0,
      incorrectAttemptsCount: data.incorrect_attempts_breakdown || {},
      hasFinishedFirstSetup: data.has_finished_setup ?? true,
      lastSyncedAt: Date.now()
    };
  } catch (err) {
    console.error('Failed to fetch student progress from cloud:', err);
    return null;
  }
}

/**
 * Save student progress to Supabase
 */
export async function syncStudentProgressToCloud(
  progress: StudentProgress
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const sId = progress.studentId || 'default_student';

  try {
    // 1. Ensure student profile exists
    await client.from('math_students').upsert({
      student_id: sId,
      display_name: progress.studentName || 'Young Hero',
      selected_character_id: progress.selectedCharacterId,
      last_active_at: new Date().toISOString()
    });

    // 2. Upsert student progress
    const { error } = await client.from('math_student_progress').upsert({
      student_id: sId,
      points: progress.points,
      completed_question_ids: progress.completedQuestionIds,
      completed_level_ids: progress.completedLevelIds,
      opened_chest_level_ids: progress.openedChestLevelIds,
      unlocked_characters: progress.unlockedCharacters,
      owned_items: progress.ownedItems,
      equipped_hat: progress.equippedHat,
      equipped_clothing: progress.equippedClothing,
      equipped_accessory: progress.equippedAccessory,
      current_level_id: progress.currentLevelId,
      total_attempts: progress.totalAttempts,
      incorrect_attempts_breakdown: progress.incorrectAttemptsCount,
      has_finished_setup: progress.hasFinishedFirstSetup,
      updated_at: new Date().toISOString()
    });

    return !error;
  } catch (err) {
    console.error('Failed to sync student progress to cloud:', err);
    return false;
  }
}

/**
 * Submit manual answer for teacher review to Supabase
 */
export async function submitReviewToCloud(
  submission: ReviewSubmission
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('math_review_submissions').upsert({
      id: submission.id,
      student_id: submission.studentId || 'default_student',
      student_name: submission.studentName || 'Young Hero',
      question_id: submission.questionId,
      level_id: submission.levelId,
      question_title_kk: submission.questionTitle.kk,
      question_title_ru: submission.questionTitle.ru,
      student_answer: submission.studentAnswer,
      points: submission.points,
      status: submission.status,
      teacher_feedback: submission.teacherFeedback,
      submitted_at: new Date(submission.submittedAt).toISOString()
    });

    return !error;
  } catch (err) {
    console.error('Failed to submit review to cloud:', err);
    return false;
  }
}

/**
 * Fetch all review submissions for the teacher queue
 */
export async function fetchTeacherReviewQueueFromCloud(): Promise<ReviewSubmission[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('math_review_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error || !data) return null;

    return data.map((item: any) => ({
      id: item.id,
      studentId: item.student_id,
      studentName: item.student_name,
      questionId: item.question_id,
      levelId: item.level_id,
      questionTitle: { kk: item.question_title_kk, ru: item.question_title_ru },
      studentAnswer: item.student_answer,
      points: item.points,
      status: item.status,
      teacherFeedback: item.teacher_feedback,
      submittedAt: new Date(item.submitted_at).getTime()
    }));
  } catch (err) {
    console.error('Failed to fetch review queue from cloud:', err);
    return null;
  }
}

/**
 * Teacher updates review status (Approve, Reject, Needs Correction)
 */
export async function updateReviewStatusInCloud(
  submissionId: string,
  status: ReviewStatus,
  feedback?: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('math_review_submissions')
      .update({
        status,
        teacher_feedback: feedback,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    return !error;
  } catch (err) {
    console.error('Failed to update review status in cloud:', err);
    return false;
  }
}
