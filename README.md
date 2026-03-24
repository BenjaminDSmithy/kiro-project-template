# Kiro Project Template

An opinionated project template with comprehensive [Kiro](https://kiro.dev) AI agent configuration — 40 steering docs, 34 hooks, spec templates, and a CLI scaffolder with 13 built-in stack presets.

## Quick Start

```bash
# Scaffold a new project (interactive)
npx create-kiro-project

# Scaffold non-interactively
npx create-kiro-project --name my-app --stack T3 --pkg pnpm --yes

# Inject .kiro/ into an existing project
npx create-kiro-project --add

# Preview what would happen (no files written)
npx create-kiro-project --dry-run --name my-app --stack T3 --yes
```

Also available via `pnpm create kiro-project` and `bunx create-kiro-project`.

## What's Included

### Steering Docs (40 files)

AI guidance documents that keep Kiro aligned with your project conventions:

| Range | Category            | Inclusion        |
| ----- | ------------------- | ---------------- |
| 00–03 | Core rules          | Always           |
| 10–12 | Development         | Always/fileMatch |
| 20–21 | Workflow            | Always           |
| 30–31 | Kiro guides         | Manual           |
| 40–52 | Domain standards    | Always/fileMatch |
| 53–59 | Framework & tooling | fileMatch        |
| 60–65 | Stack & patterns    | fileMatch/Manual |
| 70–71 | Design & review     | fileMatch/Manual |

### Hooks (34 files)

Automated quality checks and agent behaviours triggered by IDE events:

| Range  | Category        | Trigger Type                  |
| ------ | --------------- | ----------------------------- |
| 01–09  | Quality gates   | fileEdited / agentStop        |
| 10–17e | Manual tasks    | userTriggered                 |
| 17–19  | Task lifecycle  | pre/postTaskExecution         |
| 20–22  | File automation | fileCreated/Deleted/agentStop |
| 23–30  | Sync & safety   | fileEdited/preToolUse/post\*  |
| 31–34  | Stack-specific  | fileEdited/Created/postTask   |

### Stack Presets

| Preset           | Key Technologies                           |
| ---------------- | ------------------------------------------ |
| T3               | Next.js + tRPC + Tailwind + TypeScript     |
| T4               | Expo + Next.js + Tamagui + tRPC + Solito   |
| Supabase+Next.js | Next.js + Supabase + Drizzle + Tailwind    |
| Vite+React       | React + Vite + Tailwind + React Router     |
| SvelteKit        | SvelteKit + Tailwind + Drizzle + Lucia     |
| Nuxt 3           | Nuxt + Vue + Tailwind + Drizzle            |
| Remix            | Remix + React + Tailwind + Drizzle         |
| Astro            | Astro + Tailwind + MDX                     |
| Flutter+Supabase | Flutter + Dart + Supabase + Riverpod       |
| Electron         | Electron + React + Vite + Tailwind         |
| Python FastAPI   | FastAPI + SQLAlchemy + PostgreSQL + pytest |
| TanStack Start   | TanStack Start + Router + Query + Tailwind |
| Custom           | No tech stack generation; keeps all docs   |

Teams can also define custom presets via a `stacks.json` file.

### Spec Templates

| Template            | Use Case                                               |
| ------------------- | ------------------------------------------------------ |
| `_TEMPLATE/`        | Standard feature specs (requirements → design → tasks) |
| `_BUGFIX_TEMPLATE/` | Bug fix specs (current/expected/unchanged behaviour)   |

Four example specs are included demonstrating the full spec lifecycle (planned → in progress → on hold → complete).

## Project Structure

```text
.kiro/                    # Kiro AI agent configuration
├── hooks/                # 34 automation hooks
├── settings/mcp.json     # MCP server configuration
├── specs/                # Feature specifications + templates
└── steering/             # 40 AI guidance documents
cli/                      # create-kiro-project CLI (published to npm)
├── src/                  # TypeScript source
├── templates/            # Bundled template files
└── scripts/              # Build, test, publish helpers
docs/                     # Documentation templates (scaffolded into new projects)
```

## Customisation

After scaffolding:

1. Search for `<!-- TODO:` across steering and doc files
2. Update `01-product.md` with your product context and domain terms
3. Update `02-tech.md` with your actual tech stack
4. Update `03-structure.md` with your directory layout
5. Review hooks and disable any that don't suit your workflow
6. Delete example specs when ready to create your own

See [`.kiro/README.md`](.kiro/README.md) for detailed configuration guidance.

## CLI Development

```bash
cd cli
pnpm install
pnpm build
pnpm test -- --run
```

See [`cli/README.md`](cli/README.md) for full CLI documentation including architecture, testing, and CI/CD details.

## Support

If you find this template useful, consider buying me a coffee:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/benjamindsmithy)

## Licence

This project is licensed under the [MIT Licence](cli/templates/root/LICENSE).

Copyright (c) 2026 Benjamin D. Smith
