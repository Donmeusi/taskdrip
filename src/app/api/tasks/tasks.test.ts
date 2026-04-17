import { describe, it, expect, beforeEach, vi } from "vitest";

const mockCreateTask = vi.fn();
const mockCreateUser = vi.fn();
const mockGetUserByEmail = vi.fn();
const mockGetTasksByUserId = vi.fn();
const mockGetTaskById = vi.fn();
const mockUpdateTaskStatus = vi.fn();
const mockUpdateTaskResult = vi.fn();
const mockUpdateTaskError = vi.fn();
const mockProcessTaskWithAI = vi.fn();

vi.mock("@/db/index", () => ({
  db: {},
  createTask: (...args: unknown[]) => mockCreateTask(...args),
  createUser: (...args: unknown[]) => mockCreateUser(...args),
  getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args),
  getTasksByUserId: (...args: unknown[]) => mockGetTasksByUserId(...args),
  getTaskById: (...args: unknown[]) => mockGetTaskById(...args),
  updateTaskStatus: (...args: unknown[]) => mockUpdateTaskStatus(...args),
  updateTaskResult: (...args: unknown[]) => mockUpdateTaskResult(...args),
  updateTaskError: (...args: unknown[]) => mockUpdateTaskError(...args),
}));

vi.mock("@/db", () => ({
  db: {},
  createTask: (...args: unknown[]) => mockCreateTask(...args),
  createUser: (...args: unknown[]) => mockCreateUser(...args),
  getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args),
  getTasksByUserId: (...args: unknown[]) => mockGetTasksByUserId(...args),
  getTaskById: (...args: unknown[]) => mockGetTaskById(...args),
  updateTaskStatus: (...args: unknown[]) => mockUpdateTaskStatus(...args),
  updateTaskResult: (...args: unknown[]) => mockUpdateTaskResult(...args),
  updateTaskError: (...args: unknown[]) => mockUpdateTaskError(...args),
}));

vi.mock("@/lib/openai", () => ({
  processTaskWithAI: (...args: unknown[]) => mockProcessTaskWithAI(...args),
}));

vi.mock("better-sqlite3", () => ({
  default: class {},
}));

// Import modules once at the top level
let tasksRoute: typeof import("@/app/api/tasks/route");
let taskIdRoute: typeof import("@/app/api/tasks/[id]/route");
let processRoute: typeof import("@/app/api/tasks/[id]/process/route");

beforeEach(async () => {
  vi.clearAllMocks();
  tasksRoute = await import("@/app/api/tasks/route");
  taskIdRoute = await import("@/app/api/tasks/[id]/route");
  processRoute = await import("@/app/api/tasks/[id]/process/route");
});

