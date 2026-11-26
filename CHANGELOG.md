# Changelog

All notable changes, per build stage. UK spelling throughout.

## Rebrand & redesign — Buddybie

- Renamed the product to **Buddybie** (wordmark `buddybie.`), including metadata, copy, legal pages and the PWA manifest.
- Palette resampled from the logo: red `#e0433a`, orange `#ff8a4c`, pink `#ff5596`; rounded Fredoka display face.
- Landing page restructured after mastercard.com: mega-menu header, hero panel, story carousel, solutions grid, benefits split, dark band, FAQ, "Need help?" footer.
- Brand loader (`BuddyLoader`): the three logo circles orbit clockwise separately, then bounce one after another on an invisible line. Shown on first load, every internal link click and route `loading.tsx`.
- Favicon set regenerated: `favicon.ico` (16/32/48), `icon.png` (32), `apple-icon.png` (180), PWA icons 192/512 plus maskable variants.
- People photography generated in Figma for each site area (`public/images/people/*.webp`), used on the landing page and inner-page heroes.
- SEO: keyword-led titles and descriptions, FAQPage and WebApplication JSON-LD, de-duplicated page titles, descriptive image alt text.

## Stage 9 — Launch readiness (unreleased)

### Added

- **SEO landing pages**: `/discover` hub and `/discover/[city]/[circle]` with
  per-page `generateMetadata` + canonical URLs (Nairobi × 8 launch Circles).
- **Open Graph image**: branded `app/opengraph-image.tsx` via `next/og`.
- **Legal pages** (`/legal/[doc]`): Terms, Privacy, Community, Safety Centre,
  Refunds — placeholder copy marked `{{LAWYER_TEXT}}`, linked from the footer.
- **Cookie/consent banner**: privacy-preserving (decline-non-essential given
  equal weight), stored locally.
- **Data export + account deletion** (`/settings/data`): download all your data
  as JSON, or erase it.
- **API rate limits** (`src/lib/rate-limit.ts`) on the moderation, icebreaker and
  payment routes (429 + `retry-after`).
- **Analytics/error stubs** (`src/lib/analytics.ts`): PostHog + Sentry seams,
  no-op until keys are set.
- **`docs/LAUNCH_CHECKLIST.md`** — the Nairobi go-live checklist.

## Stage 8 — Host & organisation dashboards (unreleased)

### Added

- **Host dashboard** (`/host`): type selector with **Ministry** (sub-groups,
  attendance, giving link), **Corporate** (invite-by-domain, mentorship matching,
  engagement) and **Venue** (tables & bookings) panels. Demo host gate.
- **Admin console** (`/admin`): weekly **metrics** (sign-up→verified, meetups /
  member, no-show, 30-day retention, paid conversion, safety reports / 1k), users,
  verifications queue, **plans** on/off, **Circles on/off per city** (Nairobi),
  **refunds** over recorded payments, and a link to the moderation queue. Staff gate.
- Both surfaced from the Home hub. (No new tables — reads Stage 3 organisations +
  Stage 7 plans/payments under the existing RLS; staff/host/org-admin roles gate
  access in production.)

## Stage 7 — Payments and plans (unreleased)

### Added

- **Plans-driven pricing**: `src/data/plans.ts` + `docs/PRICING.md` are the single
  source; the `plans` table mirrors it. No prices hard-coded in UI or payment code.
- **Schema + RLS** (`supabase/migrations/0006_init_stage7.sql`): `plans` (seeded),
  `subscriptions` (active/grace/cancelled), `payments` (**unique `idempotency_key`**),
  `payouts`. Members read their own; payments are written server-side via the webhook.
- **Payments behind a provider interface** (`src/lib/payments/`): M-Pesa Daraja
  (STK push), Paystack, Pesapal adapters + factory.
- **API routes**: `/api/payments/initiate` (amount from plans data, never the
  client) and `/api/payments/webhook` (**idempotent** — dedupes retried callbacks).
- **Plans page** (`/plans`): member / bundle / host tiers, monthly↔annual,
  subscribe → pay (M-Pesa/card) → receipt. Proof-one (Buddy Plus) generalised to
  every plan. Upgrade CTAs from the matcher cap and Spark "who liked you" link here;
  subscribing to a Spark plan unlocks Spark premium.

## Stage 6 — Groups, events and Buddy Table (unreleased)

### Added

