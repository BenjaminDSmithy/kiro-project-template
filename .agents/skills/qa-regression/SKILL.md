---
name: qa-regression
description: Use when you need a concise regression checklist for a feature, bugfix, or release candidate, prioritised by user impact and failure risk.
---

# QA Regression

Produce a pragmatic regression plan for the requested surface area.

## Inputs

- the user flow, subsystem, or bugfix being changed
- nearby tests, feature flags, and operational constraints
- any recent incidents, edge cases, or known risky integrations

## Workflow

1. Identify the primary happy path and the highest-impact failure modes.
2. Separate must-test regressions from lower-priority exploratory checks.
3. Prefer checks that validate contracts, permissions, state transitions, and retries.
4. Call out missing automation where manual coverage is currently doing the work.
5. Keep the checklist short enough to be executed under delivery pressure.

## Output

- high-priority regression checklist
- secondary exploratory checks
- missing automation or observability gaps
- residual risks if coverage stays partial
