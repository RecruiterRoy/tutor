-- Create question_analyses table for storing scanned question analyses
CREATE TABLE IF NOT EXISTS question_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    extracted_text TEXT NOT NULL,
    solution TEXT NOT NULL,
    image_url TEXT, -- Store truncated base64 or URL
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    user_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_question_analyses_user_id ON question_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_question_analyses_created_at ON question_analyses(created_at);

-- Enable RLS
ALTER TABLE question_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analyses" ON question_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON question_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON question_analyses
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all analyses" ON question_analyses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON question_analyses TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_question_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_analyses_updated_at
    BEFORE UPDATE ON question_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_question_analyses_updated_at(); 