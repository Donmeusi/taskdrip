/**
 * PostgreSQL schema for TaskDrip (Neon/Vercel Postgres).
 *
 * This replaces schema.ts when migrating from SQLite to Postgres.
 * Key differences:
 * - pgTable instead of sqliteTable
 * - timestamp columns instead of integer("col", { mode: "timestamp" })
 * - uuid primary keys instead of text (nanoid)
 *
 * To activate: rename this file to schema.ts and update drizzle.config.ts
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", {
    enum: ["pending", "in_progress", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  resultText: text("result_text"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});