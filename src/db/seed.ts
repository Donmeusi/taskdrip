import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { createUser, createTask, updateTaskStatus, updateTaskResult } from "./queries";
import path from "path";

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), "data", "app.db");

const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite, { schema });

function seed() {
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
    title: "Summarize Q1 marketing report",
    description:
      "Read the Q1 marketing report and provide a 3-paragraph executive summary with key metrics.",
  });
  console.log(`Created task: ${task2.title}`);

  const task3 = createTask(db, {
    userId: alice.id,
    title: "Draft partnership outreach email",
    description:
      "Write a professional outreach email to potential technology partners, highlighting collaboration opportunities with our AI task platform.",
  });
  console.log(`Created task: ${task3.title}`);

  // Create tasks for Bob
  const task4 = createTask(db, {
    userId: bob.id,
    title: "Analyze competitor pricing",
    description:
      "Research pricing models of our top 5 competitors and create a comparison table.",
  });
  console.log(`Created task: ${task4.title}`);

  const task5 = createTask(db, {
    userId: bob.id,
    title: "Write blog post about AI automation",
    description:
      "Write a 500-word blog post about how AI automation is changing personal productivity, aimed at a general audience.",
  });
  console.log(`Created task: ${task5.title}`);

  // Mark task5 as in_progress (simulate partial processing)
  updateTaskStatus(db, task5.id, "in_progress");
  console.log(`Processing task: ${task5.title}`);

  console.log("\nSeeding complete!");
  console.log(`Created 2 users and 5 tasks`);
}

seed();