import { eq, desc } from "drizzle-orm";
import { users, tasks } from "./schema";
import { nanoid } from "nanoid";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type Db = BetterSQLite3Database<typeof import("./schema")>;

// ─── Users ───────────────────────────────────────────

interface CreateUserInput {
  email: string;
  name: string;
}

export function createUser(db: Db, input: CreateUserInput) {
  const now = new Date();
  const id = nanoid();
  const rows = db
    .insert(users)
    .values({
      id,
      email: input.email,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .all();
  return rows[0];
}

export function getUserById(db: Db, id: string) {
  const result = db.select().from(users).where(eq(users.id, id)).get();
  return result ?? undefined;
}

export function getUserByEmail(db: Db, email: string) {
  const result = db.select().from(users).where(eq(users.email, email)).get();
  return result ?? undefined;
}

// ─── Tasks ───────────────────────────────────────────

interface CreateTaskInput {
  userId: string;
  title: string;
  description: string;
}

export function createTask(db: Db, input: CreateTaskInput) {
  const now = new Date();
  const id = nanoid();
  const rows = db
    .insert(tasks)
    .values({
      id,
      userId: input.userId,
      title: input.title,
      description: input.description,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .all();
  return rows[0];
}

export function getTaskById(db: Db, id: string) {
  const result = db.select().from(tasks).where(eq(tasks.id, id)).get();
  return result ?? undefined;
}

export function getTasksByUserId(db: Db, userId: string) {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt))
    .all();
}

type TaskStatus = "pending" | "in_progress" | "completed" | "failed";

export function updateTaskStatus(db: Db, id: string, status: TaskStatus) {
  const rows = db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning()
    .all();
  return rows[0] ?? undefined;
}

export function updateTaskResult(db: Db, id: string, resultText: string) {
  const rows = db
    .update(tasks)
    .set({ resultText, status: "completed", updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning()
    .all();
  return rows[0] ?? undefined;
}

export function updateTaskError(db: Db, id: string, errorText: string) {
  const rows = db
    .update(tasks)
    .set({ resultText: errorText, status: "failed", updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning()
    .all();
  return rows[0] ?? undefined;
}

export function deleteTask(db: Db, id: string): boolean {
  const rows = db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning()
    .all();
  return rows.length > 0;
}