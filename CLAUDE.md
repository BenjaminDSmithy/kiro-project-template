# Project Rules

<!--
  TEMPLATE: This file is ready to use out of the box.
  Customise the sections marked [CUSTOMISE] for your project.
  Delete this comment block when done.
-->

This file is the single source of truth for Claude Code in this repository. It consolidates core rules, product context, technical standards, and workflow conventions. Sub-pages in `.claude/` extend these rules for specific domains.

## Core Rules

These rules take absolute precedence. Apply them to every interaction.

### Rule 1: Explicit Consent Required

Implement only what the user explicitly requests. Nothing more.

- Do NOT add unrequested features, extras, or "improvements"
- Do NOT interpret vague requests broadly — ask for clarification first
- Do NOT silently include your own suggestions
- Do NOT expand scope for "thoroughness"
- Confirm exact scope before executing

### Rule 2: Clarification Protocol

When a request is vague, ambiguous, or has multiple valid interpretations:

1. **Stop** — Do not proceed with assumptions
2. **Clarify** — Ask the user to specify exactly what they want
3. **Confirm** — Repeat your understanding back before executing
4. **Execute** — Only after receiving explicit confirmation

### Rule 3: Scope Boundaries

Work only within boundaries defined by this file and its sub-pages:

- Approved integrations → see Tech Stack section below
- Feature areas → see Product Overview section below
- File locations → see Project Structure section below

Anything outside these boundaries requires explicit user approval.

### Rule 4: When in Doubt, Ask

The user prefers answering a clarifying question over correcting incorrect assumptions.

### Rule Priority

1. User's explicit instruction in current request
2. Core rules (this section)
3. Domain-specific rules (sub-pages)
4. General best practices

---

## Product Overview

<!-- [CUSTOMISE] Replace with your project description -->

[Project Name] — Brief one-line description of what this project does.

### Quick Decision Framework

Before implementing code, verify:

1. **Is the feature approved?** → Check approved scope below
2. **Does it handle sensitive data?** → Follow security patterns
3. **Does it store timestamps?** → Use UTC, convert only for display
4. **Does it modify user data?** → Enforce validation, log audit trail

### Domain Terms

<!-- [CUSTOMISE] Define your project's domain vocabulary -->

| Term            | Definition            | Code Convention                                |
| --------------- | --------------------- | ---------------------------------------------- |
| `ExampleEntity` | Description of entity | `example_entities` table, `ExampleEntity` type |

### Business Rules

<!-- [CUSTOMISE] Define non-negotiable rules for your domain -->

| Rule         | Implementation          |
| ------------ | ----------------------- |
| Example rule | How it must be enforced |

### Language

<!-- [CUSTOMISE] Set your locale preference -->

Australian English: `optimise`, `behaviour`, `colour`, `analyse`, `licence` (noun).

---

## Tech Stack

<!-- [CUSTOMISE] Replace with your actual stack -->

### Pre-Implementation Checklist

1. **Technology approved?** → See Approved Integrations below
2. **Which module?** → Check Project Structure section
3. **Server or client?** → Server Components default; `'use client'` only when required
4. **Existing solution?** → Search codebase first

### Core Stack

<!-- [CUSTOMISE] Fill in your actual technology choices -->

| Layer     | Technology              | Key Constraint                    |
| --------- | ----------------------- | --------------------------------- |
| Framework | Next.js (App Router)    | Server Components default         |
| Language  | TypeScript strict       | No `any` — use `unknown` or types |
| Styling   | TailwindCSS + shadcn/ui | Reuse existing components         |
| Database  | Supabase + Drizzle ORM  | Schema in `src/lib/db/schema/`    |
| Testing   | Vitest + Playwright     | Always use `--run` flag           |
| Linting   | Trunk                   | `trunk check --fix` before commit |

### Architecture Rules

