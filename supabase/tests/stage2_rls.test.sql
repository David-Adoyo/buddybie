-- RLS tests for the Stage 2 schema. Run locally with:
--   supabase test db
--
-- Requires the Supabase test-helpers extension (basejump) which provides
-- tests.create_supabase_user / authenticate_as / get_supabase_uid. See
-- https://github.com/usebasejump/supabase-test-helpers (install into the test db).

begin;
select plan(7);

-- Two members.
select tests.create_supabase_user('alice');
select tests.create_supabase_user('bob');

-- Alice sets up profile + memberships (Friends public, Spark private-by-rule).
select tests.authenticate_as('alice');

insert into public.profiles (id, full_name) values
  (tests.get_supabase_uid('alice'), 'Alice');

insert into public.circle_memberships (user_id, circle_id, display_name, visibility) values
  (tests.get_supabase_uid('alice'), 'friends', 'Alice', 'members'),
  (tests.get_supabase_uid('alice'), 'spark',   'Alice', 'members');

insert into public.goals (user_id, circle_id, title) values
  (tests.get_supabase_uid('alice'), 'friends', 'Run a 10K'),
  (tests.get_supabase_uid('alice'), 'spark',   'Find a partner');

-- Bob's view: Spark must be invisible, Friends visible.
select tests.authenticate_as('bob');

select is(
  (select count(*)::int from public.circle_memberships
     where circle_id = 'spark' and user_id = tests.get_supabase_uid('alice')),
  0, 'Bob cannot see Alice''s Spark membership');

select is(
  (select count(*)::int from public.circle_memberships
     where circle_id = 'friends' and user_id = tests.get_supabase_uid('alice')),
  1, 'Bob can see Alice''s Friends membership');

select is(
  (select count(*)::int from public.goals
     where circle_id = 'spark' and user_id = tests.get_supabase_uid('alice')),
  0, 'Bob cannot see Alice''s Spark goal');

select is(
  (select count(*)::int from public.goals
     where circle_id = 'friends' and user_id = tests.get_supabase_uid('alice')),
  1, 'Bob can see Alice''s Friends goal');

-- Bob cannot modify Alice's goal (RLS filters the row; 0 rows affected).
with upd as (
  update public.goals set title = 'hacked'
  where user_id = tests.get_supabase_uid('alice') returning 1
)
select is((select count(*)::int from upd), 0, 'Bob cannot update Alice''s goals');

-- Bob can cheer a visible (Friends) goal of Alice's.
select lives_ok($$
  insert into public.goal_supporters (goal_id, supporter_id, type)
  select g.id, tests.get_supabase_uid('bob'), 'cheer'
  from public.goals g
  where g.user_id = tests.get_supabase_uid('alice') and g.circle_id = 'friends'
$$, 'Bob can cheer Alice''s Friends goal');

-- Alice can see her own Spark goal.
select tests.authenticate_as('alice');
select is(
  (select count(*)::int from public.goals
     where circle_id = 'spark' and user_id = tests.get_supabase_uid('alice')),
  1, 'Alice can see her own Spark goal');

select * from finish();
rollback;
