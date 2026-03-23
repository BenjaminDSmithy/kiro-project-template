# Kiro Project Template — `.kiro/` Directory

This directory contains the AI agent configuration for [Kiro](https://kiro.dev).

## Structure

```text
.kiro/
├── hooks/                    # Agent automation hooks (34 hooks)
│   ├── 01–09                 # File-triggered quality checks
│   ├── 10–17e                # User-triggered manual tasks
│   ├── 17–19                 # Spec task lifecycle hooks
│   ├── 20–22                 # File create/delete/stop automation
│   ├── 23–26                 # Sync and automation hooks
│   ├── 27–28                 # Safety gate hooks (preToolUse)
│   ├── 29–30                 # Task quality hooks (pre/postTaskExecution)
│   └── 31–34                 # Stack-specific hooks
├── settings/
│   └── mcp.json              # MCP server configuration
├── specs/                    # Feature specifications
│   ├── _TEMPLATE/            # Standard spec template (requirements, design, tasks)
│   ├── _BUGFIX_TEMPLATE/     # Bugfix spec template (bugfix.md + bugs.md)
│   ├── ✅_00_sample-auth-setup/    # Example: complete spec
│   ├── 📋_01_sample-user-notifications/  # Example: planned spec
│   ├── 🚧_02_sample-dashboard/     # Example: in-progress spec
│   └── ⏸️_03_sample-payments/      # Example: on-hold spec (blocked)
└── steering/                 # AI guidance documents (40 files)
    ├── 00–03                 # Core rules, product, tech, structure
    ├── 10–12                 # Development standards (code, errors, testing)
    ├── 20–21                 # Workflow standards (git, task completion)
    ├── 30–31                 # Reference guides (hooks, kiro best practices)
    ├── 40–52                 # Domain standards (security, API, DB, docs, etc.)
    ├── 53–59                 # Framework and tooling (Next.js, Tailwind, i18n, etc.)
    ├── 60–62                 # Stack presets (T3, T4, TanStack)
    └── 63–65                 # Advanced patterns (stack selection, monorepo, errors)
```

## Getting Started

1. Copy this `.kiro/` directory into your project root
2. Search for `<!-- TODO:` in steering files and customise for your project
3. Update `settings/mcp.json` with your MCP server credentials
4. Review hooks and disable any that don't suit your workflow
5. Delete example specs and create your first: copy `specs/_TEMPLATE/` to `specs/📋_01_your-feature/`

## Steering File Numbering

| Range | Category                                                           | Inclusion        |
| ----- | ------------------------------------------------------------------ | ---------------- |
| 00–03 | Core (rules, product, tech, structure)                             | Always           |
| 10–12 | Development (code style, errors, testing)                          | Always/fileMatch |
| 20–21 | Workflow (git, task completion)                                    | Always           |
| 30–31 | Reference guides (hooks, best practices)                           | Manual           |
| 40–52 | Domain (security, auth, API, DB, docs, CI)                         | Always/fileMatch |
| 53–59 | Framework & tooling (Next.js, Tailwind, i18n, perf, env, realtime) | fileMatch        |
| 60–62 | Stack presets (T3, T4, TanStack)                                   | fileMatch        |
| 63    | Stack selection decision tree                                      | Manual           |
| 64–65 | Advanced patterns (monorepo, error boundaries)                     | fileMatch        |
| 70–71 | Design & review (frontend design, agent review)                    | fileMatch/Manual |

## Hook Numbering

| Range  | Category          | Trigger                                          |
| ------ | ----------------- | ------------------------------------------------ |
| 01–09  | Quality gates     | fileEdited / agentStop                           |
| 10–17e | Manual tasks      | userTriggered                                    |
| 17–19  | Task lifecycle    | pre/postTaskExecution                            |
| 20–22  | File automation   | fileCreated / fileDeleted / agentStop            |
| 23–26  | Sync & automation | fileEdited / fileCreated / postToolUse           |
| 27–28  | Safety gates      | preToolUse (migration safety, context injection) |
| 29–30  | Task quality      | preTaskExecution / postTaskExecution             |
| 31–34  | Stack-specific    | fileEdited / fileCreated / postTaskExecution     |

> **Note:** Hooks `01` and `22` both use `agentStop` — `01` runs quality checks on code changes while `22` provides a brief summary. Both fire on every agent stop; this is intentional.

## Spec Lifecycle

Specs follow a folder naming convention with emoji status prefixes:

| Prefix | Status      | Meaning                           |
| ------ | ----------- | --------------------------------- |
| `📋_`  | Planned     | Spec complete, implementation TBD |
| `🚧_`  | In Progress | Active development                |
| `⏸️_`  | On Hold     | Paused, awaiting dependencies     |
| `✅_`  | Complete    | Fully implemented                 |

Each spec folder contains:

| File              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `.config.kiro`    | Spec type and workflow configuration             |
| `requirements.md` | User stories with EARS acceptance criteria       |
| `design.md`       | Architecture, interfaces, correctness properties |
| `tasks.md`        | Implementation checklist with effort estimates   |

### `.config.kiro` Reference

Each spec folder contains a `.config.kiro` JSON file with the following fields:

| Field          | Required | Valid Values                                        |
| -------------- | -------- | --------------------------------------------------- |
| `specId`       | Yes      | UUID v4 — unique identifier for the spec            |
| `workflowType` | Yes      | `requirements-first` — the standard spec workflow   |
| `specType`     | Yes      | `feature` (standard spec) or `bugfix` (bugfix spec) |

Example for a feature spec:

```json
{
  "specId": "a1b2c3d4-...",
  "workflowType": "requirements-first",
  "specType": "feature"
}
```

Example for a bugfix spec:

```json
{
  "specId": "e5f6g7h8-...",
  "workflowType": "requirements-first",
  "specType": "bugfix"
}
```

## Example Specs

| Spec                              | Demonstrates                                             |
| --------------------------------- | -------------------------------------------------------- |
| `✅_00_sample-auth-setup`         | Complete spec — all tasks checked, progress table filled |
| `📋_01_sample-user-notifications` | Planned spec — requirements and tasks, not yet started   |
| `🚧_02_sample-dashboard`          | In-progress spec — Phase 1 done, Phase 2 partial         |
| `⏸️_03_sample-payments`           | On-hold spec — blocked by dashboard dependency           |

## Stack Presets

| Stack       | Steering Doc     | Key Technologies                         |
| ----------- | ---------------- | ---------------------------------------- |
| Default     | `53-nextjs.md`   | Next.js + Supabase + Drizzle + Tailwind  |
| T3          | `60-t3-stack.md` | Next.js + tRPC + Tailwind + TypeScript   |
| T4          | `61-t4-stack.md` | Expo + Next.js + Tamagui + tRPC + Solito |
| TanStack/T5 | `62-tanstack.md` | TanStack Start + Router + Query + Vite   |

Use `#stack-selection` in chat to reference the stack selection decision tree (`63-stack-selection.md`).

## Customisation Checklist

After copying this template into your project:

- [ ] Run `./setup.sh` to replace placeholder tokens and select your stack
- [ ] Search for `<!-- TODO:` in all steering files and fill in project-specific values
- [ ] Update `01-product.md` with your product context, glossary, and domain terms
- [ ] Update `02-tech.md` with your actual tech stack and approved integrations
- [ ] Update `03-structure.md` with your directory layout and naming conventions
- [ ] Update `settings/mcp.json` with your MCP server credentials and preferences
- [ ] Review each hook and disable any that don't match your workflow
- [ ] Adjust commit message scopes in `19-commit-on-task-done.kiro.hook`
- [ ] Decide which steering files should be `always` vs `manual` vs `fileMatch`
- [ ] Delete example specs (`✅_00_sample-*`, `📋_01_sample-*`, `🚧_02_sample-*`, `⏸️_03_sample-*`) when ready
- [ ] Create your first spec: copy `_TEMPLATE/` to `📋_01_your-feature/`
