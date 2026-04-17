# Contributing to Donmeusi App

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