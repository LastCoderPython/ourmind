-- =========================================================================
-- Manas Backend Supabase SQL Schema
-- Run this in your Supabase SQL Editor to initialize all necessary tables.
-- =========================================================================

-- 1. Chat Messages Table
-- Relates to routers/chat_router.py
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Ties to auth.users if Supabase Auth is strictly enforced
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Mood Logs Table
-- Relates to routers/mood_router.py
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    emotion TEXT NOT NULL,
    intensity FLOAT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Gamification Tasks Table
-- Relates to routers/task_router.py
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Zen Garden Table
-- Relates to routers/garden_router.py
CREATE TABLE IF NOT EXISTS public.gardens (
    user_id UUID PRIMARY KEY,
    plant_stage INTEGER DEFAULT 1,
    water_level INTEGER DEFAULT 50,
    sunlight_level INTEGER DEFAULT 50,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Community Posts Table
-- Relates to routers/community_router.py
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    username TEXT DEFAULT 'Anonymous',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Community Reactions Table
-- Relates to routers/community_router.py
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('support', 'relate', 'proud')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(post_id, user_id, reaction_type) -- Prevent same user applying same reaction type multiple times
);

-- =========================================================================
-- OPTIONAL: Turn off Row Level Security (RLS) for Hackathon Speed
-- If you want the frontend/backend to read and write without strict Policies,
-- disable RLS on these tables as follows:
-- =========================================================================

ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions DISABLE ROW LEVEL SECURITY;

-- Note: In a production app, you would leave RLS enabled and create specific
-- permissive policies like:
-- CREATE POLICY "Users can only see their own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
