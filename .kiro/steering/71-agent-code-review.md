---
inclusion: manual
---

# Agent-Driven Code Review

Reference with `#agent-code-review` when requesting automated review of code changes. This complements `50-code-review.md` (human review etiquette) with structured agent review patterns.

For a stricter structural production-risk pass on the current diff, also reference `#pre-landing-review` (`72-pre-landing-review.md`).

Adapted from Claude Code's code-review and pr-review-toolkit plugins for use with Kiro's agent capabilities.

## Review Perspectives

When reviewing code, analyse from these six specialised perspectives. Each perspective operates independently and reports findings with confidence scores.

### 1. Steering Compliance

Check that code follows project steering documents.

| Check                   | Source                     |
| ----------------------- | -------------------------- |
| Component structure     | `42-react-components.md`   |
| Styling conventions     | `55-tailwind-shadcn.md`    |
| Import ordering         | `10-dev-code-style.md`     |
| Error handling patterns | `11-dev-error-handling.md` |
| Security practices      | `40-security.md`           |
| Accessibility standards | `51-accessibility.md`      |
| Naming conventions      | `03-structure.md`          |

Only flag violations that are explicitly mentioned in steering documents. Do not invent rules.

### 2. Bug Detection

Scan for obvious bugs in changed code only — not pre-existing issues.

| Focus area     | What to look for                                     |
| -------------- | ---------------------------------------------------- |
| Logic errors   | Off-by-one, wrong operator, inverted conditions      |
| Null/undefined | Missing null checks, optional chaining gaps          |
| Async issues   | Unhandled promises, race conditions, missing `await` |
| Type safety    | Unsafe casts, `as unknown as`, missing type guards   |
| Resource leaks | Unclosed connections, missing cleanup in `useEffect` |
| State bugs     | Stale closures, missing dependencies in hooks        |

### 3. Silent Failure Detection

Hunt for error handling that silently swallows failures.

| Pattern                          | Problem                                     | Fix                               |
| -------------------------------- | ------------------------------------------- | --------------------------------- |
| Empty `catch {}`                 | Error disappears entirely                   | Log or re-throw                   |
| `catch { return null }`          | Caller can't distinguish error from no-data | Return error type or throw        |
| `catch { return [] }`            | Empty array hides failure                   | Use Result type or error boundary |
| Missing `.catch()` on promises   | Unhandled rejection                         | Add error handler                 |
| `try/catch` around too much code | Masks which operation failed                | Narrow the try block              |
| Fallback values hiding errors    | `?? defaultValue` after failed fetch        | Check error state explicitly      |

### 4. Type Design Analysis

Rate type quality on four dimensions (1-10 scale):

| Dimension            | What it measures                                                      |
| -------------------- | --------------------------------------------------------------------- |
| Encapsulation        | Are implementation details hidden? Can invalid states be constructed? |
| Invariant expression | Do types make illegal states unrepresentable?                         |
| Usefulness           | Do types help consumers or just add ceremony?                         |
| Enforcement          | Are invariants checked at boundaries (Zod, runtime guards)?           |

Flag types that score below 5 on any dimension.

### 5. Code Quality

General quality review focused on maintainability.

| Check                 | Threshold                                   |
| --------------------- | ------------------------------------------- |
| Function length       | > 50 lines warrants splitting               |
| Cyclomatic complexity | > 10 branches warrants refactoring          |
| Duplication           | > 3 occurrences of same pattern             |
| Coupling              | Component depends on > 5 other modules      |
| Naming clarity        | Names should reveal intent without comments |

### 6. Code Simplification

Identify opportunities to reduce complexity while preserving functionality.

| Pattern                    | Simplification                              |
| -------------------------- | ------------------------------------------- |
| Deeply nested conditionals | Early returns, guard clauses                |
| Repeated null checks       | Optional chaining, nullish coalescing       |
| Manual array operations    | `Array.map`, `filter`, `reduce`             |
| Verbose state management   | Derived state, `useMemo`                    |
| Overly abstract code       | Inline if used once, extract if used thrice |
| Clever one-liners          | Readable multi-line if intent is unclear    |

## Confidence Scoring

Every finding must include a confidence score (0-100):

| Score  | Meaning                     | Action                |
| ------ | --------------------------- | --------------------- |
| 0-25   | Probably false positive     | Filter out            |
| 26-50  | Might be real, minor        | Filter out            |
| 51-79  | Likely real, worth noting   | Include as suggestion |
| 80-100 | High confidence, actionable | Include as finding    |

### Scoring Guidelines

| Factor                                        | Effect on score |
| --------------------------------------------- | --------------- |
| Explicit steering rule violated               | +30             |
| Bug with clear reproduction path              | +25             |
| Historical context supports finding           | +15             |
| Pattern seen in multiple locations            | +10             |
| Pre-existing issue (not introduced in change) | -40             |
| Linter would catch this                       | -30             |
| Stylistic preference without steering backing | -25             |
| Pedantic nitpick                              | -20             |

## Output Format

Report findings grouped by perspective, filtered to confidence ≥ 51:

```markdown
## Code Review — [scope description]

### Findings (confidence ≥ 80)

1. **[Perspective]**: Brief description (confidence: 85)
   - File: `path/to/file.ts` line XX
   - Issue: What's wrong
   - Fix: Suggested resolution

### Suggestions (confidence 51-79)

1. **[Perspective]**: Brief description (confidence: 65)
   - File: `path/to/file.ts` line XX
   - Note: Why this might matter

### Summary

- X findings, Y suggestions
- Perspectives clean: [list of perspectives with no issues]
```

## When to Use Each Perspective

| Trigger                      | Perspectives to run                                 |
| ---------------------------- | --------------------------------------------------- |
| Before committing            | Steering compliance, bug detection, silent failures |
| Before creating PR           | All six perspectives                                |
| After adding types           | Type design analysis                                |
| After error handling changes | Silent failure detection                            |
| After review passes          | Code simplification                                 |
| Quick sanity check           | Bug detection, code quality                         |

## Integration with Existing Review

This agent review supplements, not replaces, human review (`50-code-review.md`):

| Agent review handles                    | Human review handles        |
| --------------------------------------- | --------------------------- |
| Pattern matching against steering docs  | Architectural judgement     |
| Mechanical bug detection                | Business logic correctness  |
| Confidence-scored findings              | Contextual understanding    |
| Consistent coverage of all perspectives | Nuanced trade-off decisions |

For structural checks such as enum completeness beyond the diff, TOCTOU races, AI trust boundaries, and negative-path test gaps, use `72-pre-landing-review.md` alongside this file.
