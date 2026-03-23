---
inclusion: fileMatch
fileMatchPattern:
  - "next.config.*"
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
  - "**/*.css"
---

# Performance Budget Standards

Core Web Vitals targets, bundle size limits, and optimisation patterns.

## Core Web Vitals Targets

| Metric | Target  | Measurement               |
| ------ | ------- | ------------------------- |
| LCP    | < 2.5s  | Largest Contentful Paint  |
| INP    | < 200ms | Interaction to Next Paint |
| CLS    | < 0.1   | Cumulative Layout Shift   |
| FCP    | < 1.8s  | First Contentful Paint    |
| TTFB   | < 800ms | Time to First Byte        |

## Bundle Size Limits

| Target                    | Limit   |
| ------------------------- | ------- |
| First-load JS (per route) | < 100kB |
| Shared JS bundle          | < 80kB  |
| Individual page JS        | < 50kB  |
| CSS per page              | < 30kB  |

## Image Optimisation

| Rule                              | Implementation                             |
| --------------------------------- | ------------------------------------------ |
| Always use `next/image`           | Automatic format, sizing, and lazy loading |
| Set explicit `width` and `height` | Prevents CLS from image loading            |
| Use `priority` for above-fold     | LCP images load immediately                |
| Use WebP/AVIF formats             | `next/image` handles this automatically    |
| Lazy load below-fold images       | Default behaviour of `next/image`          |

## Font Loading

```typescript
// Use next/font for zero-CLS font loading
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
```

| Rule                         | Rationale                       |
| ---------------------------- | ------------------------------- |
| Use `next/font`              | Self-hosted, zero layout shift  |
| Set `display: 'swap'`        | Text visible during font load   |
| Limit font weights           | Each weight adds to bundle size |
| Use variable fonts when able | One file covers all weights     |

## Dynamic Imports

Use `next/dynamic` for heavy components not needed on initial load:

```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Only if component requires browser APIs
});
```

## Rules

| Rule                                 | Rationale                                            |
| ------------------------------------ | ---------------------------------------------------- |
| Measure before optimising            | Profile first, don't guess                           |
| Use `<Suspense>` for slow data       | Stream content, don't block the page                 |
| Avoid barrel imports from large libs | `import { Button } from 'lib'` may tree-shake poorly |
| Prefer Server Components             | Zero client JS for static content                    |
| Set `loading.tsx` for every route    | Perceived performance during navigation              |
| Audit with Lighthouse regularly      | Catch regressions early                              |
