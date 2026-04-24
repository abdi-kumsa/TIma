-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Create the `profiles` table (IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT UNIQUE,
  full_name   TEXT DEFAULT '',
  avatar_url  TEXT DEFAULT '',
  dark_mode   BOOLEAN DEFAULT FALSE,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create the `tasks` table and check columns
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
);

DO $$
BEGIN
  -- Ensure all required columns exist in `tasks`
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'description') THEN
    ALTER TABLE public.tasks ADD COLUMN description TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'date') THEN
    ALTER TABLE public.tasks ADD COLUMN date TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time') THEN
    ALTER TABLE public.tasks ADD COLUMN time TEXT DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'priority') THEN
    ALTER TABLE public.tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'not-important-not-urgent';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed') THEN
    ALTER TABLE public.tasks ADD COLUMN completed BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'archived') THEN
    ALTER TABLE public.tasks ADD COLUMN archived BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'recurring') THEN
    ALTER TABLE public.tasks ADD COLUMN recurring TEXT DEFAULT 'none';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'tags') THEN
    ALTER TABLE public.tasks ADD COLUMN tags JSONB DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'subtasks') THEN
    ALTER TABLE public.tasks ADD COLUMN subtasks JSONB DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'user_id') THEN
    ALTER TABLE public.tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_at') THEN
    ALTER TABLE public.tasks ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Automate Profile Creation (Trigger)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Create indexes (IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_user_id  ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date     ON public.tasks (date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks (priority);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Enable Row Level Security & Realtime
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tasks"   ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks"  ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks"  ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks"  ON public.tasks;

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime safely
DO $$
BEGIN
  -- Add tasks table to realtime if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;

  -- Add profiles table to realtime if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Grant access
-- ─────────────────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Statistics View (Optional helper)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.user_task_stats AS
SELECT 
    user_id,
    priority,
    count(*) as total_tasks,
    count(*) FILTER (WHERE completed = true) as completed_tasks,
    count(*) FILTER (WHERE completed = false AND (date::date) < CURRENT_DATE) as overdue_tasks
FROM public.tasks
GROUP BY user_id, priority;

GRANT SELECT ON public.user_task_stats TO authenticated;

-- Done!
SELECT 'Database setup/fix complete' as status;

