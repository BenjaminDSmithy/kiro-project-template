---
inclusion: fileMatch
fileMatchPattern:
  - "**/routes/**/*.tsx"
  - "**/routes/**/*.ts"
  - "**/*.functions.ts"
  - "**/*.server.ts"
  - "**/tanstack/**/*"
  - "app.config.ts"
---

# TanStack Ecosystem & TanStack Start Standards

Patterns for TanStack Start (full-stack framework) and the broader TanStack ecosystem: Query, Router, Table, Form, Store.

## TanStack Ecosystem Decision Tree

```text
1. Need server state (API/DB data)?       → TanStack Query
2. Need type-safe routing?                → TanStack Router
3. Need complex data tables?              → TanStack Table (headless)
4. Need form state + validation?          → TanStack Form
5. Need client-side reactive state?       → TanStack Store
6. Need a full-stack framework?           → TanStack Start
```

## TanStack Ecosystem Maturity

| Library | Maturity       | Use case                         |
| ------- | -------------- | -------------------------------- |
| Query   | Battle-tested  | Server state, caching, mutations |
| Router  | Production     | Type-safe file-based routing     |
| Table   | Battle-tested  | Headless data tables             |
| Form    | Stable         | Form state + validation          |
| Virtual | Battle-tested  | Virtualised lists and grids      |
| Store   | Newer          | Reactive client state            |
| Start   | v1 RC / Stable | Full-stack React framework       |
| DB      | Alpha          | Reactive client database         |

## TanStack Start Architecture

### Project Structure

```text
src/
├── routes/
│   ├── __root.tsx           # Root layout + providers
│   ├── index.tsx            # Home page
│   ├── orders/
│   │   ├── index.tsx        # /orders
│   │   └── $orderId.tsx     # /orders/:orderId (typed param)
│   └── api/
│       └── health.ts        # API route
├── utils/
│   ├── users.functions.ts   # Server function wrappers (createServerFn)
│   ├── users.server.ts      # Server-only helpers (DB queries)
│   └── schemas.ts           # Shared Zod schemas (client-safe)
├── components/              # UI components
└── app.config.ts            # TanStack Start config
```

### Server Functions

```typescript
// utils/orders.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const OrderInput = z.object({ id: z.string().uuid() });

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator(OrderInput)
  .handler(async ({ data }) => {
    return findOrderById(data.id);
  });

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator(CreateOrderSchema)
  .handler(async ({ data }) => {
    return insertOrder(data);
  });
```

### File Organisation Convention

| Suffix            | Purpose                             | Safe to import on client |
| ----------------- | ----------------------------------- | ------------------------ |
| `.functions.ts`   | `createServerFn` wrappers           | Yes (RPC stubs)          |
| `.server.ts`      | Server-only helpers (DB, secrets)   | No — server only         |
| `.ts` (no suffix) | Shared code (types, schemas, utils) | Yes                      |

### Route Loaders

```typescript
// routes/orders/$orderId.tsx
import { createFileRoute } from '@tanstack/react-router';
import { getOrder } from '~/utils/orders.functions';

export const Route = createFileRoute('/orders/$orderId')({
  // Auth guard
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  // Data loading (runs on server during SSR)
  loader: async ({ params }) => {
    return getOrder({ data: { id: params.orderId } });
  },
  component: OrderDetail,
});

function OrderDetail() {
  const order = Route.useLoaderData();
  return <div>{order.status}</div>;
}
```

### Middleware

```typescript
import { createMiddleware } from "@tanstack/react-start";

const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorised");
  return next({ context: { user: session.user } });
});

// Apply to server functions
export const getProtectedData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // context.user is typed and available
    return getUserData(context.user.id);
  });
```

## TanStack Query Patterns

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query with typed key
export function useOrders(userId: string) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => fetchOrders(userId),
    staleTime: 5 * 60 * 1000,
  });
}

// Mutation with optimistic update
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrder,
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const previous = queryClient.getQueryData(["orders"]);
      queryClient.setQueryData(["orders"], (old: Order[]) =>
        old.map((o) => (o.id === newOrder.id ? { ...o, ...newOrder } : o)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["orders"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
```

| Rule                                    | Rationale                              |
| --------------------------------------- | -------------------------------------- |
| Structure query keys hierarchically     | Enables granular invalidation          |
| Set `staleTime` based on data freshness | Don't refetch data that rarely changes |
| Use optimistic updates for mutations    | Instant UI feedback                    |
| Always handle `onError` rollback        | Revert optimistic state on failure     |
| Invalidate related queries on success   | Keep cache consistent                  |

## TanStack Router Rules

| Rule                                      | Rationale                          |
| ----------------------------------------- | ---------------------------------- |
| Use `createFileRoute` for all routes      | Type-safe params and search params |
| Use `beforeLoad` for auth guards          | Runs before loader, can redirect   |
| Use `loader` for data fetching            | SSR-compatible, typed return value |
| Use `$paramName` for dynamic segments     | Fully typed route params           |
| Use `Route.useLoaderData()` in components | Type-safe access to loaded data    |
| Validate search params with Zod           | Runtime safety for URL state       |

## TanStack Table Patterns

```typescript
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

const table = useReactTable({
  data: orders,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: { sorting },
  onSortingChange: setSorting,
});
```

| Rule                                      | Rationale                            |
| ----------------------------------------- | ------------------------------------ |
| TanStack Table is headless                | You control all markup and styling   |
| Define columns outside the component      | Prevents unnecessary re-renders      |
| Use server-side pagination for large data | Don't load 10k rows into the browser |
| Combine with TanStack Virtual for perf    | Virtualise rows for large datasets   |

## Rules (General)

| Rule                                     | Rationale                                 |
| ---------------------------------------- | ----------------------------------------- |
| Use static imports for server functions  | Build process handles environment shaking |
| Never use dynamic imports for server fns | Can cause bundler issues                  |
| Keep `.server.ts` files server-only      | Never import in client components         |
| Validate all inputs with Zod             | Runtime safety at network boundary        |
| Use Vite for builds (TanStack Start)     | Native ESM, fast HMR                      |
| Deploy via Nitro presets                 | Universal deployment (Node, CF, Vercel)   |
