---
inclusion: fileMatch
fileMatchPattern:
  - "**/*.tsx"
  - "**/*.jsx"
---

# React Component Standards

## Component Structure

| Rule                       | Implementation                                  |
| -------------------------- | ----------------------------------------------- |
| Server Components default  | Only add `'use client'` when hooks/interactivity needed |
| Functional components only | No class components                             |
| Single responsibility      | One component per file, one concern per component |
| Named exports              | `export function Button()` not `export default`  |
| Props via type aliases     | `type ButtonProps = { ... }` with destructuring  |

## Hooks

- Follow Rules of Hooks — only call at top level, only in components/custom hooks
- Use `useCallback` for event handlers passed to child components
- Use `useMemo` for expensive computations, not for every value
- Extract reusable logic into custom hooks (`use-` prefix)
- Prefer `useOptimistic` for optimistic UI updates (React 19+)

## Performance

- Use `React.memo` only when profiling shows re-render issues
- Use `key` props correctly — stable, unique identifiers, never array indices for dynamic lists
- Lazy load heavy components with `React.lazy` and `Suspense`
- Avoid creating objects/functions inside JSX — extract to variables or `useCallback`/`useMemo`
- Use React Compiler (React 19+) where available instead of manual memoisation

## Accessibility

- Use semantic HTML elements (`button`, `nav`, `main`, `section`)
- Include `aria-label` or `aria-labelledby` for interactive elements without visible text
- Ensure keyboard navigation works for all interactive elements
- Use `role` attributes only when semantic HTML is insufficient
- Test with screen readers and keyboard-only navigation
- Maintain colour contrast ratio of at least 4.5:1 (WCAG AA)

## Patterns

```typescript
// Preferred: Server Component (default)
export function UserProfile({ userId }: { userId: string }) {
  // Fetch data directly — no useEffect needed
}

// Client Component (only when needed)
'use client';

import { useState } from 'react';

type CounterProps = {
  initialCount: number,
};

export function Counter({ initialCount }: CounterProps) {
  const [count, setCount] = useState(initialCount);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```
