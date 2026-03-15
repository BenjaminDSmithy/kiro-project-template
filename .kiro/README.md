# Kiro Project Template — `.kiro/` Directory

This directory contains the AI agent configuration for [Kiro](https://kiro.dev).

## Structure

```text
.kiro/
├── hooks/                    # Agent automation hooks (15 hooks)
│   ├── 01-07                 # File-triggered quality checks
│   ├── 10-11                 # User-triggered manual tasks
│   ├── 17-19                 # Spec task lifecycle hooks
│   ├── 20-21                 # File create/delete automation
│   └── 22                    # Agent stop summary
├── settings/
│   └── mcp.json              # MCP server configuration
├── specs/                    # Feature specifications
│   ├── _TEMPLATE/            # Standard spec template (requirements, design, tasks)
│   └── _BUGFIX_TEMPLATE/     # Bugfix spec template (current/expected/unchanged)
└── steering/                 # AI guidance documents (12 files)
    ├── 00-09                 # Core rules, product, tech, structure
    ├── 10-12                 # Development standards (code, errors, testing)
    ├── 20-21                 # Workflow standards (git, task completion)
    ├── 30-31                 # Reference guides (hooks, kiro best practices)
    └── 50                    # Spec creation standards (conditional)
```

## Getting Started

1. Copy this `.kiro/` directory into your project root
2. Search for `<!-- TODO:` in steering files and customise for your project
3. Update `settings/mcp.json` with your MCP server credentials
4. Review hooks and disable any that don't suit your workflow
5. Create your first spec: copy `specs/_TEMPLATE/` to `specs/📋_01_your-feature/`

## Steering File Numbering

| Range | Category                                            | Inclusion               |
| ----- | --------------------------------------------------- | ----------------------- |
| 00–09 | Core (rules, product, tech, structure)              | Always                  |
| 10–19 | Development standards (code style, errors, testing) | Always                  |
| 20–29 | Workflow standards (git, task completion)           | Always                  |
| 30–39 | Reference guides (hooks, kiro best practices)       | Manual                  |
| 50–59 | Spec creation standards                             | Conditional (fileMatch) |

## Hook Numbering

| Range | Category           | Trigger                                                   |
| ----- | ------------------ | --------------------------------------------------------- |
| 01–09 | Quality gates      | fileEdited / agentStop                                    |
| 10–19 | Manual & lifecycle | userTriggered / pre/postTaskExecution                     |
| 20–29 | File automation    | fileCreated / fileDeleted / agentStop / postTaskExecution |

## Customisation Checklist

After copying this template into your project:

- [ ] Search for `<!-- TODO:` in all steering files and fill in project-specific values
- [ ] Update `01-product.md` with your product context, glossary, and personas
- [ ] Update `02-tech.md` with your actual tech stack and database choices
- [ ] Update `03-structure.md` with your directory layout and naming conventions
- [ ] Update `settings/mcp.json` with your MCP server credentials and preferences
- [ ] Review each hook and disable any that don't match your workflow
- [ ] Adjust commit message scopes in `19-commit-on-task-done.kiro.hook`
- [ ] Decide which steering files should be `always` vs `manual` vs `fileMatch`
