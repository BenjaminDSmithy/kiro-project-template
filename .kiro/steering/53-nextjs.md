---
inclusion: fileMatch
fileMatchPattern:
  - "src/app/**/*.ts"
  - "src/app/**/*.tsx"
  - "src/middleware.ts"
  - "next.config.*"
---

# Next.js App Router Standards

Patterns specific to Next.js 15+ App Router. For general React patterns, see `42-react-components.md`.

## Server vs Client Decision Tree

```
1. Does it need browser APIs (window, document)?     → Client Component
2. Does it need React hooks (useState, useEffect)?   → Client Component
3. Does it need event handlers (onClick, onChange)?   → Client Component
4. Does it fetch data at render time?                 → Server Component
5. Does it access backend resources directly?         → Server Component
6. Is it purely presentational?                       → Server Component
7. Everything else?                                   → Server Component (default)
```

## Data Fetching

| Pattern           | When to use                                |
| ----------------- | ------------------------------------------ |
| Server Components | Default for data fetching — fetch directly |
| Server Actions    | Form submissions, mutations                |
| Route Handlers    | External API consumers, webhooks           |
| Client-side (SWR) | Real-time data, user-specific polling      |

### Server Component Fetching

```typescript
// Preferred: fetch directly in Server Components
export default async function OrdersPage() {
  const orders = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
  });
  return <OrderList orders={orders} />;
}
```

### Server Actions

```typescript
"use server";

export async function createOrder(formData: FormData) {
  const validated = orderSchema.parse(Object.fromEntries(formData));
  const order = await db.insert(orders).values(validated).returning();
  revalidatePath("/orders");
  return order;
}
```

## Caching and Revalidation

| Strategy           | When to use                             |
| ------------------ | --------------------------------------- |
| `revalidatePath()` | After mutations that affect a page      |
| `revalidateTag()`  | After mutations that affect tagged data |
| `unstable_cache()` | Expensive computations with TTL         |
| No cache           | User-specific data, real-time data      |

## Route Organisation

| Pattern            | File                         |
| ------------------ | ---------------------------- |
| Page               | `page.tsx`                   |
| Layout (shared UI) | `layout.tsx`                 |
| Loading state      | `loading.tsx`                |
| Error boundary     | `error.tsx` (must be Client) |
| Not found          | `not-found.tsx`              |
| API route          | `route.ts`                   |

## Middleware

- Use for auth checks, redirects, and header manipulation
- Keep middleware lightweight — no heavy computation
- Match specific paths with `config.matcher`
- Never access database directly in middleware

## Metadata

```typescript
export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
};

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  return { title: product.name };
}
```

## Streaming and Suspense

- Wrap slow data fetches in `<Suspense>` with meaningful fallbacks
- Use `loading.tsx` for route-level loading states
- Prefer streaming over blocking the entire page

## Rules

| Rule                                   | Rationale                               |
| -------------------------------------- | --------------------------------------- |
| Server Components by default           | Smaller bundles, direct backend access  |
| `'use client'` only at leaf components | Push client boundary as low as possible |
| No `useEffect` for data fetching       | Use Server Components or Server Actions |
| No `fetch()` in Client Components      | Use SWR/React Query for client fetching |
| Always handle `error.tsx`              | Graceful error recovery per route       |
| Always handle `loading.tsx`            | Perceived performance                   |
