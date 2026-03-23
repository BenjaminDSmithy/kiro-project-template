---
inclusion: fileMatch
fileMatchPattern:
  - "**/api/**/*.ts"
  - "**/app/api/**/*.ts"
  - "**/*.route.ts"
---

# API Standards

REST conventions for all API routes in this project.

## Endpoint Naming

| Rule                     | Correct                  | Incorrect                |
| ------------------------ | ------------------------ | ------------------------ |
| Plural resource names    | `/api/users`             | `/api/user`              |
| Kebab-case paths         | `/api/user-profiles`     | `/api/userProfiles`      |
| No verbs in URLs         | `POST /api/orders`       | `POST /api/create-order` |
| Nested for relationships | `/api/users/{id}/orders` | `/api/user-orders`       |

## HTTP Methods

| Method   | Purpose                 | Idempotent | Response Code |
| -------- | ----------------------- | ---------- | ------------- |
| `GET`    | Retrieve resource(s)    | Yes        | 200           |
| `POST`   | Create new resource     | No         | 201           |
| `PUT`    | Replace entire resource | Yes        | 200           |
| `PATCH`  | Partial update          | Yes        | 200           |
| `DELETE` | Remove resource         | Yes        | 204           |

## Response Format

All responses use a consistent envelope:

```typescript
// Success
{ data: T, meta?: { page: number, total: number } }

// Error
{
  success: false,
  data: null,
  error: {
    code: "VALIDATION_ERROR",
    message: "Human-readable message",
    details: { field: "email", reason: "Invalid format" },
    requestId: "uuid"
  }
}
```

## Status Codes

| Code | Meaning               | When to use                          |
| ---- | --------------------- | ------------------------------------ |
| 200  | OK                    | Successful GET, PUT, PATCH           |
| 201  | Created               | Successful POST                      |
| 204  | No Content            | Successful DELETE                    |
| 400  | Bad Request           | Validation errors, malformed input   |
| 401  | Unauthorised          | Missing or invalid authentication    |
| 403  | Forbidden             | Authenticated but insufficient perms |
| 404  | Not Found             | Resource does not exist              |
| 409  | Conflict              | Duplicate resource, state conflict   |
| 422  | Unprocessable Entity  | Valid syntax but semantic errors     |
| 429  | Too Many Requests     | Rate limit exceeded                  |
| 500  | Internal Server Error | Unexpected server failure            |

## Validation

- Validate all input at the API boundary using Zod schemas
- Return 400 with field-level error details
- Never trust client-side validation alone

## Pagination

```typescript
// Request: GET /api/users?page=1&limit=20
// Response:
{
  data: User[],
  meta: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8
  }
}
```

## Authentication

- All non-public endpoints require a valid Supabase Auth token
- Pass token via `Authorization: Bearer <token>` header
- Validate server-side on every request — never cache auth state
