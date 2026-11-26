# Data model

Tables grow stage by stage. Row Level Security is on **every** table; the client
only ever uses the anon key (never the service-role key).

## Stage 2 (`supabase/migrations/0001_init_stage2.sql`)

| Table | Purpose | Key RLS rule |
| --- | --- | --- |
| `circles` | Reference data for the 16 Circles | Public read-only |
| `profiles` | One base identity per user (name, area, avatar) | Authenticated read; owner writes |
| `circle_memberships` | **Per-Circle** profile + visibility | Visible unless it is Spark, or `visibility = 'private'`, unless you own it |
| `goals` | Goals & Dreams board entries | Visible with the owner's (non-Spark, non-private) Circle membership |
| `goal_supporters` | cheer / join / accountability | You write only your own rows |

### The Spark boundary

The master plan's hard rule — *a user's Spark profile and activity are never
readable from any other Circle* — is enforced in the `circle_memberships` and
`goals` SELECT policies (`circle_id <> 'spark'`), not only in the UI.

### Tests

`supabase/tests/stage2_rls.test.sql` (pgTAP) asserts Spark isolation,
cross-user read rules and write ownership. Run with `supabase test db` (needs the
Supabase test-helpers extension installed in the test database).

## Stage 3 (`supabase/migrations/0002_init_stage3.sql`)

| Table | Purpose | Key RLS rule |
| --- | --- | --- |
| `verifications` | Ladder step statuses (selfie, ID) | Owner manages own; staff read |
| `organisations` / `org_members` | Church/company/venue verification | Creator manages; staff verify |
| `reports` | Block/report filings | Reporter + staff read; staff triage |
| `blocks` | Per-user blocks | Blocker owns their rows |
| `trust_scores` | Trust score per user | Authenticated read; owner/staff write |
| `content_flags` | AI pre-screen + photo review queue | Subject + staff read; staff resolve |
| `audit_log` | Moderation/audit trail | Append own; staff read |

`profiles` gained `role` and `is_frozen`. Moderation policies gate on
`is_staff()` (SECURITY DEFINER). A `guard_profile_privileges` trigger blocks
members from changing their own `role`/`is_frozen` — only staff can.

## Stage 4 (`supabase/migrations/0003_init_stage4.sql`)

| Table | Purpose | Key RLS rule |
| --- | --- | --- |
| `likes` | Directional likes | You manage your own; "likes to me" only in non-Spark |
| `matches` | Mutual pairs (ordered `user_a < user_b`) | Visible only to the two users |
| `conversations` | One per match | Members only (`in_conversation()`) |
| `conversation_members` | Roster | Members only |
| `messages` | Chat messages (Realtime) | Read/send only within your conversations |

A reciprocal like fires `create_match_on_reciprocal` (SECURITY DEFINER) which
inserts the ordered `match`. `messages` is added to the `supabase_realtime`
publication so members receive new messages live.

## Stage 5 (`supabase/migrations/0004_init_stage5.sql`)

| Table | Purpose | Key RLS rule |
| --- | --- | --- |
| `spark_profiles` | Separate dating profile | Owner + other Spark members only (`in_spark()`) — never outside Spark |
| `spark_mixers` | Group-first singles events | Readable by Spark members |
| `spark_mixer_rsvps` | Mixer RSVPs | Owner manages own |

Spark likes/matches reuse `likes`/`matches` with `circle_id = 'spark'`; the
Stage 4 "see likes to me" policy excludes Spark, so "who liked you" is a
premium-only reveal. `in_spark()` (SECURITY DEFINER) keeps the dating world
readable only to people who are themselves in Spark.

## Stage 6 (`supabase/migrations/0005_init_stage6.sql`)

| Table | Purpose | Key RLS rule |
| --- | --- | --- |
| `groups` / `group_members` | Groups + membership (5 kinds) | Private groups member-only (`in_group()`) |
| `events` / `event_rsvps` | Events + RSVP/waitlist/check-in | Attendees manage own RSVP; host reads the list |
| `ratings` | Post-meetup rating + no-show | Only a "going" attendee can rate, once |
| `buddy_tables` / `table_seats` | Buddy Table + seats | Readable to all; seat owned by the sitter; venue revealed `reveal_hours` before |

## Stage 7 (`supabase/migrations/0006_init_stage7.sql`)

| Table | Purpose | Key RLS rule |
| --- | --- | --- |
| `plans` | Pricing reference (mirrors `src/data/plans.ts`) | Public read of active plans |
| `subscriptions` | Member subscriptions | Owner only |
| `payments` | Payment records, **unique `idempotency_key`** | Owner reads; written server-side via webhook |
| `payouts` | Host payouts | Org owner + staff |

Prices are never hard-coded — the plans data is the source. Payment amounts are
computed server-side in `/api/payments/initiate` from the plan, and the webhook
is idempotent (the unique key is the production dedupe gate).

## App wiring note

Stage 2 UI reads/writes through a repository layer (`src/lib/data/`). Until real
Supabase **auth sessions** exist (Stage 3 — verification), the app uses the
local demo store so the flows are fully previewable; the schema + RLS above is
the production target the repository switches to once `auth.uid()` is real.
