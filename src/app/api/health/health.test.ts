import { describe, it, expect } from "vitest";

describe("Health API", () => {
  it("returns ok status", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    // NextResponse extends Response, so we can use .json()
    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.timestamp).toBeDefined();
  });
});