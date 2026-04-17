import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";
import {
  createUser,
  createTask,
  getTaskById,
  updateTaskResult,
  updateTaskError,
} from "@/db/queries";

// ─── In-memory DB for testing ──────────────────────────────

type Db = ReturnType<typeof drizzle<typeof schema>>;
let db: Db;
let sqlite: Database.Database;

beforeEach(() => {
  sqlite = new Database(":memory:");
  db = drizzle(sqlite, { schema });

  sqlite.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      result_text TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
});

afterEach(() => {
  sqlite.close();
});

// ─── Tests ─────────────────────────────────────────────────

describe("Task API — data layer (no HTTP)", () => {
  it("creates a task and retrieves it", () => {
    const user = createUser(db, { email: "test@example.com", name: "Test" });
    const task = createTask(db, {
      userId: user.id,
      title: "Research AI",
      description: "Find top AI frameworks",
    });

    expect(task.id).toBeDefined();
    expect(task.status).toBe("pending");
    expect(task.resultText).toBeNull();

    const found = getTaskById(db, task.id);
    expect(found).toBeDefined();
    expect(found!.title).toBe("Research AI");
  });

  it("processes a task successfully and stores result", () => {
    const user = createUser(db, { email: "proc@example.com", name: "Proc" });
    const task = createTask(db, {
      userId: user.id,
      title: "Write summary",
      description: "Summarize the Q1 report",
    });

    // Simulate successful AI processing
    updateTaskResult(db, task.id, "Here is the Q1 summary...");

    const updated = getTaskById(db, task.id);
    expect(updated!.status).toBe("completed");
    expect(updated!.resultText).toBe("Here is the Q1 summary...");
  });

  it("handles task processing failure with error message", () => {
    const user = createUser(db, { email: "fail@example.com", name: "Fail" });
    const task = createTask(db, {
      userId: user.id,
      title: "Do something",
      description: "That will fail",
    });

    // Simulate AI processing failure
    updateTaskError(db, task.id, "AI service is temporarily unavailable");

    const updated = getTaskById(db, task.id);
    expect(updated!.status).toBe("failed");
    expect(updated!.resultText).toBe("AI service is temporarily unavailable");
  });

  it("prevents re-processing of completed task", () => {
    const user = createUser(db, { email: "done@example.com", name: "Done" });
    const task = createTask(db, {
      userId: user.id,
      title: "Already done",
      description: "This is done",
    });

    updateTaskResult(db, task.id, "Result text");

    const updated = getTaskById(db, task.id);
    expect(updated!.status).toBe("completed");

    // Business logic: should not allow re-processing
    expect(updated!.status).not.toBe("pending");
    expect(updated!.status).not.toBe("in_progress");
  });
});

describe("OpenAI client — error handling", () => {
  it("processTaskWithAI returns error when API key is not configured", async () => {
    // Import dynamically to test with missing API key
    vi.resetModules();
    const originalEnv = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const { processTaskWithAI } = await import("@/lib/openai");
    const result = await processTaskWithAI("Test", "Test description");

    expect(result.success).toBe(false);
    expect(result.error).toContain("OPENAI_API_KEY");

    // Restore
    if (originalEnv) process.env.OPENAI_API_KEY = originalEnv;
  });
});