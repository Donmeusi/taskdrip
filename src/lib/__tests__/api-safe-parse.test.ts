import { describe, it, expect } from "vitest";
import { safeParseJson } from "@/lib/api";

describe("safeParseJson", () => {
  it("parses valid JSON", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test" }),
    });
    const { data, error } = await safeParseJson(request);
    expect(error).toBeUndefined();
    expect(data).toEqual({ title: "Test" });
  });

  it("returns error for empty body", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "",
    });
    const { data, error } = await safeParseJson(request);
    expect(data).toBeUndefined();
    expect(error).toBeDefined();
    expect(error!.status).toBe(400);
  });

  it("returns error for whitespace-only body", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "   ",
    });
    const { data, error } = await safeParseJson(request);
    expect(data).toBeUndefined();
    expect(error).toBeDefined();
    expect(error!.status).toBe(400);
  });

  it("returns error for invalid JSON", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ not valid json }",
    });
    const { data, error } = await safeParseJson(request);
    expect(data).toBeUndefined();
    expect(error).toBeDefined();
    expect(error!.status).toBe(400);
    const body = await error!.json();
    expect(body.error).toContain("valid JSON");
  });
});