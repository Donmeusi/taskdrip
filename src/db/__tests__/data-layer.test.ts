import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../schema";
import {
  createUser,
  getUserById,
  getUserByEmail,
  createTask,
  getTaskById,
  getTasksByUserId,
  updateTaskStatus,
  updateTaskResult,
  deleteTask,
} from "../queries";

// Use in-memory SQLite for tests
type Db = ReturnType<typeof drizzle<typeof schema>>;
let db: Db;
let sqlite: Database.Database;

beforeEach(() => {
  sqlite = new Database(":memory:");
  db = drizzle(sqlite, { schema });

  // Create tables manually for in-memory DB (no migrations)
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

// ─── Users ───────────────────────────────────────────

describe("createUser", () => {
  it("creates a user and returns it with generated id and timestamps", () => {
    const user = createUser(db, { email: "alice@example.com", name: "Alice" });

    expect(user.id).toBeDefined();
    expect(user.id).toHaveLength(21); // nanoid default length
    expect(user.email).toBe("alice@example.com");
    expect(user.name).toBe("Alice");
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("throws on duplicate email", () => {
    createUser(db, { email: "bob@example.com", name: "Bob" });
    expect(() =>
      createUser(db, { email: "bob@example.com", name: "Bob 2" })
    ).toThrow();
  });
});

describe("getUserById", () => {
  it("returns the user when found", () => {
    const created = createUser(db, { email: "carol@example.com", name: "Carol" });
    const found = getUserById(db, created.id);
    expect(found).toEqual(created);
  });

  it("returns undefined when not found", () => {
    const found = getUserById(db, "nonexistent");
    expect(found).toBeUndefined();
  });
});

describe("getUserByEmail", () => {
  it("returns the user when found", () => {
    const created = createUser(db, { email: "dave@example.com", name: "Dave" });
    const found = getUserByEmail(db, "dave@example.com");
    expect(found).toEqual(created);
  });

  it("returns undefined when not found", () => {
    const found = getUserByEmail(db, "nobody@example.com");
    expect(found).toBeUndefined();
  });
});

// ─── Tasks ───────────────────────────────────────────

describe("createTask", () => {
  it("creates a task and returns it with generated id, default status, and timestamps", () => {
    const user = createUser(db, { email: "eve@example.com", name: "Eve" });
    const task = createTask(db, {
      userId: user.id,
      title: "Research AI agents",
      description: "Find the top 5 AI agent frameworks and compare them",
    });

    expect(task.id).toBeDefined();
    expect(task.id).toHaveLength(21);
    expect(task.userId).toBe(user.id);
    expect(task.title).toBe("Research AI agents");
    expect(task.description).toBe(
      "Find the top 5 AI agent frameworks and compare them"
    );
    expect(task.status).toBe("pending");
    expect(task.resultText).toBeNull();
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
  });
});

describe("getTaskById", () => {
  it("returns the task when found", () => {
    const user = createUser(db, { email: "frank@example.com", name: "Frank" });
    const created = createTask(db, {
      userId: user.id,
      title: "Write report",
      description: "Draft Q1 summary",
    });
    const found = getTaskById(db, created.id);
    expect(found).toEqual(created);
  });

  it("returns undefined when not found", () => {
    const found = getTaskById(db, "nonexistent");
    expect(found).toBeUndefined();
  });
});

describe("getTasksByUserId", () => {
  it("returns all tasks for a user", () => {
    const user = createUser(db, { email: "grace@example.com", name: "Grace" });
    const task1 = createTask(db, {
      userId: user.id,
      title: "Task 1",
      description: "First",
    });
    const task2 = createTask(db, {
      userId: user.id,
      title: "Task 2",
      description: "Second",
    });

    const tasks = getTasksByUserId(db, user.id);
    expect(tasks).toHaveLength(2);
    expect(tasks.map((t) => t.id)).toEqual(
      expect.arrayContaining([task1.id, task2.id])
    );
  });

  it("returns empty array when user has no tasks", () => {
    const user = createUser(db, { email: "heidi@example.com", name: "Heidi" });
    const tasks = getTasksByUserId(db, user.id);
    expect(tasks).toHaveLength(0);
  });

  it("returns tasks including both created tasks", () => {
    const user = createUser(db, { email: "ivan@example.com", name: "Ivan" });
    const task1 = createTask(db, {
      userId: user.id,
      title: "First",
      description: "1",
    });
    const task2 = createTask(db, {
      userId: user.id,
      title: "Second",
      description: "2",
    });

    const tasks = getTasksByUserId(db, user.id);
    expect(tasks).toHaveLength(2);
    expect(tasks.map((t) => t.id)).toEqual(
      expect.arrayContaining([task1.id, task2.id])
    );
  });
});

describe("updateTaskStatus", () => {
  it("updates status and returns the updated task", () => {
    const user = createUser(db, { email: "judy@example.com", name: "Judy" });
    const task = createTask(db, {
      userId: user.id,
      title: "Do thing",
      description: "Description",
    });

    const updated = updateTaskStatus(db, task.id, "in_progress");
    expect(updated.status).toBe("in_progress");
  });

  it("returns undefined when task not found", () => {
    const result = updateTaskStatus(db, "nonexistent", "in_progress");
    expect(result).toBeUndefined();
  });
});

describe("updateTaskResult", () => {
  it("updates result_text and sets status to completed, returns the updated task", () => {
    const user = createUser(db, { email: "karl@example.com", name: "Karl" });
    const task = createTask(db, {
      userId: user.id,
      title: "Analyze data",
      description: "Run analysis on dataset",
    });

    const updated = updateTaskResult(db, task.id, "Here is the analysis...");
    expect(updated.resultText).toBe("Here is the analysis...");
    expect(updated.status).toBe("completed");
  });

  it("returns undefined when task not found", () => {
    const result = updateTaskResult(db, "nonexistent", "result");
    expect(result).toBeUndefined();
  });
});

describe("deleteTask", () => {
  it("deletes the task and returns true", () => {
    const user = createUser(db, { email: "leon@example.com", name: "Leon" });
    const task = createTask(db, {
      userId: user.id,
      title: "To delete",
      description: "Will be deleted",
    });

    const result = deleteTask(db, task.id);
    expect(result).toBe(true);
    expect(getTaskById(db, task.id)).toBeUndefined();
  });

  it("returns false when task not found", () => {
    const result = deleteTask(db, "nonexistent");
    expect(result).toBe(false);
  });
});