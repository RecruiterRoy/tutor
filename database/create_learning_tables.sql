-- Create chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    subject VARCHAR(100),
    grade VARCHAR(20),
    teacher_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_progress table
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    completion_percentage INTEGER DEFAULT 0,
    strengths TEXT[],
    areas_for_improvement TEXT[],
    last_studied TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject)
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic VARCHAR(200) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    studied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_subject ON public.learning_progress(subject);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_studied_at ON public.study_sessions(studied_at);

-- Enable RLS
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_history (with IF NOT EXISTS check)
DO $$
BEGIN
    -- Chat History Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_history' AND policyname = 'Users can view their own chat history') THEN
        CREATE POLICY "Users can view their own chat history" ON public.chat_history
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_history' AND policyname = 'Users can insert their own chat history') THEN
        CREATE POLICY "Users can insert their own chat history" ON public.chat_history
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_history' AND policyname = 'Users can update their own chat history') THEN
        CREATE POLICY "Users can update their own chat history" ON public.chat_history
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Learning Progress Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_progress' AND policyname = 'Users can view their own learning progress') THEN
        CREATE POLICY "Users can view their own learning progress" ON public.learning_progress
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_progress' AND policyname = 'Users can insert their own learning progress') THEN
        CREATE POLICY "Users can insert their own learning progress" ON public.learning_progress
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_progress' AND policyname = 'Users can update their own learning progress') THEN
        CREATE POLICY "Users can update their own learning progress" ON public.learning_progress
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Study Sessions Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sessions' AND policyname = 'Users can view their own study sessions') THEN
        CREATE POLICY "Users can view their own study sessions" ON public.study_sessions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sessions' AND policyname = 'Users can insert their own study sessions') THEN
        CREATE POLICY "Users can insert their own study sessions" ON public.study_sessions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sessions' AND policyname = 'Users can update their own study sessions') THEN
        CREATE POLICY "Users can update their own study sessions" ON public.study_sessions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create function to update updated_at timestamp for chat_history
CREATE OR REPLACE FUNCTION update_chat_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chat_history_updated_at_trigger') THEN
        CREATE TRIGGER update_chat_history_updated_at_trigger
            BEFORE UPDATE ON public.chat_history
            FOR EACH ROW
            EXECUTE FUNCTION update_chat_history_updated_at();
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON public.chat_history TO authenticated;
GRANT ALL ON public.learning_progress TO authenticated;
GRANT ALL ON public.study_sessions TO authenticated;

-- Show final status
SELECT 
    'Tables created successfully' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'chat_history') as chat_history_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'learning_progress') as learning_progress_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'study_sessions') as study_sessions_exists; 