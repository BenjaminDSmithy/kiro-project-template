---
inclusion: fileMatch
fileMatchPattern:
  - "**/auth/**/*.ts"
  - "**/middleware/**/*.ts"
  - "**/api/**/*.ts"
  - "**/lib/db/schema/**/*.ts"
  - "**/policies/**/*.ts"
---

# Authorisation Standards

Enterprise role and permission architecture patterns for this project. Built on Supabase Auth + RLS with Drizzle ORM.

## Architecture Model: Hybrid RBAC

Use a layered approach combining role-based and policy-based authorisation:

```
1. Authenticate user (Supabase Auth)
2. Load user roles
3. Load role permissions
4. Merge user-specific permission overrides
5. Apply tenant restrictions (if multi-tenant)
6. Apply policy rules (ownership, resource state, time-based)
7. Grant or deny access
```

## Core Principles

| Principle                    | Implementation                                          |
| ---------------------------- | ------------------------------------------------------- |
| Least privilege              | Grant minimum permissions needed for each role          |
| Permission-based checks      | Check `can('orders.update')` not `role === 'admin'`     |
| Server-side enforcement      | Never trust client-side role/permission checks          |
| Defence in depth             | RLS + middleware + application logic, not just one layer |
| Fail closed                  | Deny by default — explicitly grant, never explicitly deny |

## Permission Granularity

Group permissions by module with CRUD granularity:

| Pattern                  | Example                                          |
| ------------------------ | ------------------------------------------------ |
| `{module}.create`        | `users.create`, `orders.create`                  |
| `{module}.read`          | `users.read`, `reports.read`                     |
| `{module}.update`        | `orders.update`, `settings.update`               |
| `{module}.delete`        | `users.delete`, `orders.delete`                  |
| `{module}.{action}`      | `orders.approve`, `reports.export`               |

Never use generic permissions like `manage` or `edit` — be specific.

## Database Schema Pattern

```typescript
// Roles
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Permissions (module-scoped)
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  module: text('module').notNull(),
  action: text('action').notNull(),
  description: text('description'),
});

// Role ↔ Permission pivot
export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]);

// User ↔ Role pivot (multi-role support)
export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').notNull(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.userId, t.roleId] })]);

// User-specific permission overrides (Hybrid RBAC)
export const userPermissions = pgTable('user_permissions', {
  userId: uuid('user_id').notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }),
  granted: boolean('granted').notNull().default(true),
}, (t) => [primaryKey({ columns: [t.userId, t.permissionId] })]);
```

## Supabase RLS Integration

Enforce authorisation at the database level:

```sql
-- Example: Users can only read their own data
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Example: Permission-based access
CREATE POLICY "orders_update" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_effective_permissions
      WHERE user_id = auth.uid()
      AND permission = 'orders.update'
    )
  );
```

| Rule                              | Implementation                              |
| --------------------------------- | ------------------------------------------- |
| Enable RLS on all tables          | `ALTER TABLE x ENABLE ROW LEVEL SECURITY`   |
| No public access by default       | Only grant via explicit policies            |
| Use views for permission lookups  | Materialise effective permissions per user   |
| Test RLS policies                 | Verify with different user roles in tests   |

## Policy-Based Authorisation

Beyond role checks, apply contextual policies:

| Policy Type     | Example                                              |
| --------------- | ---------------------------------------------------- |
| Ownership       | User can only edit their own profile                 |
| Resource state  | Orders can only be cancelled while status is pending |
| Department      | Managers can only view their department's reports     |
| Time-based      | Submissions locked after deadline                    |

## Caching Strategy

| What to cache                  | Where          | TTL        |
| ------------------------------ | -------------- | ---------- |
| User effective permissions     | Redis / memory | 5 minutes  |
| Role-permission mappings       | Redis / memory | 15 minutes |
| Tenant configuration           | Redis / memory | 30 minutes |

Invalidate cache on: role assignment change, permission update, user deactivation.

## Audit Logging

Log all authorisation-sensitive actions:

```typescript
type AuditLog = {
  userId: string;
  action: string;       // e.g. 'orders.approve'
  resourceType: string; // e.g. 'orders'
  resourceId: string;
  result: 'granted' | 'denied';
  metadata: Record<string, unknown>;
  timestamp: string;    // UTC ISO 8601
};
```

| Rule                          | Implementation                          |
| ----------------------------- | --------------------------------------- |
| Log all permission denials    | Critical for security monitoring        |
| Log sensitive data access     | Required for compliance                 |
| Store audit logs immutably    | Append-only table, no updates/deletes   |
| Include request context       | IP, user agent, request ID              |

## Anti-Patterns

| Avoid                                    | Instead                                      |
| ---------------------------------------- | -------------------------------------------- |
| `if (user.role === 'admin')`             | `if (can(user, 'users.delete'))`             |
| Hardcoded role names in components       | Permission-based UI rendering                |
| Checking permissions only in middleware   | RLS + middleware + application logic          |
| Storing permissions in JWT               | Fetch fresh permissions server-side          |
| Single role per user                     | Multi-role with permission merging           |
