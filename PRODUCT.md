# Donmeusi Inc. — Product Definition

## Product: TaskDrip

**Tagline:** "Set it, forget it, get it done."

## Concept

TaskDrip is a simple web app for delegating tasks to AI. Users describe a task in natural language, an AI agent works on it, and the user gets the result. Think of it as an AI-powered to-do list where items actually get done instead of just sitting there.

## Why This Product

- **We dogfood it.** Our own team runs on AI agent delegation. We know the pain points.
- **Clear value prop.** "Type what you need done, get it back completed." Zero learning curve.
- **Solo dev viable.** MVP is a task queue + LLM API + simple UI. One engineer can ship it.
- **Monetizable.** Freemium: free tier with limited tasks, paid tier for power users.
- **Growing market.** Every knowledge worker wants AI help but existing tools are too complex.

## Target Users (MVP)

- Solo knowledge workers (consultants, freelancers, researchers)
- Small team leads who delegate work
- Anyone who writes TODO lists that never get done

## MVP Scope

### Core Flow (Must Have)
1. **Create Task** — User writes a natural language task description + any context/attachments
2. **AI Processing** — Task is sent to an LLM (GPT-4 / Claude) with a system prompt tuned for execution
3. **Review Result** — User sees the completed work, can approve, revise, or re-delegate
4. **Task History** — List of all tasks with status (pending, in-progress, completed, failed)

### One Agent Type (MVP)
- **Research Agent** — Given a topic or question, researches and returns a structured summary/report
- Future agents (post-MVP): Writing Agent, Code Agent, Data Agent

### Not In MVP
- Multiple agent types
- Real-time streaming (polling is fine)
- Team collaboration
- Integrations (Slack, Notion, etc.)
- Custom agent configuration
- Scheduling/recurring tasks
- Billing/payments (can use waitlist for now)

## Tech Stack (CTO's Choice — Current Scaffold)
- **Frontend:** Next.js 15 + React 19 + Tailwind CSS 4 + TypeScript
- **Testing:** Vitest + Testing Library
- **Backend:** Next.js API routes (serverless functions)
- **Database:** SQLite via Drizzle ORM (simplest thing that works, can migrate to Postgres)
- **AI Provider:** OpenAI API (GPT-4o-mini for cost, GPT-4o for quality)
- **Deployment:** Vercel (free tier to start)

## Success Metrics (First 30 Days)
- Ship a working MVP within 2 weeks
- Get 10 users trying it (friends, Twitter, indie hackers)
- 100+ tasks completed through the platform
- At least 1 user who completes 10+ tasks (power user signal)

## Revenue Model (Post-MVP)
- **Free:** 5 tasks/day, GPT-4o-mini only
- **Pro ($9/mo):** 100 tasks/day, GPT-4o access, task history export
- **Team ($29/mo per seat):** Shared workspace, team analytics

## Competitive Landscape
- **ChatGPT/Claude:** General-purpose, not task-delegation focused. No persistent task queue.
- **Zapier AI:** Automation-focused, not for ad-hoc knowledge work.
- **AutoGPT/BabyAGI:** Too technical for mainstream users.
- **Motion/Reclaim:** Calendar/schedule focused, not AI execution.

TaskDrip's edge: simplicity. It's a to-do list where the AI does the work.

## Roadmap Sketch
1. **Week 1-2:** MVP (core flow, one agent, deployed)
2. **Week 3-4:** User testing, iteration, polish
3. **Month 2:** Add billing, second agent type, waitlist → signup
4. **Month 3:** Team features, integrations