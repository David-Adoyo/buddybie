-- Be a Buddy — Stage 4 schema: matching (likes → mutual matches) and chat.
-- Chat is mutual-opt-in: a conversation only exists once two people match.
-- Messages are Realtime-enabled. RLS keeps conversations private to members and
-- continues the Spark-isolation rule (likes/matches in Spark never leak).

-- ---------------------------------------------------------------------------
-- likes: directional. A reciprocal pair becomes a match (see trigger below).
-- ---------------------------------------------------------------------------
create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  liker_id   uuid not null references auth.users (id) on delete cascade,
  liked_id   uuid not null references auth.users (id) on delete cascade,
  circle_id  text not null references public.circles (id),
  created_at timestamptz not null default now(),
  unique (liker_id, liked_id, circle_id),
  check (liker_id <> liked_id)
);
create index if not exists likes_liked_idx on public.likes (liked_id, circle_id);

-- ---------------------------------------------------------------------------
-- matches: one row per mutual pair, ordered so (a,b) is unique.
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references auth.users (id) on delete cascade,
  user_b     uuid not null references auth.users (id) on delete cascade,
  circle_id  text not null references public.circles (id),
  created_at timestamptz not null default now(),
  unique (user_a, user_b, circle_id),
  check (user_a < user_b)
);

-- ---------------------------------------------------------------------------
-- conversations + members + messages
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  circle_id  text not null references public.circles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references auth.users (id) on delete cascade,
  body            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- Reciprocal-like → match (ordered pair). SECURITY DEFINER so the insert into
-- matches isn't blocked by the match RLS during the trigger.
create or replace function public.create_match_on_reciprocal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.likes l
    where l.liker_id = new.liked_id
      and l.liked_id = new.liker_id
      and l.circle_id = new.circle_id
  ) then
    insert into public.matches (user_a, user_b, circle_id)
    values (least(new.liker_id, new.liked_id), greatest(new.liker_id, new.liked_id), new.circle_id)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists create_match_on_reciprocal on public.likes;
create trigger create_match_on_reciprocal
  after insert on public.likes
  for each row execute function public.create_match_on_reciprocal();

-- Membership helper (SECURITY DEFINER to avoid recursive RLS on the join).
create or replace function public.in_conversation(conv uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv and user_id = auth.uid()
  );
$$;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.likes                 enable row level security;
alter table public.matches               enable row level security;
alter table public.conversations         enable row level security;
alter table public.conversation_members  enable row level security;
alter table public.messages              enable row level security;

-- likes: you manage your own; you may also see likes directed AT you only in
-- non-Spark Circles ("who liked you" in Spark is a premium feature — Stage 5).
drop policy if exists "manage own likes" on public.likes;
create policy "manage own likes"
  on public.likes for all to authenticated
  using (liker_id = auth.uid()) with check (liker_id = auth.uid());
drop policy if exists "see likes to me (non-spark)" on public.likes;
create policy "see likes to me (non-spark)"
  on public.likes for select to authenticated
  using (liked_id = auth.uid() and circle_id <> 'spark');

-- matches: visible only to the two people in them.
drop policy if exists "see own matches" on public.matches;
create policy "see own matches"
  on public.matches for select to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());

-- conversations: visible to members.
drop policy if exists "see own conversations" on public.conversations;
create policy "see own conversations"
  on public.conversations for select to authenticated
  using (public.in_conversation(id));

-- conversation_members: a member sees the roster of conversations they're in.
drop policy if exists "see conversation roster" on public.conversation_members;
create policy "see conversation roster"
  on public.conversation_members for select to authenticated
  using (public.in_conversation(conversation_id));

-- messages: read within your conversations; send only as yourself, only in your
-- conversations.
drop policy if exists "read conversation messages" on public.messages;
create policy "read conversation messages"
  on public.messages for select to authenticated
  using (public.in_conversation(conversation_id));
drop policy if exists "send conversation messages" on public.messages;
create policy "send conversation messages"
  on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.in_conversation(conversation_id));

-- Realtime: stream new messages to subscribed members.
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; when undefined_object then null; end $$;
