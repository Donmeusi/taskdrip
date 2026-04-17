import { describe, it, expect } from "vitest";
import {
  methodNotAllowed,
  handleCorsPreflightRequest,
  withCors,
} from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

describe("API helpers — CORS and method handling", () => {
  // ── methodNotAllowed ──

  describe("methodNotAllowed", () => {
    it("returns 405 with allowed methods", () => {
      const response = methodNotAllowed(["GET", "POST"]);
      expect(response.status).toBe(405);
      // The Allow header is set
      expect(response.headers.get("Allow")).toBe("GET, POST");
    });
  });

  // ── handleCorsPreflightRequest ──

  describe("handleCorsPreflightRequest", () => {
    it("returns 204 with CORS headers for OPTIONS request", () => {
      const request = new NextRequest("http://localhost/api/test", {
        method: "OPTIONS",
      });
      const response = handleCorsPreflightRequest(request);
      expect(response).not.toBeNull();
      expect(response!.status).toBe(204);
      expect(response!.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response!.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, POST, OPTIONS"
      );
      expect(response!.headers.get("Access-Control-Allow-Headers")).toBe(
        "Content-Type, Authorization"
      );
    });

    it("returns null for non-OPTIONS request", () => {
      const request = new NextRequest("http://localhost/api/test", {
        method: "GET",
      });
      const response = handleCorsPreflightRequest(request);
      expect(response).toBeNull();
    });
  });

  // ── withCors ──

  describe("withCors", () => {
    it("adds CORS headers to a response", () => {
      const original = NextResponse.json({ status: "ok" });
      const response = withCors(original);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, POST, OPTIONS"
      );
    });

    it("preserves the original status code", () => {
      const original = NextResponse.json({ error: "not found" }, { status: 404 });
      const response = withCors(original);
      expect(response.status).toBe(404);
    });
  });
});