---
inclusion: fileMatch
fileMatchPattern:
  - "**/server/api/**/*.ts"
  - "**/server/trpc/**/*.ts"
  - "**/trpc/**/*.ts"
  - "**/utils/trpc.*"
  - "**/lib/trpc/**/*.ts"
---

# T3 Stack Standards

Patterns for the T3 Stack: Next.js + tRPC + Tailwind CSS + TypeScript. Optionally includes Prisma/Drizzle and NextAuth.js/Supabase Auth.

## T3 Axioms

| Axiom                     | Meaning                                          |
| ------------------------- | ------------------------------------------------ |
| Solve problems            | Only add what solves a specific problem          |
| Bleed responsibly         | Bleeding edge in low-risk areas, stable for data |
| Typesafety isn't optional | End-to-end type safety from DB to UI             |

## tRPC Architecture

### Router Organisation

```text
src/
├── server/
│   ├── api/
│   │   ├── root.ts              # Merges all routers
│   │   ├── trpc.ts              # tRPC init, context, middleware
│   │   └── routers/
│   │       ├── user.ts          # User procedures
│   │       ├── order.ts         # Order procedures
│   │       └── notification.ts  # Notification procedures
│   └── db/                      # Database client + schema
├── app/
│   └── api/trpc/[trpc]/route.ts # tRPC HTTP handler (App Router)
└── lib/
    └── trpc/
        ├── client.ts            # Client-side tRPC hooks
        ├── server.ts            # Server-side tRPC caller
        └── react.tsx            # TRPCReactProvider wrapper
```

### Router Pattern

```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(users)
        .set({ name: input.name })
        .where(eq(users.id, input.id))
        .returning();
    }),
});
```

### Context and Middleware

```typescript
// server/api/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Middleware: enforce authentication
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { session: { ...ctx.session, user: ctx.session.user } } });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceAuth);
```

### Client Usage (App Router)

```typescript
// Server Component — direct caller
import { api } from '@/lib/trpc/server';

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await api.user.getById({ id: params.id });
  return <UserProfile user={user} />;
}

// Client Component — React Query hooks
'use client';
import { api } from '@/lib/trpc/react';

export function UserList() {
  const { data: users, isLoading } = api.user.list.useQuery();
  const utils = api.useUtils();
  const createUser = api.user.create.useMutation({
    onSuccess: () => utils.user.list.invalidate(),
  });
}
```

## Rules

| Rule                                       | Rationale                               |
| ------------------------------------------ | --------------------------------------- |
| One router per domain/resource             | Clean separation of concerns            |
| Always validate input with Zod             | Runtime safety at the network boundary  |
| Use `protectedProcedure` for auth          | Never check auth inside procedure body  |
| Use `superjson` transformer                | Handles Date, Map, Set serialisation    |
| Prefer server caller in Server Components  | Avoids unnecessary HTTP round-trip      |
| Use React Query hooks in Client Components | Automatic caching and revalidation      |
| Never import server code on the client     | tRPC handles the boundary automatically |
| Keep procedures thin                       | Extract business logic to service layer |

## Anti-Patterns

| Avoid                              | Instead                                  |
| ---------------------------------- | ---------------------------------------- |
| Fat procedures with business logic | Extract to `src/lib/{domain}/` services  |
| Returning entire DB rows           | Select specific fields, use output types |
| Catching errors inside procedures  | Let tRPC error formatter handle it       |
| Using `any` in input/output        | Always define Zod schemas                |
| Mixing REST routes with tRPC       | Pick one per resource — don't duplicate  |
