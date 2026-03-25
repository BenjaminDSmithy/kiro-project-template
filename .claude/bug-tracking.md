# Bug Tracking Workflow

When bugs are discovered during implementation or testing, defer fixing them to maintain focus on the current task. Document them in `bugs.md`.

## When to Create a Bug Entry

- Tests reveal unexpected behaviour in implemented code
- Integration tests fail due to implementation issues (not test issues)
- Property-based tests find edge cases that break the implementation
- Code review identifies correctness issues in completed tasks
- Existing functionality breaks due to new changes

## Bug Entry Format

```markdown
### BUG-XXX: Brief Description

**Status**: Open | In Progress | Resolved | Closed | Deferred | Won't Fix
**Severity**: Critical | High | Medium | Low
**Discovered**: YYYY-MM-DD
**Affects**: Component or feature affected

**Description**: Clear description of the bug and its symptoms.

**Location**:
- File: `path/to/file.ts`
- Line: XXX (in `functionName()`)

**Reproduction**:
1. Step-by-step instructions to reproduce

**Root Cause**: Analysis of why the bug occurs (if known).

**Impact**:
- What functionality is blocked or broken
- Which tasks are affected

**Proposed Fix**: Suggested approach to resolve the bug.
```

## Severity Guidelines

| Severity | Criteria                                                     |
| -------- | ------------------------------------------------------------ |
| Critical | Blocks major tasks, data corruption, core unusable, security |
| High     | Blocks specific tasks, incorrect important behaviour         |
| Medium   | Edge case issues, minor performance, non-critical features   |
| Low      | Cosmetic, minor inconvenience, rarely-used features          |

## Workflow Rules

| Rule                                     | Rationale                                   |
| ---------------------------------------- | ------------------------------------------- |
| Always defer bug fixes during tasks      | Maintains focus on current work             |
| Document bugs immediately when found     | Details are freshest at discovery time       |
| Never skip documentation for small bugs  | Small bugs compound into big problems       |
| Never mark bugs resolved without tests   | Untested fixes often reintroduce the bug    |
| Never delete resolved bug entries        | Move to "Resolved Bugs" section for history |

## Commit Message Format

```text
fix({scope}): resolve BUG-XXX - brief description

- What was fixed
- Root cause
- Related changes

Fixes: BUG-XXX
```
