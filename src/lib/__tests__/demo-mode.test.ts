import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("demo-mode", () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalDemo = process.env.DEMO_MODE;

  afterEach(() => {
    // Restore env vars
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
    else delete process.env.OPENAI_API_KEY;
    if (originalDemo) process.env.DEMO_MODE = originalDemo;
    else delete process.env.DEMO_MODE;
  });

  it("isDemoMode returns true when OPENAI_API_KEY is not set", async () => {
    vi.resetModules();
    delete process.env.OPENAI_API_KEY;
    delete process.env.DEMO_MODE;

    const { isDemoMode } = await import("@/lib/demo-mode");
    expect(isDemoMode()).toBe(true);
  });

  it("isDemoMode returns true when OPENAI_API_KEY is placeholder", async () => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = "***";
    delete process.env.DEMO_MODE;

    const { isDemoMode } = await import("@/lib/demo-mode");
    expect(isDemoMode()).toBe(true);
  });

  it("isDemoMode returns true when OPENAI_API_KEY is empty string", async () => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = "";
    delete process.env.DEMO_MODE;

    const { isDemoMode } = await import("@/lib/demo-mode");
    expect(isDemoMode()).toBe(true);
  });

  it("isDemoMode returns false when OPENAI_API_KEY is set to a real key", async () => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = "sk-test-abc123";
    delete process.env.DEMO_MODE;

    const { isDemoMode } = await import("@/lib/demo-mode");
    expect(isDemoMode()).toBe(false);
  });

  it("isDemoMode returns true when DEMO_MODE is explicitly set", async () => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = "sk-test-abc123";
    process.env.DEMO_MODE = "true";

    const { isDemoMode } = await import("@/lib/demo-mode");
    expect(isDemoMode()).toBe(true);
  });

  it("processTaskWithDemoAI returns a success result with mock text", async () => {
    vi.resetModules();
    const { processTaskWithDemoAI } = await import("@/lib/demo-mode");
    const result = await processTaskWithDemoAI("Write blog post", "About AI agents");

    expect(result.success).toBe(true);
    expect(result.resultText).toBeDefined();
    expect(result.resultText!.length).toBeGreaterThan(50);
  });

  it("processTaskWithDemoAI generates research-style responses", async () => {
    vi.resetModules();
    const { processTaskWithDemoAI } = await import("@/lib/demo-mode");
    const result = await processTaskWithDemoAI("Research competitors", "Find SaaS pricing");

    expect(result.success).toBe(true);
    expect(result.resultText).toContain("Research Results");
  });

  it("processTaskWithDemoAI generates writing-style responses", async () => {
    vi.resetModules();
    const { processTaskWithDemoAI } = await import("@/lib/demo-mode");
    const result = await processTaskWithDemoAI("Write email", "Follow up with client");

    expect(result.success).toBe(true);
    expect(result.resultText).toContain("Draft");
  });
});