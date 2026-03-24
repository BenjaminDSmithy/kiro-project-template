# create-kiro-project

A cross-platform TypeScript CLI that scaffolds new projects from the Kiro project template or injects Kiro configuration (`.kiro/`) into existing projects.

| Field        | Value                                                  |
| ------------ | ------------------------------------------------------ |
| Package      | `create-kiro-project`                                  |
| Version      | 0.1.0                                                  |
| Node         | >= 18                                                  |
| Dependencies | `prompts`, `picocolors` (runtime); zero native modules |
| Licence      | MIT                                                    |

## Quick Start

```bash
# Scaffold a new project (interactive)
npx create-kiro-project

# Scaffold non-interactively
npx create-kiro-project --name my-app --stack T3 --pkg pnpm --copyright "Acme Corp" --yes

# Inject .kiro/ into an existing project
npx create-kiro-project --add

# Inject only hooks
npx create-kiro-project --add --only hooks

# Preview what would happen (no files written)
npx create-kiro-project --dry-run --name my-app --stack T3 --yes
```

## Installation

```bash
# Use directly via npx / pnpm create / bunx (recommended)
npx create-kiro-project
pnpm create kiro-project
bunx create-kiro-project

# Or install globally
npm install -g create-kiro-project
```

## Commands and Modes

### Init Mode (default)

Creates a new project directory with all template files, replaces placeholders, generates `docs/TECH-STACK.md` for the selected stack preset, and optionally cleans up irrelevant steering docs and example specs.

```bash
npx create-kiro-project [options]
```

### Add Mode (`--add`)

Injects `.kiro/` configuration into the current working directory without touching existing files. Useful for adopting Kiro in an existing codebase.

```bash
npx create-kiro-project --add [options]
```

## CLI Flags

| Flag                | Description                                                         | Default          |
| ------------------- | ------------------------------------------------------------------- | ---------------- |
| `--name <name>`     | Project name                                                        | Current dir name |
| `--copyright <who>` | Copyright holder                                                    | (empty)          |
| `--year <year>`     | Copyright year                                                      | Current year     |
| `--stack <preset>`  | Stack preset (see list below)                                       | Custom           |
| `--pkg <manager>`   | Package manager: `npm`, `pnpm`, `yarn`, `bun`                       | npm              |
| `--yes`, `-y`       | Accept all defaults without prompting                               | false            |
| `--add`             | Inject `.kiro/` into current directory instead of scaffold          | false            |
| `--only <subset>`   | With `--add`: copy only `steering`, `hooks`, `specs`, or `settings` | all              |
| `--dry-run`         | Preview operations without writing to disk                          | false            |
| `--verbose`         | Enable detailed per-file logging to stderr                          | false            |
| `--config <path>`   | Path to `.create-kiro-project.json` config file                     | Auto-discovery   |
| `--help`            | Show help message                                                   |                  |
| `--version`         | Show version number                                                 |                  |

## Stack Presets

The CLI ships with 13 built-in stack presets. Each preset configures `docs/TECH-STACK.md` content, approved integrations, and which steering docs to retain during cleanup.

| Index | Preset           | Key Technologies                                  |
| ----- | ---------------- | ------------------------------------------------- |
| 0     | T3               | Next.js + tRPC + Tailwind + TypeScript            |
| 1     | T4               | Expo + Next.js + Tamagui + tRPC + Solito          |
| 2     | Supabase+Next.js | Next.js + Supabase + Drizzle + Tailwind           |
| 3     | Vite+React       | React + Vite + Tailwind + React Router            |
| 4     | SvelteKit        | SvelteKit + Tailwind + Drizzle + Lucia            |
| 5     | Nuxt 3           | Nuxt + Vue + Tailwind + Drizzle                   |
| 6     | Remix            | Remix + React + Tailwind + Drizzle                |
| 7     | Astro            | Astro + Tailwind + MDX                            |
| 8     | Flutter+Supabase | Flutter + Dart + Supabase + Riverpod              |
| 9     | Electron         | Electron + React + Vite + Tailwind                |
| 10    | Python FastAPI   | FastAPI + SQLAlchemy + PostgreSQL + pytest        |
| 11    | TanStack Start   | TanStack Start + Router + Query + Tailwind        |
| 12    | Custom           | No tech stack generation; keeps all steering docs |

