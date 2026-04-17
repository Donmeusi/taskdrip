# Contributing to TaskDrip

## Development Workflow

1. Create a branch from `main`: `git checkout -b your-feature`
2. Make your changes
3. Ensure all quality checks pass:
   ```bash
   npm run typecheck
   npm run lint
   npm run format:check
   npm test
   npm run build
   ```
4. Push and open a pull request
5. CI will run automatically — fix any failures before requesting review

## Code Style

- **TypeScript**: Strict mode is enabled. No `any` types without a comment explaining why.
- **Formatting**: Prettier handles formatting. Run `npm run format` before committing.
- **Linting**: ESLint with `next/core-web-vitals` config. Run `npm run lint` to check.
- **Imports**: Use `@/` path alias for src imports (e.g., `import { fn } from "@/lib/fn"`).

## Testing

- Write tests for all new functionality.
- Use Vitest for unit/integration tests, Testing Library for React components.
- Place test files next to the code they test: `component.tsx` + `component.test.tsx`.
- Run `npm run test:coverage` to check coverage. Aim for meaningful coverage, not 100%.

## Commit Messages

- Use present tense: "Add feature" not "Added feature"
- Be specific: "Add email validation to signup form" not "Fix stuff"
- Reference issues when relevant: "Add user profile page (#42)"

## Pull Requests

- Small, focused PRs are preferred over large ones.
- Include a description of what changed and why.
- Link related issues.
- Keep PRs in a reviewable state — don't push broken code.

## Deployment Flow

TaskDrip deploys to Vercel via GitHub integration. The full guide is in [docs/DEPLOY.md](./docs/DEPLOY.md).

### Quick Deploy (One Click)

The README includes a "Deploy to Vercel" button that handles everything:

1. Click the button in the README — it opens Vercel with the repo pre-filled
2. Sign in to Vercel (free tier works)
3. Set the `OPENAI_API_KEY` environment variable when prompted
4. Click Deploy

### Manual Deploy

1. Push to GitHub (`main` branch)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the `Donmeusi/taskdrip` repository
4. Set `OPENAI_API_KEY` in environment variables (all environments)
5. Deploy — Vercel auto-builds and assigns a `*.vercel.app` domain

### After Merging to Main

Vercel auto-deploys on every push to `main`. No manual steps needed after the initial setup.

### Known Limitation: Ephemeral SQLite

On Vercel, the SQLite database resets on each serverless function invocation. This means:
- The UI and AI processing work for demos
- Data does NOT persist between requests
- For production, migrate to Postgres (see [docs/DEPLOY.md](./docs/DEPLOY.md#migration-roadmap-post-mvp))

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI task processing. Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `DATABASE_URL` | No | Database connection string. Default: SQLite at `./data/app.db`. Set to Postgres URL for persistent storage. |

See [.env.example](./.env.example) for the full template.