---
inclusion: manual
---

# Code Review Guidelines

Reference with `#code-review` when reviewing PRs or requesting reviews.

For a deeper structural diff review focused on production-risk bug classes, pair this with `#pre-landing-review` (`72-pre-landing-review.md`).

## What Reviewers Check

| Priority | Area           | What to look for                                    |
| -------- | -------------- | --------------------------------------------------- |
| 1        | Correctness    | Does it do what the spec/requirement says?          |
| 2        | Security       | Input validation, auth checks, secret exposure      |
| 3        | Error handling | All error paths covered, no swallowed exceptions    |
| 4        | Tests          | Adequate coverage, meaningful assertions            |
| 5        | Performance    | N+1 queries, unnecessary re-renders, large bundles  |
| 6        | Readability    | Clear naming, reasonable complexity, good structure |
| 7        | Conventions    | Follows steering docs (style, imports, naming)      |

## Approval Criteria

A PR is ready to merge when:

- All CI checks pass (lint, types, tests, build)
- At least one approval from a team member
- No unresolved comments marked as "blocking"
- No TODO/FIXME comments without linked issues
- Documentation updated if public API changed

## Feedback Etiquette

| Do                                  | Don't                            |
| ----------------------------------- | -------------------------------- |
| Suggest alternatives with examples  | Just say "this is wrong"         |
| Ask questions to understand intent  | Assume the author is wrong       |
| Prefix nits with "nit:" or "minor:" | Block PRs over style preferences |
| Acknowledge good patterns           | Only point out negatives         |
| Use "we" not "you"                  | Make it personal                 |

## Comment Prefixes

| Prefix        | Meaning                                      |
| ------------- | -------------------------------------------- |
| `blocking:`   | Must be resolved before merge                |
| `suggestion:` | Take it or leave it                          |
| `nit:`        | Minor style/preference, non-blocking         |
| `question:`   | Seeking understanding, not requesting change |
| `praise:`     | Highlighting good work                       |
