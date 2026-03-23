---
inclusion: always
---

# Bug Tracking Workflow

When bugs are discovered during implementation or testing, defer fixing them to maintain focus on the current task. Document them in `bugs.md` and add bug fix tasks to `tasks.md`.

## When to Create a Bug Entry

Create a bug entry when:

- Tests reveal unexpected behaviour in implemented code
- Integration tests fail due to implementation issues (not test issues)
- Property-based tests find edge cases that break the implementation
- Code review identifies correctness issues in completed tasks
- Existing functionality breaks due to new changes

## Bug File Location

Each spec has its own bug tracker: `.kiro/specs/{feature-name}/bugs.md`

## Bug Entry Format

```markdown
### BUG-XXX: Brief Description

**Status**: Open | In Progress | Resolved | Closed | Deferred | Won't Fix
**Severity**: Critical | High | Medium | Low
**Discovered**: YYYY-MM-DD
**Discovered By**: Task X.Y, test name, or review
**Affects**: Component or feature affected

**Description**: Clear description of the bug and its symptoms.

**Error Message**:
Exact error message if applicable

**Location**:

- File: `path/to/file.ts`
- Line: XXX (in `functionName()`)

**Reproduction**:

1. Step-by-step instructions to reproduce
2. Include minimal code example if helpful
3. Note any specific conditions required

**Root Cause**: Analysis of why the bug occurs (if known).

**Impact**:

- What functionality is blocked or broken
- Which tasks are affected
- User-facing impact (if any)

**Related Tests**:

- List of tests that fail due to this bug

**Proposed Fix**: Suggested approach to resolve the bug.

**Related Tasks**:

- Tasks that introduced the bug
- Tasks that are blocked by the bug
```

## Severity Guidelines

| Severity | Criteria                                                     |
| -------- | ------------------------------------------------------------ |
| Critical | Blocks major tasks, data corruption, core unusable, security |
| High     | Blocks specific tasks, incorrect important behaviour         |
| Medium   | Edge case issues, minor performance, non-critical features   |
| Low      | Cosmetic, minor inconvenience, rarely-used features          |

## Bug Status Lifecycle

```text
Open → In Progress → Resolved → Closed
  ↓         ↓
Deferred  Won't Fix
```

## Integration with Task Management

When bugs are discovered during a task:

1. Document the bug in `bugs.md` immediately
2. Do NOT stop the current task to fix it
3. Add a bug fix task to `tasks.md` under a "Bug Fixes" phase
4. Continue with the current task

When bugs block a task:

1. Note the blocker in the task: `Note: Blocked by BUG-XXX — see bugs.md`
2. Move to the next unblocked task
3. Return to blocked tasks after bug fix tasks are completed

When bugs are found in completed tasks:

- Do NOT modify the completed task's status
- Create bug entry in `bugs.md`
- Add a new bug fix task referencing the original task

## Commit Message Format

```text
fix({scope}): resolve BUG-XXX - brief description

- What was fixed
- Root cause
- Related changes

Fixes: BUG-XXX
Related: Task X.Y
```

## Statistics Section

Maintain at the bottom of `bugs.md`:

```markdown
## Statistics

- **Total Bugs**: X
- **Open**: X | **In Progress**: X | **Resolved**: X | **Closed**: X
- **Critical**: X | **High**: X | **Medium**: X | **Low**: X
```

## Rules

| Rule                                     | Rationale                                   |
| ---------------------------------------- | ------------------------------------------- |
| Always defer bug fixes during tasks      | Maintains agent focus on current work       |
| Document bugs immediately when found     | Details are freshest at discovery time      |
| Never skip documentation for small bugs  | Small bugs compound into big problems       |
| Never mark bugs resolved without tests   | Untested fixes often reintroduce the bug    |
| Never delete resolved bug entries        | Move to "Resolved Bugs" section for history |
| Update statistics on every status change | Keeps the overview accurate                 |
