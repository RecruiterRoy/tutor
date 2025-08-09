-- Create literature_contexts table for storing story context information
CREATE TABLE IF NOT EXISTS literature_contexts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    context_images TEXT[], -- Array of image URLs/truncated base64
    story_title VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en', -- 'en' for English, 'hi' for Hindi
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_literature_contexts_user_id ON literature_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_literature_contexts_story_title ON literature_contexts(story_title);
CREATE INDEX IF NOT EXISTS idx_literature_contexts_created_at ON literature_contexts(created_at);

-- Enable RLS
ALTER TABLE literature_contexts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own literature contexts" ON literature_contexts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own literature contexts" ON literature_contexts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own literature contexts" ON literature_contexts
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all literature contexts" ON literature_contexts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON literature_contexts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_literature_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_literature_contexts_updated_at
    BEFORE UPDATE ON literature_contexts
    FOR EACH ROW
    EXECUTE FUNCTION update_literature_contexts_updated_at(); 