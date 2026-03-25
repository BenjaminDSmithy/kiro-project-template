---
inclusion: manual
---

# QA Methodology

Reference with `#qa-methodology` when testing a UI, validating a feature branch, or producing a structured QA report.

## Modes

| Mode         | Use When                             | Expected Depth                          |
| ------------ | ------------------------------------ | --------------------------------------- |
| `Diff-Aware` | Branch changes are known, no URL yet | Test pages and flows affected by the diff |
| `Full`       | URL or deploy preview is provided    | Explore every reachable primary flow    |
| `Quick`      | Smoke test needed                    | Homepage plus top navigation targets    |

If browser tooling is unavailable, state the limitation explicitly and switch to the best available code-and-doc review. Do not pretend browser QA happened.

## Diff-Aware Workflow

1. Review the diff and changed files
2. Map changed files to routes, screens, APIs, and user flows
3. Identify the minimum set of affected journeys
4. Test those journeys first
5. Check console/network errors during interactions

## Per-Page Checklist

For each visited page or screen:

1. Visual scan: layout, spacing, broken images, overflow, clipping
2. Interaction scan: buttons, links, inputs, dropdowns, dialogs
3. Form checks: empty, invalid, long, and special-character input
4. Navigation checks: deep links, back button, entry and exit paths
5. State checks: loading, empty, success, error, overflow
6. Console checks: errors, failed requests, warnings worth action
7. Responsive checks: mobile and tablet if the feature is user-facing
8. Auth and permission checks: logged out, wrong role, expired session where relevant

## Severity Levels

| Severity   | Definition                                      |
| ---------- | ----------------------------------------------- |
| Critical   | Crash, data loss, or blocked core workflow      |
| High       | Major feature broken with no reasonable fallback |
| Medium     | Noticeable problem with workaround              |
| Low        | Cosmetic or minor polish issue                  |

## Issue Categories

- `Visual`
- `Functional`
- `UX`
- `Content`
- `Performance`
- `Console`
- `Accessibility`

## Evidence Requirements

Every issue should include:

1. exact page or route
2. reproduction steps
3. expected behaviour
4. actual behaviour
5. evidence

For interactive bugs, prefer before/after screenshots or equivalent trace evidence.

## Health Score

Use a lightweight weighted score when reporting QA results:

| Area          | Weight |
| ------------- | ------ |
| Functional    | 25%    |
| UX            | 15%    |
| Visual        | 10%    |
| Accessibility | 15%    |
| Performance   | 10%    |
| Console       | 15%    |
| Content       | 10%    |

Scoring guidance:

- Start at 100
- Critical issue: minus 25
- High issue: minus 15
- Medium issue: minus 8
- Low issue: minus 3

## Output Format

```markdown
## QA Report

### Summary
- Mode: Diff-Aware | Full | Quick
- Health score: X/100
- Issues: X critical, Y high, Z medium, N low

### Findings
1. [Severity][Category] Title
   - Route:
   - Repro:
   - Expected:
   - Actual:
   - Evidence:

### Top 3 Fixes
- ...
```

## Rules

- Verify before documenting: retry once if the failure may be transient
- Test as a user first, not as a source-code reader
- Prioritise 5-10 well-evidenced findings over a long vague list
- If fixing issues is not explicitly requested, default to report-only mode
