-- ============================================================
-- StudyLa — Supabase Database Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. USER PROFILES (parent accounts — extend Supabase auth)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHILDREN (profil anak di bawah parent)
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  year INTEGER CHECK (year BETWEEN 1 AND 5) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUESTIONS BANK (soalan pre-generated + AI)
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL CHECK (subject IN ('matematik', 'bahasa-melayu', 'bahasa-inggeris', 'sains')),
  year INTEGER CHECK (year BETWEEN 1 AND 5) NOT NULL,
  topic TEXT NOT NULL,
  layer INTEGER CHECK (layer IN (1, 2, 3)) NOT NULL,
  question_text TEXT NOT NULL,
  question_breakdown JSONB,   -- array: soalan pemecah utk layer 1
  parent_script TEXT,         -- apa parent kena cakap
  answer TEXT,
  answer_steps JSONB,         -- array: langkah-langkah jawapan
  explanation TEXT,
  source TEXT DEFAULT 'pre-generated' CHECK (source IN ('pre-generated', 'ai-realtime', 'past-exam')),
  difficulty TEXT DEFAULT 'standard' CHECK (difficulty IN ('standard', 'kbat')),
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SESSIONS (satu sesi belajar)
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES user_profiles(id) NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  year INTEGER NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SESSION QUESTION RESULTS (hasil per soalan dalam sesi)
CREATE TABLE session_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id),
  layer_reached INTEGER,       -- layer mana anak sampai
  stuck_at_layer INTEGER,      -- layer mana anak stuck (null = tak stuck)
  attempts INTEGER DEFAULT 1,
  correct BOOLEAN,
  time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TOPIC PROGRESS (status per topik per anak)
CREATE TABLE topic_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (
    status IN ('mastered', 'progressing', 'struggling', 'not_started', 'backtrack_needed')
  ),
  sessions_count INTEGER DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, subject, topic)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;

-- user_profiles: parent hanya nampak profil sendiri
CREATE POLICY "user_profiles_own" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- children: parent hanya nampak anak sendiri
CREATE POLICY "children_own" ON children
  FOR ALL USING (auth.uid() = parent_id);

-- questions: semua authenticated user boleh baca
CREATE POLICY "questions_read" ON questions
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_approved = true);

-- sessions: parent hanya nampak session sendiri
CREATE POLICY "sessions_own" ON sessions
  FOR ALL USING (auth.uid() = parent_id);

-- session_questions: parent nampak results dari session sendiri
CREATE POLICY "session_questions_own" ON session_questions
  FOR ALL USING (
    session_id IN (
      SELECT id FROM sessions WHERE parent_id = auth.uid()
    )
  );

-- topic_progress: parent nampak progress anak sendiri
CREATE POLICY "topic_progress_own" ON topic_progress
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SAMPLE DATA — soalan contoh untuk test (Matematik T3)
-- ============================================================

INSERT INTO questions (subject, year, topic, layer, question_text, question_breakdown, parent_script, answer, answer_steps, difficulty) VALUES
(
  'matematik', 3, 'pecahan-t3', 1,
  'Ain ada ¾ meter reben. Dia guna ⅜ meter untuk hiasan. Berapa meter reben yang tinggal?',
  '["Soalan ni cakap tentang apa?", "Ain ada berapa?", "Dia guna berapa?", "Soalan tanya apa?", "Kalau nak tahu yang tinggal, kita kena...?"]',
  'Jom kita baca soalan sama-sama. Cuba cerita balik — soalan ni pasal apa?',
  '3/8 meter',
  '["Tengok penyebut: ¾ dan ⅜ — tak sama", "KPK 4 dan 8 = 8", "Tukar: ¾ = 6/8", "6/8 - 3/8 = 3/8"]',
  'standard'
),
(
  'matematik', 3, 'pecahan-t3', 2,
  'Ain ada ¾ meter reben. Dia guna ⅜ meter untuk hiasan. Berapa meter reben yang tinggal?',
  '["Penyebut ¾ dan ⅜ sama ke?", "KPK 4 dan 8 ialah?", "Tukar ¾ kepada penyebut 8?", "6/8 tolak 3/8 = ?"]',
  'Cuba tengok dua nombor bawah ni (penyebut). Sama ke? Apa kita kena buat dulu kalau tak sama?',
  '3/8 meter',
  '["Penyebut tak sama", "KPK = 8", "¾ = 6/8", "6/8 - 3/8 = 3/8"]',
  'standard'
),
(
  'matematik', 3, 'pecahan-t3', 3,
  'Ain ada ¾ meter reben. Dia guna ⅜ meter untuk hiasan. Berapa meter reben yang tinggal?',
  '[]',
  'Ok, cuba tulis jalan kerja macam yang kita bincang tadi. Tak apa kalau salah — kita tengok sama-sama.',
  '3/8 meter',
  '["¾ - ⅜", "= 6/8 - 3/8", "= 3/8 meter"]',
  'standard'
);
