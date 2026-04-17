/**
 * PostgreSQL queries for TaskDrip (Neon/Vercel Postgres).
 *
 * This replaces queries.ts when migrating from SQLite to Postgres.
 * Key difference: All queries are ASYNC (pg driver is async, unlike better-sqlite3).
 *
 * To activate: rename this file to queries.ts and update all API routes
 * to await query calls.
 */

import { eq, desc } from "drizzle-orm";
import { users, tasks } from "./schema.postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

type Db = PostgresJsDatabase<typeof import("./schema.postgres")>;

// ─── Users ───────────────────────────────────────────

interface CreateUserInput {
  email: string;
  name: string;
}

export async function createUser(db: Db, input: CreateUserInput) {
  const rows = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
    })
    .returning();
  return rows[0];
}

export async function getUserById(db: Db, id: string) {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0] ?? undefined;
}

export async function getUserByEmail(db: Db, email: string) {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0] ?? undefined;
}

// ─── Tasks ───────────────────────────────────────────

interface CreateTaskInput {
  userId: string;
  title: string;
  description: string;
}

export async function createTask(db: Db, input: CreateTaskInput) {
  const rows = await db
    .insert(tasks)
    .values({
      userId: input.userId,
      title: input.title,
      description: input.description,
      status: "pending",
    })
    .returning();
  return rows[0];
}

export async function getTaskById(db: Db, id: string) {
  const result = await db.select().from(tasks).where(eq(tasks.id, id));
  return result[0] ?? undefined;
}

export async function getTasksByUserId(db: Db, userId: string) {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
}

type TaskStatus = "pending" | "in_progress" | "completed" | "failed";

export async function updateTaskStatus(db: Db, id: string, status: TaskStatus) {
  const rows = await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  return rows[0] ?? undefined;
}

export async function updateTaskResult(db: Db, id: string, resultText: string) {
  const rows = await db
    .update(tasks)
    .set({ resultText, status: "completed", updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  return rows[0] ?? undefined;
}

export async function updateTaskError(db: Db, id: string, errorText: string) {
  const rows = await db
    .update(tasks)
    .set({ resultText: errorText, status: "failed", updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  return rows[0] ?? undefined;
}

export async function deleteTask(db: Db, id: string): Promise<boolean> {
  const rows = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning();
  return rows.length > 0;
}