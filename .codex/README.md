# Codex Project Config

This directory contains project-scoped Codex configuration for this starter kit.

Included:

- `config.toml`: project-level agent limits
- `agents/`: custom or overridden subagents
- `rules/`: command approval and safety rules

The portable base instructions live in [`AGENTS.md`](../AGENTS.md). Keep cross-tool guidance there, and reserve `.codex/` for Codex-specific behavior.

Suggested customization points after scaffolding:

- tighten or relax command rules in `rules/`
- tune agent descriptions and instructions in `agents/`
- add nested `AGENTS.md` files in large subprojects
