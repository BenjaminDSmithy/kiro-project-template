#!/usr/bin/env bash
# CLI build script — runs prebuild (copy templates) then tsup bundle
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${SCRIPT_DIR}"

echo "Building create-kiro-project CLI..."
pnpm build
echo "✔ Build complete"
