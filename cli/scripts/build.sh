#!/usr/bin/env bash
# Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# CLI build script — runs prebuild (copy templates) then tsup bundle
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${SCRIPT_DIR}"

echo "Building create-kiro-project CLI..."
pnpm build
echo "✔ Build complete"
