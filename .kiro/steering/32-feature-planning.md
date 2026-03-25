---
inclusion: manual
---

# Feature Planning Workflow

Reference with `#feature-planning` when planning a new feature, reviewing a draft spec, or pressure-testing a proposed implementation before code is written.

## Goal

Turn vague feature ideas into buildable, bounded plans with clear reuse strategy, failure handling, and rollout posture.

## Phase 1: Premise Challenge

Before discussing implementation, answer these questions:

1. Is this the right problem to solve, or is it a proxy for a more valuable problem?
2. What user or business outcome matters most?
3. What happens if we do nothing?
4. What already exists in the codebase that partially solves this?
5. Which parts of the request are confirmed needs versus assumptions?

Required framing:

```text
CURRENT STATE        -> THIS PLAN         -> IDEAL FUTURE STATE
[today's reality]       [planned delta]      [12-month target]
```

## Phase 2: Scope Mode

Choose one mode and stay consistent throughout the review:

| Mode               | Use When                           | Review Behaviour                              |
| ------------------ | ---------------------------------- | --------------------------------------------- |
| `Expansion`        | Greenfield or strategic feature    | Surface adjacent opportunities worth adding   |
| `Hold Scope`       | Most feature work                  | Make the current plan rigorous and complete   |
| `Reduction`        | Large or risky plan                | Cut to the smallest version that still works  |

Default recommendations:

- Greenfield feature -> `Expansion`
- Bug fix or hotfix -> `Hold Scope`
- Refactor -> `Hold Scope`
- Plan touching many subsystems -> `Reduction`

## Phase 3: Reuse Inventory

Every plan must include a `What Already Exists` section.

For each sub-problem:

| Sub-problem | Existing file/module | Reuse, extend, or replace? | Notes |
| ----------- | -------------------- | -------------------------- | ----- |

Rules:

- Search the codebase before proposing new abstractions
- Prefer extending proven paths over parallel implementations
- If you choose to replace existing code, state why reuse is insufficient

## Phase 4: Architecture Review

Design review must cover:

- component boundaries
- request and data flow
- state transitions
- security and trust boundaries
- observability
- deployment and rollback posture

Required for non-trivial work:

```text
[Client/UI] -> [Route/API] -> [Service] -> [DB/External]
                  |              |
                  v              v
              [AuthZ]        [Logging]
```

For every new flow, trace all four paths:

| Path        | Question to answer                          |
| ----------- | ------------------------------------------- |
| Happy path  | What happens when everything works?         |
| Nil path    | What happens when required data is missing? |
| Empty path  | What happens when data exists but is empty? |
| Error path  | What happens when a dependency fails?       |

If a feature introduces state, add a state machine diagram or table.

## Phase 5: Failure Modes Registry

Every plan must identify the main failure modes before implementation.

Use this format:

| Codepath | Failure mode | Handling | User sees | Test coverage |
| -------- | ------------ | -------- | --------- | ------------- |

Flag any row that has:

- no explicit handling
- no test plan
- silent failure risk

Those are release blockers until addressed or explicitly deferred.

## Phase 6: Required Plan Outputs

Every reviewed feature plan or `design.md` should contain:

1. `Premise Challenge`
2. `Scope Mode`
3. `What Already Exists`
4. `Architecture`
5. `Failure Modes Registry`
6. `NOT in Scope`
7. `Deployment and Rollback`

## Interaction Rules

- One issue per question
- If the fix is obvious, apply it instead of asking
- If there is a real trade-off, present 2-3 options and recommend one
- Prefer complete handling within approved scope over knowingly partial plans

## Output Checklist

Before concluding a planning review, confirm:

- The core problem is clearly framed
- Scope mode is explicit
- Existing reusable code has been identified
- Main failure modes are mapped
- Rollout and rollback steps exist
- Deferred work is listed in `NOT in Scope`
