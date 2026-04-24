-- ============================================================================
-- TIma — Supabase Database Setup
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Enable required extensions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create the `tasks` table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  date        TEXT NOT NULL,                          -- ISO date string (e.g. "2026-04-23")
  time        TEXT DEFAULT NULL,                      -- Optional time in HH:mm format
  priority    TEXT NOT NULL CHECK (priority IN (
                'important-urgent',
                'important-not-urgent',
                'not-important-urgent',
                'not-important-not-urgent'
              )),
  completed   BOOLEAN DEFAULT FALSE,
  archived    BOOLEAN DEFAULT FALSE,
  recurring   TEXT DEFAULT 'none' CHECK (recurring IN ('none', 'daily', 'weekly', 'monthly')),
  tags        JSONB DEFAULT NULL,                     -- JSON array of strings, e.g. ["work","personal"]
  subtasks    JSONB DEFAULT NULL,                     -- JSON array of {id, title, completed}
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Create indexes for performance
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_user_id   ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date      ON public.tasks (date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority  ON public.tasks (priority);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Enable Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT tasks for themselves
CREATE POLICY "Users can insert own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own tasks
CREATE POLICY "Users can update own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own tasks
CREATE POLICY "Users can delete own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Enable Realtime for the tasks table
--    (This powers live sync across devices in TaskContext.tsx)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Grant access to authenticated users (required for RLS to work properly)
-- ─────────────────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.tasks TO authenticated;

-- ============================================================================
-- ✅ Done! Your database is now fully configured for TIma.
-- ============================================================================
