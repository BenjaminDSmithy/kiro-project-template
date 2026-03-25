# Logging & Observability Standards

Structured logging patterns for consistent, searchable, and actionable logs.

## Log Levels

| Level   | When to use                                | Example                          |
| ------- | ------------------------------------------ | -------------------------------- |
| `error` | Unrecoverable failures requiring attention | DB connection lost, auth failure |
| `warn`  | Recoverable issues or degraded behaviour   | Rate limit approaching, retry    |
| `info`  | Significant business events                | User created, order placed       |
| `debug` | Development-only detail                    | Query params, intermediate state |

## Structured Log Format

Always log as structured JSON — never plain strings:

```typescript
logger.info("Order created", {
  orderId: order.id,
  userId: user.id,
  total: order.total,
  currency: order.currency,
  timestamp: new Date().toISOString(),
});
```

## Required Fields

Every log entry must include:

| Field       | Purpose                            |
| ----------- | ---------------------------------- |
| `timestamp` | UTC ISO 8601                       |
| `level`     | error, warn, info, debug           |
| `message`   | Human-readable description         |
| `requestId` | Correlation ID for request tracing |
| `service`   | Service or module name             |

## Rules

| Rule                              | Implementation                             |
| --------------------------------- | ------------------------------------------ |
| Never log secrets                 | Redact tokens, passwords, API keys         |
| Never log PII in production       | Mask email, phone, names                   |
| Use correlation IDs               | Pass `requestId` through all service calls |
| Log at boundaries                 | API entry/exit, external service calls     |
| Include error context             | Stack trace, input that caused failure     |
| Keep debug logs out of production | Use environment-based log level filtering  |

## Error Logging

```typescript
logger.error("Payment processing failed", {
  orderId: order.id,
  provider: "stripe",
  errorCode: err.code,
  errorMessage: err.message,
  requestId: ctx.requestId,
  // Never log: card numbers, tokens, full error objects with secrets
});
```

## Performance Logging

Log slow operations for monitoring:

```typescript
const start = performance.now();
const result = await db.query(...);
const duration = performance.now() - start;

if (duration > 1000) {
  logger.warn("Slow query detected", {
    query: "getOrdersByUser",
    durationMs: Math.round(duration),
    userId: user.id,
  });
}
```
