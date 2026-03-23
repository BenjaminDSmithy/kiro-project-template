# Tech Stack — TaskFlow

| Field        | Value      |
| ------------ | ---------- |
| Type         | Reference  |
| Status       | Active     |
| Last Updated | 2026-03-16 |

---

## Overview

TaskFlow is a collaborative project management SaaS built with Next.js and Supabase. We prioritise type safety end-to-end, server-side rendering for performance, and a minimal dependency footprint. All infrastructure runs on Vercel + Supabase Cloud with GitHub Actions for CI/CD.

## Core Stack

| Layer       | Technology    | Version | Key Constraint                         |
| ----------- | ------------- | ------- | -------------------------------------- |
| Language    | TypeScript    | 5.5+    | Strict mode, no `any` escape hatches   |
| Framework   | Next.js       | 15.x    | App Router only, no Pages Router       |
| Styling     | Tailwind CSS  | 4.x     | Utility-first, no custom CSS files     |
| Database    | PostgreSQL    | 16      | Via Supabase, Row Level Security on    |
| Auth        | Supabase Auth | 2.x     | Email + OAuth (Google, GitHub)         |
| Testing     | Vitest        | 2.x     | Co-located tests, fast-check for props |
| Linting     | Trunk         | 1.25+   | Single tool for lint + format          |
| Package Mgr | pnpm          | 9.x     | Workspace protocol for monorepo        |

## Architecture Decisions

| Decision         | Choice                | Rationale                                       |
| ---------------- | --------------------- | ----------------------------------------------- |
| Rendering        | RSC + Server Actions  | Reduce client JS, co-locate data fetching       |
| Database access  | Drizzle ORM           | Type-safe queries, zero runtime overhead        |
| State management | Zustand (client only) | Lightweight, no boilerplate, tree-shakeable     |
| API layer        | Server Actions + tRPC | Type-safe RPC for complex flows, actions for UI |

## Infrastructure

| Component  | Technology     | Purpose                           |
| ---------- | -------------- | --------------------------------- |
| Hosting    | Vercel         | Edge-optimised Next.js hosting    |
| Database   | Supabase Cloud | Managed Postgres + Auth + Storage |
| CI/CD      | GitHub Actions | Lint, test, preview deploys on PR |
| Monitoring | Sentry         | Error tracking and performance    |
| Logging    | Axiom          | Structured log aggregation        |

## Development Commands

| Command        | When             |
| -------------- | ---------------- |
| `pnpm install` | First-time setup |
| `pnpm dev`     | Start dev server |
| `pnpm build`   | Production build |
| `pnpm test`    | Run tests        |
| `trunk check`  | Lint and format  |

## Environment Variables

| Variable                        | Required | Description                       |
| ------------------------------- | -------- | --------------------------------- |
| `DATABASE_URL`                  | Yes      | Supabase Postgres connection      |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase public anon key          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Server-side Supabase admin access |
| `AUTH_SECRET`                   | Yes      | Session signing secret            |

Never commit secrets. Use `.env` for local development, `.env.example` for documentation.

## Approved Integrations

| Category  | Approved                         |
| --------- | -------------------------------- |
| Framework | Next.js, React                   |
| Database  | Supabase (Postgres), Drizzle ORM |
| Auth      | Supabase Auth                    |
| Testing   | Vitest, fast-check, Testing Lib  |
| Styling   | Tailwind CSS, shadcn/ui          |
| Payments  | Stripe                           |

## Not Approved

| Technology | Reason                                       |
| ---------- | -------------------------------------------- |
| Prisma     | Drizzle chosen for zero-runtime overhead     |
| MongoDB    | Postgres covers all use cases via Supabase   |
| Redux      | Zustand preferred for simplicity             |
| Styled JSX | Tailwind utility-first approach standardised |

---

```
Copyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}. All rights reserved.
```
