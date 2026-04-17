import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Mock the database module ──────────────────────────────
// SQLite queries are synchronous and use the .returning().all() / .where().get() chain pattern.
// We mock the db client to match this interface.

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockReturnThis(),
  all: vi.fn(),
  get: vi.fn(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

// Import query functions with mocked db
vi.mock("@/db/index", () => ({
  db: mockDb,
}));

vi.mock("@/db/schema", () => ({
  users: {
    id: "id",
    email: "email",
    name: "name",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  tasks: {
    id: "id",
    userId: "user_id",
    title: "title",
    description: "description",
    status: "status",
    resultText: "result_text",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Tests ─────────────────────────────────────────────────

describe("Query functions — SQLite interface", () => {
  describe("createUser", () => {
    it("inserts a user and returns the first row", async () => {
      const { createUser } = await import("@/db/queries");
      const mockUser = {
        id: "nano-1",
        email: "alice@example.com",
        name: "Alice",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.all.mockReturnValue([mockUser]);

      const result = createUser(mockDb as never, {
        email: "alice@example.com",
        name: "Alice",
      });

      expect(result).toEqual(mockUser);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("returns the user when found", async () => {
      const { getUserById } = await import("@/db/queries");
      const mockUser = {
        id: "nano-1",
        email: "alice@example.com",
        name: "Alice",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.get.mockReturnValue(mockUser);

      const result = getUserById(mockDb as never, "nano-1");
      expect(result).toEqual(mockUser);
    });

    it("returns undefined when not found", async () => {
      const { getUserById } = await import("@/db/queries");
      mockDb.get.mockReturnValue(undefined);

      const result = getUserById(mockDb as never, "nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getUserByEmail", () => {
    it("returns the user when found", async () => {
      const { getUserByEmail } = await import("@/db/queries");
      const mockUser = {
        id: "nano-1",
        email: "bob@example.com",
        name: "Bob",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.get.mockReturnValue(mockUser);

      const result = getUserByEmail(mockDb as never, "bob@example.com");
      expect(result).toEqual(mockUser);
    });

    it("returns undefined when not found", async () => {
      const { getUserByEmail } = await import("@/db/queries");
      mockDb.get.mockReturnValue(undefined);

      const result = getUserByEmail(mockDb as never, "nobody@example.com");
      expect(result).toBeUndefined();
    });
  });

  describe("createTask", () => {
    it("inserts a task and returns the first row", async () => {
      const { createTask } = await import("@/db/queries");
      const mockTask = {
        id: "nano-task-1",
        userId: "nano-1",
        title: "Research AI",
        description: "Find top frameworks",
        status: "pending",
        resultText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.all.mockReturnValue([mockTask]);

      const result = createTask(mockDb as never, {
        userId: "nano-1",
        title: "Research AI",
        description: "Find top frameworks",
      });

      expect(result).toEqual(mockTask);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("getTaskById", () => {
    it("returns the task when found", async () => {
      const { getTaskById } = await import("@/db/queries");
      const mockTask = {
        id: "nano-task-1",
        userId: "nano-1",
        title: "Test task",
        description: "Test",
        status: "pending",
        resultText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.get.mockReturnValue(mockTask);

      const result = getTaskById(mockDb as never, "nano-task-1");
      expect(result).toEqual(mockTask);
    });

    it("returns undefined when not found", async () => {
      const { getTaskById } = await import("@/db/queries");
      mockDb.get.mockReturnValue(undefined);

      const result = getTaskById(mockDb as never, "nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getTasksByUserId", () => {
    it("returns all tasks for a user", async () => {
      const { getTasksByUserId } = await import("@/db/queries");
      const mockTasks = [
        {
          id: "nano-task-1",
          userId: "nano-1",
          title: "Task 1",
          description: "First",
          status: "pending",
          resultText: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "nano-task-2",
          userId: "nano-1",
          title: "Task 2",
          description: "Second",
          status: "pending",
          resultText: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockDb.all.mockReturnValue(mockTasks);

      const result = getTasksByUserId(mockDb as never, "nano-1");
      expect(result).toHaveLength(2);
    });

    it("returns empty array when user has no tasks", async () => {
      const { getTasksByUserId } = await import("@/db/queries");
      mockDb.all.mockReturnValue([]);

      const result = getTasksByUserId(mockDb as never, "nano-1");
      expect(result).toHaveLength(0);
    });
  });

  describe("updateTaskStatus", () => {
    it("updates status and returns the updated task", async () => {
      const { updateTaskStatus } = await import("@/db/queries");
      const mockUpdated = {
        id: "nano-task-1",
        userId: "nano-1",
        title: "Test",
        description: "Test",
        status: "in_progress",
        resultText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.all.mockReturnValue([mockUpdated]);

      const result = updateTaskStatus(
        mockDb as never,
        "nano-task-1",
        "in_progress"
      );
      expect(result?.status).toBe("in_progress");
    });

    it("returns undefined when task not found", async () => {
      const { updateTaskStatus } = await import("@/db/queries");
      mockDb.all.mockReturnValue([]);

      const result = updateTaskStatus(
        mockDb as never,
        "nonexistent",
        "in_progress"
      );
      expect(result).toBeUndefined();
    });
  });

  describe("updateTaskResult", () => {
    it("updates result_text and sets status to completed", async () => {
      const { updateTaskResult } = await import("@/db/queries");
      const mockUpdated = {
        id: "nano-task-1",
        userId: "nano-1",
        title: "Test",
        description: "Test",
        status: "completed",
        resultText: "Here is the result...",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.all.mockReturnValue([mockUpdated]);

      const result = updateTaskResult(
        mockDb as never,
        "nano-task-1",
        "Here is the result..."
      );
      expect(result?.resultText).toBe("Here is the result...");
      expect(result?.status).toBe("completed");
    });

    it("returns undefined when task not found", async () => {
      const { updateTaskResult } = await import("@/db/queries");
      mockDb.all.mockReturnValue([]);

      const result = updateTaskResult(
        mockDb as never,
        "nonexistent",
        "result"
      );
      expect(result).toBeUndefined();
    });
  });

  describe("updateTaskError", () => {
    it("updates result_text and sets status to failed", async () => {
      const { updateTaskError } = await import("@/db/queries");
      const mockUpdated = {
        id: "nano-task-1",
        userId: "nano-1",
        title: "Test",
        description: "Test",
        status: "failed",
        resultText: "Something went wrong",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.all.mockReturnValue([mockUpdated]);

      const result = updateTaskError(
        mockDb as never,
        "nano-task-1",
        "Something went wrong"
      );
      expect(result?.resultText).toBe("Something went wrong");
      expect(result?.status).toBe("failed");
    });

    it("returns undefined when task not found", async () => {
      const { updateTaskError } = await import("@/db/queries");
      mockDb.all.mockReturnValue([]);

      const result = updateTaskError(
        mockDb as never,
        "nonexistent",
        "error"
      );
      expect(result).toBeUndefined();
    });
  });

  describe("deleteTask", () => {
    it("deletes the task and returns true", async () => {
      const { deleteTask } = await import("@/db/queries");
      mockDb.all.mockReturnValue([{ id: "nano-task-1" }]);

      const result = deleteTask(mockDb as never, "nano-task-1");
      expect(result).toBe(true);
    });

    it("returns false when task not found", async () => {
      const { deleteTask } = await import("@/db/queries");
      mockDb.all.mockReturnValue([]);

      const result = deleteTask(mockDb as never, "nonexistent");
      expect(result).toBe(false);
    });
  });
});