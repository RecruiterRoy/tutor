-- Enable RLS (Row Level Security)
alter table public.users enable row level security;

-- Learning Progress Table
create table public.learning_progress (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    subject varchar not null,
    completion_percentage integer default 0,
    strengths text[] default array[]::text[],
    areas_for_improvement text[] default array[]::text[],
    last_studied timestamp with time zone default now(),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(user_id, subject)
);

-- Study Groups Table
create table public.study_groups (
    id uuid default gen_random_uuid() primary key,
    name varchar not null,
    description text,
    created_by uuid references auth.users not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Group Members Table
create table public.group_members (
    id uuid default gen_random_uuid() primary key,
    group_id uuid references public.study_groups not null,
    user_id uuid references auth.users not null,
    joined_at timestamp with time zone default now(),
    unique(group_id, user_id)
);

-- Shared Notes Table
create table public.shared_notes (
    id uuid default gen_random_uuid() primary key,
    group_id uuid references public.study_groups not null,
    user_id uuid references auth.users not null,
    content text not null,
    topic varchar not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Shared AI Responses Table
create table public.shared_ai_responses (
    id uuid default gen_random_uuid() primary key,
    group_id uuid references public.study_groups not null,
    user_id uuid references auth.users not null,
    response text not null,
    topic varchar not null,
    created_at timestamp with time zone default now()
);

-- Speaker Profiles Table
create table public.speaker_profiles (
    id uuid default gen_random_uuid() primary key,
    group_id uuid references public.study_groups not null,
    user_id uuid references auth.users not null,
    features jsonb not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(group_id, user_id)
);

-- Study Sessions Table
create table public.study_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    topic varchar not null,
    subject varchar not null,
    duration integer not null, -- in minutes
    studied_at timestamp with time zone default now()
);

-- User Preferences Table
create table public.user_preferences (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    preference_key varchar not null,
    preference_value jsonb not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(user_id, preference_key)
);

-- Enable RLS on all tables
alter table public.learning_progress enable row level security;
alter table public.study_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.shared_notes enable row level security;
alter table public.shared_ai_responses enable row level security;
alter table public.speaker_profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_preferences enable row level security;

-- RLS Policies
create policy "Users can view their own learning progress"
    on public.learning_progress for select
    using (auth.uid() = user_id);

create policy "Users can update their own learning progress"
    on public.learning_progress for update
    using (auth.uid() = user_id);

create policy "Users can insert their own learning progress"
    on public.learning_progress for insert
    with check (auth.uid() = user_id);

-- Similar policies for other tables...
-- Add more specific policies as needed for each table 