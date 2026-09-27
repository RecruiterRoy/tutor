-- Run this once in the Supabase SQL Editor to store all student registration fields.
ALTER TABLE public.students
    ADD COLUMN IF NOT EXISTS class text,
    ADD COLUMN IF NOT EXISTS board_name text,
    ADD COLUMN IF NOT EXISTS state_board_name text,
    ADD COLUMN IF NOT EXISTS state text,
    ADD COLUMN IF NOT EXISTS study_city text,
    ADD COLUMN IF NOT EXISTS study_state text;

ALTER TABLE public.students
    ALTER COLUMN password_hash DROP NOT NULL;