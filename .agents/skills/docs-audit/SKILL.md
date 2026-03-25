---
name: docs-audit
description: Use when code, setup steps, APIs, or workflows may have drifted from README or docs content and you need a focused documentation consistency audit.
---

# Docs Audit

Compare implementation-facing docs against the current code and configuration.

## Inputs

- the changed code paths or packages
- `README.md`, `docs/`, onboarding notes, and setup scripts
- package metadata, CLI help text, or config files referenced by docs

## Workflow

1. Identify the docs that claim setup steps, commands, APIs, or workflows.
2. Compare those claims with the code, scripts, and current defaults.
3. Flag stale commands, missing prerequisites, renamed files, and behavioral mismatches.
4. Prefer concrete doc fixes over abstract style feedback.
5. Separate blocking inaccuracies from polish improvements.

## Output

- incorrect or stale documentation with file references
- missing docs introduced by the change
- low-priority wording or structure cleanups
