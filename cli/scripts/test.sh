#!/usr/bin/env bash
# CLI test script — runs vitest in single-run mode
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${SCRIPT_DIR}"

echo "Running CLI tests..."
pnpm test -- --run
