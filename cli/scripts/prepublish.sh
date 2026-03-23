#!/usr/bin/env bash
# Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# Pre-publish safety checks for create-kiro-project.
# Run before `npm publish` to catch common release mistakes.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${SCRIPT_DIR}"

echo "Running pre-publish checks..."

# 1. Clean working tree
if [ -n "$(git status --porcelain)" ]; then
  echo "✘ Working tree is dirty — commit or stash changes first."
  exit 1
fi
echo "  ✔ Working tree is clean"

# 2. Tests pass
echo "  Running tests..."
pnpm test -- --run || { echo "✘ Tests failed."; exit 1; }
echo "  ✔ Tests passed"

# 3. Build succeeds
echo "  Building..."
pnpm build || { echo "✘ Build failed."; exit 1; }
echo "  ✔ Build succeeded"

# 4. dist/ exists and is populated
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
  echo "✘ dist/ is empty — build may have failed silently."
  exit 1
fi
echo "  ✔ dist/ is populated"

# 5. Version check against npm registry
CURRENT_VERSION=$(node -p "require('./package.json').version")
PUBLISHED_VERSION=$(npm view create-kiro-project version 2>/dev/null || echo "0.0.0")
if [ "$CURRENT_VERSION" = "$PUBLISHED_VERSION" ]; then
  echo "✘ Version $CURRENT_VERSION is already published — bump version first."
  exit 1
fi
echo "  ✔ Version $CURRENT_VERSION is not yet published"

# 6. CHANGELOG mentions current version
if ! grep -q "$CURRENT_VERSION" CHANGELOG.md 2>/dev/null; then
  echo "✘ CHANGELOG.md does not mention version $CURRENT_VERSION."
  exit 1
fi
echo "  ✔ CHANGELOG.md mentions version $CURRENT_VERSION"

# 7. Templates present
for dir in templates/kiro templates/docs; do
  if [ ! -d "$dir" ]; then
    echo "✘ Missing $dir — run pnpm prebuild first."
    exit 1
  fi
done
echo "  ✔ Template directories present"

echo ""
echo "✔ All pre-publish checks passed. Safe to publish."
