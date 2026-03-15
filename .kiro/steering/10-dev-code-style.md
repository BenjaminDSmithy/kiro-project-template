---
inclusion: always
---

# Code Style Guidelines

Mandatory formatting, import ordering, and quality gates for all source files.

## File Headers

<!-- TODO: Replace with your copyright/header template, or remove if not needed -->

Every new source file requires a header comment. Add headers to existing files when modifying them.

### Comment Style by Language

| Style       | Languages                             |
| ----------- | ------------------------------------- |
| `/* ... */` | TypeScript, JavaScript, TSX, JSX, CSS |
| `#`         | Bash, Python, YAML, Dockerfile        |
| `//`        | Go, Rust, C#                          |
| `--`        | SQL, Lua                              |

## TypeScript Rules

| Rule            | Correct                   | Avoid                        |
| --------------- | ------------------------- | ---------------------------- |
| Type safety     | Proper types or `unknown` | `any`                        |
| Object shapes   | `type Foo = { ... }`      | `interface` unless extending |
| Trailing commas | Always in multi-line      | Omitting final comma         |
| Path aliases    | `@/lib/utils`             | `../../../lib/utils`         |

## Quality Gate (Mandatory)

Run before marking any task complete:

```bash
trunk check --fix <modified-files>
```

| Command                     | Purpose                   |
| --------------------------- | ------------------------- |
| `trunk check --fix <files>` | Check and auto-fix issues |
| `trunk fmt <files>`         | Format only               |
| `trunk check --fix --all`   | Fix all files in repo     |

**Rules:**

- Always use `--fix` flag to avoid interactive prompts
- Zero tolerance for unresolved trunk issues
- Re-run until zero issues before completing task
