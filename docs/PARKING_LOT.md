# Parking lot

Ideas and follow-ups noticed while building but deliberately **out of the
current stage's scope**. Nothing here is lost; it is picked up in the stage noted.

## From Stage 5 — Spark (Dating)

- **Separate Spark photos.** Spark profile stores text fields only; add isolated
  photo upload (separate Storage bucket, AI nudity screening). _(Needs Storage + vision.)_
- **"Who liked you" server gate.** Premium reveal is a demo toggle; wire to real
  plans and a premium-only server view over `likes` where `circle_id='spark'`. _(Stage 7.)_
- **Spark mixers as real events.** Mixers are seed data; fold into the Stage 6
  events system (RSVP, capacity, QR check-in, women-only enforcement). _(Stage 6.)_
- **Spark chat polish.** Reuses the generic conversation UI (isolated by id); a
  dedicated Spark-skinned thread + unmatch/report shortcuts would be nicer. _(Later.)_
- **Age from DOB.** 18+ is a self-confirm checkbox; production should derive age
  from the KYC ID check, not a checkbox. _(Stage 3 KYC wiring.)_

## From Stage 4 — Matching and chat

- **Realtime chat wiring.** Chat uses the local demo store with a simulated
  reply. Wire Supabase Realtime on `messages` (publication already set) once auth
  is real. _(Stage 4 follow-up with live auth.)_
- **PostGIS area search.** Area matching is an exact-string match on the seed
  neighbourhood; the plan calls for PostGIS distance search. Add a `geography`
  column + `ST_DWithin` ranking. _(Perf/data pass.)_
- **LLM-ranked matching.** Scoring is deterministic (goals + traits + area). An
  LLM re-rank / richer "why you match" could layer on top. _(Optional.)_
- **Availability in onboarding.** Candidates carry availability but onboarding
  doesn't collect the member's own — add it so availability contributes to the
  score. _(Onboarding v2.)_
- **Daily-suggestion reset & plan gating.** The free cap is cookie-based; move to
  per-user server state and connect the upgrade CTA to real plans. _(Stage 7.)_

## From Stage 3 — Verification and safety

- **Real KYC wiring.** `SmileIdProvider.start()` is a stub — wire the Smile ID
  job API (selfie liveness + Kenyan ID) and persist status via a server webhook
  using the service role. _(Stage 3+ when keys land.)_
- **Photo AI moderation.** Text pre-screen is wired to Claude; image moderation
  (nudity/scam detection on uploaded photos) is represented as queued
  `content_flags` only — add Claude vision screening of avatars/photos. _(Stage 5.)_
- **SOS + check-in delivery.** The safety kit prepares location/plan messages but
  does not send them (no messaging backend yet). Wire WhatsApp/SMS delivery to
  trusted contacts. _(Stage 4 messaging.)_
- **Real notifications on freeze/report.** Moderation actions update local state;
  wire email/SMS to reporters and frozen users, and the 24-hour review SLA. _(Stage 8.)_
- **Trust score from ratings.** Currently derived from verification + reports;
  feed post-meetup ratings once events exist. _(Stage 6.)_

## From Stage 2 — Circles, profiles and goals

- **Live Supabase wiring.** Per-Circle profiles, goals and supporters currently
  use the local demo store. Switch the repository to the Supabase queries (schema
  + RLS already in `supabase/migrations/0001_init_stage2.sql`) once real auth
  sessions land. _(Stage 3.)_
- **Accountability requests.** Modelled as a one-way "requested" flag in the demo
  for now; the real flow (request → accept → paired, with notifications) comes
  with matching/chat. _(Stage 4.)_
- **Support counts.** Seeded goals carry static demo counts; real aggregates come
  from `goal_supporters` once live. _(Stage 3/4.)_
- **Join a Circle in-app.** Onboarding is the only way to join Circles so far; add
  a browse-and-join flow for the remaining Circles. _(Stage 2 follow-up / Stage 6.)_
- **pgTAP helpers.** `supabase/tests/stage2_rls.test.sql` needs the Supabase
  test-helpers extension installed in the local test DB to run.

## From Stage 1 — Foundation

- **Circle copy i18n.** Circle names, taglines and descriptions currently live in
  `src/data/circles.ts` in English only. Move the user-facing strings into
  `messages/*.json` so Kiswahili (and later French/Yoruba/Kinyarwanda) can
  translate them. _(Stage 2, with per-Circle profiles.)_
- **Cache Components / PPR.** `next.config.ts` leaves Next 16 `cacheComponents`
  off for a robust, mostly-dynamic foundation. Revisit for perf once data
  fetching patterns settle. _(Stage 9 / performance pass.)_
- **Serwist PWA.** The service worker (`public/sw.js`) is hand-written and
  minimal. Consider `@serwist/next` for precaching the build manifest and
  smarter runtime caching once the bundler story with Turbopack is confirmed.
  _(Stage 9.)_
- **Photo persistence.** Onboarding keeps the chosen photo in memory only; the
  profile draft (name/area/circles/goals/quiz) is saved to `localStorage`.
  Upload photos to Supabase Storage and persist the profile to a `profiles`
  table under RLS. _(Stage 2 / Stage 3.)_
- **Waitlist storage.** `joinWaitlist` inserts into a `waitlist` table only when
  Supabase is configured; the table itself is created with the data model.
  _(Stage 2.)_
- **More cities & areas.** `src/data/areas.ts` ships Nairobi only. Add Mombasa,
  Kisumu, Kampala, Kigali, etc. as each opens. Consider PostGIS-backed area
  search. _(Stage 4.)_
- **Form library.** `@hookform/resolvers@6` has an upstream peer-dependency
  conflict (effect), so onboarding uses controlled inputs + zod. Re-evaluate a
  form library if validation grows. _(As needed.)_
- **shadcn CLI.** UI primitives are hand-rolled in the shadcn/ui style with a
  `components.json` present, so `npx shadcn@latest add <component>` works for
  future components.
