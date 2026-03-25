---
inclusion: manual
---

# Safety Guardrails

Reference with `#safety-guardrails` when working on risky changes, debugging production-like systems, or when you want extra caution around destructive commands and edit scope.

## Purpose

This workflow is advisory unless your host environment can enforce it. Treat it as a strict operating mode anyway.

## Safety Mode Checklist

At the start of the task, state:

1. the active edit boundary
2. the risky command classes being guarded
3. the conditions that require user confirmation

Example:

```text
Safety mode active.
- Edit boundary: src/payments/
- Confirmation required for destructive shell, SQL, git, and infrastructure commands
```

## Destructive Commands Requiring Explicit Confirmation

Always ask before running commands or edits that can delete, reset, or irreversibly mutate:

- `rm -rf`, recursive deletes, broad file removal
- `git reset --hard`, `git checkout --`, force push, history rewrite
- destructive SQL such as `DROP`, `TRUNCATE`, mass `DELETE` without clear scope
- infrastructure deletion commands
- schema or migration changes with destructive data impact

## Edit Boundary

Prefer to constrain edits to the smallest relevant directory or subsystem.

Rules:

- if a task is localised, name the boundary explicitly
- if you need to leave the boundary, explain why first
- avoid opportunistic refactors outside the active bug or feature scope

## Safe Defaults

- prefer read-only inspection before mutation
- preview diffs before committing
- prefer additive migrations over destructive replacements
- preserve rollback paths when changing data, auth, or deployment behaviour

## Required Behaviour

- Announce risky operations before executing them
- Ask instead of assuming when blast radius is unclear
- Separate exploratory commands from destructive commands
- If the user asks for speed over caution, still call out irreversible risk

## Relationship to Existing Hooks

This workflow complements:

- migration safety checks
- secret leak detection
- spec validation

It does not replace them.
