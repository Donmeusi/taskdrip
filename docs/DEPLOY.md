# TaskDrip Deployment Guide

Complete guide for deploying TaskDrip to Vercel.

---

## Prerequisites

Before deploying, you need:

1. **Vercel account** — Free tier works for MVP ([sign up](https://vercel.com/signup))
2. **GitHub account** — To host the repo (Vercel deploys from GitHub)
3. **OpenAI API key** — Required for AI task processing ([get one](https://platform.openai.com/api-keys))
   - Must have billing enabled
   - See [docs/openai-setup.md](./openai-setup.md) for cost analysis

---

## Step-by-Step: Deploy to Vercel

### 1. Push to GitHub

```bash
# If not already a git repo:
git init
git add .
git commit -m "Initial commit"

# Create a GitHub repo and push:
gh repo create taskdrip --public --push
# OR: git remote add origin https://github.com/YOUR_ORG/taskdrip.git && git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select the `taskdrip` repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (default)
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 3. Set Environment Variables

In the Vercel project settings (Settings > Environment Variables), add:

| Variable | Value | Environments |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-you...-key` | Production, Preview, Development |
| `DEMO_MODE` | `false` | Production (optional) |

**Important**: 
- Do NOT set `DATABASE_URL`. The SQLite path is auto-configured and would be ephemeral on Vercel anyway (see [Limitations](#limitations) below).
- If deploying without an OpenAI API key, the app runs in **demo mode** automatically — tasks use mock AI responses. Set `DEMO_MODE=false` to force the real OpenAI path (required for AI processing to work).

### 4. Deploy

Click **Deploy**. Vercel will:
- Install dependencies
- Run `next build`
- Deploy to a `*.vercel.app` domain
- Auto-deploy on future pushes to `main`

### 5. Verify

Visit the deployed URL and test these endpoints:

| URL | Expected Result |
|-----|----------------|
| `/` | Landing page (TaskDrip marketing) |
| `/app` | Task management UI |
| `/api/health` | `{ "status": "ok" }` |
| `/api/config` | `{ "demoMode": true/false }` |
| `/app/tasks` | Task list (empty initially) |

---

## Production Build (Local)

To test the production build locally before deploying:

```bash
# Build the app
npm run build

# Start the production server
npm start
```

The app runs on `http://localhost:3000`.

---

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.mjs` | Next.js config — minimal, no serverExternalPackages needed (postgres.js is pure JS) |
| `vercel.json` | Vercel-specific settings: framework declaration, function maxDuration for AI endpoint, API cache headers |
| `.env.example` | Template for environment variables |
| `.env.local` | Local environment variables (gitignored) |

---

## Limitations

### SQLite Is Ephemeral on Vercel

**This is the most important limitation to understand.**

Vercel's serverless functions have an ephemeral (read-only except `/tmp`) filesystem. This means:

- The SQLite database (`data/app.db`) is created fresh on each serverless function invocation
- Data written in one request WILL NOT persist to the next request
- The app will appear to work (create, process tasks) but data disappears immediately

**For the MVP, this is acceptable if:**
- You only need to demo the UI and AI processing flow
- You don't need data to survive between page loads

**For production, you MUST migrate to Postgres.** See DON-13 in the backlog for the migration plan. The recommended path is:
1. Sign up for [Neon](https://neon.tech) (free tier: 0.5GB storage)
2. Update `src/db/index.ts` to use `drizzle-orm/node-postgres` instead of `drizzle-orm/better-sqlite3`
3. Set `DATABASE_URL` to the Neon connection string
4. Remove `better-sqlite3` dependency

### `better-sqlite3` Native Module

`better-sqlite3` is a native C addon. Vercel's Node.js runtime supports native modules, so this works at build time. However, the SQLite persistence issue above means it's only useful for the build to succeed — the actual database is not functional in production.

### OpenAI API Key Required

Without `OPENAI_API_KEY`:
- The app UI loads fine
- Task CRUD operations work (create, list, delete)
- The **Process** button (POST `/api/tasks/[id]/process`) returns a `422` error with message: `"OPENAI_API_KEY is not configured"`

### Function Duration

The AI processing route (`/api/tasks/[id]/process`) has `maxDuration = 30` (seconds), set in both the route file (`export const maxDuration = 30`) and `vercel.json`. Vercel Hobby tier allows up to 10s by default; Pro tier allows up to 300s. If deploying on Hobby tier and OpenAI calls exceed 10s, upgrade to Pro or reduce the AI timeout in `src/lib/openai.ts`.

---

## Post-Deployment Checklist

- [ ] Landing page loads at root URL
- [ ] `/app` page renders task UI
- [ ] `/api/health` returns `{ "status": "ok" }`
- [ ] Create a task (works without API key)
- [ ] Process a task (requires OPENAI_API_KEY)
- [ ] Waitlist signup works at `/api/waitlist`
- [ ] Custom domain configured (optional: Settings > Domains in Vercel)
- [ ] Analytics enabled (Vercel dashboard > Analytics)

---

## Rollback

If a deployment breaks:

1. Go to Vercel dashboard > Deployments
2. Find the last working deployment
3. Click the **"..."** menu > **"Promote to Production"**

Or via CLI:
```bash
npx vercel rollback
```

---

## Monitoring

- **Vercel dashboard**: Logs, analytics, deployment history
- **Runtime logs**: `npx vercel logs` (real-time function logs)
- **Health check**: `GET /api/health` returns `{ "status": "ok" }`

---

## Migration Roadmap (Post-MVP)

1. **Postgres on Neon** — Replace SQLite for persistent storage
2. **Authentication** — Add user accounts (NextAuth.js or Clerk)
3. **Background jobs** — Offload AI processing to a queue (Vercel Cron + database-backed jobs)
4. **Rate limiting** — Protect OpenAI API calls (Vercel KV + upstash ratelimit)
5. **Custom domain** — Point `taskdrip.app` (or similar) to Vercel