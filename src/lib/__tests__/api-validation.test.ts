import { describe, it, expect } from "vitest";
import {
  validateTaskCreate,
  validateWaitlistSignup,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
} from "@/lib/api";

describe("API Validation", () => {
  // ── validateTaskCreate ──

  describe("validateTaskCreate", () => {
    it("accepts valid task input", () => {
      const result = validateTaskCreate({
        title: "Write a blog post",
        description: "About AI agents",
        userEmail: "test@example.com",
      });
      expect(result.valid).toBe(true);
    });

    it("accepts valid task with optional userName", () => {
      const result = validateTaskCreate({
        title: "Write a blog post",
        description: "About AI agents",
        userEmail: "test@example.com",
        userName: "Alice",
      });
      expect(result.valid).toBe(true);
    });

    it("rejects empty body", () => {
      const result = validateTaskCreate(null);
      expect(result.valid).toBe(false);
      expect(result.status).toBe(400);
    });

    it("rejects array body", () => {
      const result = validateTaskCreate([]);
      expect(result.valid).toBe(false);
      expect(result.status).toBe(400);
    });

    it("rejects missing title", () => {
      const result = validateTaskCreate({
        description: "About AI agents",
        userEmail: "test@example.com",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("title");
    });

    it("rejects empty title", () => {
      const result = validateTaskCreate({
        title: "   ",
        description: "About AI agents",
        userEmail: "test@example.com",
      });
      expect(result.valid).toBe(false);
    });

    it("rejects non-string title", () => {
      const result = validateTaskCreate({
        title: 123,
        description: "About AI agents",
        userEmail: "test@example.com",
      });
      expect(result.valid).toBe(false);
    });

    it("rejects title exceeding max length", () => {
      const result = validateTaskCreate({
        title: "x".repeat(MAX_TITLE_LENGTH + 1),
        description: "About AI agents",
        userEmail: "test@example.com",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at most");
    });

    it("rejects missing description", () => {
      const result = validateTaskCreate({
        title: "Write a blog",
        userEmail: "test@example.com",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("description");
    });

    it("rejects description exceeding max length", () => {
      const result = validateTaskCreate({
        title: "Write a blog",
        description: "x".repeat(MAX_DESCRIPTION_LENGTH + 1),
        userEmail: "test@example.com",
      });
      expect(result.valid).toBe(false);
    });

    it("rejects missing email", () => {
      const result = validateTaskCreate({
        title: "Write a blog",
        description: "About AI agents",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Email");
    });

    it("rejects invalid email format", () => {
      const result = validateTaskCreate({
        title: "Write a blog",
        description: "About AI agents",
        userEmail: "not-an-email",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("email");
    });

    it("rejects userName exceeding max length", () => {
      const result = validateTaskCreate({
        title: "Write a blog",
        description: "About AI agents",
        userEmail: "test@example.com",
        userName: "x".repeat(MAX_NAME_LENGTH + 1),
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("userName");
    });

    it("accepts null userName (optional)", () => {
      const result = validateTaskCreate({
        title: "Write a blog",
        description: "About AI agents",
        userEmail: "test@example.com",
        userName: null,
      });
      expect(result.valid).toBe(true);
    });
  });

  // ── validateWaitlistSignup ──

  describe("validateWaitlistSignup", () => {
    it("accepts valid email", () => {
      const result = validateWaitlistSignup({ email: "test@example.com" });
      expect(result.valid).toBe(true);
    });

    it("rejects missing email", () => {
      const result = validateWaitlistSignup({});
      expect(result.valid).toBe(false);
    });

    it("rejects invalid email format", () => {
      const result = validateWaitlistSignup({ email: "bad" });
      expect(result.valid).toBe(false);
    });

    it("rejects non-string email", () => {
      const result = validateWaitlistSignup({ email: 123 });
      expect(result.valid).toBe(false);
    });

    it("rejects empty body", () => {
      const result = validateWaitlistSignup(null);
      expect(result.valid).toBe(false);
    });
  });
});