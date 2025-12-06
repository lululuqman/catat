-- Catat Letters Table Schema for Supabase
-- Run this in your Supabase SQL Editor to create the letters table

-- Create the letters table
CREATE TABLE IF NOT EXISTS public.letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    letter_type TEXT NOT NULL DEFAULT 'general',
    language TEXT NOT NULL DEFAULT 'en',
    tone_detected TEXT,
    urgency TEXT,
    transcript TEXT,
    structured_data JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS letters_user_id_idx ON public.letters(user_id);
CREATE INDEX IF NOT EXISTS letters_created_at_idx ON public.letters(created_at DESC);
CREATE INDEX IF NOT EXISTS letters_letter_type_idx ON public.letters(letter_type);
CREATE INDEX IF NOT EXISTS letters_language_idx ON public.letters(language);

-- Enable Row Level Security (RLS)
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (allows users to only see their own letters)
-- Note: For development/testing without auth, you can skip these or modify them

-- Policy: Users can view their own letters
CREATE POLICY "Users can view own letters"
    ON public.letters
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own letters
CREATE POLICY "Users can insert own letters"
    ON public.letters
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own letters
CREATE POLICY "Users can update own letters"
    ON public.letters
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own letters
CREATE POLICY "Users can delete own letters"
    ON public.letters
    FOR DELETE
    USING (auth.uid() = user_id);

-- Optional: For development/testing without authentication
-- Uncomment these to allow public access (remove in production!)
-- DROP POLICY IF EXISTS "Users can view own letters" ON public.letters;
-- DROP POLICY IF EXISTS "Users can insert own letters" ON public.letters;
-- DROP POLICY IF EXISTS "Users can update own letters" ON public.letters;
-- DROP POLICY IF EXISTS "Users can delete own letters" ON public.letters;

-- CREATE POLICY "Enable read access for all users" ON public.letters FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON public.letters FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON public.letters FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete access for all users" ON public.letters FOR DELETE USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.letters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions (optional, depending on your setup)
-- GRANT ALL ON public.letters TO authenticated;
-- GRANT ALL ON public.letters TO service_role;

-- Success message
SELECT 'Letters table created successfully!' AS message;

