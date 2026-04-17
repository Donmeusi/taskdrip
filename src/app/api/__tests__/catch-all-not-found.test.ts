import { describe, it, expect } from "vitest";

describe("API catch-all not-found route", () => {
  it("returns 404 for unmatched GET", async () => {
    const { GET } = await import("@/app/api/[...path]/route");
    const response = await GET();
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toContain("not found");
  });

  it("returns 404 for unmatched POST", async () => {
    const { POST } = await import("@/app/api/[...path]/route");
    const response = await POST();
    expect(response.status).toBe(404);
  });

  it("returns 404 for unmatched DELETE", async () => {
    const { DELETE } = await import("@/app/api/[...path]/route");
    const response = await DELETE();
    expect(response.status).toBe(404);
  });

  it("returns 404 for unmatched PUT", async () => {
    const { PUT } = await import("@/app/api/[...path]/route");
    const response = await PUT();
    expect(response.status).toBe(404);
  });

  it("returns 404 for unmatched PATCH", async () => {
    const { PATCH } = await import("@/app/api/[...path]/route");
    const response = await PATCH();
    expect(response.status).toBe(404);
  });

  it("includes CORS headers on 404 responses", async () => {
    const { GET } = await import("@/app/api/[...path]/route");
    const response = await GET();
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});