describe("Tasks API — Routes", () => {
  describe("POST /api/tasks", () => {
    it("creates a task and returns 201", async () => {
      mockGetUserByEmail.mockReturnValue({ id: "default-user", email: "a@b.com", name: "Test" });
      mockCreateTask.mockReturnValue({
        id: "abc123",
        userId: "default-user",
        title: "Research AI agents",
        description: "Research AI agents",
        status: "pending",
        resultText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Research AI agents",
          description: "Research AI agents",
          userEmail: "a@b.com",
        }),
      });

      const response = await tasksRoute.POST(request as never);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.task.id).toBe("abc123");
      expect(data.task.status).toBe("pending");
    });

    it("returns 400 if title is missing", async () => {
      const request = new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "test", userEmail: "a@b.com" }),
      });

      const response = await tasksRoute.POST(request as never);
      expect(response.status).toBe(400);
    });

    it("returns 400 if description is missing", async () => {
      const request = new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "test", userEmail: "a@b.com" }),
      });

      const response = await tasksRoute.POST(request as never);
      expect(response.status).toBe(400);
    });

    it("returns 400 if userEmail is missing", async () => {
      const request = new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "test", description: "test" }),
      });

      const response = await tasksRoute.POST(request as never);
      expect(response.status).toBe(400);
    });

    it("auto-creates user if not found", async () => {
      mockGetUserByEmail.mockReturnValue(undefined);
      mockCreateUser.mockReturnValue({ id: "new-user", email: "new@b.com", name: "new" });
      mockCreateTask.mockReturnValue({
        id: "task-new",
        userId: "new-user",
        title: "Test",
        description: "Test",
        status: "pending",
        resultText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test",
          description: "Test",
          userEmail: "new@b.com",
        }),
      });

      const response = await tasksRoute.POST(request as never);
      expect(response.status).toBe(201);
      expect(mockCreateUser).toHaveBeenCalledWith(expect.anything(), {
        email: "new@b.com",
        name: "new",
      });
    });
  });

  describe("GET /api/tasks", () => {
    it("returns tasks for a user by email", async () => {
      mockGetUserByEmail.mockReturnValue({ id: "user1", email: "a@b.com", name: "Test" });
      mockGetTasksByUserId.mockReturnValue([
        {
          id: "task1",
          userId: "user1",
          title: "Test task",
          description: "Test task",
          status: "pending",
          resultText: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const request = new Request("http://localhost/api/tasks?userEmail=a@b.com");
      const response = await tasksRoute.GET(request as never);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].id).toBe("task1");
    });

    it("returns empty array if user not found", async () => {
      mockGetUserByEmail.mockReturnValue(undefined);

      const request = new Request("http://localhost/api/tasks?userEmail=nobody@b.com");
      const response = await tasksRoute.GET(request as never);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tasks).toEqual([]);
    });

    it("returns 400 if userEmail query param is missing", async () => {
      const request = new Request("http://localhost/api/tasks");
      const response = await tasksRoute.GET(request as never);
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/tasks/[id]", () => {
    it("returns a task by id", async () => {
      mockGetTaskById.mockReturnValue({
        id: "task1",
        userId: "default-user",
        title: "Test task",
        description: "Test task",
        status: "completed",
        resultText: "Here is the result...",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost/api/tasks/task1");
      const params = Promise.resolve({ id: "task1" });
      const response = await taskIdRoute.GET(request as never, { params });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe("task1");
      expect(data.status).toBe("completed");
    });

    it("returns 404 if task not found", async () => {
      mockGetTaskById.mockReturnValue(undefined);

      const request = new Request("http://localhost/api/tasks/nonexistent");
      const params = Promise.resolve({ id: "nonexistent" });
      const response = await taskIdRoute.GET(request as never, { params });
      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/tasks/[id]/process — AI processing", () => {
    it("processes a pending task successfully via OpenAI", async () => {
      mockGetTaskById.mockReturnValue({
        id: "task1",
        userId: "user1",
        title: "Research AI agents",
        description: "Find the best AI agent frameworks",
        status: "pending",
        resultText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUpdateTaskStatus.mockReturnValue({
        id: "task1",
        status: "in_progress",
        resultText: null,
      });
      mockProcessTaskWithAI.mockResolvedValue({
        success: true,
        resultText: "Here are the top AI agent frameworks...",
      });
      mockUpdateTaskResult.mockReturnValue({
        id: "task1",
        status: "completed",
        resultText: "Here are the top AI agent frameworks...",
      });

      const request = new Request("http://localhost/api/tasks/task1/process", {
        method: "POST",
      });
      const params = Promise.resolve({ id: "task1" });
      const response = await processRoute.POST(request as never, { params });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("completed");
      expect(data.resultText).toBe("Here are the top AI agent frameworks...");
      expect(mockProcessTaskWithAI).toHaveBeenCalledWith(
        "Research AI agents",
        "Find the best AI agent frameworks"
      );
    });

    it("handles AI processing failure gracefully", async () => {
      mockGetTaskById.mockReturnValue({
        id: "task1",
        userId: "user1",
        title: "Test",
        description: "Test",
        status: "pending",
        resultText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUpdateTaskStatus.mockReturnValue({ id: "task1", status: "in_progress" });
      mockProcessTaskWithAI.mockResolvedValue({
        success: false,
        error: "AI service is temporarily unavailable. Please try again.",
      });
      mockUpdateTaskError.mockReturnValue({
        id: "task1",
        status: "failed",
        resultText: "AI service is temporarily unavailable. Please try again.",
      });

      const request = new Request("http://localhost/api/tasks/task1/process", {
        method: "POST",
      });
      const params = Promise.resolve({ id: "task1" });
      const response = await processRoute.POST(request as never, { params });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.error).toContain("temporarily unavailable");
      expect(data.task.status).toBe("failed");
    });

    it("returns 404 if task not found", async () => {
      mockGetTaskById.mockReturnValue(undefined);

      const request = new Request("http://localhost/api/tasks/nonexistent/process", {
        method: "POST",
      });
      const params = Promise.resolve({ id: "nonexistent" });
      const response = await processRoute.POST(request as never, { params });

      expect(response.status).toBe(404);
      expect(mockProcessTaskWithAI).not.toHaveBeenCalled();
    });

    it("returns 409 if task is already completed", async () => {
      mockGetTaskById.mockReturnValue({
        id: "task1",
        userId: "user1",
        title: "Done",
        description: "Already done",
        status: "completed",
        resultText: "Already done",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost/api/tasks/task1/process", {
        method: "POST",
      });
      const params = Promise.resolve({ id: "task1" });
      const response = await processRoute.POST(request as never, { params });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toContain("already completed");
      expect(mockProcessTaskWithAI).not.toHaveBeenCalled();
    });

    it("returns current state if task is already in_progress (idempotent)", async () => {
      mockGetTaskById.mockReturnValue({
        id: "task1",
        userId: "user1",
        title: "Working",
        description: "In progress",
        status: "in_progress",
        resultText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost/api/tasks/task1/process", {
        method: "POST",
      });
      const params = Promise.resolve({ id: "task1" });
      const response = await processRoute.POST(request as never, { params });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("in_progress");
      expect(mockProcessTaskWithAI).not.toHaveBeenCalled();
      expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
    });

    it("allows re-processing a failed task", async () => {
      mockGetTaskById.mockReturnValue({
        id: "task1",
        userId: "user1",
        title: "Failed before",
        description: "Try again",
        status: "failed",
        resultText: "Previous error",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUpdateTaskStatus.mockReturnValue({ id: "task1", status: "in_progress" });
      mockProcessTaskWithAI.mockResolvedValue({
        success: true,
        resultText: "Succeeded on retry!",
      });
      mockUpdateTaskResult.mockReturnValue({
        id: "task1",
        status: "completed",
        resultText: "Succeeded on retry!",
      });

      const request = new Request("http://localhost/api/tasks/task1/process", {
        method: "POST",
      });
      const params = Promise.resolve({ id: "task1" });
      const response = await processRoute.POST(request as never, { params });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("completed");
      expect(mockProcessTaskWithAI).toHaveBeenCalled();
    });

    it("handles API key not configured", async () => {
      mockGetTaskById.mockReturnValue({
        id: "task1",
        userId: "user1",
        title: "Test",
        description: "Test",
        status: "pending",
        resultText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUpdateTaskStatus.mockReturnValue({ id: "task1", status: "in_progress" });
      mockProcessTaskWithAI.mockResolvedValue({
        success: false,
        error: "OPENAI_API_KEY is not configured. Set it in .env.local",
      });
      mockUpdateTaskError.mockReturnValue({
        id: "task1",
        status: "failed",
        resultText: "OPENAI_API_KEY is not configured. Set it in .env.local",
      });

      const request = new Request("http://localhost/api/tasks/task1/process", {
        method: "POST",
      });
      const params = Promise.resolve({ id: "task1" });
      const response = await processRoute.POST(request as never, { params });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.error).toContain("OPENAI_API_KEY");
    });
  });
});