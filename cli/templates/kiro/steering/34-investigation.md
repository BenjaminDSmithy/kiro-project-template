---
inclusion: manual
---

# Investigation Workflow

Reference with `#investigation` when debugging an issue, explaining a failure, or fixing a bug that does not yet have a confirmed root cause.

## Iron Law

Do not edit production code until a root-cause hypothesis exists.

Symptom-chasing creates follow-up bugs, wider diffs, and false fixes.

## Phases

| Phase          | Goal                                              |
| -------------- | ------------------------------------------------- |
| Reproduce      | Confirm the bug is real and repeatable            |
| Isolate        | Narrow the failing area, inputs, and boundaries   |
| Hypothesise    | State the most likely root cause                  |
| Confirm        | Gather evidence that proves or disproves it       |
| Implement      | Fix the root cause, not the symptom               |
| Verify         | Re-run repro steps and add regression coverage    |

## Step 1: Reproduce

Capture:

- exact trigger
- expected behaviour
- actual behaviour
- logs, stack traces, or failing tests
- whether the issue is a regression

If the bug is not reproducible, do not guess. Document what is missing.

## Step 2: Isolate

Reduce the problem:

- which layer fails: UI, route, service, DB, external API
- which inputs trigger it
- whether it affects all users or a subset
- whether a recent diff likely introduced it

Prefer the narrowest file or module scope that can explain the failure.

## Step 3: Root-Cause Hypothesis

State the suspected cause explicitly:

```text
Hypothesis:
WHEN [trigger] THEN [component] fails because [reason].
Evidence:
- ...
```

If there are multiple plausible causes, rank them and test the most likely first.

## Step 4: Confirm

Use one of:

- targeted logging
- focused test reproduction
- debugger or trace inspection
- narrowed code-path inspection

Do not move to implementation until the evidence matches the hypothesis.

## Step 5: Implement the Fix

Rules:

- Fix the root cause, not downstream symptoms
- Keep the diff as small as possible
- Avoid unrelated clean-up during bug fixing
- Add or update a regression test for the failing path

## Step 6: Verify

Before closing the investigation, confirm:

- original repro now passes
- unchanged behaviour still holds
- regression test exists where appropriate
- logs and error handling remain sane

## Escalation

Escalate instead of thrashing:

- after 3 failed fix attempts
- if the root cause remains unclear
- if the fix requires risky cross-cutting changes
- if security-sensitive behaviour is involved and confidence is low

Escalation format:

```text
STATUS: BLOCKED | NEEDS_CONTEXT
REASON: ...
ATTEMPTED: ...
NEXT BEST STEP: ...
```

## Integration with Bug Tracking

If the issue belongs to a spec:

- document it in that spec's `bugs.md`
- link failing tests or repro steps
- add a focused bug-fix task instead of silently widening another task
