---
inclusion: always
---

# Task Completion Standards

Complete every task fully. Never skip, defer, or leave placeholders without explicit user approval.

## Decision Tree: Is This Task Complete?

Execute in order — stop at first "No":

```text
1. Does code compile without errors?           → No = Incomplete
2. Are all imports present and correct?        → No = Incomplete
3. Are barrel exports (index.ts) updated?      → No = Incomplete
4. Are there any TODO/placeholder comments?    → Yes = Incomplete
5. Are all TypeScript types defined (no any)?  → No = Incomplete
6. Is error handling complete?                 → No = Incomplete
7. Does trunk check --fix pass?                → No = Incomplete
8. Are related files updated?                  → No = Incomplete
9. Is tasks.md updated with task marked done?  → No = Incomplete
```

**Rule**: All conditions must pass. No exceptions.

## Prohibited vs Required Actions

| Prohibited                | Required                   |
| ------------------------- | -------------------------- |
| `// TODO: implement this` | Implement fully            |
| "I'll skip X for now"     | Complete or ask user       |
| Partial implementations   | Finish all aspects         |
| Deferred error handling   | Handle all error cases     |
| Missing edge cases        | Cover null, empty, loading |

## Failed Fix Protocol

When a fix doesn't work:

| Step    | Action                                      |
| ------- | ------------------------------------------- |
| Stop    | Don't immediately retry the same approach   |
| Analyse | Determine why it failed                     |
| Report  | Files changed, side effects, ripple effects |
| Ask     | Get user guidance before proceeding         |

## Repeated Failure Protocol (3+ Attempts)

After 3-4 failed attempts, the approach is likely fundamentally wrong.

| Step       | Action                                          |
| ---------- | ----------------------------------------------- |
| Summarise  | Numbered list of attempts and results           |
| Re-analyse | Question original understanding and assumptions |
| Research   | Check docs, search for similar issues           |
| Suggest    | NEW approaches only — never repeat failed ones  |
