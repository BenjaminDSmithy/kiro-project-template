#!/usr/bin/env bash
# Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# CLI test script — runs vitest in single-run mode
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${SCRIPT_DIR}"

echo "Running CLI tests..."
pnpm test -- --run
