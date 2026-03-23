#!/usr/bin/env bash
# Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# Generates CHANGELOG.md entries from conventional commits between tags.
# Follows the Keep a Changelog format (https://keepachangelog.com/).
# Usage: bash scripts/changelog.sh [from-tag] [to-tag]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${SCRIPT_DIR}"

# Determine version from package.json
VERSION=$(node -p "require('./package.json').version")
DATE=$(date +%Y-%m-%d)

# Resolve tag range from arguments or auto-detect
FROM_TAG="${1:-$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo '')}"
TO_TAG="${2:-HEAD}"

# Build git log range — handle first release (no previous tag)
if [ -z "$FROM_TAG" ]; then
  RANGE="$TO_TAG"
else
  RANGE="${FROM_TAG}..${TO_TAG}"
fi

# Group commits by conventional commit type prefix
ADDED=$(git log "$RANGE" --pretty=format:"- %s" --grep="^feat" 2>/dev/null || true)
FIXED=$(git log "$RANGE" --pretty=format:"- %s" --grep="^fix" 2>/dev/null || true)
CHANGED=$(git log "$RANGE" --pretty=format:"- %s" --grep="^refactor" 2>/dev/null || true)

# Build the new version entry
ENTRY="## [${VERSION}] - ${DATE}"

if [ -n "$ADDED" ]; then
  ENTRY="${ENTRY}

### Added

${ADDED}"
fi

if [ -n "$FIXED" ]; then
  ENTRY="${ENTRY}

### Fixed

${FIXED}"
fi

if [ -n "$CHANGED" ]; then
  ENTRY="${ENTRY}

### Changed

${CHANGED}"
fi

# Bail out if there are no commits to log
if [ -z "$ADDED" ] && [ -z "$FIXED" ] && [ -z "$CHANGED" ]; then
  echo "No conventional commits found in range — CHANGELOG.md not updated."
  exit 0
fi

# Prepend new entry to existing CHANGELOG.md or create a new one
CHANGELOG="CHANGELOG.md"

if [ -f "$CHANGELOG" ]; then
  EXISTING=$(cat "$CHANGELOG")
  # Strip the top-level heading so we can re-add it cleanly
  BODY="${EXISTING#\# Changelog}"
  {
    echo "# Changelog"
    echo ""
    echo "$ENTRY"
    echo "$BODY"
  } > "$CHANGELOG"
else
  {
    echo "# Changelog"
    echo ""
    echo "All notable changes to this project will be documented in this file."
    echo ""
    echo "The format is based on [Keep a Changelog](https://keepachangelog.com/),"
    echo "and this project adheres to [Semantic Versioning](https://semver.org/)."
    echo ""
    echo "$ENTRY"
  } > "$CHANGELOG"
fi

echo "✔ Updated CHANGELOG.md with version ${VERSION}"
