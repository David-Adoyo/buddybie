// Public environment values. Secrets (service-role key, Stripe, Smile ID, etc.)
// are NEVER read here — they live in server-only modules. See /docs/PLACEHOLDERS.md.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/**
 * True only when real Supabase credentials are present. When false the app runs
 * in "demo mode": flows are fully clickable for preview, but nothing persists.
 */
export const isSupabaseConfigured =
  env.supabaseUrl.startsWith("http") && env.supabaseAnonKey.length > 20;

/**
 * True when DATABASE_URL (Neon) is set. Used by server-only modules only —
 * the connection string must never reach the browser.
 */
export const isDatabaseConfigured =
  (process.env.DATABASE_URL ?? "").startsWith("postgres");
