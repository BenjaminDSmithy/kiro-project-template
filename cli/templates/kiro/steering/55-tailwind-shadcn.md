---
inclusion: fileMatch
fileMatchPattern:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.css"
  - "tailwind.config.*"
  - "components.json"
---

# Tailwind CSS & shadcn/ui Standards

Conventions for styling with Tailwind CSS and composing with shadcn/ui components.

## shadcn/ui Usage

| Rule                                | Implementation                              |
| ----------------------------------- | ------------------------------------------- |
| Reuse existing components first     | Check `src/components/ui/` before creating  |
| Extend via composition, not forking | Wrap shadcn components, don't modify source |
| Use `cn()` for conditional classes  | `cn("base-class", condition && "extra")`    |
| Follow shadcn naming conventions    | `button.tsx`, `dialog.tsx`, `card.tsx`      |
| Keep variants in the component      | Use `cva()` for variant definitions         |

## cn() Utility

Always use `cn()` from `@/lib/utils` for merging Tailwind classes:

```typescript
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
```

## Tailwind Conventions

| Pattern    | Correct                         | Avoid                         |
| ---------- | ------------------------------- | ----------------------------- |
| Responsive | `sm:`, `md:`, `lg:` prefixes    | CSS media queries             |
| Dark mode  | `dark:` prefix                  | Separate dark stylesheets     |
| Spacing    | Tailwind scale (`p-4`, `gap-6`) | Arbitrary values (`p-[17px]`) |
| Colours    | Design tokens (`bg-primary`)    | Raw hex (`bg-[#1a2b3c]`)      |
| Typography | `text-sm`, `font-medium`        | Inline font-size styles       |
| Layout     | Flexbox/Grid utilities          | Float-based layouts           |

## Component Composition Pattern

```typescript
// Compose shadcn primitives into feature components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order #{order.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{order.status}</p>
        <Button variant="outline" size="sm">View Details</Button>
      </CardContent>
    </Card>
  );
}
```

## Rules

| Rule                                   | Rationale                               |
| -------------------------------------- | --------------------------------------- |
| No inline styles                       | Use Tailwind classes exclusively        |
| No custom CSS unless absolutely needed | Tailwind covers 99% of cases            |
| Use design tokens for colours          | Consistent theming, dark mode support   |
| Mobile-first responsive design         | Start with base, add `sm:`, `md:`, etc. |
| Avoid `@apply` in CSS files            | Defeats the purpose of utility-first    |
| Keep class lists readable              | One concern per line in multi-line JSX  |
