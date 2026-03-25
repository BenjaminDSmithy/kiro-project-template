# Multi-Agent / IDE Starter Kit Direction Report

Reviewed on March 25, 2026.

## Summary

This project should not remain Kiro-only if the product goal is "starter kit for AI coding agents and agent-enabled IDEs."

The current repository is structurally a Kiro template with a scaffolding CLI:

- The product name, docs, and CLI are Kiro-branded.
- The template payload is centered on `.kiro/`.
- The CLI only knows how to scaffold or inject `.kiro/`.

That is visible in:

- [`README.md`](../README.md)
- [`cli/src/index.ts`](../cli/src/index.ts)
- [`cli/src/stacks.ts`](../cli/src/stacks.ts)

The strongest cross-tool pattern is:

1. Keep one vendor-neutral instruction layer.
2. Add thin host adapters for each tool.
3. Model skills, rules, hooks, and subagents as capabilities, not as one tool's file layout.

My recommendation is to evolve this repo into a **host-agnostic multi-agent starter kit** with Kiro as one supported adapter, not the center of the product.

## External Patterns Worth Adopting

### 1. AGENTS.md as the portable base layer

`AGENTS.md` is now a broad cross-tool convention rather than a vendor-specific hack. The official site describes it as a simple open format used across many coding agents, with nearest-file precedence and nested files for monorepos.

Why it matters:

- It gives this project a neutral, durable root instruction format.
- It is simpler than trying to make `.kiro/steering` the universal source of truth.
- It maps cleanly to multiple tools.

Adopt:

- Root `AGENTS.md` as the canonical shared instruction file.
- Optional nested `AGENTS.md` files for package-level overrides.
- Keep human-facing docs in `README.md`; move agent-operational guidance into `AGENTS.md`.

Sources:

- https://agents.md/
- https://developers.openai.com/codex/guides/agents-md

### 2. Layered instructions instead of one giant rules corpus

OpenAI Codex and Claude Code both support layered instruction loading with closer files taking precedence:

- Codex supports `AGENTS.md`, `AGENTS.override.md`, and fallback filenames, merged from root to current directory.
- Claude Code supports `CLAUDE.md`, nested loading, and path-scoped `.claude/rules/*.md`.

Why it matters:

- Your current `.kiro/steering` library is rich, but too monolithic to become the universal source format.
- A portable starter kit needs instruction layers:
  - core repo instructions
  - path-scoped instructions
  - task-specific procedural packs

Adopt:

- Canonical content buckets:
  - `core`
  - `scoped-rules`
  - `workflows`
  - `skills`
  - `agents`
- Generate host-specific outputs from those buckets.

Sources:

- https://developers.openai.com/codex/guides/agents-md
- https://code.claude.com/docs/en/memory

### 3. Skills should be on-demand, not always loaded

Gemini CLI and Codex both distinguish between persistent project instructions and on-demand expertise. Gemini is especially explicit here: `GEMINI.md` is workspace context, while skills are discoverable capabilities loaded only when relevant. Codex also has a separate skills system, and Claude likewise separates rules from skills.

Why it matters:

- Many of your current "manual steering" docs are really skills or workflows, not always-on context.
- Converting everything into one always-loaded prompt layer wastes context and weakens adherence.

Adopt:

- Treat planning, investigation, QA methodology, pre-landing review, security audit, docs sync, and feature rollout as **skills/workflows**, not base instructions.
- Create a vendor-neutral skills source tree, then render:
  - Codex skill folders
  - Gemini skills
  - Claude skills/plugins or equivalent packaged workflow docs
  - Kiro manual hooks/prompts

Sources:

- https://geminicli.com/docs/cli/skills/
- https://developers.openai.com/codex/subagents
- https://code.claude.com/docs/en/memory

### 4. Subagents are a first-class product surface

Codex and Claude Code both now expose explicit subagent systems:

- Codex: built-in `default`, `worker`, and `explorer`, plus project-scoped custom agents in `.codex/agents/`.
- Claude Code: built-in and custom subagents with their own prompts, tools, model choices, permissions, hooks, and optional persistent memory.

Why it matters:

- "Multi-agent starter kit" should not just mean "lots of prompt files."
- It should include ready-to-use agent roles and delegation patterns.

Adopt:

- Canonical agent roles:
  - `explorer`
  - `implementer`
  - `reviewer`
  - `qa`
  - `docs`
  - `security`
