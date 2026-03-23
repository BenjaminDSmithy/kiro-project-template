# {{PROJECT_NAME}}

<!-- TODO: Replace with your project description -->

A production-ready project template with comprehensive [Kiro](https://kiro.dev) AI agent configuration — steering docs, hooks, specs, and multi-stack support.

| Field        | Value      |
| ------------ | ---------- |
| Type         | Template   |
| Status       | Active     |
| Last Updated | 2026-03-20 |

---

## Quick Start

```bash
# 1. Clone the template
git clone <repo-url> my-project
cd my-project

# 2. Run the interactive setup wizard
chmod +x setup.sh
./setup.sh

# 3. Install dependencies (after setup picks your stack)
pnpm install

# 4. Start development
pnpm dev
```

The setup wizard replaces `{{PLACEHOLDER}}` tokens, pre-fills `docs/TECH-STACK.md` for your chosen stack, and optionally removes itself.

## What's Included

### Steering Docs (40 files)

AI guidance documents that keep Kiro aligned with your project conventions. Organised by category:

| Range | Category            | Files | Inclusion   |
| ----- | ------------------- | ----- | ----------- |
| 00–03 | Core rules          | 4     | Always      |
| 10–12 | Development         | 3     | Always/fileMatch |
| 20–21 | Workflow            | 2     | Always      |
| 30–31 | Kiro guides         | 2     | Manual      |
| 40–52 | Domain standards    | 13    | Always/fileMatch |
| 53–59 | Framework & tooling | 7     | fileMatch   |
| 60–62 | Stack presets       | 3     | fileMatch   |
| 63–65 | Advanced patterns   | 3     | Manual/fileMatch |
| 70–71 | Design & review     | 2     | fileMatch/Manual |

<details>
<summary>Full steering doc list</summary>

| File | Title | Inclusion |
| ---- | ----- | --------- |
| `00-core-rules.md` | Core rules and priorities | Always |
| `01-product.md` | Product overview and domain terms | Always |
| `02-tech.md` | Tech stack and approved integrations | Always |
| `03-structure.md` | Project structure and naming | Always |
| `10-dev-code-style.md` | Code style and quality gates | Always |
| `11-dev-error-handling.md` | Error handling patterns | fileMatch |
| `12-dev-testing.md` | Testing standards | fileMatch |
| `20-workflow-git.md` | Git workflow and commit format | Always |
| `21-workflow-task-completion.md` | Task completion standards | Always |
| `30-hooks-guide.md` | Hook authoring reference | Manual |
| `31-kiro-best-practices.md` | Kiro best practices | Manual |
| `40-security.md` | Security standards | Always |
| `41-docker.md` | Docker and containerisation | fileMatch |
| `42-react-components.md` | React component patterns | fileMatch |
| `43-mcp.md` | MCP server configuration | Always |
| `44-authorisation.md` | RBAC and RLS patterns | fileMatch |
| `45-api-standards.md` | API design standards | fileMatch |
| `46-logging.md` | Logging standards | fileMatch |
| `47-database.md` | Database conventions | fileMatch |
| `48-documentation.md` | Documentation standards | Always |
| `49-cicd.md` | CI/CD pipeline standards | fileMatch |
| `50-code-review.md` | Code review checklist | Manual |
| `50a-spec-creation.md` | Spec creation standards | fileMatch |
| `51-accessibility.md` | Accessibility standards | fileMatch |
| `52-bug-tracking.md` | Bug deferral workflow | Always |
| `53-nextjs.md` | Next.js App Router patterns | fileMatch |
| `54-state-management.md` | State management patterns | fileMatch |
| `55-tailwind-shadcn.md` | Tailwind + shadcn/ui patterns | fileMatch |
| `56-i18n.md` | Internationalisation | fileMatch |
| `57-performance.md` | Performance optimisation | fileMatch |
| `58-env-variables.md` | Environment variable management | fileMatch |
| `59-realtime.md` | Supabase Realtime patterns | fileMatch |
| `60-t3-stack.md` | T3 Stack conventions | fileMatch |
| `61-t4-stack.md` | T4 Stack conventions | fileMatch |
| `62-tanstack.md` | TanStack Start conventions | fileMatch |
| `63-stack-selection.md` | Stack selection decision tree | Manual |
| `64-monorepo.md` | Monorepo patterns | fileMatch |
| `65-error-boundaries.md` | Error boundary patterns | fileMatch |
| `70-frontend-design.md` | Frontend design standards | fileMatch |
| `71-agent-code-review.md` | Agent-driven code review | Manual |

</details>

### Hooks (34 files)

Automated quality checks and agent behaviours triggered by IDE events:

| Range | Category           | Trigger Type          | Count |
| ----- | ------------------ | --------------------- | ----- |
| 01–09 | Quality gates      | fileEdited / agentStop | 9    |
| 10–17e| Manual tasks       | userTriggered          | 12   |
| 17–19 | Task lifecycle     | pre/postTaskExecution  | 3    |
| 20–22 | File automation    | fileCreated/Deleted/agentStop | 3 |
| 23–26 | Sync & automation  | fileEdited/Created/postToolUse | 4 |
| 27–28 | Safety gates       | preToolUse             | 2    |
| 29–30 | Task quality       | pre/postTaskExecution  | 2    |
| 31–34 | Stack-specific     | fileEdited/Created/postTask | 4 |

### Stack Presets

Choose your stack during `./setup.sh` — the relevant steering docs activate automatically:

| Stack       | Steering Doc    | Key Technologies                         |
| ----------- | --------------- | ---------------------------------------- |
| Default     | `53-nextjs.md`  | Next.js + Supabase + Drizzle + Tailwind  |
| T3          | `60-t3-stack.md`| Next.js + tRPC + Tailwind + TypeScript   |
| T4          | `61-t4-stack.md`| Expo + Next.js + Tamagui + tRPC + Solito |
| TanStack/T5 | `62-tanstack.md`| TanStack Start + Router + Query + Vite   |

### Example Specs

Four example specs demonstrating the spec lifecycle:

| Spec | Status | Purpose |
| ---- | ------ | ------- |
| `✅_00_sample-auth-setup` | Complete | Shows a fully implemented spec with all tasks checked |
| `📋_01_sample-user-notifications` | Planned | Shows a planned spec with requirements and tasks |
| `🚧_02_sample-dashboard` | In Progress | Shows partial task completion |
| `⏸️_03_sample-payments` | On Hold | Shows a spec blocked by dependencies |

### Spec Templates

| Template | Use Case |
| -------- | -------- |
| `_TEMPLATE/` | Standard feature specs (requirements → design → tasks) |
| `_BUGFIX_TEMPLATE/` | Bug fix specs (current/expected/unchanged behaviour) |

## Project Structure

```text
.kiro/                    # Kiro AI agent configuration
├── hooks/                # 34 automation hooks
├── settings/mcp.json     # MCP server configuration
├── specs/                # Feature specifications + templates
└── steering/             # 40 AI guidance documents
docs/                     # Project documentation templates
├── ADR/                  # Architecture Decision Records
├── API.md                # API reference
├── ARCHITECTURE.md       # System architecture
├── CONTRIBUTING.md       # Contribution guidelines
├── DEPLOYMENT.md         # Deployment procedures
├── README.md             # Documentation index
└── TECH-STACK.md         # Technology choices
setup.sh                  # Interactive setup wizard
```

## Customisation

After running `setup.sh`:

1. Search for `<!-- TODO:` across all steering and doc files
2. Update `01-product.md` with your product context and domain terms
3. Update `02-tech.md` with your actual tech stack
4. Update `03-structure.md` with your directory layout
5. Review hooks and disable any that don't suit your workflow
6. Delete example specs when you're ready to create your own

### Topics Not Yet Covered

The following advanced topics do not have dedicated steering docs. Create your own in `.kiro/steering/` as needed:

- Caching strategies (Redis, CDN, ISR)
- File upload handling (S3, Supabase Storage)
- Background jobs and queues
- Email / transactional notifications
- Database seeding and fixtures
- Rate limiting and throttling
- WebSocket patterns (beyond Supabase Realtime)

See [`.kiro/README.md`](.kiro/README.md) for detailed configuration guidance.

## Documentation

| Document | Purpose |
| -------- | ------- |
| [docs/TECH-STACK.md](docs/TECH-STACK.md) | Technology choices and versions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Contribution guidelines |
| [docs/API.md](docs/API.md) | API reference |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment procedures |

## Licence

This project is licensed under the [MIT License](LICENSE).

---

```
Copyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}. All rights reserved.
```
