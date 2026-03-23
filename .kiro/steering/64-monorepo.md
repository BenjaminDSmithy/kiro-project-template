---
inclusion: fileMatch
fileMatchPattern:
  - "turbo.json"
  - "pnpm-workspace.yaml"
  - "**/packages/**/*"
  - "**/apps/**/*"
  - "**/tooling/**/*"
---

# Monorepo Standards

Patterns for Turborepo and pnpm workspace monorepos. Applies to T4 and monorepo T3 setups.

## Workspace Structure

```text
monorepo/
├── apps/                    # Deployable applications
│   ├── web/                 # Next.js web app
│   ├── mobile/              # Expo mobile app (T4)
│   └── docs/                # Documentation site
├── packages/                # Shared libraries
│   ├── ui/                  # Shared UI components
│   ├── api/                 # Shared API layer (tRPC routers)
│   ├── db/                  # Database schema + client
│   ├── config/              # Shared configs (TS, ESLint, Tailwind)
│   └── utils/               # Shared utilities
├── tooling/                 # Build tooling configs
├── turbo.json               # Turborepo pipeline config
└── pnpm-workspace.yaml      # Workspace definition
```

## pnpm Workspace Config

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

## Turborepo Pipeline

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

## Internal Package References

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/db": "workspace:*"
  }
}
```

## Rules

| Rule                                    | Rationale                                |
| --------------------------------------- | ---------------------------------------- |
| Shared code lives in `packages/`        | Single source of truth, no duplication   |
| Apps only import from `packages/`       | Clean dependency graph                   |
| No circular dependencies                | `packages/a` cannot import `packages/b` if b imports a |
| Use `workspace:*` for internal deps     | Always use latest local version          |
| Each package has its own `package.json` | Independent versioning and dependencies  |
| Each package has its own `tsconfig.json`| Independent compilation settings         |
| Use Turborepo for task orchestration    | Parallel builds with caching             |
| Cache build outputs                     | Faster CI and local rebuilds             |

## Anti-Patterns

| Avoid                                    | Instead                                  |
| ---------------------------------------- | ---------------------------------------- |
| Importing across apps directly           | Extract to a shared package              |
| Duplicating types across packages        | Single `@repo/types` package             |
| Running tasks without Turborepo          | Always use `turbo run build/test/lint`   |
| Hoisting all deps to root               | Keep deps in the package that uses them  |
| Shared `node_modules` assumptions        | Each package declares its own deps       |
