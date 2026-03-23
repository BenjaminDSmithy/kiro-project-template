# Database Connection Management - Bugs

## Overview

This document tracks bugs discovered during implementation and testing of the database connection management feature.

**Spec**: database-connection-management
**Created**: 2026-02-23

---

## Active Bugs

(No active bugs)

---

## Resolved Bugs

### BUG-002: SemaphoreFullException - Connection Returned to Pool Multiple Times

**Status**: Resolved
**Severity**: Critical
**Discovered**: 2026-02-23
**Resolved**: 2026-02-23
**Discovered By**: Task 6.7.1 integration tests
**Affects**: MySqlConnectionContext connection pooling

**Description**:
The connection pool semaphore was being released more times than it was acquired, causing a `SemaphoreFullException`. This indicated a fundamental misunderstanding of what the semaphore should represent in the connection pool architecture.

**Root Cause**:
The semaphore logic was incorrect. The initial implementation tried to use the semaphore to track "available slots for new connections" rather than "how many connections can be active simultaneously". This caused:
1. When reusing a connection from the available pool, the semaphore was NOT acquired
2. When returning that connection, the semaphore WAS released
3. This caused the semaphore count to exceed its maximum

**Resolution**:
Corrected the semaphore logic to properly represent "how many connections can be active simultaneously":
1. **Always acquire semaphore first** when getting a connection (whether reusing or creating new)
2. Try to reuse from available pool
3. Create new connection if no valid connection available
4. **Always release semaphore** when returning connection to pool

This ensures:
- Pool never exceeds max size
- Waiting threads get unblocked when connections are returned
- Semaphore count accurately reflects available connection capacity

**Files Modified**:
- `src/###########.Infrastructure/MySql/MySqlConnectionContext.cs` - Fixed `GetConnectionAsync()` to always wait on semaphore first

**Commit**: fix: resolve BUG-002 - correct semaphore logic for connection pooling

### BUG-001: InvalidCastException - MySqlConnector vs MySql.Data.MySqlClient Type Mismatch

**Status**: Resolved
**Severity**: Critical
**Discovered**: 2026-02-23
**Resolved**: 2026-02-23
**Discovered By**: Task 6.7.1 integration tests
**Affects**: MySqlDataStore transaction operations

**Description**:
When using the IConnectionContext constructor path, MySqlDataStore attempted to cast `MySqlConnector.MySqlConnection` to `MySql.Data.MySqlClient.MySqlConnection`, causing an `InvalidCastException`.

**Root Cause**:
The codebase had both `MySql.Data` (legacy Oracle driver) and `MySqlConnector` (modern driver) referenced. The connection context used `MySqlConnector`, but MySqlDataStore and related classes were importing and using `MySql.Data.MySqlClient`.

**Resolution**:
1. Replaced all `using MySql.Data.MySqlClient;` statements with `using MySqlConnector;` across the codebase
2. Updated files:
   - `MySqlDataStore.cs`
   - `MySqlConnectionContext.cs`
   - `MySqlTransactionContext.cs`
   - `MySqlInsertBuilder.cs`
   - `MySqlUpdateBuilder.cs`
   - `MySqlQueryBuilder.cs`
   - `MySqlMigrationRunner.cs`
   - `MySqlDataStoreTransaction.cs`
   - Test files in `###########.Security.Tests`
3. Added transaction association to all MySqlCommand instances when a transaction is active
4. Verified code compiles successfully

**Commit**: fix: resolve BUG-001 - MySqlConnector vs MySql.Data.MySqlClient type mismatch

---

## Bug Tracking Process

### When to Create a Bug Entry

Create a bug entry when:
1. Tests reveal unexpected behavior in implemented code
2. Integration tests fail due to implementation issues
3. Property-based tests find edge cases that break the implementation
4. Code review identifies correctness issues

### Bug Entry Format

Each bug entry should include:
- **Status**: Open, In Progress, Resolved, Closed
- **Severity**: Critical, High, Medium, Low
- **Discovered**: Date
- **Discovered By**: Task, test, or review that found the bug
- **Affects**: Component or feature affected
- **Description**: Clear description of the bug
- **Error Message**: Exact error message (if applicable)
- **Location**: File and line number
- **Reproduction**: Steps to reproduce
- **Root Cause**: Analysis of why the bug occurs
- **Impact**: What functionality is blocked or broken
- **Related Tests**: Tests that fail due to this bug
- **Proposed Fix**: Suggested approach to fix
- **Related Tasks**: Tasks that introduced or are blocked by the bug

### Bug Resolution Process

1. **Identify**: Bug discovered during testing or review
2. **Document**: Create bug entry in bugs.md
3. **Analyze**: Investigate root cause
4. **Fix**: Implement fix in code
5. **Test**: Verify fix resolves the issue
6. **Update**: Move bug to "Resolved Bugs" section with resolution details
7. **Commit**: Include bug reference in commit message (e.g., "fix: resolve BUG-001")

---

## Statistics

- **Total Bugs**: 2
- **Open**: 0
- **In Progress**: 0
- **Resolved**: 2
- **Critical**: 0
- **High**: 0
- **Medium**: 0
- **Low**: 0

---

**Document Version**: 1.0
**Last Updated**: 2026-02-23
**Status**: Active