| Pattern             | Required                     | Prohibited                  |
| ------------------- | ---------------------------- | --------------------------- |
| Component rendering | Server Components by default | `'use client'` without need |
| Database access     | Drizzle ORM query builders   | Raw SQL in application code |
| Timestamps          | UTC ISO 8601                 | Local timezone in storage   |

### Utility Commands

| Command                     | When                    |
| --------------------------- | ----------------------- |
| `trunk check --fix <files>` | Before every commit     |
| `trunk fmt <files>`         | Auto-format             |
| `pnpm test -- --run`        | Run tests (never watch) |

### Environment

- Never commit secrets — use `.env`
- Reference `.env.example` for required variables

### Approved Integrations

<!-- [CUSTOMISE] List your approved technologies -->

| Category       | Approved                                            |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js, React, TanStack Start, Expo                |
| API Layer      | tRPC, TanStack Query, REST (Next.js Route Handlers) |
| Database       | Supabase (PostgreSQL), Drizzle ORM                  |
| Auth           | Supabase Auth                                       |
| Testing        | Vitest, Playwright                                  |
| Styling        | TailwindCSS, shadcn/ui, Radix UI, Tamagui          |
| Navigation     | Solito (cross-platform), Expo Router                |
| Infrastructure | Docker, Cloudflare Workers                          |
| Icons          | Lucide React                                        |

**Not approved** (require explicit user approval): Firebase, MongoDB, Prisma, Auth0, Clerk, NextAuth.

---

## Project Structure

<!-- [CUSTOMISE] Adapt to your actual project layout -->

### Decision Tree: Where Does This Code Go?

```text
1. Is it a page or API route?       → src/app/
2. Is it a reusable UI component?   → src/components/ui/
3. Is it a feature-specific component? → src/components/[feature]/
4. Is it business logic or utility? → src/lib/[domain]/
5. Is it database-related?          → src/lib/db/schema/ (ORM) or supabase/migrations/ (SQL)
```

### File Placement Matrix

| File Type         | Path Pattern                      | Example                        |
| ----------------- | --------------------------------- | ------------------------------ |
| Page              | `src/app/[route]/page.tsx`        | `src/app/dashboard/page.tsx`   |
| API Route         | `src/app/api/[endpoint]/route.ts` | `src/app/api/users/route.ts`   |
| UI Component      | `src/components/ui/[name].tsx`    | `src/components/ui/button.tsx` |
| Feature Component | `src/components/[feature]/`       | `src/components/dashboard/`    |
| Hook              | `src/hooks/use-[name].ts`        | `src/hooks/use-auth.ts`        |
| Domain Logic      | `src/lib/[domain]/`              | `src/lib/auth/session.ts`      |
| DB Schema         | `src/lib/db/schema/`             | `src/lib/db/schema/users.ts`   |
| Types             | `src/lib/types/`                 | `src/lib/types/user.ts`        |
| Validators        | `src/lib/validator/`             | `src/lib/validator/user.ts`    |

### Naming Conventions

| Element         | Convention    | Correct            | Incorrect           |
| --------------- | ------------- | ------------------ | ------------------- |
| Component file  | kebab-case    | `user-profile.tsx` | `UserProfile.tsx`   |
| Hook file       | `use-` prefix | `use-auth.ts`      | `auth-hook.ts`      |
| Barrel export   | `index.ts`    | Always required    | Direct file imports |
| DB table        | snake_case    | `user_profiles`    | `userProfiles`      |
| TypeScript type | PascalCase    | `UserProfile`      | `userProfile`       |
| Variable        | camelCase     | `userProfile`      | `user_profile`      |

### Import Order (Strict)

```typescript
// 1. External libraries (alphabetical)
import { useCallback } from "react";
// 2. Internal utilities (@/lib/)
import { cn } from "@/lib/utils";
// 3. Internal hooks (@/hooks/)
import { useAuth } from "@/hooks/use-auth";
// 4. Internal types (use `type` keyword)
import type { User } from "@/lib/types/user";
// 5. Relative imports (same feature)
import { UserCard } from "./user-card";
```

