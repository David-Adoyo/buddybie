# Buddybie

> Find your people. A verified, goals-first community app for faith, work, fun,
> growth and love — online and in real life. Nairobi first.

Built in nine staged passes from the master plan
(`Buddybie — Master Plan & Build Prompt.md`). This repository is at **Stage 1 —
Foundation**.

## Stack

- **Next.js 16** (App Router, TypeScript) · **Tailwind CSS v4** · shadcn/ui-style primitives
- **next-intl** (English shipped, Kiswahili wired up) · **PWA** (installable + offline shell)
- **Supabase** (`@supabase/ssr`) for phone-OTP auth — optional in dev

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3001 (pinned, since another app may hold :3000).

The app runs in **demo mode** out of the box (no secrets needed): sign-in accepts
any 6-digit code and onboarding saves to `localStorage`. To enable real phone OTP
and persistence, copy `.env.example` to `.env.local` and add your Supabase keys.

## What is in Stage 1

| Route | What |
| --- | --- |
| `/` | Landing: hero, Pick-your-Circle grid, features, safety, waitlist |
| `/signin` | Phone-OTP sign-in (Supabase, demo-mode fallback) |
| `/onboarding` | Name → photo → area → Circles → goals → 15-question quiz |
| `/home` | Post-onboarding summary |

Theme (light/dark), language (EN/SW) and low-data mode toggles are in the footer.

## Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Docs

- `docs/PLACEHOLDERS.md` — every unconfirmed value and secret.
- `docs/PARKING_LOT.md` — deferred ideas, with the stage that picks them up.
- `CHANGELOG.md` — per-stage change log.

## House rules

UK spelling · build stage-by-stage, stop for preview · Supabase RLS on every
table · no service-role key in the client · secrets in env vars only.
