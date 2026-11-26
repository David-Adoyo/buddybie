# Placeholders & secrets

Every value the agent must not invent lives here. `{{DOUBLE_BRACE}}` tokens are
design/config placeholders; the env vars are set in `.env.local` (never
committed). Nothing here is confirmed — replace before launch.

## Brand (Stage 1)

| Token | Where | Current placeholder default | Needs |
| --- | --- | --- | --- |
| `{{BRAND_PRIMARY}}` | `src/app/globals.css` (`--primary`) | `#e8604c` warm coral | Confirmed brand colour |
| `{{BRAND_SECONDARY}}` | `src/app/globals.css` (`--brand-teal`) | `#1f6f6b` teal | Confirmed brand colour |
| `{{BRAND_ACCENT}}` | `src/app/globals.css` (`--accent`) | `#f4a826` amber | Confirmed brand colour |
| Circle accent colours | `src/data/circles.ts` | per-Circle hex | Confirmed with brand palette |
| Logo | `src/components/logo.tsx` | two-circle SVG mark | Final logo artwork |
| PWA icons | `public/icons/icon-{192,512}.png` | generated brand squares | Final icon artwork |

## Environment variables

Set in `.env.local` (see `.env.example`). When Supabase vars are absent the app
runs in **demo mode** — flows are clickable but nothing persists.

| Var | Scope | Used by | Status |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | `src/lib/env.ts` | needed for real auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | `src/lib/env.ts` | needed for real auth |
| `NEXT_PUBLIC_SITE_URL` | public | metadata / links | optional (defaults to localhost) |
| `ANTHROPIC_API_KEY` | server | `src/lib/moderation/screen.ts` | optional — enables AI pre-screen (else heuristic) |
| `MODERATION_MODEL` | server | `src/lib/moderation/screen.ts` | optional — defaults to `claude-opus-4-8` |
| `SMILE_ID_PARTNER_ID` / `SMILE_ID_API_KEY` | server | `src/lib/kyc/provider.ts` | optional — enables Smile ID KYC (else demo) |

## Reserved for later stages (not yet wired)

These are listed so no one invents them early:

- `SUPABASE_SERVICE_ROLE_KEY` — server only, never in the client (Stage 3+).
- `{{MPESA_SHORTCODE}}`, `{{MPESA_CONSUMER_KEY}}`, `{{MPESA_CONSUMER_SECRET}}`, `{{MPESA_PASSKEY}}` — M-Pesa Daraja (Stage 7).
- `{{SMILE_ID_PARTNER_ID}}`, `{{SMILE_ID_API_KEY}}` — KYC / liveness (Stage 3).
- `{{PAYSTACK_SECRET_KEY}}`, `{{PESAPAL_CONSUMER_KEY}}` — card payments (Stage 7).
- `{{RESEND_API_KEY}}`, `{{AFRICAS_TALKING_API_KEY}}`, `{{WHATSAPP_API_KEY}}` — messaging (Stage 3+).
- `{{MAPS_KEY}}` — Mapbox/Google Maps (Stage 4).
- `{{TABLE_REVEAL_HOURS}}` — Buddy Table venue reveal window (Stage 6).
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SENTRY_DSN` — analytics & errors (`src/lib/analytics.ts`, no-op until set).
- `PAYSTACK_SECRET_KEY`, `PESAPAL_CONSUMER_KEY` — card payments (`src/lib/payments/provider.ts`).
- `{{LAWYER_TEXT}}` — legal copy for Terms/Privacy/Community/Refunds/Safety Centre (`/legal/*`).
- `{{GIVING_LINK}}` — a Ministry host's donation link (`/host`).
