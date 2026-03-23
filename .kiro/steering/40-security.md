---
inclusion: always
---

# Security Standards

Proactive security practices for all code in this repository.

## Secrets Management

| Rule                          | Implementation                              |
| ----------------------------- | ------------------------------------------- |
| No hardcoded secrets          | Use `.env.local` or secret manager          |
| No secrets in steering/specs  | Use `CHANGE_ME` placeholders                |
| No secrets in logs            | Redact before logging                       |
| No secrets in error messages  | Return generic messages to clients          |
| Rotate compromised keys       | Immediately revoke and regenerate           |

## Input Validation

- Validate all user input at API boundaries using Zod or equivalent
- Use parameterised queries via Drizzle ORM — never interpolate user input into SQL
- Sanitise HTML output to prevent XSS (React handles this by default, but avoid `dangerouslySetInnerHTML`)
- Validate file uploads: type, size, and content
- Reject unexpected fields — use strict schemas, not permissive ones

## Authentication and Authorisation

- Use Supabase Auth for all authentication flows
- Enforce Row Level Security (RLS) on all Supabase tables
- Check authorisation server-side — never trust client-side checks alone
- Use short-lived tokens with refresh rotation
- Implement CSRF protection for state-changing operations

## HTTP Security Headers

Required headers for all responses:

| Header                    | Value                                      |
| ------------------------- | ------------------------------------------ |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains`    |
| `Content-Security-Policy` | Restrict to trusted sources                |
| `X-Content-Type-Options`  | `nosniff`                                  |
| `X-Frame-Options`         | `DENY` or `SAMEORIGIN`                    |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`          |
| `Permissions-Policy`      | Disable unused browser features            |

## Dependency Security

- Run `pnpm audit` before merging dependency changes
- Pin major versions in `package.json`
- Review changelogs before upgrading major versions
- Remove unused dependencies promptly
- Prefer well-maintained packages with active security response

## Data Protection

- Encrypt sensitive data at rest (Supabase handles this)
- Use TLS 1.3 for all data in transit
- Store timestamps in UTC — convert only for display
- Implement proper session management with secure cookie flags
- Follow OWASP Top 10 (2025 edition) guidelines
