<!-- Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved. -->
<!-- Licensed under the MIT License. See LICENSE file in the project root. -->

# Contributing Guide

| Field        | Value      |
| ------------ | ---------- |
| Type         | Guide      |
| Status       | Active     |
| Last Updated | 2026-03-23 |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/create-kiro-project.git

# Install dependencies
pnpm install

# Build the CLI (copies templates + bundles with tsup)
pnpm --filter create-kiro-project build

# Run the test suite
pnpm --filter create-kiro-project test -- --run
```

## Development Workflow

### Branch Strategy

| Branch   | Purpose               | Merges Into |
| -------- | --------------------- | ----------- |
| `main`   | Production-ready code | —           |
| `feat/*` | New features          | `main`      |
| `fix/*`  | Bug fixes             | `main`      |
| `docs/*` | Documentation changes | `main`      |

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

📝 Summary:
- What changed and why

📦 Files Modified:
- path/to/file.ts (minor updates)
```

| Type       | When                         |
| ---------- | ---------------------------- |
| `feat`     | New feature                  |
| `fix`      | Bug fix                      |
| `refactor` | Code change (no feature/fix) |
| `test`     | Adding or updating tests     |
| `docs`     | Documentation only           |
| `chore`    | Build, CI, tooling changes   |

Rules:

- Subject line <= 50 characters, imperative mood, lowercase, no trailing period
- Body lines <= 70 characters
- Reference task IDs when applicable: `feat(cli): add --only flag`

### Pull Request Process

1. Create a feature branch from `main`
2. Make changes with passing tests
3. Run quality checks (see below)
4. Open PR with description of changes
5. Address review feedback
6. Squash merge when approved

## Code Standards

### Quality Checks

Run before every commit:

```bash
# Lint and auto-fix
trunk check --fix <modified-files>

# Run tests (never use watch mode)
pnpm --filter create-kiro-project test -- --run
```

### TypeScript Rules

- No `any` — use proper types or `unknown`
- Prefer `type` over `interface` unless extending
- Always use trailing commas in multi-line structures
- Use path aliases where available

### File Naming

| Context  | Convention | Example                    |
| -------- | ---------- | -------------------------- |
| Source   | kebab-case | `dry-run.ts`               |
| Test     | co-located | `dry-run.test.ts`          |
| Property | co-located | `dry-run.property.test.ts` |
| Commands | kebab-case | `commands/init.ts`         |
| Scripts  | kebab-case | `scripts/build.sh`         |

### File Headers

All source files require a copyright header. See existing files for the format:

- TypeScript: `/* Copyright (c) 2026 ... */` block comment
- Bash: `# Copyright (c) 2026 ...` after the shebang line
- YAML: `# Copyright (c) 2026 ...` at the top

### Testing Requirements

The project has 156 tests across 22 test files. All tests must pass before merging.

| Category    | Files | Description                                                   |
| ----------- | ----- | ------------------------------------------------------------- |
| Unit        | 10    | Individual module behaviour (logger, config, validator, etc.) |
| Property    | 10    | Invariant verification via fast-check (100 runs each)         |
| Integration | 1     | Full scaffold/inject flows in temp directories                |
| E2E         | 1     | CLI subprocess tests against built `dist/index.js`            |

Property-based tests use [fast-check](https://github.com/dubzzz/fast-check) with `{ timeout: 30000 }` and `{ numRuns: 100 }`.

```bash
# Run all tests
pnpm --filter create-kiro-project test -- --run

# Run a specific test file
pnpm --filter create-kiro-project test -- --run src/config.test.ts
```

## Project Structure

```text
cli/
├── src/                  # TypeScript source
│   ├── index.ts          # CLI entry point — arg parsing, DI wiring, routing
│   ├── commands/
│   │   ├── init.ts       # Full project scaffold command
│   │   └── add.ts        # Inject .kiro/ into existing project
│   ├── config.ts         # Config file loader
│   ├── dry-run.ts        # Dry-run preview engine
│   ├── logger.ts         # Verbose logger (no-op when off)
│   ├── progress.ts       # Spinner + counter progress reporter
│   ├── prompts.ts        # Interactive prompts with flag-skip logic
│   ├── replacer.ts       # Placeholder token replacement engine
│   ├── stacks.ts         # 13 built-in + custom stack presets
│   ├── utils.ts          # File copy/remove helpers
│   └── validator.ts      # Template directory integrity checker
├── scripts/              # Automation scripts
├── templates/            # Bundled at build time (not in source control)
└── package.json
```

### Architecture Notes

- Dependency injection pattern: `index.ts` creates all dependencies and passes them via `CommandOptions`
- Commands never create their own dependencies — they receive them
- Verbose logger is a complete no-op when `--verbose` is off (zero overhead)
- Progress reporter degrades gracefully in non-TTY environments

## Kiro Integration

This project uses [Kiro](https://kiro.dev) for AI-assisted development.

### Specs

New features follow the spec workflow:

1. Create requirements in `.kiro/specs/<feature>/requirements.md`
2. Design the solution in `design.md`
3. Break into tasks in `tasks.md`
4. Implement task by task

### Steering Files

Project conventions are documented in `.kiro/steering/`. Update these when conventions change.

### Hooks

Agent hooks in `.kiro/hooks/` automate quality checks during development — linting, test running, migration safety, and more.

## Scripts Reference

| Script                      | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `scripts/build.sh`          | Build wrapper (copy templates + tsup bundle)         |
| `scripts/test.sh`           | Test runner wrapper                                  |
| `scripts/changelog.sh`      | Generate CHANGELOG entries from conventional commits |
| `scripts/prepublish.sh`     | 7-check safety gate before npm publish               |
| `scripts/copy-templates.sh` | Copy repo templates into `cli/templates/`            |
| `scripts/run-init.sh`       | Dev helper: run init command locally                 |
| `scripts/run-add.sh`        | Dev helper: run add command locally                  |

## Questions?

Open an issue on the repository for bugs, feature requests, or questions.

---

```text
Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
Licensed under the MIT License.
```
