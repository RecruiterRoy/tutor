-- Create tables for subject management system

-- User Subjects Table
CREATE TABLE IF NOT EXISTS public.user_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, subject_name)
);

-- Subject Chat History Table
CREATE TABLE IF NOT EXISTS public.subject_chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'ai')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add current_subject column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS current_subject VARCHAR(100);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subjects
CREATE POLICY "Users can view own subjects" ON public.user_subjects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjects" ON public.user_subjects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects" ON public.user_subjects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects" ON public.user_subjects
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for subject_chat_history
CREATE POLICY "Users can view own chat history" ON public.subject_chat_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON public.subject_chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat history" ON public.subject_chat_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history" ON public.subject_chat_history
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_subjects TO authenticated;
GRANT ALL ON public.subject_chat_history TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subjects_user_id ON public.user_subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subjects_subject_name ON public.user_subjects(subject_name);
CREATE INDEX IF NOT EXISTS idx_subject_chat_history_user_id ON public.subject_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subject_chat_history_subject ON public.subject_chat_history(subject);
CREATE INDEX IF NOT EXISTS idx_subject_chat_history_created_at ON public.subject_chat_history(created_at);

-- Add comments
COMMENT ON TABLE public.user_subjects IS 'Stores user selected subjects and their progress';
COMMENT ON TABLE public.subject_chat_history IS 'Stores chat history for each subject per user';
COMMENT ON COLUMN public.user_profiles.current_subject IS 'Currently active subject for the user'; 