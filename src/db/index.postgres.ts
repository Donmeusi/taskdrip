/**
 * PostgreSQL database connection for TaskDrip (Neon/Vercel Postgres).
 *
 * This replaces index.ts when migrating from SQLite to Postgres.
 * Uses the `postgres` (postgres.js) driver with Drizzle ORM.
 *
 * To activate: rename this file to index.ts, install deps, and update
 * all API routes to await db calls.
 *
 * Required packages:
 *   npm install postgres
 *   npm uninstall better-sqlite3 @types/better-sqlite3
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.postgres";

const connectionString = process.env.DATABASE_URL!;

// Configure for Neon serverless:
// - Use ssl: "require" for Neon's TLS requirement
// - Use prepare: false for Neon's pipelined query mode
const client = postgres(connectionString, {
  ssl: "require",
  prepare: false,
});

export const db = drizzle(client, { schema });

// Re-export schema and query functions for convenience
export * from "./schema.postgres";
export * from "./queries.postgres";