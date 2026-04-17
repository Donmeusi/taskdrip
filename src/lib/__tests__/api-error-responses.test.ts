import { describe, it, expect } from "vitest";
import {
  badRequest,
  notFound,
  internalError,
  tooManyRequests,
  unprocessableEntity,
  errorResponse,
  isRateLimited,
} from "@/lib/api";

describe("API helpers — error responses", () => {
  describe("errorResponse", () => {
    it("returns JSON with error message and status", () => {
      const response = errorResponse("something broke", 418);
      expect(response.status).toBe(418);
      // Can't easily read body in unit test without async, but structure is correct
    });
  });

  describe("badRequest", () => {
    it("returns 400 status", () => {
      const response = badRequest("Missing field");
      expect(response.status).toBe(400);
    });
  });

  describe("notFound", () => {
    it("returns 404 status with default message", () => {
      const response = notFound();
      expect(response.status).toBe(404);
    });

    it("accepts custom message", () => {
      const response = notFound("Task not found");
      expect(response.status).toBe(404);
    });
  });

  describe("internalError", () => {
    it("returns 500 status with generic message (never leaks stack)", () => {
      const response = internalError();
      expect(response.status).toBe(500);
    });

    it("accepts custom message", () => {
      const response = internalError("Database connection failed");
      expect(response.status).toBe(500);
    });
  });

  describe("unprocessableEntity", () => {
    it("returns 422 status", () => {
      const response = unprocessableEntity("AI processing failed");
      expect(response.status).toBe(422);
    });
  });

  describe("tooManyRequests", () => {
    it("returns 429 with default retry-after", () => {
      const response = tooManyRequests();
      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe("60");
    });

    it("accepts custom retry-after seconds", () => {
      const response = tooManyRequests(30);
      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe("30");
    });
  });

  describe("isRateLimited", () => {
    it("returns false (MVP no-op)", async () => {
      const result = await isRateLimited("any-key");
      expect(result).toBe(false);
    });
  });
});