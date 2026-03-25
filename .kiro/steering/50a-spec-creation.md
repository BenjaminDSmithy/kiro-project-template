---
inclusion: fileMatch
fileMatchPattern: [".kiro/specs/**/*.md"]
---

# Specification Standards

Standards for feature specifications in `.kiro/specs/`. Reference templates in `.kiro/specs/_TEMPLATE/`.

## Spec Structure

Each spec folder contains three files:

| File                       | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| `requirements.md`          | User stories + EARS acceptance criteria            |
| `bugfix.md` (bugfix specs) | Current/expected/unchanged behaviour analysis      |
| `design.md`                | Architecture + interfaces + correctness properties |
| `tasks.md`                 | Implementation checklist with effort estimates     |

For non-trivial features, `design.md` should also include:

- `Premise Challenge`
- `Scope Mode`
- `What Already Exists`
- `Failure Modes Registry`
- `NOT in Scope`
- `Deployment and Rollback`

## Folder Naming

Format: `{status}_{XX}_{kebab-name}/`

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| `📋_`  | Planned — spec complete, implementation TBD |
| `🚧_`  | In Progress — active development            |
| `⏸️_`  | On Hold — paused, awaiting dependencies     |
| `✅_`  | Complete — fully implemented                |

## EARS Patterns (Mandatory for Acceptance Criteria)

| Pattern      | Syntax                                           | Use For                |
| ------------ | ------------------------------------------------ | ---------------------- |
| Ubiquitous   | `THE [system] SHALL [response]`                  | Always-on requirements |
| Event-driven | `WHEN [trigger], THE [system] SHALL [response]`  | Triggered actions      |
| State-driven | `WHILE [state], THE [system] SHALL [response]`   | State-dependent        |
| Unwanted     | `IF [error], THEN THE [system] SHALL [response]` | Error handling         |
| Optional     | `WHERE [option], THE [system] SHALL [response]`  | Configurable features  |

## Correctness Properties Format

```markdown
### Property N: [Title]

_For any_ [universal quantification], [expected behaviour/outcome].
**Validates: Requirements [RX.Y]**
```

## Design Review Requirements

When a feature spans multiple components, async flows, or external integrations:

| Requirement              | Minimum Expectation                                  |
| ------------------------ | ---------------------------------------------------- |
| Premise challenge        | Confirm the problem is correctly framed              |
| Reuse inventory          | Identify existing files or services to extend        |
| Architecture             | Include an ASCII diagram                             |
| Failure modes            | Map likely failures, handling, and test coverage     |
| Scope boundaries         | Explicitly list `NOT in Scope` items                 |
| Rollout posture          | Document deployment order and rollback plan          |

Reference `32-feature-planning.md` when turning a rough idea into a real spec.

## Task Formatting

| Element         | Format                                   |
| --------------- | ---------------------------------------- |
| Phase/Epic      | `- [ ] N. [Title] (Weeks X-Y)`           |
| Sub-task        | `- [ ] N.M [Title]` (2-space indent)     |
| Requirement ref | `_Requirements: R1, R2_ \| _Effort: 1h_` |
| Checkpoint      | `- [ ] N. Checkpoint - [Description]`    |
| Completed       | `- [x] N.M [Title]`                      |

## Effort Estimates (AI-Accelerated)

| Complexity | Time  | Examples                     |
| ---------- | ----- | ---------------------------- |
| Simple     | 30min | CRUD, basic UI, config       |
| Medium     | 1h    | Integrations, complex UI     |
| Complex    | 2h    | Algorithms, architecture     |
| V.Complex  | 3h    | AI features, billing, mobile |
