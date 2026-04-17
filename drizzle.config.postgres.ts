/**
 * Drizzle Kit configuration for PostgreSQL (Neon).
 *
 * This replaces drizzle.config.ts when migrating from SQLite to Postgres.
 *
 * To activate: rename this file to drizzle.config.ts
 */

import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.postgres.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;