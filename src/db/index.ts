/**
 * TaskDrip database — auto-selects SQLite or Postgres at module load time.
 *
 * Provider selection:
 *   - DATABASE_URL starts with "postgresql://" or "postgres://" → Postgres (Neon)
 *   - Otherwise → SQLite (local dev / demo)
 *
 * Both providers export the same surface area:
 *   db, users, tasks, createUser, getUserById, getUserByEmail,
 *   createTask, getTaskById, getTasksByUserId, updateTaskStatus,
 *   updateTaskResult, updateTaskError, deleteTask
 */

import * as sqliteSchema from "./schema.sqlite";
import * as sqliteQueries from "./queries.sqlite";
import * as postgresSchema from "./schema.postgres";
import * as postgresQueries from "./queries.postgres";

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

type DbType = BetterSQLite3Database | PostgresJsDatabase;

const connectionString = process.env.DATABASE_URL || "";
const isPostgres =
  connectionString.startsWith("postgresql://") ||
  connectionString.startsWith("postgres://");

// ── Lazy initialization ─────────────────────────────────────
// Both drivers are heavy; we only initialize the one we need.

let _db: DbType;
let _users: typeof sqliteSchema.users | typeof postgresSchema.users;
let _tasks: typeof sqliteSchema.tasks | typeof postgresSchema.tasks;

if (isPostgres) {
  // Dynamic imports for Postgres (Neon)
  const { drizzle } = require("drizzle-orm/postgres-js") as typeof import("drizzle-orm/postgres-js");
  const { default: postgres } = require("postgres") as { default: typeof import("postgres") };

  const client = postgres(connectionString, {
    ssl: "require" as const,
    prepare: false,
  });
  _db = drizzle(client, { schema: postgresSchema });
  _users = postgresSchema.users;
  _tasks = postgresSchema.tasks;
} else {
  // Dynamic imports for SQLite
  const { drizzle } = require("drizzle-orm/better-sqlite3") as typeof import("drizzle-orm/better-sqlite3");
  const Database = require("better-sqlite3") as { default: typeof import("better-sqlite3") };
  const path = require("path") as typeof import("path");
  const fs = require("fs") as typeof import("fs");

  const DB_PATH =
    process.env.DATABASE_URL || path.join(process.cwd(), "data", "app.db");

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database.default(DB_PATH);
  _db = drizzle(sqlite, { schema: sqliteSchema });
  _users = sqliteSchema.users;
  _tasks = sqliteSchema.tasks;
}

export const db: DbType = _db;
export const users = _users;
export const tasks = _tasks;

// ── Query function re-exports ────────────────────────────────
// Both query modules expose the same function signatures.
// We re-export from the active provider matching the detected mode.

export const {
  createUser,
  getUserById,
  getUserByEmail,
  createTask,
  getTaskById,
  getTasksByUserId,
  updateTaskStatus,
  updateTaskResult,
  updateTaskError,
  deleteTask,
} = isPostgres ? postgresQueries : (sqliteQueries as any);