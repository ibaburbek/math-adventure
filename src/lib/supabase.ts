/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Level,
  StudentProgress,
  ReviewSubmission,
  ReviewStatus,
  StudentAccount,
  LoginResult
} from '../types/game';

// Check environment variables first, then fallback to teacher runtime settings if stored
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qdxllnszugxjofonhuqf.supabase.co';
const ENV_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_yMdtPlwC-RSSL_Va_CdrEw_1BtAVK6t';

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

/**
 * Authenticate student via secure server-side RPC with PIN verification and rate-limiting
 */
export async function studentLogin(identifier: string, pin: string): Promise<LoginResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      code: 'SERVER_ERROR',
      message: 'Supabase cloud client is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    };
  }

  const cleanId = identifier.trim();
  const cleanPin = pin.trim();

  if (!cleanId) {
    return {
      success: false,
      code: 'STUDENT_NOT_FOUND',
      message: 'Please enter your student code or name.'
    };
  }

  if (!cleanPin) {
    return {
      success: false,
      code: 'INVALID_PIN',
      message: 'Please enter your 4-digit PIN.'
    };
  }

  try {
    const { data, error } = await client.rpc('student_login', {
      p_identifier: cleanId,
      p_pin: cleanPin
    });

    if (error) {
      // RPC might not exist if migration hasn't been run yet
      if (error.code === '42883' || error.message?.includes('function public.student_login') || error.message?.includes('does not exist')) {
        return {
          success: false,
          code: 'SERVER_ERROR',
          message: 'Student login database function not installed. Please run the SQL migration in Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        code: 'SERVER_ERROR',
        message: error.message || 'Login failed.'
      };
    }

    if (!data) {
      return {
        success: false,
        code: 'SERVER_ERROR',
        message: 'No response from authentication server.'
      };
    }

    return {
      success: Boolean(data.success),
      code: data.code,
      message: data.message,
      student: data.student,
      progress: data.progress,
      remainingAttempts: data.remaining_attempts,
      lockedUntil: data.locked_until
    };
  } catch (err: any) {
    console.error('Student login error:', err);
    return {
      success: false,
      code: 'SERVER_ERROR',
      message: err.message || 'An unexpected error occurred during login.'
    };
  }
}

/**
 * Fetch all students for Teacher Studio
 */
export async function teacherGetStudents(): Promise<StudentAccount[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.rpc('teacher_get_students');
    if (error) {
      console.warn('teacher_get_students RPC error:', error);
      // Fallback: direct select if RPC not installed
      const { data: directData, error: directErr } = await client
        .from('math_students')
        .select(`
          student_id,
          student_code,
          display_name,
          selected_character_id,
          last_active_at,
          failed_attempts
        `)
        .order('display_name', { ascending: true });

      if (directErr || !directData) return null;
      return directData.map((d: any) => ({
        student_id: d.student_id,
        student_code: d.student_code || d.student_id,
        display_name: d.display_name,
        selected_character_id: d.selected_character_id,
        failed_attempts: d.failed_attempts || 0,
        is_locked: false
      }));
    }

    return (data || []).map((row: any) => ({
      student_id: row.student_id,
      student_code: row.student_code,
      display_name: row.display_name,
      selected_character_id: row.selected_character_id,
      points: row.points,
      completed_levels_count: row.completed_levels_count,
      completed_questions_count: row.completed_questions_count,
      last_active_at: row.last_active_at,
      last_login_at: row.last_login_at,
      failed_attempts: row.failed_attempts,
      is_locked: Boolean(row.is_locked)
    }));
  } catch (err) {
    console.error('Failed to get students for teacher:', err);
    return null;
  }
}

/**
 * Teacher creates a new student with unique code, name, and hashed PIN
 */
export async function teacherCreateStudent(
  studentCode: string,
  displayName: string,
  pin: string,
  initialCharacter?: string
): Promise<{ success: boolean; message?: string; student?: StudentAccount }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client not configured.' };
  }

  try {
    const { data, error } = await client.rpc('teacher_create_student', {
      p_student_code: studentCode.trim(),
      p_display_name: displayName.trim(),
      p_pin: pin.trim(),
      p_initial_character: initialCharacter || 'alen'
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (data && !data.success) {
      return { success: false, message: data.message };
    }

    return {
      success: true,
      message: 'Student account created successfully!',
      student: data?.student
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to create student.' };
  }
}

/**
 * Teacher resets student's PIN
 */
export async function teacherResetStudentPin(
  studentId: string,
  newPin: string
): Promise<{ success: boolean; message?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Supabase client not configured.' };

  try {
    const { data, error } = await client.rpc('teacher_reset_student_pin', {
      p_student_id: studentId,
      p_new_pin: newPin.trim()
    });

    if (error) return { success: false, message: error.message };
    if (data && !data.success) return { success: false, message: data.message };

    return { success: true, message: data?.message || 'PIN reset successfully!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to reset PIN.' };
  }
}

/**
 * Teacher deletes a student
 */
export async function teacherDeleteStudent(
  studentId: string
): Promise<{ success: boolean; message?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Supabase client not configured.' };

  try {
    const { data, error } = await client.rpc('teacher_delete_student', {
      p_student_id: studentId
    });

    if (error) {
      // Fallback direct delete
      const { error: delErr } = await client
        .from('math_students')
        .delete()
        .eq('student_id', studentId);
      if (delErr) return { success: false, message: delErr.message };
      return { success: true };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to delete student.' };
  }
}