- Render them per host where supported.
- Keep the roles narrow and opinionated.

Sources:

- https://developers.openai.com/codex/subagents
- https://code.claude.com/docs/en/sub-agents

### 5. Hooks should be capability-driven, not vendor-first

Claude Code and Kiro both support event-driven hooks, but their semantics differ. Gemini also has hooks, and other tools prefer rules or approvals rather than arbitrary shell hooks.

Why it matters:

- The current project encodes behavior directly as Kiro hooks.
- That does not generalize cleanly.

Adopt:

- Define hook intent in canonical form first:
  - validate edited spec files
  - block dangerous file writes
  - enforce review gates
  - sync docs after release work
  - log or validate shell commands
- Then map per host:
  - Kiro hook files
  - Claude `.claude/settings.json` hooks
  - Gemini hook config
  - Codex `.rules` or agent instructions where actual hooks are not the right primitive

Sources:

- https://docs.anthropic.com/en/docs/claude-code/hooks
- https://developers.openai.com/codex/rules

### 6. Security and trust need to become a first-class template concern

The better tools now distinguish between trusted and untrusted workspaces or have explicit approval/rules systems:

- Codex has `.rules` and approval policy controls.
- Gemini CLI has Trusted Folders and a restricted safe mode for untrusted projects.
- Cursor background agents explicitly call out remote execution and internet access risk.

Why it matters:

- A serious multi-agent starter kit should scaffold security posture, not only coding conventions.
- This repo already started moving in that direction with review and safety docs; that should become host-neutral and more explicit.

Adopt:

- A `security/agent-runtime.md` canonical document covering:
  - approval posture
  - command allow/deny policy
  - MCP trust model
  - network expectations
  - secret handling
  - background-agent risk
- Host-specific mappings:
  - Codex `.rules`
  - Claude permissions/hooks settings
  - Gemini trust and safe-mode guidance
  - Cursor remote/background-agent warnings

Sources:

- https://developers.openai.com/codex/rules
- https://geminicli.com/docs/cli/trusted-folders/
- https://docs.cursor.com/en/background-agents

## What This Repo Should Become

## Product Shape

Target identity:

- Not "Kiro project template"
- More like "AI coding agent starter kit" or "multi-agent IDE starter"

That means the repo should have:

1. A **core** layer with vendor-neutral instructions and workflows.
2. Multiple **host adapters** that render those assets into each tool's native format.
3. A CLI that targets one or more hosts instead of only `.kiro/`.

## Suggested Repository Architecture

```text
agent-starter/
├── agents/
│   ├── roles/
│   │   ├── explorer.md
│   │   ├── implementer.md
│   │   ├── reviewer.md
│   │   ├── qa.md
│   │   └── security.md
│   ├── skills/
│   │   ├── feature-planning/
│   │   ├── investigation/
│   │   ├── qa-methodology/
│   │   ├── pre-landing-review/
│   │   ├── docs-sync/
│   │   └── security-audit/
│   ├── rules/
│   │   ├── core.md
│   │   ├── testing.md
│   │   ├── docs.md
│   │   └── security.md
│   └── workflows/
│       ├── specs.md
│       ├── bugfix.md
│       └── release.md
├── adapters/
│   ├── agnostic/
│   │   └── AGENTS.md.hbs
│   ├── codex/
│   │   ├── AGENTS.md.hbs
│   │   ├── .codex/agents/*.toml.hbs
│   │   └── .codex/rules/*.rules.hbs
│   ├── claude/
│   │   ├── CLAUDE.md.hbs
│   │   ├── .claude/rules/*.md.hbs
│   │   ├── .claude/agents/*.md.hbs
│   │   └── .claude/settings.json.hbs
│   ├── gemini/
│   │   ├── GEMINI.md.hbs
│   │   ├── .gemini/skills/**/SKILL.md.hbs
│   │   └── .gemini/settings.json.hbs
│   ├── cursor/
│   │   ├── AGENTS.md.hbs
│   │   └── .cursor/rules/*.mdc.hbs
│   └── kiro/
│       ├── .kiro/steering/*.md.hbs
│       ├── .kiro/hooks/*.kiro.hook.hbs
│       └── .kiro/specs/**/*
├── cli/
└── docs/
```

## Suggested Incorporations Into This Project

### P0