Always use `@/` path aliases. Always create barrel exports (`index.ts`).

---

## Code Style

### TypeScript Rules

| Rule            | Correct                   | Avoid                        |
| --------------- | ------------------------- | ---------------------------- |
| Type safety     | Proper types or `unknown` | `any`                        |
| Object shapes   | `type Foo = { ... }`      | `interface` unless extending |
| Trailing commas | Always in multi-line      | Omitting final comma         |
| Path aliases    | `@/lib/utils`             | `../../../lib/utils`         |

### Quality Gate (Mandatory)

Run before marking any task complete:

```bash
trunk check --fix <modified-files>
```

Zero tolerance for unresolved trunk issues. Re-run until zero issues.

---

## Error Handling

All API errors must return a consistent structure:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "request_id": "uuid"
  }
}
```

| Rule                 | Correct                         | Incorrect                      |
| -------------------- | ------------------------------- | ------------------------------ |
| Never swallow errors | Log or re-throw                 | Empty catch block              |
| Use specific codes   | `VALIDATION_ERROR`, `NOT_FOUND` | `ERROR`, `FAILED`              |
| Include context      | `{ field, reason }`             | Generic "Something went wrong" |
| Sanitise messages    | `"Invalid format"`              | `"Invalid: ${userInput}"`      |
| Hide internals       | `"Database error"`              | Stack traces, SQL, file paths  |

---

## Testing Standards

Vitest for unit/integration tests, Playwright for E2E. Always use `--run` flag — never watch mode.

### Which Test Type?

1. **User journey / browser interaction?** → E2E (Playwright)
2. **Multiple services (DB/Redis)?** → Integration (Vitest)
3. **Testing invariants or edge cases?** → Property (fast-check)
4. **React component?** → Unit with RTL (Vitest)
5. **Everything else** → Unit (Vitest)

### Test Structure (AAA Pattern)

All tests follow Arrange-Act-Assert with `describe("Module") > describe("function") > it("should ... when ...")`.

### Forbidden Test Patterns

| Pattern                    | Correct Alternative            |
| -------------------------- | ------------------------------ |
| `test.only()`, `it.only()` | Remove before commit           |
| `await sleep(1000)`        | `waitFor()`, `expect.poll()`   |
| `setTimeout` in assertions | `vi.advanceTimersByTime()`     |
| Missing `act()` wrapper    | Wrap state updates in `act()`  |
| Hard-coded delays          | Polling or event-based waiting |

### Test Command Hygiene

- Start with the narrowest failing test when debugging
- Expand to related suites before declaring a fix complete
- Use `--reporter=dot` or name filtering for large suites

---

## Git Workflow

### Commit Message Format

```text
<type>(<scope>): <subject>
```

Types: `feat` `fix` `docs` `style` `refactor` `test` `chore` `perf` `build` `ci`

Title rules: ≤50 chars, imperative mood, lowercase, no trailing period.

### Required Commit Body Sections

Always include:

- `📝 Summary:` — 1-3 bullet points
- `📦 Files Modified:` — file paths with change magnitude
- `📊 Code Changes:` — insertions/deletions count

Include when applicable: `⚠️ Breaking Changes:`, `🔧 Technical Improvements:`, `📁 Database:`, `🔒 Security:`, `➕ Files Added:`

### Commit Workflow

1. Check working tree status
2. Review all changes
3. Run `trunk check --fix <files>` (must pass)
4. Stage related files only
5. Commit with formatted message

---

## Task Completion Standards

Complete every task fully. Never skip, defer, or leave placeholders without explicit user approval.

### Is This Task Complete?

All must pass — no exceptions:

1. Code compiles without errors
2. All imports present and correct
3. Barrel exports (`index.ts`) updated
4. No `TODO`/placeholder comments remain
5. All TypeScript types defined (no `any`)
6. Error handling complete
7. `trunk check --fix` passes
8. Related files updated

### Failed Fix Protocol

After a fix doesn't work: **Stop** → **Analyse** why → **Report** side effects → **Ask** for guidance.

After 3+ failed attempts: the approach is fundamentally wrong. Summarise attempts, re-analyse assumptions, research docs, suggest entirely new approaches.

---

## Security Standards

### Secrets Management

- No hardcoded secrets — use `.env` or secret manager
- No secrets in logs, error messages, or steering docs
- Rotate compromised keys immediately

### Input Validation

- Validate all user input at API boundaries using Zod
- Use parameterised queries via Drizzle ORM — never interpolate user input into SQL
- Sanitise HTML output (avoid `dangerouslySetInnerHTML`)
- Reject unexpected fields — use strict schemas

### Auth & Authorisation

- Use Supabase Auth for all authentication
- Enforce Row Level Security (RLS) on all tables
- Check authorisation server-side — never trust client-side checks alone

### Dependency Security

- Run `pnpm audit` before merging dependency changes
- Pin major versions
- Remove unused dependencies promptly

---

## Safety Guardrails

When working on risky changes, state the active edit boundary and guarded command classes at the start.

### Destructive Commands Requiring Confirmation

Always ask before:

- `rm -rf`, recursive deletes, broad file removal
- `git reset --hard`, force push, history rewrite
- Destructive SQL: `DROP`, `TRUNCATE`, mass `DELETE`
- Infrastructure deletion commands
- Schema/migration changes with destructive data impact

### Safe Defaults

- Prefer read-only inspection before mutation
- Preview diffs before committing
- Prefer additive migrations over destructive replacements
- Preserve rollback paths when changing data, auth, or deployment behaviour
- Announce risky operations before executing them

---

## Sub-Pages

Domain-specific rules are in `.claude/` as markdown files. Claude Code auto-loads these when relevant:

| File                           | Domain                                   |
| ------------------------------ | ---------------------------------------- |
| `CLAUDE.md` (this file)        | Core rules, always loaded                |
| `.claude/api-standards.md`     | REST API conventions                     |
| `.claude/database.md`          | Database design with Supabase + Drizzle  |
| `.claude/react-components.md`  | React component patterns                 |
| `.claude/docker.md`            | Docker and container standards           |
| `.claude/accessibility.md`     | WCAG AA compliance                       |
| `.claude/logging.md`           | Structured logging and observability     |
| `.claude/authorisation.md`     | RBAC and permission architecture         |
| `.claude/cicd.md`              | CI/CD pipeline standards                 |
| `.claude/documentation.md`     | Documentation conventions                |
| `.claude/performance.md`       | Performance optimisation                 |
| `.claude/state-management.md`  | State management patterns                |
| `.claude/nextjs.md`            | Next.js App Router specifics             |
| `.claude/tailwind-shadcn.md`   | Tailwind + shadcn/ui patterns            |
| `.claude/i18n.md`              | Internationalisation                     |
| `.claude/env-variables.md`     | Environment variable management          |
| `.claude/realtime.md`          | Real-time features (Supabase)            |
| `.claude/error-boundaries.md`  | Error boundary patterns                  |
| `.claude/monorepo.md`          | Monorepo conventions                     |
| `.claude/t3-stack.md`          | T3 stack specifics                       |
| `.claude/t4-stack.md`          | T4 stack specifics                       |
| `.claude/tanstack.md`          | TanStack Start/Router/Query              |
| `.claude/code-review.md`       | Code review checklist                    |
| `.claude/pre-landing-review.md`| Pre-merge review                         |
| `.claude/security-audit.md`    | Security audit methodology               |
| `.claude/frontend-design.md`   | Frontend design patterns                 |
| `.claude/bug-tracking.md`      | Bug tracking workflow                    |
