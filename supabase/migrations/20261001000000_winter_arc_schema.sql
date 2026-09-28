-- ========================================================================
-- Winter Arc — Production Supabase / PostgreSQL Database Schema
-- Version: 1.0
-- Compliant with Winter Arc PRD & TRD
-- ========================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ========================================================================
-- 1. PROFILES
-- ========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 30),
  display_name text,
  avatar_url text,
  bio text,
  language text not null default 'en' check (language in ('en', 'te', 'hi')),
  timezone text not null default 'Asia/Kolkata',
  privacy text not null default 'private' check (privacy in ('private', 'friends', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========================================================================
-- 2. ARC TEMPLATES
-- ========================================================================
create table if not exists public.arc_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  default_duration_days integer check (default_duration_days > 0),
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

-- ========================================================================
-- 3. ARCS
-- ========================================================================
create table if not exists public.arcs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid references public.arc_templates(id) on delete set null,
  name text not null,
  description text,
  duration_days integer not null check (duration_days between 1 and 3650),
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  privacy text not null default 'private' check (privacy in ('private', 'friends', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- ========================================================================
-- 4. HABITS
-- ========================================================================
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  arc_id uuid not null references public.arcs(id) on delete cascade,
  name text not null,
  description text,
  icon text default '❄️',
  habit_type text not null check (habit_type in ('boolean', 'number', 'duration', 'time', 'percentage')),
  target_value numeric,
  target_unit text,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  reminder_enabled boolean not null default false,
  reminder_time time,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========================================================================
-- 5. HABIT SCHEDULES (Optional weekly recurrence)
-- ========================================================================
create table if not exists public.habit_schedules (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  day_of_week integer check (day_of_week between 0 and 6),
  created_at timestamptz not null default now()
);

-- ========================================================================
-- 6. HABIT LOGS (Primary Source of Truth)
-- ========================================================================
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  value numeric,
  completed boolean not null default false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

-- ========================================================================
-- 7. DAILY SUMMARIES (Cache table)
-- ========================================================================
create table if not exists public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  arc_id uuid not null references public.arcs(id) on delete cascade,
  summary_date date not null,
  total_habits integer not null default 0,
  completed_habits integer not null default 0,
  completion_percentage numeric check (completion_percentage between 0 and 100),
  perfect_day boolean not null default false,
  created_at timestamptz not null default now(),
  unique(arc_id, summary_date)
);

-- ========================================================================
-- 8. FRIENDSHIPS
-- ========================================================================
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> receiver_id),
  unique (requester_id, receiver_id)
);

-- ========================================================================
-- 9. GROUPS & MEMBERS
-- ========================================================================
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  invite_code text unique default substring(encode(gen_random_bytes(6), 'hex') from 1 for 8),
  privacy text not null default 'private' check (privacy in ('private', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_arcs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ========================================================================
-- 10. XP SYSTEM & AUDIT EVENTS
-- ========================================================================
create table if not exists public.user_xp (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_xp bigint not null default 0,
  level integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  xp_amount integer not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

-- ========================================================================
-- 11. ACHIEVEMENTS & USER UNLOCKS
-- ========================================================================
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  icon text,
  requirement_type text not null,
  requirement_value numeric,
  xp_reward integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ========================================================================
-- 12. NOTIFICATIONS & PREFERENCES
-- ========================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  reference_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  habit_reminders boolean not null default true,
  streak_warnings boolean not null default true,
  achievements boolean not null default true,
  friend_requests boolean not null default true,
  group_notifications boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  week_starts_on integer not null default 1 check (week_starts_on between 0 and 6),
  updated_at timestamptz not null default now()
);

-- ========================================================================
-- 13. SHARING & MODERATION
-- ========================================================================
create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  arc_id uuid references public.arcs(id) on delete cascade,
  token text unique not null default substring(encode(gen_random_bytes(12), 'hex') from 1 for 12),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  description text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- ========================================================================
-- 14. PERFORMANCE INDEXES
-- ========================================================================
create index if not exists idx_arcs_user on public.arcs(user_id);
create index if not exists idx_habits_arc on public.habits(arc_id);
create index if not exists idx_habit_logs_habit_date on public.habit_logs(habit_id, log_date);
create index if not exists idx_habit_logs_user_date on public.habit_logs(user_id, log_date);
create index if not exists idx_friendships_receiver on public.friendships(receiver_id);
create index if not exists idx_friendships_requester on public.friendships(requester_id);
create index if not exists idx_group_members_user on public.group_members(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- ========================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================
alter table public.profiles enable row level security;
alter table public.arcs enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.friendships enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.user_xp enable row level security;
alter table public.user_achievements enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;
alter table public.notification_settings enable row level security;

-- Profiles: Public read for public profiles, self can read/update all
create policy "Users can view own profile or public profiles"
on public.profiles for select
using (
  auth.uid() = id or privacy = 'public' or (
    privacy = 'friends' and exists (
      select 1 from public.friendships
      where (requester_id = auth.uid() and receiver_id = profiles.id and status = 'accepted')
         or (receiver_id = auth.uid() and requester_id = profiles.id and status = 'accepted')
    )
  )
);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- Arcs: Users can view own arcs or friends/public arcs according to privacy
create policy "Users can view own arcs"
on public.arcs for select
using (auth.uid() = user_id);

create policy "Users can insert own arcs"
on public.arcs for insert
with check (auth.uid() = user_id);

create policy "Users can update own arcs"
on public.arcs for update
using (auth.uid() = user_id);

create policy "Users can delete own arcs"
on public.arcs for delete
using (auth.uid() = user_id);

-- Habits: Controlled via Arc ownership
create policy "Users can view habits of accessible arcs"
on public.habits for select
using (
  exists (select 1 from public.arcs where arcs.id = habits.arc_id and arcs.user_id = auth.uid())
);

create policy "Users can manage habits of own arcs"
on public.habits for all
using (
  exists (select 1 from public.arcs where arcs.id = habits.arc_id and arcs.user_id = auth.uid())
);

-- Habit Logs: Users can only see and write their own logs
create policy "Users can view own habit logs"
on public.habit_logs for select
using (auth.uid() = user_id);

create policy "Users can manage own habit logs"
on public.habit_logs for all
using (auth.uid() = user_id);

-- User XP & Achievements: Users view own
create policy "Users view own xp"
on public.user_xp for select
using (auth.uid() = user_id);

create policy "Users view own achievements"
on public.user_achievements for select
using (auth.uid() = user_id);

-- User Settings: Self only
create policy "Users manage own settings"
on public.user_settings for all
using (auth.uid() = user_id);

create policy "Users manage own notification settings"
on public.notification_settings for all
using (auth.uid() = user_id);

-- ========================================================================
-- 16. AUTOMATIC USER INITIALIZATION TRIGGER
-- ========================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'warrior_' || substring(new.id::text from 1 for 6)),
    coalesce(new.raw_user_meta_data->>'display_name', 'Arc Warrior'),
    coalesce(new.raw_user_meta_data->>'language', 'en')
  );

  insert into public.user_settings (user_id)
  values (new.id);

  insert into public.notification_settings (user_id)
  values (new.id);

  insert into public.user_xp (user_id, total_xp, level)
  values (new.id, 0, 1);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================================================================
-- 17. SEED DATA (Templates & Initial Achievements)
-- ========================================================================
insert into public.arc_templates (name, description, icon, default_duration_days) values
('Winter Arc', 'The classic 90-day cold discipline challenge for ultimate transformation.', '❄️', 90),
('Study Arc', 'Academic and cognitive mastery challenge for students & self-learners.', '📚', 60),
('Fitness Arc', 'Pure strength, conditioning, and nutrition focus for physical evolution.', '🏋️', 90),
('Digital Detox', 'Reclaim attention, dopamine balance, and deep focus away from screens.', '📵', 30),
('Custom Arc', 'Define your own path, targets, and personal discipline milestones.', '✨', 90)
on conflict do nothing;

insert into public.achievements (code, name, description, icon, requirement_type, requirement_value, xp_reward) values
('first_step', 'First Step', 'Complete your very first habit in your Arc.', '🌱', 'habits_completed', 1, 50),
('seven_days', '7 Days of Fire', 'Maintain an unbroken streak for 7 consecutive days.', '🔥', 'streak_days', 7, 100),
('perfect_day', 'Perfect Day', 'Complete 100% of your daily habits in a single day.', '💯', 'perfect_days', 1, 100),
('thirty_days', '30-Day Milestone', 'Complete 30 days of consistent discipline.', '🗓️', 'streak_days', 30, 500),
('sixty_days', '60-Day Ascent', 'Cross two continuous months of committed evolution.', '🏔️', 'streak_days', 60, 1000),
('winter_legend', 'Winter Legend', 'Successfully conquer the complete 90-day Arc.', '👑', 'arc_completed', 90, 2000),
('consistency', 'Iron Consistency', 'Complete habits at least 30 times total.', '⚡', 'habits_completed', 30, 250)
on conflict (code) do nothing;
