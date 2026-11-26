import { neon } from "@neondatabase/serverless";

/**
 * Neon HTTP-based SQL client. One function per request — no persistent
 * connection pool needed (Neon's HTTP driver handles this internally).
 *
 * Usage:
 *   import { sql } from "@/lib/db";
 *   const rows = await sql`SELECT * FROM waitlist WHERE email = ${email}`;
 *
 * Returns null in demo mode (DATABASE_URL not set) so callers can fall back
 * to demo data gracefully rather than crashing.
 */
function createSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export const sql = createSql();
