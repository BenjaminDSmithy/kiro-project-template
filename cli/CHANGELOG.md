# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-03-23

Initial release of `create-kiro-project`.

### Added

#### Core CLI (Spec 04)

- Interactive project scaffolding wizard with prompts for project name, copyright holder, year, stack preset, and package manager
- `--add` mode to inject `.kiro/` configuration into existing projects without touching other files
- `--only` flag for cherry-picking subsets (`steering`, `hooks`, `specs`, `settings`) during add mode
- Non-interactive mode via `--yes` / `-y` flag with sensible defaults
- CLI flags for all prompt values: `--name`, `--copyright`, `--year`, `--stack`, `--pkg`
- 13 built-in stack presets: T3, T4, Supabase+Next.js, Vite+React, SvelteKit, Nuxt 3, Remix, Astro, Flutter+Supabase, Electron, Python FastAPI, TanStack Start, Custom
- Automatic `docs/TECH-STACK.md` generation from selected stack preset
- Placeholder replacement engine (`{{PROJECT_NAME}}`, `{{COPYRIGHT_HOLDER}}`, `{{YEAR}}`) across all text files
- Binary file detection and skipping during placeholder replacement
- Steering doc cleanup based on stack preset's `keepSteering` list
- Example spec removal (preserves `_TEMPLATE/` and `_BUGFIX_TEMPLATE/`)
- Cross-platform file operations via `fs/promises` (no shell commands)
- Graceful Ctrl+C handling during prompts
- User-friendly error messages for directory conflicts, permission errors, and invalid flag values
- `--help` and `--version` flags
- Template bundling at build time via `scripts/copy-templates.sh`

#### CLI Enhancements (Spec 05)

- `--dry-run` flag to preview all file operations without writing to disk
- `--verbose` flag for detailed per-file operation logging to stderr
- `--config <path>` flag for explicit config file path
- Configuration file support (`.create-kiro-project.json`) with auto-discovery walk-up
- Configuration precedence: CLI flags > prompts > config file > hardcoded defaults
- Custom stack presets via `stacks.json` referenced from config file
- Template directory validation before any file operations
- Progress reporter with animated spinner (TTY) and plain-text fallback (non-TTY)
- Verbose logger with timestamped, categorised output to stderr (zero overhead when off)
- Dependency injection architecture: `CommandOptions` passed to commands from entry point
- GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`) with build-and-test + publish jobs
- CHANGELOG generator script (`scripts/changelog.sh`) parsing conventional commits
- Pre-publish validation script (`scripts/prepublish.sh`) with 7 safety checks
- SIGINT cleanup: stops spinner, restores cursor visibility, exits cleanly

### Testing

- 151 passing tests across 21 test files (+ 5 E2E tests that run against built dist/)
- 12 property-based tests via fast-check verifying correctness invariants
- Integration tests covering full scaffold, inject, dry-run parity, config resolution, and custom stacks
- E2E tests exercising the CLI as a subprocess against `dist/index.js`

### Fixed

- Placeholder replacement uses `split().join()` instead of `replaceAll()` to avoid `$` special replacement pattern interpretation in values
