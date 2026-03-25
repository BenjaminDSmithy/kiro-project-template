# T4 Stack Standards

Patterns for the T4 Stack: universal apps across iOS, Android, and Web using Expo + Next.js + Tamagui + tRPC. Deploys to Cloudflare Workers.

## T4 Architecture Overview

```text
monorepo/
  apps/
    expo/              # React Native (iOS + Android)
      app/             # Expo Router file-based routes
      app.config.ts    # Expo config
    next/              # Next.js (Web)
      app/             # App Router pages
      next.config.ts
  packages/
    app/               # Shared screens + navigation (Solito)
      features/        # Feature screens
      navigation/      # Cross-platform navigation
      provider/        # Shared providers
    ui/                # Shared UI components (Tamagui)
      src/
      tamagui.config.ts
    api/               # tRPC routers + server logic
      src/
        router/        # tRPC routers
        trpc.ts        # tRPC init
      index.ts
  tooling/             # Shared configs (ESLint, TS, etc.)
```

## Cross-Platform Navigation (Solito)

```typescript
import { useRouter } from 'solito/router';
import { Link } from 'solito/link';

export function OrderList() {
  const router = useRouter();

  return (
    <>
      <Link href="/orders/abc-123">
        <Text>View Order</Text>
      </Link>
      <Button onPress={() => router.push('/orders/new')}>
        New Order
      </Button>
    </>
  );
}
```

| Rule                                    | Rationale                                |
| --------------------------------------- | ---------------------------------------- |
| Use `solito/router` for navigation      | Works on both Expo and Next.js           |
| Use `solito/link` for links             | Renders `<a>` on web, `Pressable` native |
| Keep navigation logic in `packages/app` | Shared across platforms                  |
| Use platform files for exceptions       | `.native.tsx` / `.web.tsx` when needed   |

## Tamagui UI Components

```typescript
import { styled, YStack, XStack, Text, Button } from 'tamagui';

export function OrderCard({ order }: { order: Order }) {
  return (
    <YStack padding="$4" borderRadius="$4" backgroundColor="$background">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$5" fontWeight="bold">Order #{order.id}</Text>
        <Text color="$colorSubtle">{order.status}</Text>
      </XStack>
      <Button theme="active" marginTop="$3">View Details</Button>
    </YStack>
  );
}
```

| Rule                                     | Rationale                                |
| ---------------------------------------- | ---------------------------------------- |
| Use Tamagui tokens (`$4`, `$background`) | Consistent theming across platforms      |
| Use `YStack`/`XStack` over `View`        | Built-in flex layout with Tamagui tokens |
| Define variants with `styled()`          | Compile-time optimisation                |
| Keep UI components in `packages/ui`      | Shared across all apps                   |
| Use `tamagui.config.ts` for tokens       | Single source of truth for design tokens |

## Platform-Specific Code

| Pattern        | When to use                           |
| -------------- | ------------------------------------- |
| `.native.tsx`  | React Native only (iOS + Android)     |
| `.web.tsx`     | Web only (Next.js)                    |
| `.ios.tsx`     | iOS only                              |
| `.android.tsx` | Android only                          |
| No suffix      | Shared across all platforms (default) |

## Cloudflare Workers Deployment

| Rule                                  | Rationale                         |
| ------------------------------------- | --------------------------------- |
| Keep server functions edge-compatible | No Node.js APIs in Workers        |
| Use D1 for database                   | Cloudflare's edge SQL database    |
| Use KV for caching                    | Low-latency key-value at the edge |
| Use R2 for file storage               | S3-compatible object storage      |
| Test with `wrangler dev` locally      | Matches production environment    |

## Rules

| Rule                                | Rationale                             |
| ----------------------------------- | ------------------------------------- |
| Shared code lives in `packages/`    | Maximum code reuse across platforms   |
| Platform code lives in `apps/`      | Platform-specific entry points only   |
| Use Bun as package manager          | Faster installs, native TypeScript    |
| Test on both platforms regularly    | Catch platform-specific issues early  |
| Use Expo EAS for native builds      | Managed build infrastructure          |
| Keep tRPC routers in `packages/api` | Shared between web and native clients |
