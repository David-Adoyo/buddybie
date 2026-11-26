-- ============================================================================
-- Be a Buddy — Neon schema (PostgreSQL, no Supabase-specific extensions)
--
-- Differences from supabase/migrations/:
--   • auth.users is replaced by public.users (we own the identity table).
--     The users.supabase_id column stores the Supabase-issued UUID so the
--     auth JWT can be correlated with a row in this database.
--   • Row Level Security policies using auth.uid() are removed.
--     Authorisation is enforced at the API/server-action layer instead.
--   • Everything else is plain PostgreSQL and works identically.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type visibility as enum ('public', 'members', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type support_type as enum ('cheer', 'join', 'accountability');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_level as enum ('none', 'selfie', 'id');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'reviewed', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_tier as enum ('free', 'plus', 'pro');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- users (one row per authenticated user)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  supabase_id   uuid unique,          -- Supabase auth UID (nullable until linked)
  phone         text unique,
  display_name  text,
  avatar_url    text,
  area          text,
  verified      verification_level not null default 'none',
  is_staff      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- waitlist
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  circle     text,
  created_at timestamptz not null default now(),
  unique (email)
);

-- ---------------------------------------------------------------------------
-- circles (reference data; mirrors src/data/circles.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.circles (
  id          text primary key,
  name        text not null,
  launch_wave smallint not null default 1,
  is_spark    boolean not null default false,
  always_free boolean not null default false
);

insert into public.circles (id, name, launch_wave, is_spark, always_free) values
  ('friends',      'Friends & Social',        1, false, false),
  ('faith',        'Faith & Fellowship',      1, false, false),
  ('work',         'Work & Corporate',        1, false, false),
  ('spark',        'Spark',                   1, true,  false),
  ('goals',        'Goals & Accountability',  1, false, false),
  ('fitness',      'Fitness & Outdoors',      1, false, false),
  ('buddy-table',  'Buddy Table',             1, false, false),
  ('students',     'Students & Young Pros',   1, false, false),
  ('arts',         'Arts, Music & Culture',   2, false, false),
  ('parents',      'Parents & Family',        2, false, false),
  ('travel',       'Travel & Explorers',      1, false, false),
  ('business',     'Business & Founders',     2, false, false),
  ('diaspora',     'Diaspora & Expats',       2, false, false),
  ('gaming',       'Gaming & Tech',           3, false, false),
  ('volunteering', 'Volunteering & Causes',   3, false, true),
  ('support',      'Support Circles',         3, false, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- circle_memberships (per-Circle profile + visibility)
-- ---------------------------------------------------------------------------
create table if not exists public.circle_memberships (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  circle_id    text not null references public.circles (id),
  display_name text,
  bio          text,
  visibility   visibility not null default 'members',
  created_at   timestamptz not null default now(),
  unique (user_id, circle_id)
);
create index if not exists circle_memberships_circle_idx
  on public.circle_memberships (circle_id);

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  circle_id   text not null references public.circles (id),
  title       text not null,
  description text,
  visibility  visibility not null default 'members',
  completed   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists goals_user_idx   on public.goals (user_id);
create index if not exists goals_circle_idx on public.goals (circle_id);

-- ---------------------------------------------------------------------------
-- goal_supporters
-- ---------------------------------------------------------------------------
create table if not exists public.goal_supporters (
  id           uuid primary key default gen_random_uuid(),
  goal_id      uuid not null references public.goals (id) on delete cascade,
  supporter_id uuid not null references public.users (id) on delete cascade,
  support_type support_type not null default 'cheer',
  created_at   timestamptz not null default now(),
  unique (goal_id, supporter_id)
);

-- ---------------------------------------------------------------------------
-- verifications
-- ---------------------------------------------------------------------------
create table if not exists public.verifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  level      verification_level not null,
  provider   text,
  ref_id     text,
  passed     boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users (id) on delete cascade,
  reported_id uuid not null references public.users (id) on delete cascade,
  reason      text not null,
  detail      text,
  status      report_status not null default 'open',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- blocks
-- ---------------------------------------------------------------------------
create table if not exists public.blocks (
  blocker_id uuid not null references public.users (id) on delete cascade,
  blocked_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

-- ---------------------------------------------------------------------------
-- likes + matches + conversations + messages
-- ---------------------------------------------------------------------------
create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  from_id    uuid not null references public.users (id) on delete cascade,
  to_id      uuid not null references public.users (id) on delete cascade,
  circle_id  text not null references public.circles (id),
  created_at timestamptz not null default now(),
  unique (from_id, to_id, circle_id)
);

create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.users (id) on delete cascade,
  user_b     uuid not null references public.users (id) on delete cascade,
  circle_id  text not null references public.circles (id),
  created_at timestamptz not null default now(),
  unique (user_a, user_b, circle_id)
);

create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  circle_id  text references public.circles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.users (id) on delete cascade,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.users (id) on delete cascade,
  body            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- groups + events + ratings (Stage 6)
-- ---------------------------------------------------------------------------
create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  circle_id   text not null references public.circles (id),
  name        text not null,
  description text,
  host_id     uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid references public.groups (id) on delete set null,
  circle_id   text not null references public.circles (id),
  title       text not null,
  description text,
  location    text,
  starts_at   timestamptz,
  host_id     uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  event_id   uuid not null references public.events (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  status     text not null default 'going',
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.ratings (
  id         uuid primary key default gen_random_uuid(),
  rater_id   uuid not null references public.users (id) on delete cascade,
  rated_id   uuid not null references public.users (id) on delete cascade,
  score      smallint not null check (score between 1 and 5),
  comment    text,
  created_at timestamptz not null default now(),
  unique (rater_id, rated_id)
);

-- ---------------------------------------------------------------------------
-- subscriptions + payments (Stage 7)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  tier       plan_tier not null default 'free',
  circle_id  text references public.circles (id),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, circle_id)
);

create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  amount_cents   integer not null,
  currency       text not null default 'usd',
  provider       text not null,
  provider_ref   text unique,
  status         text not null default 'pending',
  created_at     timestamptz not null default now()
);
