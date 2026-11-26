-- Be a Buddy — Stage 6 schema: groups, events (RSVP + waitlist + QR check-in +
-- ratings + no-show tracking) and Buddy Table (weekly matched tables with a
-- timed venue reveal). RLS keeps private groups member-only and lets attendees
-- rate meetups they attended. Spark isolation continues via circle_id.

do $$ begin
  create type group_kind as enum ('public', 'private', 'verified_only', 'women_only', 'men_only');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rsvp_status as enum ('going', 'waitlist', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------------
create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  circle_id   text not null references public.circles (id),
  name        text not null,
  description text,
  kind        group_kind not null default 'public',
  created_by  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index if not exists groups_circle_idx on public.groups (circle_id);

create table if not exists public.group_members (
  group_id   uuid not null references public.groups (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null default 'member' check (role in ('organiser', 'member')),
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create or replace function public.in_group(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.group_members where group_id = g and user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- events + RSVPs + ratings
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  circle_id   text not null references public.circles (id),
  group_id    uuid references public.groups (id) on delete set null,
  title       text not null,
  description text,
  venue       text,
  area        text,
  starts_at   timestamptz not null,
  capacity    integer not null default 20,
  women_only  boolean not null default false,
  men_only    boolean not null default false,
  verified_only boolean not null default false,
  host_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index if not exists events_circle_idx on public.events (circle_id, starts_at);

create table if not exists public.event_rsvps (
  event_id   uuid not null references public.events (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  status     rsvp_status not null default 'going',
  checked_in boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.ratings (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events (id) on delete cascade,
  rater_id   uuid not null references auth.users (id) on delete cascade,
  stars      smallint not null check (stars between 1 and 5),
  no_show    boolean not null default false,
  comment    text,
  created_at timestamptz not null default now(),
  unique (event_id, rater_id)
);

-- ---------------------------------------------------------------------------
-- Buddy Table
-- ---------------------------------------------------------------------------
create table if not exists public.buddy_tables (
  id           uuid primary key default gen_random_uuid(),
  area         text not null,
  starts_at    timestamptz not null,
  reveal_hours integer not null default 24,
  venue        text,
  seats        integer not null default 6,
  created_at   timestamptz not null default now()
);

create table if not exists public.table_seats (
  table_id   uuid not null references public.buddy_tables (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (table_id, user_id)
);

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.events        enable row level security;
alter table public.event_rsvps   enable row level security;
alter table public.ratings       enable row level security;
alter table public.buddy_tables  enable row level security;
alter table public.table_seats   enable row level security;

-- groups: public/gated groups are discoverable; private groups only to members.
drop policy if exists "groups discoverable" on public.groups;
create policy "groups discoverable"
  on public.groups for select to authenticated
  using (kind <> 'private' or public.in_group(id) or created_by = auth.uid());
drop policy if exists "create group" on public.groups;
create policy "create group"
  on public.groups for insert to authenticated with check (created_by = auth.uid());
drop policy if exists "manage group" on public.groups;
create policy "manage group"
  on public.groups for update to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists "see group roster" on public.group_members;
create policy "see group roster"
  on public.group_members for select to authenticated using (public.in_group(group_id));
drop policy if exists "join or leave group" on public.group_members;
create policy "join or leave group"
  on public.group_members for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- events: visible to authenticated (discovery); host manages.
drop policy if exists "events readable" on public.events;
create policy "events readable"
  on public.events for select to authenticated using (true);
drop policy if exists "host creates event" on public.events;
create policy "host creates event"
  on public.events for insert to authenticated with check (host_id = auth.uid());
drop policy if exists "host manages event" on public.events;
create policy "host manages event"
  on public.events for update to authenticated
  using (host_id = auth.uid()) with check (host_id = auth.uid());

-- rsvps: attendees manage their own; hosts can read their event's list.
drop policy if exists "manage own rsvp" on public.event_rsvps;
create policy "manage own rsvp"
  on public.event_rsvps for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "host reads rsvps" on public.event_rsvps;
create policy "host reads rsvps"
  on public.event_rsvps for select to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid()));

-- ratings: only an attendee who was going can rate, once; readable to host.
drop policy if exists "attendee rates" on public.ratings;
create policy "attendee rates"
  on public.ratings for insert to authenticated
  with check (
    rater_id = auth.uid()
    and exists (
      select 1 from public.event_rsvps r
      where r.event_id = ratings.event_id and r.user_id = auth.uid() and r.status = 'going'
    )
  );
drop policy if exists "read own or host ratings" on public.ratings;
create policy "read own or host ratings"
  on public.ratings for select to authenticated
  using (
    rater_id = auth.uid()
    or exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid())
  );

-- buddy tables: readable to all authenticated; seats owned by the sitter. The
-- venue column is only populated reveal_hours before starts_at (done server-side).
drop policy if exists "tables readable" on public.buddy_tables;
create policy "tables readable"
  on public.buddy_tables for select to authenticated using (true);
drop policy if exists "manage own seat" on public.table_seats;
create policy "manage own seat"
  on public.table_seats for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "see table seats" on public.table_seats;
create policy "see table seats"
  on public.table_seats for select to authenticated using (true);
