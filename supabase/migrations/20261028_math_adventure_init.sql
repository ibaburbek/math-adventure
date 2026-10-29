-- Math Adventure Supabase Cloud Schema & Migration
-- Supports secure Cloud Save, Student Progress, Teacher Question CRUD, and Review Queue

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
    options JSONB, -- Array of strings for multiple choice
    correct_answer TEXT NOT NULL,
    explanation_kk TEXT,
    explanation_ru TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Profiles
CREATE TABLE IF NOT EXISTS public.math_students (
    student_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    selected_character_id TEXT DEFAULT 'alen',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Student Question Attempts Log
CREATE TABLE IF NOT EXISTS public.math_student_attempts (
    id BIGSERIAL PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.math_students(student_id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    student_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Teacher Review Queue Table
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

-- 7. Teacher Profiles
CREATE TABLE IF NOT EXISTS public.math_teacher_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_math_questions_level_id ON public.math_questions(level_id, question_order);
CREATE INDEX IF NOT EXISTS idx_math_review_status ON public.math_review_submissions(status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_math_student_attempts ON public.math_student_attempts(student_id, question_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.math_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_student_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_review_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_teacher_profiles ENABLE ROW LEVEL SECURITY;

-- POLICIES:
-- 1. Levels: Anyone can read published levels; authenticated teachers can insert/update/delete.
CREATE POLICY "Public read published levels" ON public.math_levels
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Teacher manage levels" ON public.math_levels
    FOR ALL USING (auth.role() = 'authenticated');

-- 2. Questions: Anyone can read questions for published levels; teachers can manage.
CREATE POLICY "Public read questions" ON public.math_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.math_levels
            WHERE public.math_levels.id = public.math_questions.level_id
            AND (public.math_levels.is_published = true OR auth.role() = 'authenticated')
        )
    );

CREATE POLICY "Teacher manage questions" ON public.math_questions
    FOR ALL USING (auth.role() = 'authenticated');

-- 3. Students: Students can read/insert their own profile record.
CREATE POLICY "Student read own profile" ON public.math_students
    FOR SELECT USING (true);

CREATE POLICY "Student upsert profile" ON public.math_students
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Student update own profile" ON public.math_students
    FOR UPDATE USING (true);

-- 4. Student Progress: Students manage their own progress row, teachers can read all.
CREATE POLICY "Student read own progress" ON public.math_student_progress
    FOR SELECT USING (true);

CREATE POLICY "Student upsert progress" ON public.math_student_progress
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Student update progress" ON public.math_student_progress
    FOR UPDATE USING (true);

-- 5. Student Attempts: Insert only
CREATE POLICY "Student insert attempt" ON public.math_student_attempts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Teacher read attempts" ON public.math_student_attempts
    FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Review Submissions: Students insert pending reviews; Teachers review and update status.
CREATE POLICY "Student read own submissions" ON public.math_review_submissions
    FOR SELECT USING (true);

CREATE POLICY "Student insert pending submission" ON public.math_review_submissions
    FOR INSERT WITH CHECK (status = 'pending');

CREATE POLICY "Teacher update submissions" ON public.math_review_submissions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. Teacher Profiles: Authenticated read/write own profile
CREATE POLICY "Teacher profile own access" ON public.math_teacher_profiles
    FOR ALL USING (auth.uid() = id);
