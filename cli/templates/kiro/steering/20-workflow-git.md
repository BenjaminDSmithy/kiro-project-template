---
inclusion: always
---

# Git Workflow & Commit Standards

## Commit Message Format

```
<type>(<scope>): <subject>
```

| Component | Required | Allowed Values                                                             |
| --------- | -------- | -------------------------------------------------------------------------- |
| type      | Yes      | `feat` `fix` `docs` `style` `refactor` `test` `chore` `perf` `build` `ci`  |
| scope     | Yes      | Project-specific scopes (e.g., `api`, `auth`, `db`, `ui`, `docs`, `tests`) |

### Title Rules

| Rule           | Correct                             | Incorrect                     |
| -------------- | ----------------------------------- | ----------------------------- |
| Length         | ≤50 characters                      | Long descriptive sentences    |
| Mood           | Imperative (`add`, `fix`, `update`) | Past tense (`added`, `fixed`) |
| Capitalisation | Lowercase first letter              | `Add new feature`             |
| Punctuation    | No trailing period                  | `add new feature.`            |

### Body Format

- Line length: ≤70 characters
- Blank line required after title

## Required Commit Body Sections

**Always include:**

| Section              | Content                                 |
| -------------------- | --------------------------------------- |
| `📝 Summary:`        | 1-3 bullet points describing the change |
| `📦 Files Modified:` | File paths with change magnitude        |
| `📊 Code Changes:`   | Insertions/deletions count (net change) |

**Include when applicable (omit if empty):**

| Section                      | When to Include                        |
| ---------------------------- | -------------------------------------- |
| `⚠️ Breaking Changes:`       | API changes requiring consumer updates |
| `🔧 Technical Improvements:` | Implementation details worth noting    |
| `🗄 Database:`               | Schema or migration changes            |
| `🔒 Security:`               | Security-related fixes                 |
| `➕ Files Added:`            | New files created                      |

## File Change Magnitude Descriptors

| Descriptor                | Lines Changed |
| ------------------------- | ------------- |
| `minor updates`           | <20           |
| `substantial changes`     | 20-100        |
| `significant refactor`    | 100-300       |
| `substantial restructure` | >300          |

## Commit Workflow

| Step | Action                                      |
| ---- | ------------------------------------------- |
| 1    | Check working tree status                   |
| 2    | Review all changes                          |
| 3    | Run `trunk check --fix <files>` (must pass) |
| 4    | Stage related files only                    |
| 5    | Commit with formatted message               |

## Spec Task Atomic Commits

When completing tasks from `.kiro/specs/*/tasks.md`, bundle implementation and task status in a single atomic commit.

| Rule                                | Rationale                                |
| ----------------------------------- | ---------------------------------------- |
| Never commit `tasks.md` alone       | Status must accompany implementation     |
| Never commit implementation alone   | Task completion must be tracked          |
| Reference task ID in commit message | Enables audit trail via `git log --grep` |
| One task per commit (preferred)     | Cleaner history                          |
