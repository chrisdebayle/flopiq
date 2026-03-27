-- =====================================================
-- FlopIQ Database Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- =====================================================

-- 1. Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  total_xp integer default 0,
  best_streak integer default 0,
  best_session_pct integer default 0,
  total_correct integer default 0,
  total_answered integer default 0,
  sessions_played integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Sessions table (one row per drill session)
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  correct integer default 0,
  total integer default 0,
  grade text,
  xp_earned integer default 0,
  best_streak integer default 0,
  duration_ms integer default 0,
  category_breakdown jsonb default '{}',
  created_at timestamptz default now()
);

-- 3. Scenario results (one row per scenario attempt)
create table if not exists public.scenario_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete cascade,
  scenario_id text not null,
  correct boolean default false,
  action_chosen text,
  bet_type_chosen text,
  opponent_type text,
  created_at timestamptz default now()
);

-- 4. Analytics events
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- =====================================================
-- Row Level Security (RLS) — protects data per user
-- =====================================================

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.scenario_results enable row level security;
alter table public.analytics_events enable row level security;

-- Profiles: users can read all (for leaderboard), update only their own
create policy "Anyone can read profiles" on public.profiles
  for select using (true);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Sessions: users can read/write their own
create policy "Users can read own sessions" on public.sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own sessions" on public.sessions
  for insert with check (auth.uid() = user_id);

-- Scenario results: users can read/write their own
create policy "Users can read own results" on public.scenario_results
  for select using (auth.uid() = user_id);

create policy "Users can insert own results" on public.scenario_results
  for insert with check (auth.uid() = user_id);

-- Analytics: users can insert their own events, only admins can read
create policy "Users can insert own events" on public.analytics_events
  for insert with check (auth.uid() = user_id);

-- =====================================================
-- Auto-create profile on signup (trigger)
-- =====================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Player'));
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if re-running
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- Indexes for performance
-- =====================================================

create index if not exists idx_profiles_xp on public.profiles(total_xp desc);
create index if not exists idx_sessions_user on public.sessions(user_id, created_at desc);
create index if not exists idx_results_user on public.scenario_results(user_id, created_at desc);
create index if not exists idx_results_scenario on public.scenario_results(scenario_id);
create index if not exists idx_analytics_type on public.analytics_events(event_type, created_at desc);
