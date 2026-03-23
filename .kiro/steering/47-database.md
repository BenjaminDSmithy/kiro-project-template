---
inclusion: fileMatch
fileMatchPattern:
  - "**/db/**/*.ts"
  - "**/schema/**/*.ts"
  - "**/migrations/**/*.sql"
  - "**/supabase/**/*.sql"
---

# Database Design Standards

Schema conventions, indexing strategies, and migration best practices for Supabase + Drizzle ORM.

## Naming Conventions

| Element          | Convention     | Example                    |
| ---------------- | -------------- | -------------------------- |
| Table names      | snake_case, plural | `user_profiles`        |
| Column names     | snake_case     | `created_at`, `first_name` |
| Primary keys     | `id` (uuid)    | `id uuid PRIMARY KEY`     |
| Foreign keys     | `{table}_id`   | `user_id`, `order_id`     |
| Junction tables  | `{table1}_{table2}` | `user_roles`          |
| Indexes          | `idx_{table}_{columns}` | `idx_orders_user_id` |
| Unique constraints | `uq_{table}_{columns}` | `uq_users_email`  |

## Required Columns

Every table must include:

| Column       | Type                          | Purpose              |
| ------------ | ----------------------------- | -------------------- |
| `id`         | `uuid` with `defaultRandom()` | Primary key          |
| `created_at` | `timestamp with time zone`    | Record creation time |
| `updated_at` | `timestamp with time zone`    | Last modification    |

## Indexing Strategy

| Index when                          | Skip when                        |
| ----------------------------------- | -------------------------------- |
| Column used in WHERE clauses        | Table has < 1000 rows            |
| Column used in JOIN conditions      | Column has very low cardinality  |
| Column used in ORDER BY             | Column is rarely queried         |
| Foreign key columns (always)        | Already covered by primary key   |

## Migration Best Practices

| Rule                                | Rationale                                |
| ----------------------------------- | ---------------------------------------- |
| One concern per migration           | Easier to review and rollback            |
| Always write down migrations        | Never rely on auto-rollback              |
| Test migrations on a copy first     | Prevent production data loss             |
| Never modify existing migrations    | Create new ones to fix issues            |
| Use transactions for DDL changes    | Atomic schema changes                    |

## Query Patterns

| Pattern                    | Use                                      | Avoid                          |
| -------------------------- | ---------------------------------------- | ------------------------------ |
| Drizzle query builders     | All application queries                  | Raw SQL in app code            |
| Parameterised queries      | Always                                   | String interpolation           |
| Select specific columns    | `select({ id, name })`                   | `select()` (all columns)      |
| Pagination                 | `limit().offset()` or cursor-based       | Fetching all rows              |
| Batch operations           | `insert().values([...])`                 | Loop of individual inserts     |

## Supabase-Specific

- Enable RLS on every table — no exceptions
- Use `auth.uid()` in RLS policies for user-scoped access
- Create database functions for complex business logic
- Use Supabase Realtime only for genuinely real-time features
- Store all timestamps in UTC with timezone
