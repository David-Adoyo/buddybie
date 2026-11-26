-- Be a Buddy — Stage 2 schema: profiles, circles, per-Circle memberships,
-- goals and goal supporters. Security-first: Row Level Security on every table.
--
-- The non-negotiable rule from the master plan is enforced HERE, not just in the
-- UI: a user's Spark (Dating) membership and goals are NEVER readable from any
-- other Circle. See the circle_memberships and goals SELECT policies.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type visibility as enum ('public', 'members', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type support_type as enum ('cheer', 'join', 'accountability');
exception when duplicate_object then null; end $$;

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
  ('friends',      'Friends & Social',       1, false, false),
  ('faith',        'Faith & Fellowship',     1, false, false),
  ('work',         'Work & Corporate',       1, false, false),
  ('spark',        'Spark',                  1, true,  false),
  ('goals',        'Goals & Accountability', 1, false, false),
  ('fitness',      'Fitness & Outdoors',     1, false, false),
  ('buddy-table',  'Buddy Table',            1, false, false),
  ('students',     'Students & Young Pros',  1, false, false),
  ('arts',         'Arts, Music & Culture',  2, false, false),
  ('parents',      'Parents & Family',       2, false, false),
  ('travel',       'Travel Buddies',         2, false, false),
  ('business',     'Business & Founders',    2, false, false),
  ('diaspora',     'Diaspora & Expats',      2, false, false),
  ('gaming',       'Gaming & Tech',          3, false, false),
  ('volunteering', 'Volunteering & Causes',  3, false, true),
  ('support',      'Support Circles',        3, false, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- profiles (one base identity per user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  area        text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- circle_memberships (per-Circle profile + visibility)
-- ---------------------------------------------------------------------------
create table if not exists public.circle_memberships (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
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
-- goals (Goals & Dreams board)
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  circle_id   text not null references public.circles (id),
  title       text not null,
  description text,
  status      text not null default 'active',
  created_at  timestamptz not null default now()
);
create index if not exists goals_circle_idx on public.goals (circle_id);

-- ---------------------------------------------------------------------------
-- goal_supporters (cheer / join / accountability)
-- ---------------------------------------------------------------------------
create table if not exists public.goal_supporters (
  id           uuid primary key default gen_random_uuid(),
  goal_id      uuid not null references public.goals (id) on delete cascade,
  supporter_id uuid not null references auth.users (id) on delete cascade,
  type         support_type not null,
  created_at   timestamptz not null default now(),
  unique (goal_id, supporter_id, type)
);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.circles            enable row level security;
alter table public.profiles           enable row level security;
alter table public.circle_memberships enable row level security;
alter table public.goals              enable row level security;
alter table public.goal_supporters    enable row level security;

-- circles: public read-only reference data.
drop policy if exists "circles are readable by everyone" on public.circles;
create policy "circles are readable by everyone"
  on public.circles for select using (true);

-- profiles: any authenticated user may read base identities; only the owner writes.
drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- circle_memberships: THE Spark-isolation boundary.
-- Visible only if you own it, OR it is a non-Spark Circle that is not private.
drop policy if exists "memberships visible unless spark or private" on public.circle_memberships;
create policy "memberships visible unless spark or private"
  on public.circle_memberships for select to authenticated
  using (
    user_id = auth.uid()
    or (circle_id <> 'spark' and visibility <> 'private')
  );

drop policy if exists "insert own membership" on public.circle_memberships;
create policy "insert own membership"
  on public.circle_memberships for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "update own membership" on public.circle_memberships;
create policy "update own membership"
  on public.circle_memberships for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "delete own membership" on public.circle_memberships;
create policy "delete own membership"
  on public.circle_memberships for delete to authenticated
  using (user_id = auth.uid());

-- goals: readable by owner, or when the owner's membership in that (non-Spark)
-- Circle is itself visible. Spark goals never leak to other Circles.
drop policy if exists "goals visible with circle membership" on public.goals;
create policy "goals visible with circle membership"
  on public.goals for select to authenticated
  using (
    user_id = auth.uid()
    or (
      circle_id <> 'spark'
      and exists (
        select 1 from public.circle_memberships m
        where m.user_id = goals.user_id
          and m.circle_id = goals.circle_id
          and m.visibility <> 'private'
      )
    )
  );

drop policy if exists "insert own goal in joined circle" on public.goals;
create policy "insert own goal in joined circle"
  on public.goals for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.circle_memberships m
      where m.user_id = auth.uid() and m.circle_id = goals.circle_id
    )
  );

drop policy if exists "update own goal" on public.goals;
create policy "update own goal"
  on public.goals for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "delete own goal" on public.goals;
create policy "delete own goal"
  on public.goals for delete to authenticated
  using (user_id = auth.uid());

-- goal_supporters: readable when the underlying goal is non-Spark (or yours);
-- each user only writes their own support rows.
drop policy if exists "supporters visible with goal" on public.goal_supporters;
create policy "supporters visible with goal"
  on public.goal_supporters for select to authenticated
  using (
    supporter_id = auth.uid()
    or exists (
      select 1 from public.goals g
      where g.id = goal_id and (g.user_id = auth.uid() or g.circle_id <> 'spark')
    )
  );

drop policy if exists "insert own support" on public.goal_supporters;
create policy "insert own support"
  on public.goal_supporters for insert to authenticated
  with check (supporter_id = auth.uid());

drop policy if exists "delete own support" on public.goal_supporters;
create policy "delete own support"
  on public.goal_supporters for delete to authenticated
  using (supporter_id = auth.uid());
