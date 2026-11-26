-- Be a Buddy — Stage 5 schema: Spark (Dating). Spark-only data, isolated so it
-- is readable ONLY by other Spark members (never from any other Circle). Likes
-- and matches reuse the Stage 4 tables with circle_id = 'spark' (whose RLS
-- already hides "who liked you" from non-Spark reads — that is a premium reveal).

-- ---------------------------------------------------------------------------
-- spark_profiles: a dating profile that is entirely separate from a member's
-- other per-Circle profiles.
-- ---------------------------------------------------------------------------
create table if not exists public.spark_profiles (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  intent           text not null default 'serious' check (intent in ('serious', 'casual', 'friends')),
  bio              text,
  faith            text,
  faith_importance text not null default 'somewhat' check (faith_importance in ('not', 'somewhat', 'very')),
  wants_children   text not null default 'open' check (wants_children in ('yes', 'no', 'open')),
  group_first      boolean not null default true,
  dob              date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- True when the current user is themselves in Spark. Gates who can read Spark
-- profiles so the dating world stays isolated from everyone else.
create or replace function public.in_spark()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.spark_profiles where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- spark_mixers: group-first singles events (speed dating, singles dinners).
-- ---------------------------------------------------------------------------
create table if not exists public.spark_mixers (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  venue      text not null,
  area       text not null,
  starts_at  timestamptz not null,
  capacity   integer not null default 12,
  women_only boolean not null default false,
  men_only   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.spark_mixer_rsvps (
  mixer_id   uuid not null references public.spark_mixers (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (mixer_id, user_id)
);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.spark_profiles     enable row level security;
alter table public.spark_mixers       enable row level security;
alter table public.spark_mixer_rsvps  enable row level security;

-- spark_profiles: you own yours; other Spark members may discover you; nobody
-- outside Spark can read any of it.
drop policy if exists "read spark profiles in-spark" on public.spark_profiles;
create policy "read spark profiles in-spark"
  on public.spark_profiles for select to authenticated
  using (user_id = auth.uid() or public.in_spark());
drop policy if exists "insert own spark profile" on public.spark_profiles;
create policy "insert own spark profile"
  on public.spark_profiles for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "update own spark profile" on public.spark_profiles;
create policy "update own spark profile"
  on public.spark_profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "delete own spark profile" on public.spark_profiles;
create policy "delete own spark profile"
  on public.spark_profiles for delete to authenticated using (user_id = auth.uid());

-- spark_mixers: visible to Spark members only.
drop policy if exists "read mixers in-spark" on public.spark_mixers;
create policy "read mixers in-spark"
  on public.spark_mixers for select to authenticated using (public.in_spark());

-- RSVPs: you manage your own.
drop policy if exists "manage own mixer rsvp" on public.spark_mixer_rsvps;
create policy "manage own mixer rsvp"
  on public.spark_mixer_rsvps for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
