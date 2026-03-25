# AGENTS.md

This file is the portable base layer for coding agents working in this repository.

If host-specific files also exist, follow them in addition to this file:

- `.codex/`
- `.kiro/`
- `.claude/`
- `.cursor/`
- `.gemini/`

Use the closest `AGENTS.md` to the files you edit. More specific instructions override broader ones.

## Working Style

- Keep changes scoped to the user request.
- Read the nearby docs and code before editing.
- Prefer fast search tools such as `rg` and targeted file reads over broad scans.
- Do not rewrite or reformat unrelated code while solving a focused task.
- Ask before destructive actions, force pushes, schema resets, or adding new production dependencies.

## Repo Discovery

- Start with `README.md`, relevant files in `docs/`, and the nearest host-specific config.
- Use `package.json`, lockfiles, task files, and CI config as the source of truth for available commands.
- If `.kiro/specs/` exists for the current work, stay aligned with the active spec instead of inventing parallel scope.

## Editing Rules

- Fix the root cause when practical, not just the visible symptom.
- Keep comments short and only add them when they clarify non-obvious logic.
- Update docs when behavior, interfaces, workflows, or setup steps change.
- Preserve user changes you did not make. Do not revert unrelated modifications.

## Verification

- Run the smallest relevant checks after making changes.
- Expand to broader validation when the change crosses boundaries or affects release behavior.
- If you could not run a useful check, say so clearly in the handoff.

## Handoff

- Report concrete outcomes, not just intent.
- Call out residual risk, skipped checks, or follow-up work explicitly.
