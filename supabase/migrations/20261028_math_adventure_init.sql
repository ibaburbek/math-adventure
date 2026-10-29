-- ==============================================================================
-- MATH ADVENTURE — OFFICIAL SUPABASE SCHEMA MIGRATION & STUDENT AUTH
-- Supports:
-- 1. Levels & Questions Management
-- 2. Student Authentication with Unique Student Code & Bcrypt-hashed PINs
-- 3. Rate-Limiting Protection (5 failed attempts locks for 5 minutes)
-- 4. Server-Side RPC Functions for Login, Student Creation & PIN Reset
-- 5. Progress & Review Queue Synchronization
-- ==============================================================================

-- Enable pgcrypto for industry-standard bcrypt PIN hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Levels Table
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

-- Ensure columns exist if table was partially created
ALTER TABLE public.math_levels ADD COLUMN IF NOT EXISTS world_theme TEXT DEFAULT 'forest';
ALTER TABLE public.math_levels ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE public.math_levels ADD COLUMN IF NOT EXISTS reward_chest_bonus INT DEFAULT 50;
ALTER TABLE public.math_levels ADD COLUMN IF NOT EXISTS reward_item TEXT;
ALTER TABLE public.math_levels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS public.math_questions (
    id TEXT PRIMARY KEY,
    level_id TEXT NOT NULL REFERENCES public.math_levels(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    text_kk TEXT NOT NULL,
    text_ru TEXT NOT NULL,
    image_url TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    answer_mode TEXT NOT NULL CHECK (answer_mode IN ('typed', 'multiple_choice')),
    checking_mode TEXT NOT NULL CHECK (checking_mode IN ('auto', 'manual')),
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation_kk TEXT,
    explanation_ru TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Profiles (with unique student_code, pin_hash & rate limiting)
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

-- Ensure student columns exist if table already exists
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS student_code TEXT;
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0;
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE public.math_students ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS idx_math_students_code ON public.math_students(lower(student_code));

-- 4. Student Progress Table
CREATE TABLE IF NOT EXISTS public.math_student_progress (
    student_id TEXT PRIMARY KEY REFERENCES public.math_students(student_id) ON DELETE CASCADE,
    points INT DEFAULT 0 CHECK (points >= 0),
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Teacher Review Queue Table
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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_correction')),
    teacher_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_math_levels_order ON public.math_levels(level_order ASC);
CREATE INDEX IF NOT EXISTS idx_math_questions_level_order ON public.math_questions(level_id, question_order ASC);
CREATE INDEX IF NOT EXISTS idx_math_review_submissions_date ON public.math_review_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_math_review_submissions_student ON public.math_review_submissions(student_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.math_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_review_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read levels" ON public.math_levels;
DROP POLICY IF EXISTS "Public upsert levels" ON public.math_levels;
DROP POLICY IF EXISTS "Public read questions" ON public.math_questions;
DROP POLICY IF EXISTS "Public upsert questions" ON public.math_questions;
DROP POLICY IF EXISTS "Public read students" ON public.math_students;
DROP POLICY IF EXISTS "Public upsert students" ON public.math_students;
DROP POLICY IF EXISTS "Public read progress" ON public.math_student_progress;
DROP POLICY IF EXISTS "Public upsert progress" ON public.math_student_progress;
DROP POLICY IF EXISTS "Public read reviews" ON public.math_review_submissions;
DROP POLICY IF EXISTS "Public submit reviews" ON public.math_review_submissions;
DROP POLICY IF EXISTS "Public update reviews" ON public.math_review_submissions;

CREATE POLICY "Public read levels" ON public.math_levels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public upsert levels" ON public.math_levels FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read questions" ON public.math_questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public upsert questions" ON public.math_questions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read students" ON public.math_students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public upsert students" ON public.math_students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read progress" ON public.math_student_progress FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public upsert progress" ON public.math_student_progress FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read reviews" ON public.math_review_submissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public submit reviews" ON public.math_review_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update reviews" ON public.math_review_submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- SECURE SERVER-SIDE RPC FUNCTIONS
-- ==============================================================================

-- 1. Student Login (Server-side PIN verification & Rate-Limiting)
CREATE OR REPLACE FUNCTION public.student_login(
    p_identifier TEXT,
    p_pin TEXT
)
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

    SELECT * INTO v_student
    FROM public.math_students
    WHERE lower(student_code) = v_cleaned_id
       OR lower(trim(display_name)) = v_cleaned_id
    LIMIT 1;

    IF v_student IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'STUDENT_NOT_FOUND',
            'message', 'Student account not found. Please check your student code.'
        );
    END IF;

    -- Check if locked due to failed attempts
    IF v_student.locked_until IS NOT NULL AND v_student.locked_until > NOW() THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ACCOUNT_LOCKED',
            'message', 'Account is temporarily locked. Please wait 5 minutes or ask your teacher to reset your PIN.',
            'locked_until', v_student.locked_until
        );
    END IF;

    IF v_student.pin_hash IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'NO_PIN_SET',
            'message', 'No PIN set for this student. Please ask your teacher to assign a PIN.'
        );
    END IF;

    v_pin_match := (v_student.pin_hash = crypt(p_pin, v_student.pin_hash));

    IF NOT v_pin_match THEN
        UPDATE public.math_students
        SET failed_attempts = COALESCE(failed_attempts, 0) + 1,
            locked_until = CASE
                WHEN COALESCE(failed_attempts, 0) + 1 >= 5 THEN NOW() + INTERVAL '5 minutes'
                ELSE NULL
            END
        WHERE student_id = v_student.student_id;

        RETURN jsonb_build_object(
            'success', false,
            'code', 'INVALID_PIN',
            'message', 'Incorrect PIN.',
            'remaining_attempts', GREATEST(0, 5 - (COALESCE(v_student.failed_attempts, 0) + 1))
        );
    END IF;

    -- Login success: reset failed attempts
    UPDATE public.math_students
    SET failed_attempts = 0,
        locked_until = NULL,
        last_login_at = NOW(),
        last_active_at = NOW()
    WHERE student_id = v_student.student_id;

    -- Load or initialize progress
    SELECT * INTO v_progress
    FROM public.math_student_progress
    WHERE student_id = v_student.student_id;

    IF v_progress IS NULL THEN
        INSERT INTO public.math_student_progress (
            student_id, points, current_level_id, updated_at
        ) VALUES (
            v_student.student_id, 0, 'lvl_1_arithmetic', NOW()
        )
        RETURNING * INTO v_progress;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'student', jsonb_build_object(
            'student_id', v_student.student_id,
            'student_code', v_student.student_code,
            'display_name', v_student.display_name,
            'selected_character_id', v_student.selected_character_id
        ),
        'progress', jsonb_build_object(
            'studentId', v_progress.student_id,
            'studentCode', v_student.student_code,
            'studentName', v_student.display_name,
            'points', v_progress.points,
            'completedQuestionIds', v_progress.completed_question_ids,
            'completedLevelIds', v_progress.completed_level_ids,
            'openedChestLevelIds', v_progress.opened_chest_level_ids,
            'unlockedCharacters', v_progress.unlocked_characters,
            'ownedItems', v_progress.owned_items,
            'equippedHat', v_progress.equipped_hat,
            'equippedClothing', v_progress.equipped_clothing,
            'equippedAccessory', v_progress.equipped_accessory,
            'currentLevelId', v_progress.current_level_id,
            'totalAttempts', v_progress.total_attempts,
            'incorrectAttemptsCount', v_progress.incorrect_attempts_breakdown,
            'hasFinishedFirstSetup', v_progress.has_finished_setup
        )
    );