- **Schema + RLS** (`supabase/migrations/0005_init_stage6.sql`): `groups`
  (public/private/verified-only/women-only/men-only), `group_members`, `events`,
  `event_rsvps`, `ratings`, `buddy_tables`, `table_seats`. Private groups are
  member-only (`in_group()`); only attendees who were "going" can rate an event.
- **Groups** (`/groups`): per-Circle list with kind badges, join/leave and a
  create flow.
- **Events** (`/events`, `/events/[id]`): RSVP with capacity → **waitlist**, a
  **QR check-in** (demo), and **post-meetup ratings + no-show** reporting.
- **Buddy Table** (`/table`): weekly matched tables of 4–6 with the **venue
  revealed `{{TABLE_REVEAL_HOURS}}` (default 24h) before** start; take/leave a seat.
- **Home is now a hub** surfacing Buddies, Groups, Events, Buddy Table, Safety.

## Stage 5 — Spark (Dating) (unreleased)

The dating Circle — its own skin, an 18+/ID-verified gate, values matching,
"who liked you" (premium), group-first mixers and the date-safety kit. Spark
stays fully isolated from every other Circle.

### Added

- **Schema + RLS** (`supabase/migrations/0004_init_stage5.sql`): `spark_profiles`
  (separate dating profile), `spark_mixers`, `spark_mixer_rsvps`, and an
  `in_spark()` boundary so Spark data is readable **only** by other Spark members.
  Likes/matches reuse the Stage 4 tables with `circle_id = 'spark'`.
- **18+ / ID-verified gate** (`SparkGate`): Spark surfaces unlock only after the
  member sets up a Spark profile (confirming 18+) and reaches ID verification.
- **Separate Spark profile** (`/profile` in Spark): relationship intent, faith +
  importance, children, group-first, bio — isolated from all other Circles.
- **Spark discovery** (`/buddies` in Spark): values/intent/faith/area matching
  (`src/lib/matching/spark-score.ts`) with a **Spark: Faith** filter, distinct
  pink skin, like/pass, and match → chat.
- **Who liked you** (premium): locked count for free members, revealed list with
  a demo premium toggle.
- **Group-first mixers** + RSVP, and a **date-safety** card (public venues +
  links to the safety kit) on the Spark home.
- Spark matches/chat are isolated: the buddy chat list never shows them.

### Notes

- Spark uses its own demo store (`src/lib/data/spark.ts`); schema + RLS are the
  production target.

## Stage 4 — Matching and chat (unreleased)

The AI Buddy Matcher, daily suggestions with a server-enforced free-tier cap,
mutual-opt-in chat and icebreaker cards.

### Added

- **Schema + RLS** (`supabase/migrations/0003_init_stage4.sql`): `likes`,
  `matches`, `conversations`, `conversation_members`, `messages`. A reciprocal
  like fires a trigger that creates the mutual `match`; conversations/messages
  are private to members (RLS via `in_conversation()`); `messages` is added to
  the Realtime publication.
- **AI Buddy Matcher** (`/buddies`): scores candidates on shared goals, quiz
  traits and area (`src/lib/matching/score.ts`), sorts, and shows a one-line
  "why you match". Connect = like; a reciprocated like is an instant match.
- **Server-enforced free tier** (`/api/suggestions`): 5 new suggestions a day,
  tracked in an httpOnly, date-keyed cookie the client can't bump.
- **Mutual-opt-in chat** (`/chat`, `/chat/[id]`): conversations unlock only on a
  match; demo messages persist locally with a simulated reply (Realtime-ready).
- **Icebreaker cards** (`/api/icebreakers`): Claude-generated openers (official
  SDK) with friendly templates as the fallback, shown on a new chat.
- Romance-scam warning now also runs inline on the chat composer.
- Bottom nav reworked to Home · Buddies · Goals · Chat · Profile; Safety moved to
  a header icon.

### Notes

- Matching/chat use the demo store; schema + RLS + Realtime are the production
  target. Icebreakers use Claude when `ANTHROPIC_API_KEY` is set.

## Stage 3 — Verification and safety (unreleased)

The full trust & safety surface: the verification ladder, block/report, a
moderation queue, AI pre-screening, romance-scam warnings, and the safety kit.

### Added

- **Schema + RLS** (`supabase/migrations/0002_init_stage3.sql`): `verifications`,
  `organisations`, `org_members`, `reports`, `blocks`, `trust_scores`,
  `content_flags`, `audit_log`, plus `profiles.role`/`is_frozen`. A staff-only
  moderation boundary (`is_staff()`) and a trigger that blocks members from
  escalating their own role or un-freezing themselves.
