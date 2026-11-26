-- Be a Buddy — Stage 7 schema: plans-driven payments. Prices live in `plans`
-- (mirrors src/data/plans.ts), never hard-coded. Payments are idempotent on a
-- unique key so a retried webhook never double-charges or double-activates.

do $$ begin
  create type plan_scope as enum ('member', 'bundle', 'host');
exception when duplicate_object then null; end $$;
do $$ begin
  create type sub_status as enum ('active', 'grace', 'cancelled', 'expired');
exception when duplicate_object then null; end $$;
do $$ begin
  create type pay_status as enum ('pending', 'succeeded', 'failed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type pay_provider as enum ('mpesa', 'paystack', 'pesapal');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- plans (reference data, seeded from src/data/plans.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.plans (
  code         text primary key,
  name         text not null,
  scope        plan_scope not null,
  circle_id    text references public.circles (id),
  monthly_kes  integer not null,
  annual_kes   integer,
  currency     text not null default 'KES',
  features     jsonb not null default '[]'::jsonb,
  active       boolean not null default true
);

insert into public.plans (code, name, scope, circle_id, monthly_kes, annual_kes) values
  ('buddy-plus',     'Buddy Plus',      'member', 'friends',     399, 3300),
  ('active-plus',    'Active Plus',     'member', 'fitness',     399, 3300),
  ('goal-plus',      'Goal Plus',       'member', 'goals',       499, 4200),
  ('fellowship-plus','Fellowship Plus', 'member', 'faith',       299, 2500),
  ('student-plus',   'Student Plus',    'member', 'students',    199, 1700),
  ('pro-networker',  'Pro Networker',   'member', 'work',        799, 6700),
  ('table-pass',     'Table Pass',      'member', 'buddy-table', 1500, 12000),
  ('spark-plus',     'Spark Plus',      'member', 'spark',       799, 6700),
  ('spark-gold',     'Spark Gold',      'member', 'spark',       1499, 12500),
  ('all-access',     'Buddy All-Access','bundle', null,          1499, null),
  ('all-access-gold','All-Access + Spark Gold','bundle', null,   2499, null),
  ('community-host', 'Community Host',  'host',   null,          1000, null),
  ('ministry',       'Ministry',        'host',   null,          2500, null),
  ('corporate',      'Corporate',       'host',   null,          15000, null),
  ('venue-partner',  'Venue Partner',   'host',   null,          5000, null)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  plan_code  text not null references public.plans (code),
  status     sub_status not null default 'active',
  interval   text not null default 'monthly' check (interval in ('monthly', 'annual')),
  started_at timestamptz not null default now(),
  renews_at  timestamptz,
  grace_until timestamptz,
  unique (user_id, plan_code)
);

-- ---------------------------------------------------------------------------
-- payments (idempotent) + payouts
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  plan_code       text references public.plans (code),
  amount_kes      integer not null,
  provider        pay_provider not null,
  provider_ref    text,
  idempotency_key text not null unique,
  status          pay_status not null default 'pending',
  created_at      timestamptz not null default now()
);

create table if not exists public.payouts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references public.organisations (id) on delete set null,
  amount_kes  integer not null,
  status      text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at  timestamptz not null default now()
);

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.plans         enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments      enable row level security;
alter table public.payouts       enable row level security;

drop policy if exists "plans public read" on public.plans;
create policy "plans public read" on public.plans for select using (active);

drop policy if exists "own subscriptions" on public.subscriptions;
create policy "own subscriptions"
  on public.subscriptions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Members read their own payments; inserts/status transitions happen server-side
-- via the service role from the provider webhook (never from the client).
drop policy if exists "read own payments" on public.payments;
create policy "read own payments"
  on public.payments for select to authenticated using (user_id = auth.uid());

drop policy if exists "org payouts read" on public.payouts;
create policy "org payouts read"
  on public.payouts for select to authenticated
  using (
    exists (
      select 1 from public.organisations o
      where o.id = org_id and o.created_by = auth.uid()
    )
    or public.is_staff()
  );
