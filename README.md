# Kiro Project Template

An opinionated project template with comprehensive [Kiro](https://kiro.dev) AI agent configuration, a portable `AGENTS.md` base layer, Codex project config, and a CLI scaffolder with 13 built-in stack presets.

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

### Portable Agent Base

- `AGENTS.md` for shared cross-tool instructions
- `.codex/` for project-scoped Codex agents and safety rules

### Steering Docs (47 files)

AI guidance documents that keep Kiro aligned with your project conventions:

| Range | Category                    | Inclusion        |
| ----- | --------------------------- | ---------------- |
| 00–03 | Core rules                  | Always           |
| 10–12 | Development                 | Always/fileMatch |
| 20–21 | Workflow                    | Always           |
| 30–35 | Planning & workflow guides  | Manual           |
| 40–52 | Domain standards            | Always/fileMatch |
| 53–65 | Framework, stack & patterns | fileMatch/Manual |
| 70–74 | Design, review & audit      | fileMatch/Manual |

Notable manual workflows now included: feature planning, QA methodology, investigation, safety guardrails, pre-landing review, documentation sync, and security audit.

### Hooks (48 files)

Automated quality checks and agent behaviours triggered by IDE events:

| Range  | Category        | Trigger Type                  |
| ------ | --------------- | ----------------------------- |
| 01–09  | Quality gates   | fileEdited / agentStop        |
| 10–17l | Manual tasks    | userTriggered                 |
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
.codex/                   # Codex project config (agents, rules, limits)
.kiro/                    # Kiro AI agent configuration
├── hooks/                # 48 automation hooks
├── settings/mcp.json     # MCP server configuration
├── specs/                # Feature specifications + templates
└── steering/             # 47 AI guidance documents
AGENTS.md                 # Portable cross-tool agent instructions
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

## Setup Script

The `setup.sh` script is an interactive wizard that configures the template for your project. It walks through five steps:

1. **Project Identity** — project name, copyright holder, and year
2. **Tech Stack** — choose from 13 presets (or Custom)
3. **Package Manager** — npm, pnpm, yarn, bun, or N/A
3b. **Stack Scaffolder** — optionally run the official `create-*` scaffolder for your chosen stack
4. **Steering Cleanup** — remove steering docs for stacks you didn't choose
5. **Example Specs** — remove the 4 example specs or keep them for reference

### Usage

```bash
# Interactive (default)
./setup.sh

# Preview what would happen without modifying any files
./setup.sh --dry-run

# Non-interactive (CI / automation)
PROJECT_NAME="My App" COPYRIGHT_HOLDER="Acme Inc" YEAR="2026" \
  STACK_CHOICE=1 PKG_CHOICE=2 SCAFFOLD_CHOICE=2 \
  ./setup.sh --headless
```

### Flags

| Flag         | Description                                              |
| ------------ | -------------------------------------------------------- |
| `--headless` | Skip interactive prompts; requires env vars to be set    |
| `--dry-run`  | Show what would happen without modifying files or running commands |

### Headless Environment Variables

All prompts can be pre-set via environment variables. If a variable is set, the corresponding prompt is skipped.

| Variable             | Default        | Description                                      |
| -------------------- | -------------- | ------------------------------------------------ |
| `PROJECT_NAME`       | Folder name    | Project name                                     |
| `COPYRIGHT_HOLDER`   | _(required)_   | Copyright holder (company or person)             |
| `YEAR`               | Current year   | Copyright year (`YYYY` or `YYYY-YYYY`)           |
| `STACK_CHOICE`       | `13`           | Stack preset (1–13)                              |
| `PKG_CHOICE`         | `2`            | Package manager (1=npm, 2=pnpm, 3=yarn, 4=bun, 5=N/A) |
| `DLX_CHOICE`         | `1`            | Runner preference (1=npx everywhere, 2=pkg manager equivalent) |
| `SCAFFOLD_CHOICE`    | `1`            | Run scaffolder (1=yes, 2=skip)                   |
| `SCAFFOLD_DIR_CHOICE`| `2`            | Scaffold location (1=current dir, 2=new subdirectory) |
| `CLEANUP_CHOICE`     | `2`            | Remove other stack steering docs (1=yes, 2=no)   |
| `EXAMPLES_CHOICE`    | `2`            | Remove example specs (1=yes, 2=no)               |
| `REMOVE_SELF`        | `y`            | Delete setup.sh after completion (y/n)           |

### Stack Scaffolders

When a stack preset is selected (other than Custom or Python FastAPI), the script offers to run the official scaffolder. It shows the exact command and its source URL before asking for confirmation.

| Preset           | Scaffolder Command                          | Source                          |
| ---------------- | ------------------------------------------- | ------------------------------- |
| T3               | `{pkg} create t3-app@latest`                | create.t3.gg                    |
| T4               | `bun create t4-app@latest`                  | t4stack.com                     |
| Supabase+Next.js | `{pkg} create next-app@latest`              | nextjs.org                      |
| Vite+React       | `{pkg} create vite@latest --template react-ts` | vite.dev                     |
| SvelteKit        | `{dlx} sv create`                           | svelte.dev                      |
| Nuxt 3           | `{dlx} nuxi@latest init`                    | nuxt.com                        |
| Remix            | `{dlx} create-remix@latest`                 | remix.run                       |
| Astro            | `{pkg} create astro@latest`                 | astro.build                     |
| Flutter+Supabase | `flutter create`                            | flutter.dev                     |
| Electron         | `{dlx} create-electron-app@latest`          | electronforge.io                |
| Python FastAPI   | _(no official scaffolder)_                  | —                               |
| TanStack Start   | `{dlx} @tanstack/create-router@latest`      | tanstack.com                    |
| Custom           | _(no scaffolding)_                          | —                               |

`{pkg}` = your package manager's `create` command (e.g. `pnpm create`). `{dlx}` = your chosen runner (`npx`, `pnpm dlx`, `yarn dlx`, or `bunx`).

Non-npm users are asked whether to use `npx` everywhere (default) or their package manager's native equivalent (`pnpm dlx`, `yarn dlx`, `bunx`).

## Tasks

The workspace includes pre-configured tasks accessible via the command palette (`Tasks: Run Task`) or the Run and Debug panel. Each task delegates to a shell script in `cli/scripts/`.

| Task                       | Script                      | Description                                                                                                                                                                                                                     |
| -------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🚀 Run Setup Script        | `setup.sh`                  | Interactive setup wizard — replaces `{{PLACEHOLDER}}` tokens with your project name, copyright holder, and year. Optionally runs the official stack scaffolder, pre-fills `TECH-STACK.md` based on your chosen stack preset, and cleans up irrelevant steering docs. Supports `--dry-run` to preview changes without modifying files and `--headless` for non-interactive CI usage. |
| 🔨 CLI: Build              | `cli/scripts/build.sh`      | Copies templates from the repo root into `cli/templates/`, then bundles the CLI with tsup.                                                                                                                                      |
| 🧪 CLI: Test               | `cli/scripts/test.sh`       | Runs the full Vitest test suite in single-run mode (`--run`).                                                                                                                                                                   |
| ▶️ CLI: Init (interactive) | `cli/scripts/run-init.sh`   | Builds if needed, then runs the CLI in init mode — scaffolds a new project interactively.                                                                                                                                       |
| ▶️ CLI: Add (interactive)  | `cli/scripts/run-add.sh`    | Builds if needed, then runs the CLI with `--add` — injects `.kiro/` configuration into an existing project.                                                                                                                     |
| 📋 CLI: Changelog          | `cli/scripts/changelog.sh`  | Generates `CHANGELOG.md` entries from conventional commits between git tags.                                                                                                                                                    |
| ✅ CLI: Pre-publish Checks | `cli/scripts/prepublish.sh` | Safety checks before `npm publish` — verifies clean working tree, passing tests, successful build, version bump, changelog entry, and template presence.                                                                        |

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

This project is licensed under the [MIT Licence](LICENSE).

Copyright (c) 2026 Binary Sword Pty Ltd
