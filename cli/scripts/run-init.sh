#!/usr/bin/env bash
# Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# Run the CLI init command (interactive mode)
# Builds first if needed, then runs the CLI entry point
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${SCRIPT_DIR}"

# Build if dist doesn't exist or source is newer
if [[ ! -f dist/index.cjs ]] || [[ src/index.ts -nt dist/index.cjs ]]; then
  echo "Building first..."
  pnpm build
fi

echo "Running: create-kiro-project (init mode)"
echo "─────────────────────────────────────────"
node dist/index.cjs "$@"
