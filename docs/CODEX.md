# Codex Guide

| Field        | Value      |
| ------------ | ---------- |
| Type         | Guide      |
| Status       | Active     |
| Last Updated | 2026-03-25 |

---

## Overview

This guide explains the Codex-specific files scaffolded by this template and how to use them in practice.

The Codex layer in this starter is intentionally split into:

- `AGENTS.md` for portable project instructions
- `.codex/config.toml` for project-level Codex settings
- `.codex/agents/` for custom and overridden subagents
- `.codex/rules/` for approval and safety rules around risky commands
- `.agents/skills/` for repository-scoped Codex skills shared with the team

If you are using the Codex CLI or the Codex IDE extension in a trusted project, those files become the local operating context for Codex.

The Codex IDE extension uses the same agent as the Codex CLI and shares the same configuration, so the checked-in repo files below work across both surfaces.

## Recommended Repo Layout

```text
AGENTS.md
.codex/
  config.toml
  agents/
  rules/
.agents/
  skills/
    release-check/
      SKILL.md
    qa-regression/
      SKILL.md
    docs-audit/
      SKILL.md
apps/web/AGENTS.override.md
packages/api/AGENTS.override.md
```

Use the root `AGENTS.md` for shared repository defaults, and place `AGENTS.override.md` as close as possible to specialized work. Codex loads instruction files from the repo root down to the current directory, with closer files overriding broader guidance.

## CLI Scaffolding

Create a new project with Codex support only:

```bash
npx create-kiro-project --host codex --name my-app --yes
```

Inject Codex config into an existing project:

```bash
npx create-kiro-project --add --host codex
```

Preview the generated Codex files without writing anything:

```bash
npx create-kiro-project --dry-run --host codex --name my-app --yes
```

## Generated Codex Files

| Path                    | Purpose |
| ----------------------- | ------- |
| `AGENTS.md`             | Shared base instructions for Codex and other agent-capable tools |
| `.codex/config.toml`    | Agent runtime limits such as max threads and depth |
| `.codex/agents/*.toml`  | Named specialist agents for scoped work |
| `.codex/rules/*.rules`  | Prefix-based approval and safety rules for risky commands |
| `.agents/skills/*/SKILL.md` | Repository-scoped skills for repeated Codex workflows |
| `.codex/README.md`      | Short local reference for the Codex pack |

## Included Agents

| Agent Name         | Use It For |
| ------------------ | ---------- |
| `worker`           | Scoped implementation work with follow-through on checks and docs |
| `explorer`         | Read-only codebase mapping before changes |
| `reviewer`         | Correctness, security, regression, and missing-test review |
| `qa_auditor`       | Focused QA plans, regression checklists, and risk-based test coverage |
| `docs_researcher`  | README/API/setup/doc consistency checks |
| `release_guard`    | Release-readiness checks across versioning, changelog, rollout, and rollback notes |

Two of these agents intentionally override built-in Codex roles:

- `worker`
- `explorer`

That keeps the familiar names while adding project-specific expectations.

## Included Shared Skills

| Skill Name        | Use It For |
| ----------------- | ---------- |
| `release-check`   | Final release-readiness review across versioning, changelog, rollout, and rollback notes |
| `qa-regression`   | Short risk-based manual regression plan for a feature or bugfix |
| `docs-audit`      | Documentation drift checks across README, docs, scripts, and config |

## Included Rule Packs

| Rule File               | Purpose |
| ----------------------- | ------- |
| `publish.rules`         | Prompts before package publish commands |
| `release.rules`         | Prompts before tagging and GitHub release creation |
| `force-push.rules`      | Prompts before force-push variants |
| `safety.rules`          | Blocks or prompts before destructive cleanup commands |

These rules are deliberately conservative. Tighten or relax them after you see how your team actually works.

## First-Run Verification

Confirm that Codex is loading the repo instructions:

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

If your repository uses nested overrides, verify the active instruction chain from a subdirectory:

```bash
codex --cd apps/web --ask-for-approval never "Show which instruction files are active."
```

Use `/skills` in the CLI or IDE extension, or mention a skill explicitly with `$release-check`, `$qa-regression`, or `$docs-audit`.

## Practical Usage Patterns

The exact invocation syntax can vary between the Codex CLI, the Codex app, and the Codex IDE extension. The stable part is the agent name defined in `.codex/agents/*.toml`.

Use prompts like these:

### 1. Focused Review

```text
Use the reviewer agent to inspect the current diff for correctness, regressions, auth gaps, and missing tests. Findings first with file references.
```

### 2. Release Gate

```text
Use the release_guard agent to review this release branch for version bumps, changelog coverage, rollback risk, and missing migration notes.
```

### 3. Documentation Audit

```text
Use the docs_researcher agent to compare README.md, docs/, and package.json and list any setup or API mismatches.
```

### 4. QA Plan

```text
Use the qa_auditor agent to produce a short regression checklist for the payment retry flow, prioritised by user impact.
```

### 5. Read-Only Exploration

```text
Use the explorer agent to trace how invite acceptance works end to end and cite the concrete files and functions involved.
```

### 6. Explicit Skill Invocation

```text
Use $release-check to review this release candidate for version bumps, changelog coverage, rollback notes, and risky publish commands.
```

## Nested Override Examples

See the checked-in samples for a monorepo-friendly override layout:

- `docs/examples/codex-monorepo/apps/web/AGENTS.override.md`
- `docs/examples/codex-monorepo/packages/api/AGENTS.override.md`

## Customization Checklist

- Update `AGENTS.md` with your real product context, architecture boundaries, and commands
- Add or remove repository skills in `.agents/skills/` as your team workflows solidify
- Remove any agent roles your team will not actually invoke
- Add nested `AGENTS.override.md` files for packages or services with local conventions
- Tighten `safety.rules` if your repo contains stateful infrastructure or production-facing scripts
- Uncomment and tune the shared defaults in `.codex/config.toml` when your approval and sandbox policy is settled
- Extend `release.rules` if you use Changesets, custom release scripts, or environment promotion tooling

## Recommended Branch Scope

Keep Codex-specific work in Codex-specific branches. Avoid mixing in configuration for other AI IDEs or agent hosts unless that branch is explicitly about multi-host support.
