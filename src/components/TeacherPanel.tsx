/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  GameState,
  Level,
  Question,
  Difficulty,
  AnswerMode,
  CheckingMode,
  ReviewSubmission,
  Language,
  WorldTheme
} from '../types/game';
import { translations } from '../i18n/translations';
import { WORLD_THEMES } from '../data/worldThemes';
import { soundManager } from '../utils/sound';
import {
  testSupabaseConnection,
  syncLevelsToCloud,
  fetchCloudLevels,
  syncStudentProgressToCloud,
  fetchStudentProgressFromCloud,
  fetchTeacherReviewQueueFromCloud,
  updateReviewStatusInCloud,
  getSupabaseConfig,
  updateSupabaseConfig,
  isSupabaseConfigured,
  teacherGetStudents,
  teacherCreateStudent,
  teacherResetStudentPin,
  teacherDeleteStudent
} from '../lib/supabase';
import { StudentAccount } from '../types/game';
import {
  Lock,
  KeyRound,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Check,
  X,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RotateCcw,
  BarChart2,
  ListOrdered,
  FileQuestion,
  LogOut,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Copy,
  Database,
  ExternalLink,
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

interface TeacherPanelProps {
  state: GameState;
  language: Language;
  soundEnabled: boolean;
  initialTab?: 'levels' | 'reviews' | 'analytics' | 'backup' | 'cloud' | 'students';
  onClose: () => void;
  onUpdateState: (updater: (prev: GameState) => GameState) => void;
  onResetProgress: () => void;
  onResetAllDefault: () => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({
  state,
  language,
  soundEnabled,
  initialTab,
  onClose,
  onUpdateState,
  onResetProgress,
  onResetAllDefault
}) => {
  const t = translations[language];
  const { teacherSettings, levels, progress } = state;

  // PIN Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Tab inside Teacher Panel
  const [activeTab, setActiveTab] = useState<'levels' | 'reviews' | 'analytics' | 'backup' | 'cloud' | 'students'>(initialTab || 'levels');

  // Student Management State
  const [studentList, setStudentList] = useState<StudentAccount[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPin, setNewStudentPin] = useState('');
  const [studentActionError, setStudentActionError] = useState('');
  const [studentActionSuccess, setStudentActionSuccess] = useState('');
  const [resetPinModalStudent, setResetPinModalStudent] = useState<StudentAccount | null>(null);
  const [resetNewPin, setResetNewPin] = useState('');

  // Level Management State
  const [selectedLevelId, setSelectedLevelId] = useState<string>(levels[0]?.id || '');
  const [isEditingLevelModalOpen, setIsEditingLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Partial<Level> | null>(null);

  // Question Management State
  const [isEditingQuestionModalOpen, setIsEditingQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  // Teacher Review Feedback State
  const [reviewFeedbackInput, setReviewFeedbackInput] = useState<Record<string, string>>({});

  // Supabase Cloud State
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(getSupabaseConfig().key);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const questionImageInputRef = useRef<HTMLInputElement>(null);

  // Load students from Supabase
  const loadStudents = async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoadingStudents(true);
    setStudentActionError('');
    try {
      const data = await teacherGetStudents();
      if (data) {
        setStudentList(data);
      }
    } catch (err: any) {
      setStudentActionError(err.message || 'Failed to load students.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students' && isAuthenticated) {
      loadStudents();
    }
  }, [activeTab, isAuthenticated]);

  // Handle PIN Login / Setup
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (!teacherSettings.pinCreated) {
      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        setPinError('PIN must be 4 digits (0-9)');
        return;
      }
      if (newPin !== confirmPin) {
        setPinError(t.pinMismatch);
        return;
      }
      onUpdateState(prev => ({
        ...prev,
        teacherSettings: {
          pin: newPin,
          pinCreated: true
        }
      }));
      setIsAuthenticated(true);
      soundManager.playCorrect(soundEnabled);
    } else {
      if (enteredPin === teacherSettings.pin) {
        setIsAuthenticated(true);
        soundManager.playClick(soundEnabled);
      } else {
        setPinError(t.wrongPin);
        soundManager.playWrong(soundEnabled);
      }
    }
  };

  const currentLevel = levels.find(l => l.id === selectedLevelId) || levels[0];

  // LEVEL CRUD
  const handleSaveLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel || !editingLevel.title?.kk || !editingLevel.title?.ru) return;

    onUpdateState(prev => {
      const isExisting = prev.levels.some(l => l.id === editingLevel.id);
      let updatedLevels: Level[];

      if (isExisting) {
        updatedLevels = prev.levels.map(l =>
          l.id === editingLevel.id ? ({ ...l, ...editingLevel } as Level) : l
        );
      } else {
        const newLevel: Level = {
          id: `lvl_custom_${Date.now()}`,
          order: prev.levels.length + 1,
          title: editingLevel.title as any,
          description: editingLevel.description as any || { kk: '', ru: '' },
          worldTheme: (editingLevel.worldTheme as WorldTheme) || 'forest',
          isPublished: editingLevel.isPublished ?? true,
          rewardChestBonus: editingLevel.rewardChestBonus || 50,
          questions: []
        };
        updatedLevels = [...prev.levels, newLevel];
        setSelectedLevelId(newLevel.id);
      }

      // If Supabase is connected, sync asynchronously
      if (isSupabaseConfigured()) {
        syncLevelsToCloud(updatedLevels);
      }

      return { ...prev, levels: updatedLevels };
    });

    setIsEditingLevelModalOpen(false);
    setEditingLevel(null);
  };

  const handleDeleteLevel = (levelId: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    onUpdateState(prev => {
      const filtered = prev.levels.filter(l => l.id !== levelId);
      if (isSupabaseConfigured()) {
        syncLevelsToCloud(filtered);
      }
      return { ...prev, levels: filtered };
    });
    if (selectedLevelId === levelId && levels.length > 1) {
      setSelectedLevelId(levels.find(l => l.id !== levelId)?.id || '');
    }
  };

  const handleTogglePublish = (levelId: string) => {
    onUpdateState(prev => {
      const updated = prev.levels.map(l =>
        l.id === levelId ? { ...l, isPublished: !l.isPublished } : l
      );
      if (isSupabaseConfigured()) {
        syncLevelsToCloud(updated);
      }
      return { ...prev, levels: updated };
    });
  };

  // QUESTION CRUD
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.text?.kk || !editingQuestion.text?.ru) return;
    if (!currentLevel) return;

    onUpdateState(prev => {
      const updatedLevels = prev.levels.map(lvl => {
        if (lvl.id !== currentLevel.id) return lvl;

        const isExisting = lvl.questions.some(q => q.id === editingQuestion.id);
        let newQuestions: Question[];

        if (isExisting) {
          newQuestions = lvl.questions.map(q =>
            q.id === editingQuestion.id ? ({ ...q, ...editingQuestion } as Question) : q
          );
        } else {
          const newQ: Question = {
            id: `q_custom_${Date.now()}`,
            levelId: lvl.id,
            order: lvl.questions.length + 1,
            text: editingQuestion.text as any,
            difficulty: (editingQuestion.difficulty as Difficulty) || 'easy',
            answerMode: (editingQuestion.answerMode as AnswerMode) || 'typed',
            checkingMode: (editingQuestion.checkingMode as CheckingMode) || 'auto',
            options: editingQuestion.options || ['1', '2', '3', '4'],
            correctAnswer: editingQuestion.correctAnswer || '0',
            image: editingQuestion.image,
            explanation: editingQuestion.explanation
          };
          newQuestions = [...lvl.questions, newQ];
        }

        return { ...lvl, questions: newQuestions };
      });

      if (isSupabaseConfigured()) {
        syncLevelsToCloud(updatedLevels);
      }

      return { ...prev, levels: updatedLevels };
    });

    setIsEditingQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!window.confirm(t.deleteQuestionConfirm)) return;
    onUpdateState(prev => {
      const updatedLevels = prev.levels.map(lvl => {
        if (lvl.id !== currentLevel.id) return lvl;
        return {
          ...lvl,
          questions: lvl.questions.filter(q => q.id !== questionId)
        };
      });
      if (isSupabaseConfigured()) {
        syncLevelsToCloud(updatedLevels);
      }
      return { ...prev, levels: updatedLevels };
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!currentLevel) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentLevel.questions.length) return;

    onUpdateState(prev => {
      const updatedLevels = prev.levels.map(lvl => {
        if (lvl.id !== currentLevel.id) return lvl;
        const copy = [...lvl.questions];
        const temp = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = temp;
        return { ...lvl, questions: copy };
      });
      if (isSupabaseConfigured()) {
        syncLevelsToCloud(updatedLevels);
      }
      return { ...prev, levels: updatedLevels };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEditingQuestion(prev => ({
        ...prev,
        image: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // REVIEWS QUEUE
  const handleApproveReview = async (submission: ReviewSubmission) => {
    soundManager.playCorrect(soundEnabled);
    if (isSupabaseConfigured()) {
      await updateReviewStatusInCloud(submission.id, 'approved', reviewFeedbackInput[submission.id]);
    }
    onUpdateState(prev => {
      const alreadyCompleted = prev.progress.completedQuestionIds.includes(submission.questionId);
      const newCompleted = alreadyCompleted
        ? prev.progress.completedQuestionIds
        : [...prev.progress.completedQuestionIds, submission.questionId];

      const pointsToAdd = alreadyCompleted ? 0 : submission.points;

      const updatedSubmissions = prev.progress.reviewSubmissions.map(s =>
        s.id === submission.id ? { ...s, status: 'approved' as const } : s
      );

      const newProgress = {
        ...prev.progress,
        points: prev.progress.points + pointsToAdd,
        completedQuestionIds: newCompleted,
        reviewSubmissions: updatedSubmissions
      };

      if (isSupabaseConfigured()) {
        syncStudentProgressToCloud(newProgress);
      }

      return {
        ...prev,
        progress: newProgress
      };
    });
  };

  const handleRejectReview = async (submission: ReviewSubmission) => {
    soundManager.playWrong(soundEnabled);
    const feedback = reviewFeedbackInput[submission.id] || '';
    if (isSupabaseConfigured()) {
      await updateReviewStatusInCloud(submission.id, 'rejected', feedback);
    }
    onUpdateState(prev => {
      const newSubmissions = prev.progress.reviewSubmissions.map(s =>
        s.id === submission.id
          ? { ...s, status: 'rejected' as const, teacherFeedback: feedback }
          : s
      );
      const newProgress = { ...prev.progress, reviewSubmissions: newSubmissions };
      if (isSupabaseConfigured()) {
        syncStudentProgressToCloud(newProgress);
      }
      return { ...prev, progress: newProgress };
    });
  };

  const handleRequestCorrection = async (submission: ReviewSubmission) => {
    soundManager.playClick(soundEnabled);
    const feedback = reviewFeedbackInput[submission.id] || '';
    if (isSupabaseConfigured()) {
      await updateReviewStatusInCloud(submission.id, 'needs_correction', feedback);
    }
    onUpdateState(prev => {
      const newSubmissions = prev.progress.reviewSubmissions.map(s =>
        s.id === submission.id
          ? { ...s, status: 'needs_correction' as const, teacherFeedback: feedback }
          : s
      );
      const newProgress = { ...prev.progress, reviewSubmissions: newSubmissions };
      if (isSupabaseConfigured()) {
        syncStudentProgressToCloud(newProgress);
      }
      return { ...prev, progress: newProgress };
    });
  };

  // BACKUP & RESTORE
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `math_adventure_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.levels && parsed.progress) {
          onUpdateState(() => parsed);
          alert(t.importSuccess);
        } else {
          alert(t.importError);
        }
      } catch {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
  };

  // SUPABASE CLOUD SYNC ACTIONS
  const handleSaveCloudCredentials = () => {
    updateSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    setCloudMessage({
      type: 'success',
      text: 'Supabase credentials saved locally!'
    });
  };

  const handleTestCloudConnection = async () => {
    setIsTestingCloud(true);
    setCloudMessage({ type: null, text: '' });
    updateSupabaseConfig(supabaseUrlInput, supabaseKeyInput);

    const result = await testSupabaseConnection();
    setIsTestingCloud(false);
    setCloudMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    setCloudMessage({ type: null, text: '' });

    try {
      const levelsOk = await syncLevelsToCloud(levels);
      const progressOk = await syncStudentProgressToCloud(progress);

      setIsSyncing(false);
      if (levelsOk && progressOk) {
        soundManager.playCorrect(soundEnabled);
        setCloudMessage({
          type: 'success',
          text: t.cloudSyncSuccess
        });
      } else {
        soundManager.playWrong(soundEnabled);
        setCloudMessage({
          type: 'error',
          text: 'Failed to sync to Supabase. Check that the tables exist by running the SQL migration.'
        });
      }
    } catch (err: any) {
      setIsSyncing(false);
      soundManager.playWrong(soundEnabled);
      setCloudMessage({
        type: 'error',
        text: `Sync error: ${err.message}`
      });
    }
  };

  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    setCloudMessage({ type: null, text: '' });

    try {
      const remoteLevels = await fetchCloudLevels();
      const remoteProgress = await fetchStudentProgressFromCloud(progress.studentId || 'default_student');
      const remoteReviews = await fetchTeacherReviewQueueFromCloud();

      setIsSyncing(false);
      if (remoteLevels && remoteLevels.length > 0) {
        onUpdateState(prev => ({
          ...prev,
          levels: remoteLevels,
          progress: remoteProgress
            ? { ...prev.progress, ...remoteProgress }
            : prev.progress,
          reviewSubmissions: remoteReviews || prev.progress.reviewSubmissions
        }));
        soundManager.playCorrect(soundEnabled);
        setCloudMessage({
          type: 'success',
          text: 'Successfully pulled levels and progress from Supabase!'
        });
      } else {
        soundManager.playWrong(soundEnabled);
        setCloudMessage({
          type: 'error',
          text: 'No levels found in cloud. Try syncing local levels first.'
        });
      }
    } catch (err: any) {
      setIsSyncing(false);
      soundManager.playWrong(soundEnabled);
      setCloudMessage({
        type: 'error',
        text: `Error pulling from cloud: ${err.message}`
      });
    }
  };

  // Student Actions
  const handleCreateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentCode.trim() || !newStudentName.trim() || !newStudentPin.trim()) return;

    if (newStudentPin.trim().length < 4) {
      setStudentActionError('PIN must be at least 4 digits');
      return;
    }

    setStudentActionError('');
    setStudentActionSuccess('');
    soundManager.playClick(soundEnabled);

    const res = await teacherCreateStudent(
      newStudentCode.trim(),
      newStudentName.trim(),
      newStudentPin.trim()
    );

    if (res.success) {
      soundManager.playCorrect(soundEnabled);
      setStudentActionSuccess(t.studentCreatedSuccess);
      setNewStudentCode('');
      setNewStudentName('');
      setNewStudentPin('');
      setIsAddStudentOpen(false);
      loadStudents();
    } else {
      soundManager.playWrong(soundEnabled);
      setStudentActionError(res.message || 'Failed to create student');
    }
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinModalStudent || !resetNewPin.trim()) return;

    if (resetNewPin.trim().length < 4) {
      setStudentActionError('PIN must be at least 4 digits');
      return;
    }

    soundManager.playClick(soundEnabled);
    const res = await teacherResetStudentPin(resetPinModalStudent.student_id, resetNewPin.trim());

    if (res.success) {
      soundManager.playCorrect(soundEnabled);
      setStudentActionSuccess(res.message || 'PIN reset successfully!');
      setResetPinModalStudent(null);
      setResetNewPin('');
      loadStudents();
    } else {
      soundManager.playWrong(soundEnabled);
      setStudentActionError(res.message || 'Failed to reset PIN');
    }
  };

  const handleDeleteStudentClick = async (student: StudentAccount) => {
    if (!window.confirm(`${t.deleteStudentConfirm}\n${student.display_name} (${student.student_code})`)) {
      return;
    }

    soundManager.playClick(soundEnabled);
    const res = await teacherDeleteStudent(student.student_id);
    if (res.success) {
      soundManager.playCorrect(soundEnabled);
      setStudentActionSuccess('Student deleted.');
      loadStudents();
    } else {
      soundManager.playWrong(soundEnabled);
      setStudentActionError(res.message || 'Failed to delete student');
    }
  };

  const migrationSql = `-- Math Adventure Migration SQL for Supabase SQL Editor
-- Includes Tables, pgcrypto, Student PIN Authentication RPCs & RLS Policies

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Levels
CREATE TABLE IF NOT EXISTS public.math_levels (
    id TEXT PRIMARY KEY,
    level_order INT NOT NULL,
    title_kk TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    description_kk TEXT DEFAULT '',
    description_ru TEXT DEFAULT '',
    world_theme TEXT DEFAULT 'forest',
    is_published BOOLEAN DEFAULT true,
    reward_chest_bonus INT DEFAULT 50,
    reward_item TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Questions
CREATE TABLE IF NOT EXISTS public.math_questions (
    id TEXT PRIMARY KEY,
    level_id TEXT NOT NULL REFERENCES public.math_levels(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    text_kk TEXT NOT NULL,
    text_ru TEXT NOT NULL,
    image_url TEXT,
    difficulty TEXT NOT NULL,
    answer_mode TEXT NOT NULL,
    checking_mode TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation_kk TEXT,
    explanation_ru TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students (with unique student_code, pin_hash & rate limiting)
CREATE TABLE IF NOT EXISTS public.math_students (
    student_id TEXT PRIMARY KEY,
    student_code TEXT,
    display_name TEXT NOT NULL,
    selected_character_id TEXT DEFAULT 'alen',
    pin_hash TEXT,
    failed_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created previously
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS student_code TEXT;
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0;
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS idx_math_students_code ON public.math_students(lower(student_code));

-- 4. Student Progress
CREATE TABLE IF NOT EXISTS public.math_student_progress (
    student_id TEXT PRIMARY KEY REFERENCES public.math_students(student_id) ON DELETE CASCADE,
    points INT DEFAULT 0,
    completed_question_ids TEXT[] DEFAULT '{}',
    completed_level_ids TEXT[] DEFAULT '{}',
    opened_chest_level_ids TEXT[] DEFAULT '{}',
    unlocked_characters TEXT[] DEFAULT '{"alen","ayla","barshyn","tulki"}',
    owned_items TEXT[] DEFAULT '{}',
    equipped_hat TEXT,
    equipped_clothing TEXT,
    equipped_accessory TEXT,
    current_level_id TEXT DEFAULT 'lvl_1_arithmetic',
    total_attempts INT DEFAULT 0,
    incorrect_attempts_breakdown JSONB DEFAULT '{}',
    has_finished_setup BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Review Submissions
CREATE TABLE IF NOT EXISTS public.math_review_submissions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.math_students(student_id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    question_id TEXT NOT NULL,
    level_id TEXT NOT NULL,
    question_title_kk TEXT NOT NULL,
    question_title_ru TEXT NOT NULL,
    student_answer TEXT NOT NULL,
    points INT NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'pending',
    teacher_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.math_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_review_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read levels" ON public.math_levels FOR SELECT USING (true);
CREATE POLICY "Public upsert levels" ON public.math_levels FOR ALL USING (true);
CREATE POLICY "Public read questions" ON public.math_questions FOR SELECT USING (true);
CREATE POLICY "Public upsert questions" ON public.math_questions FOR ALL USING (true);
CREATE POLICY "Public read students" ON public.math_students FOR SELECT USING (true);
CREATE POLICY "Public read progress" ON public.math_student_progress FOR ALL USING (true);
CREATE POLICY "Public read reviews" ON public.math_review_submissions FOR ALL USING (true);

-- SECURE RPC: Student Login with server-side PIN verification & rate-limiting
CREATE OR REPLACE FUNCTION public.student_login(p_identifier TEXT, p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_student RECORD;
    v_progress RECORD;
    v_cleaned_id TEXT;
    v_pin_match BOOLEAN;
BEGIN
    v_cleaned_id := lower(trim(p_identifier));
    SELECT * INTO v_student FROM public.math_students
    WHERE lower(student_code) = v_cleaned_id OR lower(trim(display_name)) = v_cleaned_id
    LIMIT 1;

    IF v_student IS NULL THEN
        RETURN jsonb_build_object('success', false, 'code', 'STUDENT_NOT_FOUND', 'message', 'Student account not found.');
    END IF;

    IF v_student.locked_until IS NOT NULL AND v_student.locked_until > NOW() THEN
        RETURN jsonb_build_object('success', false, 'code', 'ACCOUNT_LOCKED', 'message', 'Account temporarily locked. Please wait 5 minutes.', 'locked_until', v_student.locked_until);
    END IF;

    IF v_student.pin_hash IS NULL THEN
        RETURN jsonb_build_object('success', false, 'code', 'NO_PIN_SET', 'message', 'No PIN set for this student.');
    END IF;

    v_pin_match := (v_student.pin_hash = crypt(p_pin, v_student.pin_hash));
    IF NOT v_pin_match THEN
        UPDATE public.math_students
        SET failed_attempts = COALESCE(failed_attempts, 0) + 1,
            locked_until = CASE WHEN COALESCE(failed_attempts, 0) + 1 >= 5 THEN NOW() + INTERVAL '5 minutes' ELSE NULL END
        WHERE student_id = v_student.student_id;
        RETURN jsonb_build_object('success', false, 'code', 'INVALID_PIN', 'message', 'Incorrect PIN.', 'remaining_attempts', GREATEST(0, 5 - (COALESCE(v_student.failed_attempts, 0) + 1)));
    END IF;

    UPDATE public.math_students
    SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW(), last_active_at = NOW()
    WHERE student_id = v_student.student_id;

    SELECT * INTO v_progress FROM public.math_student_progress WHERE student_id = v_student.student_id;
    IF v_progress IS NULL THEN
        INSERT INTO public.math_student_progress (student_id, points, current_level_id, updated_at)
        VALUES (v_student.student_id, 0, 'lvl_1_arithmetic', NOW())
        RETURNING * INTO v_progress;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'student', jsonb_build_object('student_id', v_student.student_id, 'student_code', v_student.student_code, 'display_name', v_student.display_name, 'selected_character_id', v_student.selected_character_id),
        'progress', jsonb_build_object('studentId', v_progress.student_id, 'studentCode', v_student.student_code, 'studentName', v_student.display_name, 'points', v_progress.points, 'completedQuestionIds', v_progress.completed_question_ids, 'completedLevelIds', v_progress.completed_level_ids, 'openedChestLevelIds', v_progress.opened_chest_level_ids, 'unlockedCharacters', v_progress.unlocked_characters, 'ownedItems', v_progress.owned_items, 'equippedHat', v_progress.equipped_hat, 'equippedClothing', v_progress.equipped_clothing, 'equippedAccessory', v_progress.equipped_accessory, 'currentLevelId', v_progress.current_level_id, 'totalAttempts', v_progress.total_attempts, 'incorrectAttemptsCount', v_progress.incorrect_attempts_breakdown, 'hasFinishedFirstSetup', v_progress.has_finished_setup)
    );
END;
$$;

-- SECURE RPC: Teacher create student with hashed PIN
CREATE OR REPLACE FUNCTION public.teacher_create_student(p_student_code TEXT, p_display_name TEXT, p_pin TEXT, p_initial_character TEXT DEFAULT 'alen')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_clean_code TEXT;
    v_student_id TEXT;
    v_hashed_pin TEXT;
BEGIN
    v_clean_code := upper(trim(p_student_code));
    IF length(v_clean_code) < 2 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Code must be at least 2 characters.');
    END IF;
    IF length(trim(p_pin)) < 4 THEN
        RETURN jsonb_build_object('success', false, 'message', 'PIN must be at least 4 digits.');
    END IF;
    IF EXISTS (SELECT 1 FROM public.math_students WHERE lower(student_code) = lower(v_clean_code)) THEN
        RETURN jsonb_build_object('success', false, 'message', 'A student with this code already exists.');
    END IF;

    v_student_id := 'std_' || lower(replace(v_clean_code, ' ', '_')) || '_' || floor(random() * 8999 + 1000)::text;
    v_hashed_pin := crypt(trim(p_pin), gen_salt('bf', 8));

    INSERT INTO public.math_students (student_id, student_code, display_name, selected_character_id, pin_hash, created_at, last_active_at)
    VALUES (v_student_id, v_clean_code, trim(p_display_name), p_initial_character, v_hashed_pin, NOW(), NOW());

    INSERT INTO public.math_student_progress (student_id, points, current_level_id, updated_at)
    VALUES (v_student_id, 0, 'lvl_1_arithmetic', NOW());

    RETURN jsonb_build_object('success', true, 'student', jsonb_build_object('student_id', v_student_id, 'student_code', v_clean_code, 'display_name', trim(p_display_name), 'selected_character_id', p_initial_character));
END;
$$;

-- SECURE RPC: Teacher reset student PIN
CREATE OR REPLACE FUNCTION public.teacher_reset_student_pin(p_student_id TEXT, p_new_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    IF length(trim(p_new_pin)) < 4 THEN
        RETURN jsonb_build_object('success', false, 'message', 'PIN must be at least 4 digits.');
    END IF;
    UPDATE public.math_students
    SET pin_hash = crypt(trim(p_new_pin), gen_salt('bf', 8)), failed_attempts = 0, locked_until = NULL, last_active_at = NOW()
    WHERE student_id = p_student_id;
    RETURN jsonb_build_object('success', true, 'message', 'PIN reset successfully.');
END;
$$;

-- SECURE RPC: Teacher list students (pin_hash is NEVER exposed)
CREATE OR REPLACE FUNCTION public.teacher_get_students()
RETURNS TABLE (student_id TEXT, student_code TEXT, display_name TEXT, selected_character_id TEXT, points INT, completed_levels_count INT, completed_questions_count INT, last_active_at TIMESTAMPTZ, last_login_at TIMESTAMPTZ, failed_attempts INT, is_locked BOOLEAN)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT s.student_id, s.student_code, s.display_name, s.selected_character_id, COALESCE(p.points, 0) AS points, COALESCE(cardinality(p.completed_level_ids), 0) AS completed_levels_count, COALESCE(cardinality(p.completed_question_ids), 0) AS completed_questions_count, s.last_active_at, s.last_login_at, COALESCE(s.failed_attempts, 0) AS failed_attempts, (s.locked_until IS NOT NULL AND s.locked_until > NOW()) AS is_locked
    FROM public.math_students s
    LEFT JOIN public.math_student_progress p ON p.student_id = s.student_id
    ORDER BY s.display_name ASC;
$$;

-- SECURE RPC: Teacher delete student
CREATE OR REPLACE FUNCTION public.teacher_delete_student(p_student_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.math_students WHERE student_id = p_student_id;
    RETURN jsonb_build_object('success', true);
END;
$$;

NOTIFY pgrst, 'reload schema';`;

  // IF NOT AUTHENTICATED: RENDER PIN LOGIN/SETUP SCREEN
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-100">{t.teacherTitle}</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">{t.teacherPinNotice}</p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            {!teacherSettings.pinCreated ? (
              <>
                <div className="text-left space-y-1">
                  <label className="text-xs font-bold text-slate-300">{t.setupPin}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4 цифры (напр. 1234)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-center tracking-widest text-lg font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    autoFocus
                  />
                </div>

                <div className="text-left space-y-1">
                  <label className="text-xs font-bold text-slate-300">{t.confirmPin}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Повторите PIN"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-center tracking-widest text-lg font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  maxLength={4}
                  value={enteredPin}
                  onChange={e => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-center tracking-widest text-2xl font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400">(Default: 1234)</p>
              </div>
            )}

            {pinError && (
              <p className="text-xs font-bold text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-600/30">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-700/30 cursor-pointer transition-all"
            >
              {!teacherSettings.pinCreated ? t.createPinBtn : t.loginBtn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED TEACHER DASHBOARD
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[94vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/70 border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">{t.teacherTitle}</h2>
                {isSupabaseConfigured() ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                    <CloudCheck className="w-3 h-3" />
                    <span>Supabase Online</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                    <CloudOff className="w-3 h-3" />
                    <span>Local Mode</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Math Adventure Teacher Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.exitTeacherPanel}</span>
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'levels'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>{t.tabLevels}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap relative ${
              activeTab === 'reviews'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>{t.tabReviews}</span>
            {progress.reviewSubmissions.filter(s => s.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>{t.tabAnalytics}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.tabStudents}</span>
            {studentList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px] text-emerald-300">
                {studentList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'cloud'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>{t.tabCloud}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{t.tabData}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: LEVEL & QUESTION MANAGEMENT */}
          {activeTab === 'levels' && (
            <div className="space-y-6">
              {/* Level Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">{t.levelLabel}:</span>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((lvl, idx) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setSelectedLevelId(lvl.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedLevelId === lvl.id
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {idx + 1}. {lvl.title[language]} {!lvl.isPublished && `(${t.draftBadge})`}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingLevel({
                      title: { kk: 'Жаңа деңгей', ru: 'Новый уровень' },
                      description: { kk: 'Деңгей сипаттамасы', ru: 'Описание уровня' },
                      worldTheme: 'forest',
                      isPublished: true,
                      rewardChestBonus: 50
                    });
                    setIsEditingLevelModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.createLevel}</span>
                </button>
              </div>

              {/* Current Level Metadata Card */}
              {currentLevel && (
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100">
                        {currentLevel.title[language]}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(currentLevel.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          currentLevel.isPublished
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {currentLevel.isPublished ? t.publishedBadge : t.draftBadge}
                      </button>

                      {/* World Theme Tag */}
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                        {WORLD_THEMES[currentLevel.worldTheme || 'forest']?.name[language]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {currentLevel.description[language]}
                    </p>
                    <p className="text-xs text-amber-400 font-semibold mt-1">
                      🎁 Chest Reward: +{currentLevel.rewardChestBonus} {t.pointsReward}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLevel(currentLevel);
                        setIsEditingLevelModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t.editLevel}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLevel(currentLevel.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.deleteLevel}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Questions List for this Level */}
              {currentLevel && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <span>{t.questionsList}</span>
                      <span className="text-xs font-normal text-slate-400">
                        ({currentLevel.questions.length} / 8-10)
                      </span>
                    </h4>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion({
                          levelId: currentLevel.id,
                          text: { kk: 'Жаңа сұрақ мәтіні', ru: 'Текст нового вопроса' },
                          difficulty: 'easy',
                          answerMode: 'typed',
                          checkingMode: 'auto',
                          correctAnswer: '10',
                          explanation: { kk: '', ru: '' }
                        });
                        setIsEditingQuestionModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addQuestion}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentLevel.questions.map((question, qIdx) => (
                      <div
                        key={question.id}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                            {qIdx + 1}
                          </span>

                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-100">
                              {question.text[language]}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                              <span
                                className={`px-2 py-0.5 rounded ${
                                  question.difficulty === 'easy'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : question.difficulty === 'medium'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {question.difficulty === 'easy'
                                  ? t.difficultyEasy
                                  : question.difficulty === 'medium'
                                  ? t.difficultyMedium
                                  : t.difficultyHard}
                              </span>
                              <span>·</span>
                              <span>
                                {question.answerMode === 'multiple_choice'
                                  ? t.typeMultipleChoice
                                  : t.typeTyped}
                              </span>
                              <span>·</span>
                              <span>
                                {question.checkingMode === 'manual'
                                  ? t.manualCheck
                                  : t.autoCheck}
                              </span>
                              <span>·</span>
                              <span className="text-emerald-400 font-mono">
                                Ans: {question.correctAnswer}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Question Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(qIdx, 'up')}
                            disabled={qIdx === 0}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                            title={t.moveUp}
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(qIdx, 'down')}
                            disabled={qIdx === currentLevel.questions.length - 1}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                            title={t.moveDown}
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestion(question);
                              setIsEditingQuestionModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                            title={t.editLevel}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 cursor-pointer"
                            title={t.deleteLevel}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEACHER REVIEW QUEUE */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">{t.pendingReviewsTitle}</h3>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                  {progress.reviewSubmissions.filter(s => s.status === 'pending').length} pending
                </span>
              </div>

              {progress.reviewSubmissions.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">{t.noPendingReviews}</p>
              ) : (
                <div className="space-y-4">
                  {progress.reviewSubmissions.map(submission => (
                    <div
                      key={submission.id}
                      className="p-5 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-200">
                          {submission.questionTitle[language]}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            submission.status === 'pending'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : submission.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {submission.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm">
                        <p className="text-xs text-slate-400 font-bold mb-1">
                          {t.studentAnswerLabel}
                        </p>
                        <p className="text-emerald-300 font-medium">
                          &quot;{submission.studentAnswer}&quot;
                        </p>
                      </div>

                      {/* Feedback input field for Teacher */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">
                          {t.feedbackPrompt}
                        </label>
                        <input
                          type="text"
                          value={
                            reviewFeedbackInput[submission.id] !== undefined
                              ? reviewFeedbackInput[submission.id]
                              : submission.teacherFeedback || ''
                          }
                          onChange={e =>
                            setReviewFeedbackInput(prev => ({
                              ...prev,
                              [submission.id]: e.target.value
                            }))
                          }
                          placeholder="Жарайсың! Немесе мына жерін түзет..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>

                      {/* Approval Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleApproveReview(submission)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.approveBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRequestCorrection(submission)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{t.requestCorrectionBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectReview(submission)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{t.rejectBtn}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDENT ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-100">{t.analyticsTitle}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold">{t.studentPoints}</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    {progress.points} {t.pointsLabel}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold">{t.questionsCompleted}</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    {progress.completedQuestionIds.length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold">{t.totalAttemptsLabel}</p>
                  <p className="text-2xl font-black text-cyan-400 mt-1">
                    {progress.totalAttempts}
                  </p>
                </div>
              </div>

              {/* Incorrect attempts breakdown */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.incorrectAttemptsBreakdown}
                </h4>

                {Object.keys(progress.incorrectAttemptsCount).length === 0 ? (
                  <p className="text-xs text-emerald-400 font-semibold">{t.noErrorsRecorded}</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(progress.incorrectAttemptsCount).map(([qId, count]) => (
                      <div
                        key={qId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                      >
                        <span className="font-mono text-slate-300">{qId}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                          {count} incorrect attempts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset Student Progress Button */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t.resetConfirm)) {
                      onResetProgress();
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 text-xs font-bold cursor-pointer transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.resetProgressBtn}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: STUDENTS MANAGEMENT */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Header Action Card */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>{t.studentListTitle}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                        {studentList.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'kk'
                        ? 'Оқушыларға жеке код пен құпия 4 таңбалы PIN тағайындаңыз. Нәтижелер автоматты сақталады.'
                        : 'Создавайте профили учеников и назначайте личные 4-значные PIN-коды для облачного сохранения.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={loadStudents}
                    disabled={isLoadingStudents}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    title="Жаңарту / Обновить"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingStudents ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStudentActionError('');
                      setStudentActionSuccess('');
                      setIsAddStudentOpen(true);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t.createStudentBtn}</span>
                  </button>
                </div>
              </div>

              {/* Action Notification Messages */}
              {studentActionSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2 text-xs font-semibold text-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{studentActionSuccess}</span>
                </div>
              )}

              {studentActionError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center gap-2 text-xs font-semibold text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{studentActionError}</span>
                </div>
              )}

              {/* Student Cards Grid */}
              {isLoadingStudents ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  <span className="text-xs font-medium">
                    {language === 'kk' ? 'Оқушылар тізімі жүктелуде...' : 'Загрузка списка учеников...'}
                  </span>
                </div>
              ) : studentList.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-950/40 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-300">{t.noStudentsYet}</p>
                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t.createStudentBtn}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentList.map(st => (
                    <div
                      key={st.student_id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 shadow-md"
                    >
                      <div className="space-y-2">
                        {/* Top: Name & Code */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-extrabold text-white leading-tight">
                              {st.display_name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-emerald-400 font-bold">
                                {st.student_code}
                              </span>
                            </div>
                          </div>

                          {/* Security Status Badge */}
                          {st.is_locked ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                              <ShieldAlert className="w-3 h-3 text-rose-400" />
                              <span>{language === 'kk' ? 'Бұғатталған' : 'Заблокирован'}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>{language === 'kk' ? 'Белсенді' : 'Активен'}</span>
                            </span>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">{t.studentPoints}</span>
                            <span className="text-sm font-extrabold text-amber-300">
                              {st.points || 0}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">{t.studentLevels}</span>
                            <span className="text-sm font-extrabold text-emerald-300">
                              {st.completed_levels_count || 0}
                            </span>
                          </div>
                        </div>

                        {/* Activity */}
                        {st.last_active_at && (
                          <p className="text-[10px] text-slate-500">
                            {t.studentLastActive}: {new Date(st.last_active_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentActionError('');
                            setStudentActionSuccess('');
                            setResetPinModalStudent(st);
                            setResetNewPin('');
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t.resetPinBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteStudentClick(st)}
                          className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-xs font-semibold cursor-pointer transition-colors"
                          title={t.deleteStudentBtn}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUPABASE CLOUD SAVE CONFIGURATION & MIGRATION */}
          {activeTab === 'cloud' && (
            <div className="space-y-6">
              {/* Cloud Status Card */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-md ${
                      isSupabaseConfigured()
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      {isSupabaseConfigured() ? t.cloudConnected : t.cloudUnconfigured}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isSupabaseConfigured()
                        ? 'Real-time cloud database persistence with Row Level Security (RLS).'
                        : 'Currently using browser LocalStorage. Configure Supabase credentials below to enable cloud save.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={handleTestCloudConnection}
                    disabled={isTestingCloud}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTestingCloud ? 'animate-spin' : ''}`} />
                    <span>{t.testConnectionBtn}</span>
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {cloudMessage.text && (
                <div
                  className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-3 ${
                    cloudMessage.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                  }`}
                >
                  {cloudMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <span>{cloudMessage.text}</span>
                </div>
              )}

              {/* Credentials Form */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-100">
                  Supabase Credentials (VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY)
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400">Supabase Project URL</label>
                    <input
                      type="text"
                      value={supabaseUrlInput}
                      onChange={e => setSupabaseUrlInput(e.target.value)}
                      placeholder="https://your-project.supabase.co"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">
                      Supabase Anon / Publishable Key
                    </label>
                    <input
                      type="password"
                      value={supabaseKeyInput}
                      onChange={e => setSupabaseKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-slate-500">
                      Saved safely in your browser session. Never exposes service-role keys.
                    </p>
                    <button
                      type="button"
                      onClick={handleSaveCloudCredentials}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>

              {/* Sync Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Push to Cloud */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{t.syncToCloudBtn}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Выгружает все текущие уровни, вопросы, прогресс и отправленные ответы в Supabase.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncToCloud}
                    disabled={isSyncing || !isSupabaseConfigured()}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-colors"
                  >
                    <CloudCheck className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Upload to Cloud</span>
                  </button>
                </div>

                {/* Pull from Cloud */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{t.pullFromCloudBtn}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Загружает последние уровни и прогресс из облака Supabase.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePullFromCloud}
                    disabled={isSyncing || !isSupabaseConfigured()}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <Download className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Pull from Cloud</span>
                  </button>
                </div>
              </div>

              {/* SQL Migration Viewer */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{t.sqlMigrationTitle}</h4>
                    <p className="text-xs text-slate-400">
                      Скопируйте и выполните этот скрипт в разделе <b>SQL Editor</b> вашей панели Supabase для создания всех таблиц и политик RLS.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(migrationSql);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSql ? t.copied : t.copySqlBtn}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-900 text-[11px] font-mono text-emerald-400/90 max-h-48 overflow-y-auto border border-slate-800">
                  {migrationSql}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: DATA & BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200">
                <p className="font-bold">{t.backupTitle}</p>
                <p className="mt-1">{t.backupNotice}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{t.exportBtn}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Сохраняет все уровни, созданные вопросы, прогресс и настройки в JSON файл.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.exportBtn}</span>
                  </button>
                </div>

                {/* Import */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{t.importBtn}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Восстанавливает уровни и прогресс из сохранённого файла.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportJSON}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t.importBtn}</span>
                  </button>
                </div>
              </div>

              {/* Reset Everything to default */}
              <div className="pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t.resetDefaultConfirm)) {
                      onResetAllDefault();
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-xs font-bold cursor-pointer transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.resetAllToDefaultBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT LEVEL MODAL WITH WORLD THEME SELECTION */}
      {isEditingLevelModalOpen && editingLevel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              {editingLevel.id ? t.editLevel : t.createLevel}
            </h3>

            <form onSubmit={handleSaveLevel} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400">{t.levelTitleKk}</label>
                <input
                  type="text"
                  required
                  value={editingLevel.title?.kk || ''}
                  onChange={e =>
                    setEditingLevel(prev => ({
                      ...prev,
                      title: { ...(prev?.title as any), kk: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">{t.levelTitleRu}</label>
                <input
                  type="text"
                  required
                  value={editingLevel.title?.ru || ''}
                  onChange={e =>
                    setEditingLevel(prev => ({
                      ...prev,
                      title: { ...(prev?.title as any), ru: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              {/* WORLD THEME SELECTION */}
              <div>
                <label className="text-xs font-bold text-slate-400">{t.worldThemeLabel}</label>
                <select
                  value={editingLevel.worldTheme || 'forest'}
                  onChange={e =>
                    setEditingLevel(prev => ({
                      ...prev,
                      worldTheme: e.target.value as WorldTheme
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold"
                >
                  <option value="forest">🌲 {WORLD_THEMES.forest.name[language]}</option>
                  <option value="crystal_caves">💎 {WORLD_THEMES.crystal_caves.name[language]}</option>
                  <option value="ice_kingdom">❄️ {WORLD_THEMES.ice_kingdom.name[language]}</option>
                  <option value="desert">🏜️ {WORLD_THEMES.desert.name[language]}</option>
                  <option value="sky_islands">☁️ {WORLD_THEMES.sky_islands.name[language]}</option>
                  <option value="dragon_valley">🌋 {WORLD_THEMES.dragon_valley.name[language]}</option>
                  <option value="ancient_temple">🏛️ {WORLD_THEMES.ancient_temple.name[language]}</option>
                  <option value="magic_castle">🏰 {WORLD_THEMES.magic_castle.name[language]}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">{t.levelDescKk}</label>
                <textarea
                  rows={2}
                  value={editingLevel.description?.kk || ''}
                  onChange={e =>
                    setEditingLevel(prev => ({
                      ...prev,
                      description: { ...(prev?.description as any), kk: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">{t.levelDescRu}</label>
                <textarea
                  rows={2}
                  value={editingLevel.description?.ru || ''}
                  onChange={e =>
                    setEditingLevel(prev => ({
                      ...prev,
                      description: { ...(prev?.description as any), ru: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-bold text-slate-400">Published Status</label>
                <input
                  type="checkbox"
                  checked={editingLevel.isPublished ?? true}
                  onChange={e =>
                    setEditingLevel(prev => ({
                      ...prev,
                      isPublished: e.target.checked
                    }))
                  }
                  className="w-4 h-4 rounded text-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingLevelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {isEditingQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85">
          <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-100">
              {editingQuestion.id ? t.editLevel : t.addQuestion}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400">{t.questionTextKk}</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.text?.kk || ''}
                  onChange={e =>
                    setEditingQuestion(prev => ({
                      ...prev,
                      text: { ...(prev?.text as any), kk: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">{t.questionTextRu}</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.text?.ru || ''}
                  onChange={e =>
                    setEditingQuestion(prev => ({
                      ...prev,
                      text: { ...(prev?.text as any), ru: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              {/* Upload image optional */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">{t.questionImage}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={questionImageInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => questionImageInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t.uploadImage}</span>
                  </button>
                  {editingQuestion.image && (
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(prev => ({ ...prev, image: undefined }))}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 text-rose-300 text-xs font-bold"
                    >
                      {t.removeImage}
                    </button>
                  )}
                </div>
                {editingQuestion.image && (
                  <img
                    src={editingQuestion.image}
                    alt="Question preview"
                    className="max-h-36 rounded-xl border border-slate-700 object-contain"
                  />
                )}
              </div>

              {/* Difficulty & Type & Check Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400">{t.difficultyLabel}</label>
                  <select
                    value={editingQuestion.difficulty || 'easy'}
                    onChange={e =>
                      setEditingQuestion(prev => ({
                        ...prev,
                        difficulty: e.target.value as Difficulty
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="easy">{t.difficultyEasy} (10 pts)</option>
                    <option value="medium">{t.difficultyMedium} (20 pts)</option>
                    <option value="hard">{t.difficultyHard} (30 pts)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">{t.answerTypeLabel}</label>
                  <select
                    value={editingQuestion.answerMode || 'typed'}
                    onChange={e =>
                      setEditingQuestion(prev => ({
                        ...prev,
                        answerMode: e.target.value as AnswerMode
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="typed">{t.typeTyped}</option>
                    <option value="multiple_choice">{t.typeMultipleChoice}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">{t.checkTypeLabel}</label>
                  <select
                    value={editingQuestion.checkingMode || 'auto'}
                    onChange={e =>
                      setEditingQuestion(prev => ({
                        ...prev,
                        checkingMode: e.target.value as CheckingMode
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="auto">{t.autoCheck}</option>
                    <option value="manual">{t.manualCheck}</option>
                  </select>
                </div>
              </div>

              {/* Multiple Choice Options if active */}
              {editingQuestion.answerMode === 'multiple_choice' && (
                <div>
                  <label className="text-xs font-bold text-slate-400">
                    {t.optionsLabel} (через запятую)
                  </label>
                  <input
                    type="text"
                    value={(editingQuestion.options || []).join(', ')}
                    onChange={e =>
                      setEditingQuestion(prev => ({
                        ...prev,
                        options: e.target.value.split(',').map(s => s.trim())
                      }))
                    }
                    placeholder="Например: 12, 14, 16, 18"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
              )}

              {/* Correct Answer */}
              <div>
                <label className="text-xs font-bold text-slate-400">{t.correctAnswerLabel}</label>
                <input
                  type="text"
                  required
                  value={editingQuestion.correctAnswer || ''}
                  onChange={e =>
                    setEditingQuestion(prev => ({
                      ...prev,
                      correctAnswer: e.target.value
                    }))
                  }
                  placeholder="Точный правильный ответ"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
                />
              </div>

              {/* Teacher Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400">
                    {t.questionExplanationKk}
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.explanation?.kk || ''}
                    onChange={e =>
                      setEditingQuestion(prev => ({
                        ...prev,
                        explanation: { ...(prev?.explanation as any), kk: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">
                    {t.questionExplanationRu}
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.explanation?.ru || ''}
                    onChange={e =>
                      setEditingQuestion(prev => ({
                        ...prev,
                        explanation: { ...(prev?.explanation as any), ru: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">{t.createStudentBtn}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {t.studentCode} (Логин коды / Код для входа)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. HERO-01, ASKAR-26"
                  value={newStudentCode}
                  onChange={e => setNewStudentCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-emerald-300 placeholder-slate-500 uppercase tracking-wider"
                />
                <p className="text-[10px] text-slate-500">
                  {language === 'kk'
                    ? 'Оқушы осы код арқылы ойынға кіреді (бірегей болуы тиіс).'
                    : 'Ученик будет использовать этот код для входа (должен быть уникальным).'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {t.studentName} (Аты-жөні / ФИО)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Алихан Сәрсен"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white placeholder-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {t.studentPinLabel} (4 таңбалы PIN)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={newStudentPin}
                  onChange={e => setNewStudentPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono tracking-widest text-amber-300 placeholder-slate-500 text-center"
                />
                <p className="text-[10px] text-slate-500">
                  {language === 'kk'
                    ? 'Бұл PIN базада шифрланып (hash) сақталады.'
                    : 'PIN надёжно хешируется в базе данных и никогда не хранится открыто.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={!newStudentCode.trim() || !newStudentName.trim() || newStudentPin.length < 4}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow cursor-pointer transition-colors"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PIN MODAL */}
      {resetPinModalStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">{t.resetPinBtn}</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPinModalStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 block">{t.studentName}:</span>
              <span className="font-bold text-white">{resetPinModalStudent.display_name}</span>
              <span className="text-xs text-emerald-400 font-mono ml-2">({resetPinModalStudent.student_code})</span>
            </div>

            <form onSubmit={handleResetPinSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {t.newPinPrompt}
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••"
                  value={resetNewPin}
                  onChange={e => setResetNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono tracking-widest text-amber-300 placeholder-slate-500 text-center"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPinModalStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={resetNewPin.length < 4}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs shadow cursor-pointer transition-colors"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