Teams can also define custom stack presets via a `stacks.json` file (see Configuration File below).

## Configuration File

Create a `.create-kiro-project.json` file in your project root (or any ancestor directory) to share default settings across your team.

```json
{
  "copyrightHolder": "Acme Corp",
  "stack": "T3",
  "pkgManager": "pnpm",
  "customStacks": "./stacks.json"
}
```

### Accepted Fields

| Field             | Type   | Description                                         |
| ----------------- | ------ | --------------------------------------------------- |
| `copyrightHolder` | string | Default copyright holder for `{{COPYRIGHT_HOLDER}}` |
| `stack`           | string | Default stack preset name                           |
| `pkgManager`      | string | `npm`, `pnpm`, `yarn`, or `bun`                     |
| `customStacks`    | string | Relative path to a `stacks.json` file               |

### Resolution Order

The CLI searches for `.create-kiro-project.json` by walking up from the current working directory to the filesystem root. Use `--config <path>` to specify an explicit path instead.

### Configuration Precedence

Values are resolved in this order (highest wins):

1. CLI flags (`--stack T3 --pkg pnpm`)
2. Interactive prompt responses
3. Config file defaults (`.create-kiro-project.json`)
4. Hardcoded defaults (`Custom` stack, `npm` package manager)

When `--yes` is set, interactive prompts are skipped entirely, so the order becomes: CLI flags > config file > hardcoded defaults.

## Custom Stack Presets

Define additional stack presets in a `stacks.json` file referenced from your config:

```json
[
  {
    "name": "MyCustomStack",
    "rows": ["| Framework | Custom Framework | 1.0 | Custom constraint |"],
    "approved": "Custom Framework, React, Tailwind CSS",
    "keepSteering": ["00-core-rules.md", "02-tech.md", "10-dev-code-style.md"]
  }
]
```

Each entry requires:

| Field          | Type     | Description                                     |
| -------------- | -------- | ----------------------------------------------- |
| `name`         | string   | Display name (must be non-empty)                |
| `rows`         | string[] | Markdown table rows for `TECH-STACK.md`         |
| `approved`     | string   | Comma-separated approved integrations           |
| `keepSteering` | string[] | Steering doc filenames to retain during cleanup |

Custom presets are assigned indices starting from 13 (after the 0-12 built-in presets) and never overwrite built-in entries.

## Dry-Run Mode

Preview what the CLI would do without writing any files:

```bash
npx create-kiro-project --dry-run --name my-app --stack T3 --yes
```

Output shows counts per category:

```text
Dry-run preview:

  Directories:  12 would be created
  Files:        47 would be copied
  Replacements: 15 would have placeholders replaced
  Removals:     8 would be removed

  Total operations: 82
```

Dry-run mode works with both `init` and `add` commands, including `--only` subset filtering.

## Verbose Logging

Enable detailed per-file operation logging with `--verbose`:

```bash
npx create-kiro-project --verbose --name my-app --stack T3 --yes
```

Verbose output goes to stderr (stdout remains clean for piping) and includes:

- Timestamped file operations (copy, replace, remove, skip)
- Config file resolution path
- Steering doc and example spec removal details
- Custom stack preset loading

When `--verbose` is off, the logger is a complete no-op with zero overhead.

## Progress Reporting

The CLI provides visual feedback during file operations:

- TTY environments: animated spinner with colour-coded status
- Non-TTY environments (CI): plain newline-terminated lines
- Summary line after completion showing counts (copied, replaced, removed)
- Clean SIGINT handling: stops spinner, restores cursor, exits gracefully

All progress output goes to stderr.

## Placeholder Replacement

The CLI replaces these tokens in all text files:

| Token                  | Replaced With                    |
| ---------------------- | -------------------------------- |
| `{{PROJECT_NAME}}`     | Project name from prompt or flag |
| `{{COPYRIGHT_HOLDER}}` | Copyright holder                 |
| `{{YEAR}}`             | Copyright year                   |

