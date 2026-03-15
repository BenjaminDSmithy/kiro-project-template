# {{PROJECT_NAME}}

<!-- TODO: Replace with your project description -->

| Field        | Value      |
| ------------ | ---------- |
| Type         | Reference  |
| Status       | Draft      |
| Last Updated | 2026-03-16 |

---

## Overview

<!-- TODO: Describe what this project does and who it's for -->

## Quick Start

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Start development
npm run dev
```

## Project Structure

<!-- TODO: Update with your actual directory layout -->

```text
.kiro/                # AI agent configuration (steering, hooks, specs)
src/                  # Application source code
tests/                # Test files
docs/                 # Documentation
```

## Development

### Prerequisites

<!-- TODO: List required tools and versions -->

- Node.js >= 20
- npm >= 10

### Commands

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run test`  | Run tests                |
| `npm run lint`  | Run linters              |
| `trunk check`   | Run all quality checks   |
| `trunk fmt`     | Auto-format code         |

## Kiro Integration

This project uses [Kiro](https://kiro.dev) for AI-assisted development. The `.kiro/` directory contains:

- **Steering files** — AI guidance documents that keep Kiro aligned with project conventions
- **Hooks** — Automated quality checks triggered by file changes and agent events
- **Specs** — Feature specifications following requirements → design → tasks workflow
- **MCP settings** — Model Context Protocol server configuration

See [`.kiro/README.md`](.kiro/README.md) for details.

## License

<!-- TODO: Add your license -->

---

```
Copyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}. All rights reserved.
```
