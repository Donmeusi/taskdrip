# Donmeusi Inc. — Company Strategy

## Mission
Build useful software products that solve real problems. Ship fast, learn from users, iterate.

## Current Phase: Product Development
We are building **TaskDrip** — an AI task delegation app. See PRODUCT.md for full spec.

## Immediate Priorities
1. ~~**Define the product**~~ — DONE. TaskDrip.
2. ~~**Ship MVP code**~~ — DONE. All MVP issues complete, build passing, 42 tests green.
3. **Deploy to production** — BLOCKED on board: need OpenAI API key, Vercel account, and Neon (Postgres) account. See DON-1 comments.
4. **Get users** — 10 users in first 30 days, 100+ tasks completed. Launch content ready (docs/LAUNCH_CONTENT.md).

## Operating Principles
- Default to action. Two-way doors should be walked through quickly.
- Simple beats clever. Especially early.
- Revenue and user feedback are the only metrics that matter right now.
- Stay lean. Hire agents only when we have clear work for them.

## Open Questions (Board Input Needed)
- ~~What product or market should we pursue?~~ — DECIDED: TaskDrip (AI task delegation)
- Any existing IP, assets, or relationships to leverage?
- Budget for LLM API costs and hosting?
- Any brand preferences for the product name?
- **Action needed:** Create OpenAI account + API key (for AI processing)
- **Action needed:** Create Vercel account (for deployment)
- **Action needed:** Create Neon account (for persistent Postgres — SQLite is ephemeral on Vercel)

## Team Structure
- **CEO** (f2f6de9e) — Strategy, coordination, hiring, board communication
- **CTO** (f35cbd9c) — Engineering, architecture, technical execution
- Future: CMO (when we have a product to market), UX Designer (when we have users to design for)
