# Contributing Guide

| Field        | Value      |
| ------------ | ---------- |
| Type         | Guide      |
| Status       | Draft      |
| Last Updated | 2026-03-16 |

---

## Getting Started

### Prerequisites

<!-- TODO: List required tools and versions -->

- Node.js >= 20
- <!-- TODO: other prerequisites -->

### Setup

```bash
# Clone the repository
git clone <!-- TODO: repo URL -->

# Install dependencies
<!-- TODO: install command -->

# Copy environment variables
cp .env.example .env.local

# Start development
<!-- TODO: dev command -->
```

## Development Workflow

### Branch Strategy

| Branch    | Purpose               | Merges Into |
| --------- | --------------------- | ----------- |
| `main`    | Production-ready code | —           |
| `develop` | Integration branch    | `main`      |
| `feat/*`  | New features          | `develop`   |
| `fix/*`   | Bug fixes             | `develop`   |
| `docs/*`  | Documentation changes | `develop`   |

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

<body>
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

- Subject line <= 72 characters, imperative mood, lowercase, no trailing period
- Body lines <= 72 characters
- Reference spec/task when applicable: `spec(feature): complete task 1.2`

### Pull Request Process

1. Create a feature branch from `develop`
2. Make changes with passing tests
3. Run quality checks: <!-- TODO: lint/test commands -->
4. Open PR with description of changes
5. Address review feedback
6. Squash merge when approved

## Code Standards

### Quality Checks

Run before every commit:

```bash
<!-- TODO: lint command -->
<!-- TODO: format command -->
<!-- TODO: test command -->
```

### File Naming

<!-- TODO: Adjust to match your project conventions -->

| Context         | Convention | Example                |
| --------------- | ---------- | ---------------------- |
| Source files    | kebab-case | `user-service.ts`      |
| Components      | PascalCase | `UserProfile.tsx`      |
| Test files      | co-located | `user-service.test.ts` |
| Database tables | snake_case | `user_profiles`        |

### Testing Requirements

- Unit tests for business logic
- Integration tests for API endpoints
- Property-based tests for invariants (minimum 100 iterations)
- Accessibility tests for interactive components

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

## Questions?

<!-- TODO: Add contact info, discussion links, or issue templates -->

---

```
Copyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}. All rights reserved.
```
