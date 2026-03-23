---
title: "Kiro Best Practices"
inclusion: manual
description: "Best practices for working with Kiro — spec-driven development, steering files, hooks, chat/context, quality, MCP, and AI collaboration tips."
tags: ["kiro", "best-practices", "specs", "hooks", "workflow"]
version: "1.0.0"
---

Reference this file with `#kiro-best-practices` when you want Kiro to follow these patterns.

## RULES

You MUST follow these rules across all interactions in this repo:

1. You MUST start with a spec (requirements → design → tasks) before writing any implementation code.
2. You MUST reference requirement numbers in every task using `_Requirements: X.Y_` notation.
3. You MUST NOT commit secrets, API keys, passwords, or tokens — use `CHANGE_ME` placeholders.
4. You MUST NOT retry a tool call that was denied by a `preToolUse` hook.

## Spec-Driven Development

- **1.** Always start with a spec before writing any code — requirements first, then design, then tasks.
- **2.** Write requirements in plain language before thinking about implementation.
- **3.** Keep requirements atomic — one testable condition per criterion.
- **4.** Never skip the design phase; it prevents scope creep and rework.
- **5.** Break tasks into small, independently completable units.
- **6.** Reference requirement numbers in every task: `_Requirements: X.Y_`.
- **7.** Mark tasks complete only when all acceptance criteria are verifiably met.
- **8.** Use optional tasks (`- [ ]*`) for nice-to-haves that don't block the MVP.
- **9.** Treat specs as living documents — update them when requirements change.

## Spec Types — Choosing the Right Workflow

- **10.** Use requirements-first for net-new features where the "what" is clear but the "how" is open.
- **11.** Use design-first when the architecture is already decided.
- **12.** Use bugfix specs for surgical fixes with explicit Current/Expected/Unchanged behavior sections in `bugfix.md`.
- **13.** For bugfix specs, always document what must NOT change — this prevents regressions.

## Steering Files

- **14.** Keep steering files focused — one domain per file.
- **15.** Use `inclusion: always` only for core standards that apply to every interaction.
- **16.** Use `inclusion: fileMatch` for domain-specific guidance triggered by file patterns.
- **17.** Use `inclusion: manual` for reference material pulled in on demand with `#filename`.
- **17a.** Use `inclusion: auto` with `name` and `description` for context-heavy guidance that loads automatically when the request matches the description.
- **18.** Frontmatter must be the very first thing in the file — no blank lines before `---`.
- **19.** Always explain the _why_ behind conventions, not just the _what_.
- **20.** Include concrete examples in steering files — show, don't just tell.
- **21.** Never put secrets, credentials, or sensitive data in steering files.
- **22.** Use `#[[file:path]]` references to link live project files into steering context.

## Agent Hooks

- **23.** Use `fileEdited` hooks to enforce quality on every save (lint, format, validate).
- **24.** Use `agentStop` hooks to summarise completed work or update changelogs.
- **25.** Use `preToolUse` hooks for access control — if a hook denies access, never retry.
- **26.** Use `postToolUse` hooks to review results after write operations.
- **27.** Use `userTriggered` hooks for on-demand workflows.
- **28.** Keep hook prompts specific and actionable — vague prompts produce vague results.
- **29.** Avoid circular hook dependencies (Hook A triggers Tool X which triggers Hook A again).
- **30.** Document what each hook does and why in its `description` field.
- **31.** Prefer `askAgent` for complex analysis; use `runCommand` for simple shell tasks.
- **32.** Use `preTaskExecution` hooks to inject context reminders before spec tasks start.
- **33.** Use `postTaskExecution` hooks to validate outputs after spec tasks complete.

## Chat and Context

- **34.** Use `#File` to give Kiro direct access to a specific file.
- **35.** Use `#Folder` to provide context for an entire directory.
- **36.** Use `#Problems` to share current editor diagnostics with Kiro.
- **37.** Use `#Terminal` to share terminal output for debugging.
- **38.** Use `#Git Diff` to give Kiro context on recent changes.
- **39.** Drag images into chat for visual context (diagrams, screenshots, error UIs).
- **40.** Be explicit about constraints — Kiro follows instructions better with clear boundaries.
- **41.** Reference steering files manually with `#steering-filename` for specialised context.

## Quality and Consistency

- **42.** Use kebab-case for all file and directory names.
- **43.** All `#### Acceptance Criteria` headings are never numbered.
- **44.** Requirements are numbered: `### Requirement 1: Title`.
- **45.** Keep specs minimal — only document what is needed, not everything imaginable.
- **46.** Prefer concrete paths over abstract descriptions in requirements.
- **47.** Cross-reference related requirements using `_Requirements: X.Y_` notation.

## Kiro Workflow Efficiency

- **48.** Use Autopilot mode for well-defined tasks with clear specs.
- **49.** Use Supervised mode when making changes to critical files.
- **50.** Execute one task at a time — review before moving to the next.
- **51.** Keep task descriptions actionable — start with a verb (Create, Define, Add, Configure).
- **52.** Optional tasks use `- [ ]*` syntax and are skipped in run-all-tasks mode.
- **53.** Property-based tests validate universal invariants; unit tests validate specific examples.
- **54.** Never use mocks to make tests pass — tests must validate real functionality.

## MCP and Powers

- **55.** Activate a power with `action="activate"` before calling any of its tools.
- **56.** Never guess tool names or parameters — always get them from the activate response.
- **57.** MCP configs live at `.kiro/settings/mcp.json` (workspace) or `~/.kiro/settings/mcp.json` (user).
- **58.** List `autoApprove` tool names to skip confirmation prompts for trusted operations.
- **59.** Servers reconnect automatically on config changes — no restart needed.

## General AI Collaboration

- **60.** Treat Kiro as a junior developer — provide clear context and examples.
- **61.** Spec-first prevents the "vibe coding" trap of building the wrong thing well.
- **62.** Small, frequent iterations beat big-bang implementations every time.
- **63.** When Kiro's output is wrong, check the steering files first — missing context is usually the cause.
