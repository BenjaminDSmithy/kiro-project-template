# Environment Variable Standards

Naming, validation, and management of environment variables.

## Naming Convention

| Prefix         | Exposed to browser | Example                     |
| -------------- | ------------------ | --------------------------- |
| `NEXT_PUBLIC_` | Yes                | `NEXT_PUBLIC_SUPABASE_URL`  |
| No prefix      | No (server only)   | `SUPABASE_SERVICE_ROLE_KEY` |

| Rule                                     | Rationale                                |
| ---------------------------------------- | ---------------------------------------- |
| Never prefix secrets with `NEXT_PUBLIC_` | Client-exposed vars are visible to users |
| Use SCREAMING_SNAKE_CASE                 | Standard convention for env vars         |
| Group by service                         | `SUPABASE_*`, `STRIPE_*`, `SMTP_*`       |

## File Hierarchy

| File               | Purpose                    | Committed |
| ------------------ | -------------------------- | --------- |
| `.env.example`     | Template with placeholders | Yes       |
| `.env`             | Local development secrets  | No        |
| `.env.development` | Dev defaults (non-secret)  | Yes       |
| `.env.production`  | Prod defaults (non-secret) | Yes       |
| `.env.test`        | Test environment overrides | Yes       |

## Startup Validation

Validate all required env vars at application startup using Zod:

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

## `.env.example` as Source of Truth

Every env var used in the codebase must appear in `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=CHANGE_ME
NEXT_PUBLIC_SUPABASE_ANON_KEY=CHANGE_ME
SUPABASE_SERVICE_ROLE_KEY=CHANGE_ME

# App
NODE_ENV=development
```

## Rules

| Rule                                  | Rationale                               |
| ------------------------------------- | --------------------------------------- |
| `.env.example` is the source of truth | New devs know exactly what's needed     |
| Validate at startup, not at usage     | Fail fast with clear error messages     |
| Never commit `.env`                   | Contains real secrets                   |
| Use `CHANGE_ME` as placeholder value  | Obvious that it needs replacing         |
| Document each var with a comment      | Purpose is clear without searching code |
