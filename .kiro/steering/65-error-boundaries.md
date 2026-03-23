---
inclusion: fileMatch
fileMatchPattern:
  - "**/error.tsx"
  - "**/global-error.tsx"
  - "**/not-found.tsx"
  - "**/loading.tsx"
---

# Error Boundary Standards

UI error recovery patterns for Next.js App Router and React applications.

## Next.js Error Files

| File               | Scope                    | Must be Client Component |
| ------------------ | ------------------------ | ------------------------ |
| `error.tsx`        | Route segment errors     | Yes                      |
| `global-error.tsx` | Root layout errors       | Yes                      |
| `not-found.tsx`    | 404 pages                | No                       |
| `loading.tsx`      | Suspense fallback        | No                       |

## Route Error Boundary

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

## Global Error Boundary

```typescript
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div role="alert">
          <h2>Something went wrong</h2>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

## Graceful Degradation Patterns

| Scenario                | Pattern                                    |
| ----------------------- | ------------------------------------------ |
| Data fetch fails        | Show cached data or empty state with retry |
| Image fails to load     | Show placeholder with alt text             |
| Third-party widget fails| Hide widget, log error, continue           |
| Auth session expires    | Redirect to login with return URL          |
| Network offline         | Show offline banner, queue mutations       |

## Rules

| Rule                                    | Rationale                                |
| --------------------------------------- | ---------------------------------------- |
| Every route segment needs `error.tsx`   | Isolate failures to the smallest scope   |
| Root layout needs `global-error.tsx`    | Catch errors that escape route boundaries|
| Error boundaries must be Client Components| React requirement for error boundaries |
| Always include a retry/reset action     | Users can recover without refreshing     |
| Log errors to monitoring service        | Don't swallow errors silently            |
| Never show stack traces to users        | Security risk, poor UX                   |
| Use `role="alert"` on error UI          | Accessible to screen readers             |
| Provide meaningful empty states         | Better than blank screens                |
