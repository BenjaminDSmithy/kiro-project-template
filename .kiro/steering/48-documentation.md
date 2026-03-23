---
inclusion: fileMatch
fileMatchPattern:
  - "**/*.md"
  - "**/docs/**/*"
  - "README*"
  - "CHANGELOG*"
  - "CONTRIBUTING*"
---

# Documentation Standards

What to document, how to format it, and where it lives.

## What Must Be Documented

| Artefact              | Location                    | Format          |
| --------------------- | --------------------------- | --------------- |
| Project overview      | `README.md`                 | Markdown        |
| API endpoints         | `docs/API.md`               | Markdown + examples |
| Architecture          | `docs/ARCHITECTURE.md`      | Markdown + diagrams |
| Deployment            | `docs/DEPLOYMENT.md`        | Step-by-step    |
| Contributing guide    | `docs/CONTRIBUTING.md`      | Markdown        |
| ADRs                  | `docs/ADR/NNN-title.md`     | ADR template    |
| Changelog             | `CHANGELOG.md`              | Keep a Changelog format |

## Code Documentation

### TypeScript/JSDoc

Document all exported functions, types, and classes:

```typescript
/**
 * Calculates the total price including tax.
 *
 * @param items - Array of line items with price and quantity
 * @param taxRate - Tax rate as a decimal (e.g. 0.10 for 10%)
 * @returns Total price including tax, rounded to 2 decimal places
 */
export function calculateTotal(items: LineItem[], taxRate: number): number {
  // ...
}
```

| Rule                              | Implementation                        |
| --------------------------------- | ------------------------------------- |
| Document all exports              | JSDoc on every public function/type   |
| Describe parameters               | `@param` with type and purpose        |
| Describe return values             | `@returns` with what and when         |
| Document exceptions                | `@throws` for expected error cases    |
| Skip obvious getters/setters       | Don't document trivial accessors      |

## README Structure

Every project README should include:

1. Project name and one-line description
2. Quick start (install + run in < 5 commands)
3. Tech stack summary
4. Project structure overview
5. Development setup
6. Testing instructions
7. Deployment guide (or link to docs/)

## ADR (Architecture Decision Records)

Use for significant technical decisions. Follow the template at `#[[file:docs/ADR/000-template.md]]`.

| Field              | Required |
| ------------------ | -------- |
| Title              | Yes      |
| Type + Status      | Yes      |
| Context            | Yes      |
| Decision           | Yes      |
| Consequences (+/-) | Yes      |
| Alternatives       | Yes      |
| References         | Optional |

## Language

Use Australian English throughout: `optimise`, `behaviour`, `colour`, `analyse`, `licence` (noun).
