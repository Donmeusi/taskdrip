# Technical Decisions

This document records the tech stack choices made for the Donmeusi MVP and the reasoning behind each.

## Decision Principle

**Optimize for speed of iteration, not future-proofing.** We can always migrate later. The goal is to ship a working MVP as fast as possible.

---

## Framework: Next.js 15 (App Router)

**Alternatives considered:**
- Remix — similar feature set, smaller ecosystem
- Vite + React SPA — no server rendering, no API routes built-in
- Express + separate frontend — more boilerplate, slower iteration

**Why Next.js:**
- Full-stack in one project: pages, API routes, server actions
- App Router is mature in v15 — no experimentation risk
- Server components reduce client-side JS, better UX out of the box
- Vercel deployment is zero-config (literally `vercel` and you're live)
- Largest React ecosystem, most tutorials, most answers on Stack Overflow
- When we need it: middleware, edge functions, ISR, image optimization are all built-in

**Trade-off:** Next.js is opinionated. If the product evolves toward a completely different architecture (e.g., mobile-native backend), we may need to extract the API. But that's a two-way door — we can add a separate API server and share the database layer.

---

## Language: TypeScript (strict)

**Alternatives considered:**
- JavaScript — faster to write, no build step overhead
- ReasonML / ReScript — safer but tiny ecosystem

**Why TypeScript:**
- Catches bugs before runtime, especially in a small team with no code review bottleneck
- IDE support is excellent (autocompletion, refactoring)
- Strict mode forces discipline that saves debugging time
- The "overhead" of types pays for itself by day 3 of any non-trivial feature

---

## Styling: Tailwind CSS v4

**Alternatives considered:**
- CSS Modules — more explicit but slower iteration
- Styled-components / Emotion — runtime overhead, bigger bundle
- Plain CSS — no design system consistency

**Why Tailwind:**
- Utility-first means no context switching between markup and styles
- v4 is simpler (CSS-first config, no `tailwind.config.js` needed in most cases)
- Design constraints built-in (spacing scale, color palette) prevent one-off values
- Purges unused styles automatically — tiny production CSS
- Team members can read and modify styles without learning a custom system

---

## Testing: Vitest + Testing Library

**Alternatives considered:**
- Jest — more established but slower, worse ESM/TypeScript support
- Playwright — for E2E, overkill at MVP stage
- No tests — faster initially but pays compound interest in bug-fixing

**Why Vitest:**
- Jest-compatible API but 10x faster startup
- Native TypeScript and ESM support — no transforms, no config
- Same config as Vite (will be useful if we add Storybook or other Vite tools)
- Testing Library is the React standard — tests user behavior, not implementation

**Scope:** Unit and integration tests for now. E2E (Playwright) can be added when we have critical user flows to protect.

---

## Linting & Formatting: ESLint + Prettier

**Why this combo:**
- ESLint catches actual bugs (unused variables, missing deps, accessibility issues)
- Prettier eliminates formatting debates — run it, commit, move on
- `next/core-web-vitals` preset covers React-specific best practices
- Tailwind plugin sorts class names for consistency

---

## CI/CD: GitHub Actions + Vercel

**Alternatives considered:**
- CircleCI — more complex for no benefit at this scale
- Netlify — comparable to Vercel but weaker Next.js support
- AWS / GCP — overkill for MVP, hours of config to save minutes of latency

**Why GitHub Actions + Vercel:**
- GitHub Actions runs lint, typecheck, tests, build on every push/PR — quality gate
- Vercel deploys preview on every PR — instant feedback
- Production deploys on push to main — zero-intervention deployment
- Total setup time: under an hour
- Vercel free tier handles MVP traffic easily

**Pipeline:**
1. On every push/PR → lint + typecheck + format check + tests + build
2. On PR → deploy preview to Vercel
3. On merge to main → deploy production to Vercel

---

## What We're NOT Using (Yet)

| Tool | Why Not Now |
|------|-------------|
| Database | Product direction not defined yet — will add when we know what we're storing |
| Auth | Same — add when we have users who need accounts |
| ORM | Depends on database choice |
| Docker | Vercel handles deployment; add when we need custom infra |
| Storybook | Overhead for MVP; add when UI complexity justifies it |
| E2E tests (Playwright) | Add when we have critical flows; unit/integration covers MVP |
| Monorepo (Turborepo) | One app, one package; split if/when we need multiple services |

---

## Summary

The stack is deliberately boring and mainstream. Every tool is widely used, well-documented, and solves a real problem we have right now. No part of this is hard to change later — we're not locked into anything. The only opinion with real weight is Next.js, and even that can be gradually extracted if the product outgrows it.