Binary files are automatically detected and skipped. Special characters in values (`&`, `\`, `/`, `$`) are handled safely via `split().join()` replacement.

## Template Validation

Before any file operations, the CLI validates that the bundled templates directory is intact. If `kiro/`, `docs/`, or `root/` subdirectories are missing, it throws a clear error suggesting reinstallation:

```text
Template directory not found at /path/to/templates/kiro.
The package may be corrupted — try reinstalling with npm install -g create-kiro-project.
```

This runs even in `--dry-run` mode.

## Architecture

```text
src/
├── index.ts              # CLI entry point — arg parsing, DI wiring, routing
├── commands/
│   ├── init.ts           # Full project scaffold command
│   └── add.ts            # Inject .kiro/ into existing project
├── config.ts             # Config file loader (.create-kiro-project.json)
├── dry-run.ts            # Dry-run preview engine (zero side effects)
├── logger.ts             # Verbose logger (no-op when --verbose is off)
├── progress.ts           # Spinner + counter progress reporter
├── prompts.ts            # Interactive prompts with flag-skip logic
├── replacer.ts           # Placeholder token replacement engine
├── stacks.ts             # 13 built-in + custom stack preset definitions
├── utils.ts              # File copy/remove helpers, coloured logging
└── validator.ts          # Template directory integrity checker

scripts/
├── build.sh              # Build wrapper
├── changelog.sh          # AI-powered release notes generator (Claude / ChatGPT)
├── copy-templates.sh     # Copies repo templates into cli/templates/ at build time
├── prepublish.sh         # 7-check safety gate before npm publish
├── release.sh            # Gitflow release orchestrator
├── run-add.sh            # Dev helper: run add command
├── run-init.sh           # Dev helper: run init command
└── test.sh               # Test runner wrapper

templates/                # Bundled at build time (not in source control)
├── kiro/                 # .kiro/ hooks, settings, specs, steering
├── docs/                 # Documentation templates
└── root/                 # Root project files (README, LICENSE, etc.)
```

### Dependency Injection

`index.ts` creates all dependencies (`VerboseLogger`, `ProgressReporter`, config defaults) based on parsed flags and passes them to `init()` / `add()` via a `CommandOptions` object. Commands never create their own dependencies — they receive them.

```typescript
type CommandOptions = {
  logger: VerboseLogger;
  progress: ProgressReporter;
  configDefaults: ProjectConfigFile;
};
```

### Data Flow

```text
process.argv → parseArgs() → CliFlags
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              loadConfig()  createLogger()  createProgress()
                    │           │           │
                    └───────────┼───────────┘
                                ▼
                         CommandOptions
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
              init(flags, opts)      add(flags, opts)
                    │                       │
                    ▼                       ▼
              gatherConfig(flags)    gatherConfig(flags)
                    │                       │
                    ▼                       ▼
              copyDir + replacePlaceholders + cleanup
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) with two jobs:

### build-and-test

Runs on every push and pull request to `main`:

1. Checkout + pnpm setup + Node.js 18 with dependency caching
2. `pnpm install --frozen-lockfile` for reproducible installs
3. `pnpm --filter create-kiro-project build`
4. `pnpm --filter create-kiro-project test -- --run`

### publish

Runs only on GitHub release events (after build-and-test passes):

1. Same setup as build-and-test
2. `npm publish --access public` with `NPM_TOKEN` secret

## Scripts

### `scripts/release.sh`

Gitflow release orchestrator. Walks you through a full release cycle interactively:

1. Prompts for release type (major / minor / patch) and bumps `package.json` version
2. Creates a `release/X.Y.Z` branch from `develop`
3. Runs the full test suite and build
4. Generates AI-powered changelog via `changelog.sh`
5. Pauses for you to review, edit, and commit
6. Verifies clean working tree, merges into `main`, tags `vX.Y.Z`
7. Merges `main` back into `develop`
8. Optionally deletes the release branch

```bash
bash scripts/release.sh
```

Prerequisites: clean working tree on `develop`, plus `jq`/`curl` and an AI API key for changelog generation.

### `scripts/changelog.sh`

AI-powered release notes generator. Gathers commits between git tags, sends them to Claude or ChatGPT, and produces user-facing release notes with a friendly summary paragraph followed by a technical breakdown (Added, Changed, Fixed, etc.).

