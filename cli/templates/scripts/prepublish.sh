#!/usr/bin/env bash
# Copyright (c) {{YEAR}} {{COPYRIGHT_HOLDER}}. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# Pre-publish safety checks.
# Run before `npm publish` to catch common release mistakes.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${SCRIPT_DIR}"

echo "Running pre-publish checks..."

# 1. Clean working tree
TREE_STATUS=$(git status --porcelain)
if [[ -n ${TREE_STATUS} ]]; then
	echo "  x Working tree is dirty -- commit or stash changes first."
	exit 1
fi
echo "  ok Working tree is clean"

# 2. Tests pass
echo "  Running tests..."
if ! pnpm test; then
	echo "  x Tests failed."
	exit 1
fi
echo "  ok Tests passed"

# 3. Build succeeds
echo "  Building..."
if ! pnpm build; then
	echo "  x Build failed."
	exit 1
fi
echo "  ok Build succeeded"

# 4. dist/ exists and is populated
DIST_CONTENTS=$(ls -A dist 2>/dev/null || true)
if [[ ! -d "dist" ]] || [[ -z ${DIST_CONTENTS} ]]; then
	echo "  x dist/ is empty -- build may have failed silently."
	exit 1
fi
echo "  ok dist/ is populated"

# 5. Version check against npm registry
PACKAGE_NAME=$(node -p "require('./package.json').name")
CURRENT_VERSION=$(node -p "require('./package.json').version")
PUBLISHED_VERSION=$(npm view "${PACKAGE_NAME}" version 2>/dev/null || echo "0.0.0")
if [[ ${CURRENT_VERSION} == "${PUBLISHED_VERSION}" ]]; then
	printf "  x Version %s is already published -- bump version first.\n" "${CURRENT_VERSION}"
	exit 1
fi
printf "  ok Version %s is not yet published\n" "${CURRENT_VERSION}"

# 6. CHANGELOG mentions current version
if ! grep -q "${CURRENT_VERSION}" CHANGELOG.md 2>/dev/null; then
	printf "  x CHANGELOG.md does not mention version %s.\n" "${CURRENT_VERSION}"
	exit 1
fi
printf "  ok CHANGELOG.md mentions version %s\n" "${CURRENT_VERSION}"

echo ""
echo "ok All pre-publish checks passed. Safe to publish."
