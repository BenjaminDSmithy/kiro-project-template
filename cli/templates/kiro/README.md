# Kiro Templates

This directory contains the `.kiro/` configuration files bundled at build time.

## Contents (populated by `scripts/copy-templates.sh`)

- `hooks/` — Git hook configurations
- `settings/` — MCP and editor settings
- `specs/` — Spec templates and examples
- `steering/` — Steering documents for AI guidance

These files are copied from the repository root `.kiro/` directory during the `prebuild` step.
Do not edit files here directly — edit the source files in the root `.kiro/` directory instead.
