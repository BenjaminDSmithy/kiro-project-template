---
inclusion: fileMatch
fileMatchPattern:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.property.test.ts"
  - "__tests__/**/*"
  - "e2e/**/*"
---

# Testing Standards

Vitest for unit/integration tests, Playwright for E2E. Always use `--run` flag — never watch mode in CI or verification.

## Decision Flow: Which Test Type?

1. **User journey or browser interaction?** → E2E (Playwright)
2. **Multiple services (DB/Redis)?** → Integration (Vitest)
3. **Testing invariants or edge cases?** → Property (fast-check)
4. **React component?** → Unit with RTL (Vitest)
5. **Everything else** → Unit (Vitest)

## Test Structure (AAA Pattern)

All tests must follow Arrange-Act-Assert:

```typescript
describe("ModuleName", () => {
  describe("functionOrMethod", () => {
    it("should [expected behaviour] when [condition]", () => {
      // Arrange — setup test data and mocks
      const input = { name: "test" };

      // Act — execute code under test
      const result = functionUnderTest(input);

      // Assert — verify outcome
      expect(result).toMatchObject({ success: true });
    });
  });
});
```

## Property Tests (fast-check)

```typescript
import * as fc from "fast-check";

describe("Property Tests", () => {
  it("should satisfy invariant", { timeout: 30000 }, () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = myFunction(input);
        return result !== undefined;
      }),
      { numRuns: 100 },
    );
  });
});
```

| Constraint                | Value                |
| ------------------------- | -------------------- |
| Minimum timeout           | 30000ms (30 seconds) |
| Standard `numRuns`        | 100                  |
| Slow operations `numRuns` | 10-25                |

## Forbidden Patterns

| Pattern                    | Correct Alternative            |
| -------------------------- | ------------------------------ |
| `test.only()`, `it.only()` | Remove before commit           |
| `await sleep(1000)`        | `waitFor()`, `expect.poll()`   |
| `setTimeout` in assertions | `vi.advanceTimersByTime()`     |
| Missing `act()` wrapper    | Wrap state updates in `act()`  |
| Hard-coded delays          | Polling or event-based waiting |

## Pre-Commit Checklist

- [ ] No `.only()` calls in code
- [ ] All tests pass with `pnpm test -- --run`
- [ ] No hard-coded delays or sleeps
- [ ] Property tests have 30s+ timeout
- [ ] `trunk check --fix` passes on test files
