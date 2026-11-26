#!/usr/bin/env node
/**
 * Run all Neon migrations in order.
 * Usage: node neon/migrate.js
 * Requires DATABASE_URL_UNPOOLED in your environment (from .env.local).
 */
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error("❌  Set DATABASE_URL_UNPOOLED in .env.local first.");
    process.exit(1);
  }

  const sql = neon(url);
  const dir = path.join(__dirname);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log(`▶  Running ${file}…`);
    const query = fs.readFileSync(path.join(dir, file), "utf8");
    await sql(query);
    console.log(`✅  ${file} done`);
  }

  console.log("\n🎉  All migrations complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