END;
$$;

-- 2. Teacher Create Student (Hashed PIN, unique student code)
CREATE OR REPLACE FUNCTION public.teacher_create_student(
    p_student_code TEXT,
    p_display_name TEXT,
    p_pin TEXT,
    p_initial_character TEXT DEFAULT 'alen'
)
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

    INSERT INTO public.math_students (
        student_id, student_code, display_name, selected_character_id, pin_hash, created_at, last_active_at
    ) VALUES (
        v_student_id, v_clean_code, trim(p_display_name), p_initial_character, v_hashed_pin, NOW(), NOW()
    );

    INSERT INTO public.math_student_progress (
        student_id, points, current_level_id, updated_at
    ) VALUES (
        v_student_id, 0, 'lvl_1_arithmetic', NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'student', jsonb_build_object(
            'student_id', v_student_id,
            'student_code', v_clean_code,
            'display_name', trim(p_display_name),
            'selected_character_id', p_initial_character
        )
    );
END;
$$;

-- 3. Teacher Reset Student PIN
CREATE OR REPLACE FUNCTION public.teacher_reset_student_pin(
    p_student_id TEXT,
    p_new_pin TEXT
)
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
    SET pin_hash = crypt(trim(p_new_pin), gen_salt('bf', 8)),
        failed_attempts = 0,
        locked_until = NULL,
        last_active_at = NOW()
    WHERE student_id = p_student_id;

    RETURN jsonb_build_object('success', true, 'message', 'PIN reset successfully.');
END;
$$;

-- 4. Teacher List Students (pin_hash is NEVER exposed)
CREATE OR REPLACE FUNCTION public.teacher_get_students()
RETURNS TABLE (
    student_id TEXT,
    student_code TEXT,
    display_name TEXT,
    selected_character_id TEXT,
    points INT,
    completed_levels_count INT,
    completed_questions_count INT,
    last_active_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    failed_attempts INT,
    is_locked BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        s.student_id,
        s.student_code,
        s.display_name,
        s.selected_character_id,
        COALESCE(p.points, 0) AS points,
        COALESCE(cardinality(p.completed_level_ids), 0) AS completed_levels_count,
        COALESCE(cardinality(p.completed_question_ids), 0) AS completed_questions_count,
        s.last_active_at,
        s.last_login_at,
        COALESCE(s.failed_attempts, 0) AS failed_attempts,
        (s.locked_until IS NOT NULL AND s.locked_until > NOW()) AS is_locked
    FROM public.math_students s
    LEFT JOIN public.math_student_progress p ON p.student_id = s.student_id
    ORDER BY s.display_name ASC;
$$;

-- 5. Teacher Delete Student
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

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