1. Add root `AGENTS.md` as the new canonical base instruction file.
2. Keep `.kiro/` support, but reposition it as one adapter.
3. Introduce host targets in the CLI:
   - `--host kiro`
   - `--host codex`
   - `--host claude`
   - `--host gemini`
   - `--host cursor`
   - `--host all`
4. Split "always-on guidance" from "on-demand workflows."
5. Rename the product and CLI away from `create-kiro-project`.

### P1

1. Add project-scoped agent definitions:
   - `.codex/agents/*.toml`
   - `.claude/agents/*.md`
   - optional Gemini/Cursor equivalents where appropriate
2. Add host-specific security packs:
   - Codex `.rules`
   - Claude permissions/hooks examples
   - Gemini trust/settings examples
3. Add path-scoped rule generation for large repos.
4. Add a capabilities matrix in docs so users know which host supports:
   - persistent instructions
   - path-scoped rules
   - hooks
   - skills
   - subagents
   - remote/background execution

### P2

1. Add remote/background-agent guidance as an optional pack, not default.
2. Add host bundles for review-heavy teams vs implementation-heavy teams.
3. Add monorepo support with nested `AGENTS.md` and host-specific subproject overrides.

## What Not To Flatten

Do not force all tools into one fake common denominator.

Keep these differences explicit:

- Hooks are not equivalent across hosts.
- Permission systems are not equivalent across hosts.
- Background agents are not equivalent to local subagents.
- Skills are not equivalent to always-on instructions.
- Path-scoped rules differ materially between Claude, Cursor, Codex, and Kiro.

The correct approach is **canonical intent + per-host rendering**, not "one folder format for every tool."

## Concrete Migration Plan

### Phase 1: Reframe without breaking Kiro

1. Add `AGENTS.md` at repo root.
2. Introduce `core/` or `agents/` canonical content directories.
3. Mark `.kiro/` as the first adapter generated from canonical content.
4. Update docs and README language from Kiro-first to host-aware.

### Phase 2: Add one serious second host

Best next host: **Codex** or **Claude Code**.

Reason:

- Both have mature project-scoped instruction systems.
- Both support explicit agent/subagent concepts.
- Both map cleanly to your existing workflow emphasis.

I would start with **Codex first** if the goal is broad IDE reach, because the Codex IDE extension already runs in VS Code-compatible editors and shares config with the Codex CLI.

Source:

- https://developers.openai.com/codex/ide/features

### Phase 3: Generalize the CLI

Move from:

- scaffold `.kiro/`

To:

- scaffold one or more host packs from canonical sources
- inject host packs into existing repos
- optionally render only:
  - rules
  - skills
  - hooks
  - agents
  - docs

### Phase 4: Rebrand and publish

Rename:

- repo
- package
- CLI command
- docs language

Keep Kiro as a supported target, not the identity.

## Practical Recommendation

If you want the highest-leverage next move, do this:

1. Add `AGENTS.md`.
2. Create a canonical `agents/` source tree for rules, workflows, skills, and roles.
3. Preserve `.kiro/` as generated output.
4. Add Codex as the second supported host.
5. Rebrand the CLI and README after Codex support lands.

That sequence keeps current value intact while moving the architecture toward a real multi-agent starter kit.

## Source Notes

Primary sources reviewed:

- AGENTS.md: https://agents.md/
- OpenAI Codex AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- OpenAI Codex subagents: https://developers.openai.com/codex/subagents
- OpenAI Codex rules: https://developers.openai.com/codex/rules
- OpenAI Codex IDE features: https://developers.openai.com/codex/ide/features
- Claude Code memory / project instructions: https://code.claude.com/docs/en/memory
- Claude Code subagents: https://code.claude.com/docs/en/sub-agents
- Claude Code hooks: https://docs.anthropic.com/en/docs/claude-code/hooks
- Cursor background agents: https://docs.cursor.com/en/background-agents
- Cursor rules overview: https://docs.cursor.com/fr/context/rules
- Gemini CLI skills: https://geminicli.com/docs/cli/skills/
- Gemini CLI trusted folders: https://geminicli.com/docs/cli/trusted-folders/

## Bottom Line

Yes, this project should expand beyond Kiro.

But the right pivot is not "add more vendor folders by hand." It is:

- **vendor-neutral core**
- **host adapters**
- **capability-driven rendering**
- **AGENTS.md as the portable base layer**

That is the shape that can credibly become a multi-agent / IDE starter kit.
