---
inclusion: fileMatch
fileMatchPattern:
  - "**/api/**/*.ts"
  - "**/middleware/**/*.ts"
  - "**/services/**/*.ts"
  - "**/lib/**/*.ts"
  - "**/components/**/*.tsx"
---

# Error Handling Standards

Reuse existing error infrastructure. Never create new error classes without justification.

## Decision Flow

When handling errors, follow this order:

1. **Identify error type** → Client, server, or external service?
2. **Use existing class** → Extend what exists
3. **Include context** → Code, message, details
4. **Wrap async handlers** → Use error middleware for routes

## Error Response Format

All API errors should return a consistent structure:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "request_id": "uuid"
  }
}
```

## Mandatory Rules

| Rule                 | Correct                         | Incorrect                      |
| -------------------- | ------------------------------- | ------------------------------ |
| Never swallow errors | Log or re-throw                 | Empty catch block              |
| Use specific codes   | `VALIDATION_ERROR`, `NOT_FOUND` | `ERROR`, `FAILED`              |
| Include context      | `{ field, reason }`             | Generic "Something went wrong" |
| Sanitise messages    | `"Invalid format"`              | `"Invalid: ${userInput}"`      |
| Hide internals       | `"Database error"`              | Stack traces, SQL, file paths  |

## Anti-Patterns

| Avoid                           | Instead                                |
| ------------------------------- | -------------------------------------- |
| `throw new Error("Not found")`  | Use typed error factory methods        |
| `catch (e) { /* ignore */ }`    | `catch (e) { logger.error(e); throw }` |
| Returning `{ error: "failed" }` | Use standard response format           |
