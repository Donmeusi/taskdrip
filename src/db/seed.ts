import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { createUser, createTask, updateTaskStatus, updateTaskResult } from "./queries";

const DB_PATH = process.env.DATABASE_URL || "./data/app.db";

const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("Seeding database...");

  // Create demo users
  const alice = createUser(db, { email: "alice@example.com", name: "Alice" });
  console.log(`Created user: ${alice.name} (${alice.email})`);

  const bob = createUser(db, { email: "bob@example.com", name: "Bob" });
  console.log(`Created user: ${bob.name} (${bob.email})`);

  // Create tasks for Alice
  const task1 = createTask(db, {
    userId: alice.id,
    title: "Research AI agent frameworks",
    description:
      "Find the top 5 AI agent frameworks and compare their features, pricing, and community support.",
  });
  console.log(`Created task: ${task1.title}`);

  // Simulate AI processing - mark as in_progress then complete
  updateTaskStatus(db, task1.id, "in_progress");
  updateTaskResult(
    db,
    task1.id,
    "## Top 5 AI Agent Frameworks\n\n1. **LangChain** — Most popular, huge ecosystem, Python/JS\n2. **CrewAI** — Multi-agent orchestration, easy setup\n3. **AutoGen** — Microsoft-backed, conversation-driven\n4. **Phidata** — Production-focused, built-in tools\n5. **Semantic Kernel** — Enterprise-oriented, C#/Python/Java\n\nRecommendation: LangChain for flexibility, CrewAI for multi-agent workflows."
  );
  console.log(`Completed task: ${task1.title}`);

  const task2 = createTask(db, {
    userId: alice.id,
    title: "Summarize Q1 report",
    description: "Read through the Q1 earnings report and provide a 3-bullet summary.",
  });
  console.log(`Created task: ${task2.title}`);

  updateTaskStatus(db, task2.id, "in_progress");
  console.log(`Task in progress: ${task2.title}`);

  const task3 = createTask(db, {
    userId: alice.id,
    title: "Draft blog post about AI agents",
    description:
      "Write a 500-word blog post about how AI agents are changing knowledge work.",
  });
  console.log(`Created task: ${task3.title}`);

  // Create tasks for Bob
  const task4 = createTask(db, {
    userId: bob.id,
    title: "Analyze competitor pricing",
    description:
      "Research our top 3 competitors and summarize their pricing models.",
  });
  updateTaskStatus(db, task4.id, "in_progress");
  updateTaskResult(
    db,
    task4.id,
    "## Competitor Pricing Analysis\n\n1. **Competitor A** — Freemium, $15/mo Pro\n2. **Competitor B** — Usage-based, $0.10/task\n3. **Competitor C** — $29/mo flat rate\n\nKey insight: Most competitors charge per-seat. Usage-based pricing is underrepresented."
  );
  console.log(`Completed task: ${task4.title}`);

  const task5 = createTask(db, {
    userId: bob.id,
    title: "Prepare meeting notes template",
    description:
      "Create a reusable meeting notes template with action items, decisions, and follow-ups.",
  });
  console.log(`Created task: ${task5.title}`);

  const task6 = createTask(db, {
    userId: bob.id,
    title: "Review pull request #42",
    description: "Review the API endpoint PR and provide feedback.",
  });
  updateTaskStatus(db, task6.id, "failed");
  console.log(`Task failed: ${task6.title}`);

  console.log("\nSeed complete!");
  console.log(`Users: 2, Tasks: 6 (2 completed, 1 in_progress, 2 pending, 1 failed)`);

  sqlite.close();
}

seed();