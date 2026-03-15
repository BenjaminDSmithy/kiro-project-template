---
inclusion: always
---

# Technical Stack

<!-- TODO: Replace with your actual stack -->

## Pre-Implementation Checklist

Before writing code, answer these in order:

1. **Technology approved?** → See Approved Integrations (bottom of doc)
2. **Which module?** → Check `03-structure.md` for file placement
3. **Server or client?** → Server Components default; `'use client'` only when required
4. **Existing solution?** → Search codebase first

## Core Stack

<!-- TODO: Fill in your actual technology choices -->

| Layer     | Technology              | Key Constraint                    |
| --------- | ----------------------- | --------------------------------- |
| Framework | Next.js (App Router)    | Server Components default         |
| Language  | TypeScript strict       | No `any` — use `unknown` or types |
| Styling   | TailwindCSS + shadcn/ui | Reuse existing components         |
| Database  | Supabase + Drizzle ORM  | Schema in `src/lib/db/schema/`    |
| Testing   | Vitest + Playwright     | Always use `--run` flag           |
| Linting   | Trunk                   | `trunk check --fix` before commit |

## Architecture Rules

| Pattern             | Required                     | Prohibited                  |
| ------------------- | ---------------------------- | --------------------------- |
| Component rendering | Server Components by default | `'use client'` without need |
| Database access     | Drizzle ORM query builders   | Raw SQL in application code |
| Timestamps          | UTC ISO 8601                 | Local timezone in storage   |

## Utility Commands

| Command                     | When                    |
| --------------------------- | ----------------------- |
| `trunk check --fix <files>` | Before every commit     |
| `trunk fmt <files>`         | Auto-format             |
| `pnpm test -- --run`        | Run tests (never watch) |

## MCP Tool Preference

Use MCP tools instead of bash for:

| Domain   | MCP Server | Prerequisite          |
| -------- | ---------- | --------------------- |
| Database | supabase   | `pnpm supabase start` |
| Git      | git        | —                     |
| Browser  | chrome     | —                     |
| Docker   | docker     | Docker daemon running |

## Environment

- Never commit secrets — use `.env.local`
- Reference `.env.example` for required variables

## Approved Integrations

<!-- TODO: List your approved technologies. Anything not listed requires user approval. -->

| Category       | Approved                           |
| -------------- | ---------------------------------- |
| Framework      | Next.js, React                     |
| Database       | Supabase (PostgreSQL), Drizzle ORM |
| Auth           | Supabase Auth                      |
| Testing        | Vitest, Playwright                 |
| Styling        | TailwindCSS, shadcn/ui, Radix UI   |
| Infrastructure | Docker                             |
| Icons          | Lucide React                       |

**Not approved** (require explicit user approval):

- Databases: Firebase, MongoDB, Prisma
- Auth: Auth0, Clerk, NextAuth
