---
inclusion: manual
---

# Stack Selection Guide

Reference this with `#stack-selection` when choosing a stack for a new project.

## Decision Tree

```text
1. Building a web-only SaaS with auth + DB?
   ├── Need end-to-end type-safe API?        → T3 Stack (60-t3-stack.md)
   ├── Need real-time features + Supabase?    → Default Stack (53-nextjs.md)
   └── Want bleeding-edge full-stack React?   → TanStack Start (62-tanstack.md)

2. Building mobile + web (universal app)?
   └── Need iOS + Android + Web from one codebase? → T4 Stack (61-t4-stack.md)

3. Building a content-heavy site?
   └── Static-first with islands of interactivity? → Astro (custom)

4. Building a desktop app?
   └── Need native OS integration?            → Electron (custom)

5. Building a Python backend?
   └── Need async API with auto-docs?         → FastAPI (custom)
```

## Stack Comparison

| Feature        | Default         | T3              | T4            | TanStack/T5    |
| -------------- | --------------- | --------------- | ------------- | -------------- |
| Framework      | Next.js         | Next.js         | Next.js+Expo  | TanStack Start |
| API layer      | Route Handlers  | tRPC            | tRPC          | Server Fns     |
| Database       | Supabase        | Drizzle         | Supabase      | Flexible       |
| Auth           | Supabase Auth   | NextAuth        | Supabase Auth | Flexible       |
| Styling        | Tailwind+shadcn | Tailwind+shadcn | Tamagui       | Tailwind       |
| Mobile support | No              | No              | Yes (Expo)    | No             |
| Real-time      | Supabase RT     | Manual          | Supabase RT   | Manual         |
| Deployment     | Vercel/Docker   | Vercel/Docker   | CF Workers    | Nitro (any)    |
| Maturity       | Battle-tested   | Battle-tested   | Newer         | Newer          |

## When to Use Each

| Stack       | Best for                                                 |
| ----------- | -------------------------------------------------------- |
| Default     | Most web apps — proven, well-documented, large ecosystem |
| T3          | Type-safety purists — tRPC eliminates API contracts      |
| T4          | Universal apps — one codebase for iOS, Android, Web      |
| TanStack/T5 | Vite-based projects — faster DX, modern bundling         |

## Setup

After choosing a stack:

1. Run `./setup.sh` and select the matching preset (use `--dry-run` to preview first)
2. The setup wizard handles scaffolding, package manager selection, and steering doc cleanup
3. The relevant steering doc activates automatically via `fileMatch`
4. Irrelevant stack steering docs won't trigger (different file patterns)
5. Update `02-tech.md` approved integrations if needed

See the [Setup Script](../../README.md#setup-script) section in the README for full usage details, flags, and headless environment variables.
