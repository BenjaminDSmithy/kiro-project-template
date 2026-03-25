---
name: release-check
description: Use when a change is close to shipping and you need a focused release-readiness pass covering versioning, changelog notes, rollout risk, rollback notes, and publish or tag safety.
---

# Release Check

Run a narrow release-readiness review for the current change set.

## Inputs

- the current branch, diff, or release candidate
- package metadata such as `package.json`, release scripts, or tags
- any changelog, migration, rollout, or rollback notes already present

## Workflow

1. Confirm the intended release unit and version source of truth.
2. Check that user-visible behavior changes are reflected in changelog or release notes.
3. Check for required migration, rollout, rollback, or environment notes.
4. Flag risky publish, tag, or force-push steps before they happen.
5. Summarize blockers first, then list follow-up items that can wait.

## Output

- release blockers
- missing release artifacts
- rollback or operational risks
- concrete files and commands that need follow-up
