# Launch checklist — Nairobi

Status legend: ✅ built in v1 · 🔑 needs a confirmed value/key · ⚖️ needs legal/ops.

## Product (built in v1)

- [x] Foundation, design system, PWA, EN + Swahili i18n
- [x] Circles, per-Circle profiles & visibility, Goals & Dreams board
- [x] Verification ladder, block/report, moderation queue, AI pre-screen, safety kit
- [x] AI Buddy Matcher, mutual-opt-in chat, icebreakers, server-enforced free tier
- [x] Spark (Dating): isolated profile, 18+/ID gate, values matching, mixers, who-liked-you
- [x] Groups, events (RSVP/waitlist/QR check-in/ratings/no-show), Buddy Table
- [x] Plans-driven payments (M-Pesa/Paystack/Pesapal adapters, idempotent webhook)
- [x] Host & organisation dashboards, admin console
- [x] SEO city×Circle landing pages, OG images, legal pages, cookie consent, data export/deletion, API rate limits

## Before go-live

### Keys & config (🔑 — see docs/PLACEHOLDERS.md)
- [ ] Supabase project: run migrations `0001`–`0006`, set `NEXT_PUBLIC_SUPABASE_*`
- [ ] Confirm brand colours/logo (`{{BRAND_*}}`) and PWA icons
- [ ] M-Pesa Daraja (`MPESA_*`), Paystack/Pesapal keys; test STK push + webhook
- [ ] Smile ID (`SMILE_ID_*`) for selfie liveness + Kenyan ID
- [ ] `ANTHROPIC_API_KEY` (+ `MODERATION_MODEL`) for AI pre-screen & icebreakers
- [ ] PostHog (`NEXT_PUBLIC_POSTHOG_KEY`) + Sentry (`NEXT_PUBLIC_SENTRY_DSN`)
- [ ] `TABLE_REVEAL_HOURS`, maps key, WhatsApp/Resend/Africa's Talking messaging

### Compliance (⚖️)
- [ ] ODPC data-controller registration + DPIA (dating, faith, location) + named DPO
- [ ] Lawyer-reviewed Terms, Privacy, Community, Refunds, Safety Centre (`{{LAWYER_TEXT}}`)
- [ ] KIPI trademark filing; eCitizen BRS + KRA PIN
- [ ] Per-Circle consent screens; separate consent for sensitive data

### Engineering hardening
- [ ] Wire demo stores to Supabase (auth sessions) — see docs/PARKING_LOT.md
- [ ] RLS tests pass (`supabase test db`); payment webhook idempotency tested with the live provider
- [ ] Shared rate-limit store (Upstash/Redis) instead of in-memory
- [ ] Load test; Sentry + PostHog dashboards for the weekly metrics
- [ ] Real QR check-in; Realtime chat; photo uploads + AI image moderation

### Growth / content
- [ ] Seed Nairobi content (Circles, founding groups, first events, Buddy Tables)
- [ ] Founding partners: 3 churches/ministries, 2 corporates, 5 venues
- [ ] "Buddy Week" launch events; campus/church ambassadors

## Metrics to watch weekly
Sign-up→verified · meetups/member · no-show rate · 30-day retention ·
paid conversion per Circle · safety reports per 1,000 meetups. (Dashboards in `/admin`.)
