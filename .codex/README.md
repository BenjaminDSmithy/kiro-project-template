# Codex Project Config

This directory contains project-scoped Codex configuration for this starter kit.

Included:

- `config.toml`: project-level agent limits
- `agents/`: custom or overridden subagents for implementation, review, QA, docs, and release checks
- `rules/`: command approval and safety rules for destructive actions and release workflows
- `../.agents/skills/`: repository-scoped Codex skills shared with the team

The portable base instructions live in [`AGENTS.md`](../AGENTS.md). Keep cross-tool guidance there, and reserve `.codex/` for Codex-specific behavior.

Suggested customization points after scaffolding:

- tighten or relax command rules in `rules/`
- tune agent descriptions and instructions in `agents/`
- add or trim repository skills in `../.agents/skills/`
- remove roles you do not plan to use regularly
- add nested `AGENTS.override.md` files in large subprojects

## Included Agents

- `worker`: scoped implementation and follow-through
- `explorer`: read-only codebase mapping and evidence gathering
- `reviewer`: correctness/security/test review
- `qa_auditor`: QA plan and regression-risk audit
- `docs_researcher`: docs and API consistency checks
- `release_guard`: release-readiness review across versioning, changelog, and rollout notes

## Included Rule Packs

- `publish.rules`: prompts before common publish commands
- `release.rules`: prompts before tagging and release creation
- `force-push.rules`: prompts before force-push variants
- `safety.rules`: blocks or prompts before destructive cleanup commands
