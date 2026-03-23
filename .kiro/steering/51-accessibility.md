---
inclusion: fileMatch
fileMatchPattern:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.css"
  - "**/tailwind*"
---

# Accessibility Standards

WCAG 2.2 AA compliance guidelines for all user-facing components.

## Semantic HTML

| Use                    | Instead of                          |
| ---------------------- | ----------------------------------- |
| `<button>`             | `<div onClick>`                     |
| `<a href>`             | `<span onClick>` for navigation     |
| `<nav>`                | `<div class="nav">`                 |
| `<main>`               | `<div class="main">`                |
| `<section>` + heading  | `<div>` without structure           |
| `<ul>/<ol>` for lists  | `<div>` with visual-only formatting |

## ARIA Guidelines

| Rule                                    | Implementation                          |
| --------------------------------------- | --------------------------------------- |
| Use ARIA only when HTML is insufficient | Semantic HTML first, ARIA as supplement |
| Every interactive element needs a name  | `aria-label` or visible text            |
| Live regions for dynamic content        | `aria-live="polite"` for updates        |
| Roles match behaviour                   | Don't use `role="button"` on a `<div>`  |

## Keyboard Navigation

- All interactive elements must be focusable and operable via keyboard
- Visible focus indicators on all focusable elements (never `outline: none` without replacement)
- Logical tab order following visual layout
- Escape key closes modals, dropdowns, and overlays
- Skip navigation link as first focusable element

## Colour and Contrast

| Requirement                  | Minimum ratio |
| ---------------------------- | ------------- |
| Normal text (< 18px)         | 4.5:1         |
| Large text (≥ 18px or bold)  | 3:1           |
| UI components and graphics   | 3:1           |

- Never convey information through colour alone — use icons, text, or patterns as well
- Test with colour blindness simulators

## Forms

- Every input must have an associated `<label>` (or `aria-label`)
- Group related fields with `<fieldset>` and `<legend>`
- Display error messages adjacent to the field, linked via `aria-describedby`
- Mark required fields with `aria-required="true"` and visible indicator

## Images and Media

| Content type     | Requirement                                |
| ---------------- | ------------------------------------------ |
| Informative image| Descriptive `alt` text                     |
| Decorative image | `alt=""` or CSS background                 |
| Complex diagram  | `alt` + detailed text description nearby   |
| Video            | Captions and transcript                    |

## Testing

- Use axe-core or similar automated tools as a baseline
- Manual keyboard navigation testing on all new components
- Screen reader testing (VoiceOver on macOS) for critical flows
- Automated a11y checks in Playwright E2E tests
