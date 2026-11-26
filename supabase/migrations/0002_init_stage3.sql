-- Be a Buddy — Stage 3 schema: verification ladder, trust & safety, moderation.
-- Security-first: RLS on every table, a staff-only boundary for moderation, and
-- a trigger that stops members escalating their own role or un-freezing themselves.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type verification_status as enum ('none', 'pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_role as enum ('member', 'host', 'org_admin', 'moderator', 'super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type flag_status as enum ('pending', 'approved', 'removed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles: role + freeze (added this stage)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role member_role not null default 'member';
alter table public.profiles
  add column if not exists is_frozen boolean not null default false;

-- Staff check used throughout. SECURITY DEFINER so policies can read the role
-- without recursing through profiles' own RLS.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'super_admin')
  );
$$;

-- Members may edit their own profile but NOT their role or frozen flag.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.is_frozen is distinct from old.is_frozen)
     and not public.is_staff() then
    raise exception 'not allowed to change role or frozen status';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_privileges on public.profiles;
create trigger guard_profile_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- ---------------------------------------------------------------------------
-- verifications (ladder: level derived in app from these statuses)
-- ---------------------------------------------------------------------------
create table if not exists public.verifications (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  selfie       verification_status not null default 'none',
  id_check     verification_status not null default 'none',
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- organisations + members (ladder level 4)
-- ---------------------------------------------------------------------------
create table if not exists public.organisations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('church', 'company', 'venue')),
  reg_no      text,
  status      verification_status not null default 'pending',
  created_by  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id     uuid not null references public.organisations (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null default 'member' check (role in ('org_admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- ---------------------------------------------------------------------------
-- reports / blocks / trust / moderation / audit
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references auth.users (id) on delete cascade,
  reported_user_id uuid references auth.users (id) on delete set null,
  target_type      text not null check (target_type in ('user', 'goal', 'message', 'photo', 'event')),
  target_id        text,
  reason           text not null,
  details          text,
  status           report_status not null default 'open',
  created_at       timestamptz not null default now()
);

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists public.trust_scores (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  score      integer not null default 0,
  updated_at timestamptz not null default now()
);

-- AI pre-screen results + photos awaiting human review.
create table if not exists public.content_flags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('message', 'photo', 'goal')),
  excerpt     text,
  labels      jsonb not null default '[]'::jsonb,
  severity    text not null default 'low' check (severity in ('low', 'medium', 'high')),
  status      flag_status not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references auth.users (id) on delete set null,
  action     text not null,
  target     text,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.verifications  enable row level security;
alter table public.organisations  enable row level security;
alter table public.org_members    enable row level security;
alter table public.reports        enable row level security;
alter table public.blocks         enable row level security;
alter table public.trust_scores   enable row level security;
alter table public.content_flags  enable row level security;
alter table public.audit_log      enable row level security;

-- profiles: let staff read/update any profile (freeze), on top of Stage 2's owner policies.
drop policy if exists "staff manage profiles" on public.profiles;
create policy "staff manage profiles"
  on public.profiles for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- verifications: owner manages own (real status transitions run server-side via
-- the KYC webhook using the service role; owner-write is for the demo flow).
drop policy if exists "own verification read" on public.verifications;
create policy "own verification read"
  on public.verifications for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
drop policy if exists "own verification write" on public.verifications;
create policy "own verification write"
  on public.verifications for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "own verification update" on public.verifications;
create policy "own verification update"
  on public.verifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- organisations
drop policy if exists "orgs readable" on public.organisations;
create policy "orgs readable"
  on public.organisations for select to authenticated using (true);
drop policy if exists "create org" on public.organisations;
create policy "create org"
  on public.organisations for insert to authenticated with check (created_by = auth.uid());
drop policy if exists "manage org" on public.organisations;
create policy "manage org"
  on public.organisations for update to authenticated
  using (created_by = auth.uid() or public.is_staff())
  with check (created_by = auth.uid() or public.is_staff());

-- org_members
drop policy if exists "org members readable" on public.org_members;
create policy "org members readable"
  on public.org_members for select to authenticated using (true);
drop policy if exists "join org" on public.org_members;
create policy "join org"
  on public.org_members for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "leave org" on public.org_members;
create policy "leave org"
  on public.org_members for delete to authenticated using (user_id = auth.uid());

-- reports: reporter can file + see own; staff see/triage all. Reported users can't read.
drop policy if exists "file report" on public.reports;
create policy "file report"
  on public.reports for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "read own or staff reports" on public.reports;
create policy "read own or staff reports"
  on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_staff());
drop policy if exists "staff triage reports" on public.reports;
create policy "staff triage reports"
  on public.reports for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- blocks: the blocker owns their block rows.
drop policy if exists "own blocks" on public.blocks;
create policy "own blocks"
  on public.blocks for all to authenticated
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- trust_scores: anyone authenticated may read; owner/staff may write (demo).
drop policy if exists "trust readable" on public.trust_scores;
create policy "trust readable"
  on public.trust_scores for select to authenticated using (true);
drop policy if exists "trust writable" on public.trust_scores;
create policy "trust writable"
  on public.trust_scores for all to authenticated
  using (user_id = auth.uid() or public.is_staff())
  with check (user_id = auth.uid() or public.is_staff());

-- content_flags: the subject or the AI pre-screen (acting as the user) can create;
-- subject and staff can read; only staff decide outcomes.
drop policy if exists "create flag" on public.content_flags;
create policy "create flag"
  on public.content_flags for insert to authenticated
  with check (user_id = auth.uid() or public.is_staff());
drop policy if exists "read own or staff flags" on public.content_flags;
create policy "read own or staff flags"
  on public.content_flags for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
drop policy if exists "staff resolve flags" on public.content_flags;
create policy "staff resolve flags"
  on public.content_flags for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- audit_log: anyone may append their own actions; only staff may read.
drop policy if exists "append audit" on public.audit_log;
create policy "append audit"
  on public.audit_log for insert to authenticated with check (actor_id = auth.uid());
drop policy if exists "staff read audit" on public.audit_log;
create policy "staff read audit"
  on public.audit_log for select to authenticated using (public.is_staff());
