---
inclusion: always
---

# Core Rules

These rules take absolute precedence over all other steering documents. Apply them to every interaction.

## Rule 1: Explicit Consent Required

Implement only what the user explicitly requests. Nothing more.

| Prohibited Action                     | Required Action                      |
| ------------------------------------- | ------------------------------------ |
| Adding unrequested features or extras | Implement exactly what was asked     |
| Interpreting vague requests broadly   | Ask for clarification first          |
| Silently including own suggestions    | Wait for explicit user approval      |
| Assuming "all" includes your ideas    | Confirm exact scope before executing |
| Expanding scope for "thoroughness"    | Stay within stated boundaries        |
| Suggesting unapproved integrations    | Reference `02-tech.md` for approved  |

## Rule 2: Clarification Protocol

When a request is vague, ambiguous, or could be interpreted multiple ways:

1. **Stop** — Do not proceed with assumptions
2. **Clarify** — Ask the user to specify exactly what they want
3. **Confirm** — Repeat your understanding back before executing
4. **Execute** — Only after receiving explicit confirmation

## Rule 3: Scope Boundaries

Work only within boundaries defined by steering documents:

| Boundary              | Reference Document |
| --------------------- | ------------------ |
| Approved integrations | `02-tech.md`       |
| Feature areas         | `01-product.md`    |
| File locations        | `03-structure.md`  |

Anything outside these boundaries requires explicit user approval before proceeding.

## Rule 4: When in Doubt, Ask

The user prefers answering a clarifying question over correcting incorrect assumptions.

**Ask** rather than assume when:

- The request has multiple valid interpretations
- You're unsure which files or components are affected
- The scope could reasonably include or exclude something
- A decision could have significant downstream impact

## Rule Priority

When rules conflict, apply in this order:

1. User's explicit instruction in current request
2. Core rules (this document)
3. Other steering documents (by number: `01-`, `02-`, etc.)
4. General best practices
