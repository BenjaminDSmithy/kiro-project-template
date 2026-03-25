---
inclusion: manual
---

# Pre-Landing Review

Reference with `#pre-landing-review` when reviewing a diff or PR for structural production risks that standard linting and happy-path tests often miss.

## Critical Checks

### SQL and Data Safety

- string interpolation in SQL
- writes that bypass validation or constraints
- read-check-write patterns that should be atomic
- missing eager loading causing N+1 behaviour on new paths

### Race Conditions and Concurrency

- check-then-set flows without conflict handling
- find-or-create flows on non-unique columns
- state transitions that can double-apply or skip under concurrency
- background jobs with weak idempotency

### AI and Trust Boundaries

- LLM output persisted without schema validation
- user content injected into prompts without sanitisation
- tool output trusted without type or shape checks

### Enum and Value Completeness

If the diff adds a new status, tier, enum value, feature flag, or type discriminator:

- trace every switch and branch that handles sibling values
- check allowlists, filters, and UI labels
- check analytics, exports, background jobs, and guards outside the diff

### Conditional Side Effects

- one branch sends notifications while another silently skips equivalent side effects
- logs claim an action happened when the action was skipped
- partial success leaves inconsistent persistence or cache state

### Crypto, Token, and Comparison Safety

- non-cryptographic random values for secrets or tokens
- token truncation that reduces entropy
- non-constant-time comparison of secrets

### Negative-Path Test Gaps

- tests cover success but not blocked or failing paths
- authz features lack tests proving access is denied
- external services are asserted on success but not asserted absent on failure

## Informational Checks

- stale comments and docs after behavioural changes
- magic values duplicated across files
- weak observability on new failure paths
- mismatch between PR intent and actual changed behaviour

## Output Format

```markdown
Review: N issues (X critical, Y informational)

CRITICAL:
- [file:line] problem
  Fix: recommended fix

INFORMATIONAL:
- [file:line] problem
  Fix: recommended fix
```

If no issues are found, say `Review: No issues found.`

## Suppressions

Do not flag:

- harmless repetition that improves readability
- style-only preferences with no steering basis
- problems already fixed inside the same diff
- empirical threshold changes without correctness impact
