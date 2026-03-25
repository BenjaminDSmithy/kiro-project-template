# Pre-Landing Review

Structural production-risk checks that standard linting and happy-path tests often miss.

## Critical Checks

### SQL and Data Safety

- String interpolation in SQL
- Writes that bypass validation or constraints
- Read-check-write patterns that should be atomic
- Missing eager loading causing N+1 behaviour on new paths

### Race Conditions and Concurrency

- Check-then-set flows without conflict handling
- Find-or-create flows on non-unique columns
- State transitions that can double-apply or skip under concurrency
- Background jobs with weak idempotency

### AI and Trust Boundaries

- LLM output persisted without schema validation
- User content injected into prompts without sanitisation
- Tool output trusted without type or shape checks

### Enum and Value Completeness

If the diff adds a new status, tier, enum value, feature flag, or type discriminator:

- Trace every switch and branch that handles sibling values
- Check allowlists, filters, and UI labels
- Check analytics, exports, background jobs, and guards outside the diff

### Conditional Side Effects

- One branch sends notifications while another silently skips equivalent side effects
- Logs claim an action happened when the action was skipped
- Partial success leaves inconsistent persistence or cache state

### Crypto, Token, and Comparison Safety

- Non-cryptographic random values for secrets or tokens
- Token truncation that reduces entropy
- Non-constant-time comparison of secrets

### Negative-Path Test Gaps

- Tests cover success but not blocked or failing paths
- Authz features lack tests proving access is denied
- External services are asserted on success but not asserted absent on failure

## Informational Checks

- Stale comments and docs after behavioural changes
- Magic values duplicated across files
- Weak observability on new failure paths
- Mismatch between PR intent and actual changed behaviour

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

- Harmless repetition that improves readability
- Style-only preferences with no project rule basis
- Problems already fixed inside the same diff
- Empirical threshold changes without correctness impact