- **Verification ladder** (`/safety`): phone → selfie liveness → government ID →
  organisation, with level and trust-score display and verified badges.
- **KYC behind a provider interface** (`src/lib/kyc/`): demo provider + Smile ID
  stub, selected by `SMILE_ID_*` env.
- **AI pre-screen** (`/api/moderate`, `src/lib/moderation/`): classifies posted
  text with Claude (official SDK, defaults to `claude-opus-4-8`, server-only) and
  falls back to a heuristic when `ANTHROPIC_API_KEY` is unset. Flagged posts are
  blocked and queued for review.
- **Romance-scam warnings**: inline, as-you-type, on the goal composer.
- **Block & report**: two-tap report + block from any goal, feeding the queue.
- **Moderation queue** (`/admin/moderation`): triage reports and AI-flagged
  content; demo moderator toggle (RLS enforces staff-only in production).
- **Safety kit**: trusted contacts, share-my-plan, check-in timer, and an SOS
  button that shares live location (`navigator.geolocation`).

### Notes

- Safety/verification data uses the demo store; schema + RLS are the production
  target. Real KYC and LLM calls activate when their keys are set.

## Stage 2 — Circles, profiles and goals (unreleased)

Per-Circle identity and the Goals & Dreams board, built Friends-first (proof-one)
and applied across the wave-1 Circles. The Spark-isolation rule is enforced in
Row Level Security, not just the UI.

### Added

- **Schema + RLS** (`supabase/migrations/0001_init_stage2.sql`): `circles`,
  `profiles`, `circle_memberships`, `goals`, `goal_supporters` with RLS on every
  table. Spark memberships/goals are unreadable from other Circles at the
  database layer. pgTAP tests in `supabase/tests/stage2_rls.test.sql`.
- **Signed-in app shell** (`src/app/(app)/`): header with a **Circle switcher**,
  desktop nav + mobile bottom nav, Home / Goals / Profile.
- **Circle switcher**: one identity, switch between joined Circles; Spark flagged
  18+ and gated with an isolation notice.
- **Per-Circle profiles** (`/profile`): display name, bio and **visibility**
  (public / members / private) per Circle, over a shared base identity.
- **Goals & Dreams board** (`/goals`): post goals, **cheer**, **join** and
  **request an accountability buddy**, with seeded demo buddies to interact with.
- **Per-Circle home** (`/home`): profile summary + your goals in the active Circle.
- **Docs**: `docs/DATA_MODEL.md`.

### Notes

- Interactive data uses the local demo store (same pattern as Stage 1); it
  switches to live Supabase queries once real auth sessions exist in Stage 3.
- Onboarding goals are migrated into the board under the first joined Circle.

## Stage 1 — Foundation (unreleased)

Repo, environment, design system, layout shell, i18n, phone-OTP auth and the
full onboarding flow, plus a waitlist landing page.

### Added

- **Project**: Next.js 16 (App Router, TypeScript), Tailwind CSS v4, hand-rolled
  shadcn/ui-style primitives (`components.json` present for the CLI).
- **PWA**: web manifest, brand icons, offline shell (`public/sw.js`,
  `public/offline.html`), installable with a low-data mode toggle.
- **i18n**: next-intl with cookie-based locale (no URL prefix). English shipped;
  Kiswahili wired up (`messages/en.json`, `messages/sw.json`) with a switcher.
- **Design system**: warm, human theme tokens (placeholder brand palette), light
  and dark themes, mobile-first, each Circle has an icon and accent colour.
- **Auth**: phone OTP sign-in (`/signin`) via Supabase, with a graceful demo
  mode when Supabase is not configured.
- **Onboarding** (`/onboarding`): name → photo → area → pick Circles →
  3–5 goals → 15-question personality quiz, with a stepper and progress bar.
- **Landing** (`/`): hero, Pick-your-Circle grid (8 launch Circles), features,
  how-it-works, safety band and a waitlist form.
- **Home** (`/home`): post-onboarding summary of Circles and goals.
- **Data model seeds**: all 16 Circles (`src/data/circles.ts`), the quiz
  (`src/data/quiz.ts`) and Nairobi areas (`src/data/areas.ts`).
- **Docs**: `docs/PLACEHOLDERS.md`, `docs/PARKING_LOT.md`.

### Notes

- Runs fully in **demo mode** without any secrets; add Supabase keys to enable
  real OTP and persistence.
- Brand colours, logo and all secrets are placeholders — see
  `docs/PLACEHOLDERS.md`.
