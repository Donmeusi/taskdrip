# TaskDrip

**Set it, forget it, get it done.**

AI-powered task delegation app by Donmeusi Inc. Describe tasks in plain English, AI completes them, you review the result.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?repository-url=https%3A%2F%2Fgithub.com%2FDonmeusi%2Ftaskdrip&env=OPENAI_API_KEY&envDescription=OpenAI%20API%20key%20required%20for%20AI%20task%20processing&project-name=taskdrip)

Click the button above to deploy. You'll need to:
1. Sign in to Vercel (free tier works)
2. Set the `OPENAI_API_KEY` environment variable when prompted
3. Click Deploy

> **Note:** Without `OPENAI_API_KEY`, the app runs in demo mode (mock AI responses). Set `DEMO_MODE=false` to force live OpenAI. SQLite data is ephemeral on Vercel — see [DEPLOY.md](./docs/DEPLOY.md#migration-roadmap-post-mvp) for Postgres migration.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | Full-stack web, SSR, API routes built-in |
| Language | TypeScript | Type safety, better DX, fewer bugs |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration, no context switching |
| Testing | Vitest + Testing Library | Fast, TypeScript-native, great React support |
| Linting | ESLint (next/core-web-vitals) | Catches bugs, enforces consistency |
| Formatting | Prettier | Zero-config formatting, no debates |
| CI/CD | GitHub Actions + Vercel | Automated quality gates, zero-config deploy |

See [TECH_DECISIONS.md](./TECH_DECISIONS.md) for detailed reasoning.

## Project Structure

```
src/
  app/              # Next.js App Router pages and API routes
    api/            # API route handlers
      health/       # Health check endpoint
      tasks/        # Task CRUD + AI processing
        [id]/process/ # POST trigger AI processing
      waitlist/     # Waitlist signup
    app/            # TaskDrip task management UI
      page.tsx      # Task creation, list, detail views
    layout.tsx      # Root layout
    page.tsx        # Landing page (TaskDrip marketing)
    globals.css     # Global styles (Tailwind)
  lib/              # Shared libraries
    openai.ts       # OpenAI client + processTaskWithAI()
  db/               # Database layer (Drizzle ORM + SQLite)
    schema.ts       # Table definitions (users, tasks)
    queries.ts      # CRUD operations
    index.ts        # Database connection + re-exports
    seed.ts         # Seed data script
    __tests__/      # Data layer unit tests
  test/
    setup.ts        # Test environment setup
drizzle/            # Generated SQL migrations
docs/               # Documentation
  openai-setup.md   # OpenAI API key setup + cost guide
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Test coverage report |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:generate` | Generate Drizzle migration from schema |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly to DB (dev) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |

## Deployment

See **[docs/DEPLOY.md](./docs/DEPLOY.md)** for the complete deployment guide.

Quick summary for Vercel:
1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Set `OPENAI_API_KEY` in environment variables
4. Deploy

**Note**: SQLite data is **ephemeral** on Vercel — data resets between requests. For persistent storage, migrate to Postgres (see DEPLOY.md).

## API

See [docs/API.md](./docs/API.md) for API documentation.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.