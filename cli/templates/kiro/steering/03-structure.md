---
inclusion: always
---

# Project Structure

<!-- TODO: Adapt to your actual project layout -->

## Decision Tree: Where Does This Code Go?

Execute in order until you find a match:

```
1. Is it a page or API route?
   → src/app/

2. Is it a reusable UI component?
   → src/components/ui/

3. Is it a feature-specific component?
   → src/components/[feature]/

4. Is it business logic or domain utility?
   → src/lib/[domain]/

5. Is it database-related?
   → src/lib/db/schema/ (ORM) or supabase/migrations/ (SQL)
```

## File Placement Matrix

| File Type         | Path Pattern                      | Example                        |
| ----------------- | --------------------------------- | ------------------------------ |
| Page              | `src/app/[route]/page.tsx`        | `src/app/dashboard/page.tsx`   |
| API Route         | `src/app/api/[endpoint]/route.ts` | `src/app/api/users/route.ts`   |
| UI Component      | `src/components/ui/[name].tsx`    | `src/components/ui/button.tsx` |
| Feature Component | `src/components/[feature]/`       | `src/components/dashboard/`    |
| Hook              | `src/hooks/use-[name].ts`         | `src/hooks/use-auth.ts`        |
| Domain Logic      | `src/lib/[domain]/`               | `src/lib/auth/session.ts`      |
| DB Schema         | `src/lib/db/schema/`              | `src/lib/db/schema/users.ts`   |
| Types             | `src/lib/types/`                  | `src/lib/types/user.ts`        |
| Validators        | `src/lib/validator/`              | `src/lib/validator/user.ts`    |

## Naming Conventions

| Element         | Convention    | Correct            | Incorrect           |
| --------------- | ------------- | ------------------ | ------------------- |
| Component file  | kebab-case    | `user-profile.tsx` | `UserProfile.tsx`   |
| Hook file       | `use-` prefix | `use-auth.ts`      | `auth-hook.ts`      |
| Barrel export   | `index.ts`    | Always required    | Direct file imports |
| DB table        | snake_case    | `user_profiles`    | `userProfiles`      |
| TypeScript type | PascalCase    | `UserProfile`      | `userProfile`       |
| Variable        | camelCase     | `userProfile`      | `user_profile`      |

## Import Order (Strict)

```typescript
// 1. External libraries (alphabetical)
import { useCallback } from "react";

// 2. Internal utilities (@/lib/)
import { cn } from "@/lib/utils";

// 3. Internal hooks (@/hooks/)
import { useAuth } from "@/hooks/use-auth";

// 4. Internal types (use `type` keyword)
import type { User } from "@/lib/types/user";

// 5. Relative imports (same feature)
import { UserCard } from "./user-card";
```

**Rule**: Always use `@/` path aliases. Always create barrel exports (`index.ts`).

## Spec Files

Location: `.kiro/specs/`

Each spec contains: `requirements.md` (or `bugfix.md` for bugfix specs), `design.md`, `tasks.md`.