```bash
# Auto-detect tag range, write to CHANGELOG.md
bash scripts/changelog.sh

# Preview without writing
bash scripts/changelog.sh --dry-run

# Specify range explicitly
bash scripts/changelog.sh v0.1.0 v0.2.0

# Override AI model
bash scripts/changelog.sh --model claude-sonnet-4-20250514
```

Provider auto-detection: uses Claude if `ANTHROPIC_API_KEY` is set in `.env`, otherwise falls back to OpenAI if `OPENAI_API_KEY` is set. Requires `jq` and `curl`.

### `scripts/prepublish.sh`

Seven safety checks that must all pass before publishing to npm:

1. Clean git working tree (no uncommitted changes)
2. Full test suite passes
3. Build succeeds
4. `dist/` directory is populated
5. `package.json` version differs from latest npm version
6. `CHANGELOG.md` mentions the current version
7. `templates/kiro`, `templates/docs`, and `templates/vscode` directories exist

```bash
bash scripts/prepublish.sh
```

Exits with code 1 on first failure with a descriptive message. Exits with code 0 when all checks pass.

### `scripts/copy-templates.sh`

Copies template files from the repository root into `cli/templates/` at build time. Runs automatically as the `prebuild` script.

## Testing

The project has 156 tests across 22 test files:

```bash
# Run all tests
pnpm test -- --run

# Run a specific test file
pnpm test -- --run src/config.test.ts
```

### Test Categories

| Category    | Files | Description                                                   |
| ----------- | ----- | ------------------------------------------------------------- |
| Unit        | 10    | Individual module behaviour (logger, config, validator, etc.) |
| Property    | 10    | Invariant verification via fast-check (100 runs each)         |
| Integration | 1     | Full scaffold/inject flows in temp directories                |
| E2E         | 1     | CLI subprocess tests against built `dist/index.js`            |

### Property Tests

Property-based tests use [fast-check](https://github.com/dubzzz/fast-check) to verify correctness invariants:

| Property                          | Validates                                       |
| --------------------------------- | ----------------------------------------------- |
| Config File Idempotency           | Same dir always returns same config             |
| Config File Walk-Up Termination   | Always terminates, even from deeply nested dirs |
| Dry-Run Purity                    | Zero filesystem side effects                    |
| Dry-Run / Normal Correspondence   | Preview file list matches actual files created  |
| Template Validation Completeness  | Missing subdirs always throw descriptive errors |
| Placeholder Exhaustion            | No `{{TOKEN}}` remains after replacement        |
| Custom Stack Index Isolation      | Custom indices never overwrite built-in presets |
| Verbose Logger Zero Overhead      | `verbose=false` produces zero output            |
| Progress Reporter TTY Degradation | Non-TTY produces only newline-terminated lines  |
| Pre-Publish Gate Completeness     | Exit code 0 implies all seven checks passed     |
| Flag Parsing Correctness          | Flags in any argv position are parsed correctly |
| Configuration Precedence          | CLI flags > config file > hardcoded defaults    |

All property tests use `{ timeout: 30000 }` and `{ numRuns: 100 }`.

## Error Handling

| Scenario                      | Behaviour                                             |
| ----------------------------- | ----------------------------------------------------- |
| Target directory exists       | Prompts for confirmation before overwriting           |
| Missing permissions           | Displays "Permission denied: {path}"                  |
| Invalid `--stack` value       | Lists valid options and exits                         |
| Invalid `--pkg` value         | Lists valid options and exits                         |
| Ctrl+C during prompts         | Exits cleanly with no partial output                  |
| Missing templates directory   | Descriptive error suggesting reinstallation           |
| Malformed config file         | Logs warning to stderr, continues with empty defaults |
| Explicit `--config` not found | Throws "Config file not found at {path}"              |
| Malformed `stacks.json`       | Throws error listing missing fields and entry index   |

## Development

```bash
# Install dependencies
pnpm install

# Build (copies templates + bundles with tsup)
pnpm build

# Run tests
pnpm test -- --run

# Run init command in dev mode
bash scripts/run-init.sh

# Run add command in dev mode
bash scripts/run-add.sh
```

## Licence

MIT
