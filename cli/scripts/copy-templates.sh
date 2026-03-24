#!/usr/bin/env bash
# Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# copy-templates.sh
# Copies template files from the repository root into cli/templates/ at build time.
# Run from the cli/ directory (or via `pnpm prebuild`).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$CLI_DIR/.." && pwd)"
TEMPLATES_DIR="$CLI_DIR/templates"

echo "Copying templates from $REPO_ROOT into $TEMPLATES_DIR ..."

# --- kiro/ templates ---
KIRO_DEST="$TEMPLATES_DIR/kiro"
rm -rf "$KIRO_DEST/hooks" "$KIRO_DEST/settings" "$KIRO_DEST/specs" "$KIRO_DEST/steering"

for subdir in hooks settings specs steering; do
  if [ -d "$REPO_ROOT/.kiro/$subdir" ]; then
    cp -R "$REPO_ROOT/.kiro/$subdir" "$KIRO_DEST/$subdir"
    echo "  ✓ .kiro/$subdir"
  else
    echo "  ⚠ .kiro/$subdir not found, skipping"
  fi
done

# --- docs/ templates ---
DOCS_DEST="$TEMPLATES_DIR/docs"
# Remove everything except the placeholder README
find "$DOCS_DEST" -mindepth 1 ! -name 'README.md' -exec rm -rf {} + 2>/dev/null || true

if [ -d "$REPO_ROOT/docs" ]; then
  # Copy contents of docs/ into templates/docs/, excluding .DS_Store
  rsync -a --exclude='.DS_Store' "$REPO_ROOT/docs/" "$DOCS_DEST/"
  echo "  ✓ docs/"
else
  echo "  ⚠ docs/ not found, skipping"
fi

# --- root files ---
ROOT_DEST="$TEMPLATES_DIR/root"
# Remove everything except the placeholder README
find "$ROOT_DEST" -mindepth 1 ! -name 'README.md' -exec rm -rf {} + 2>/dev/null || true

ROOT_FILES=(README.md LICENSE .gitignore package.json .env.example setup.sh)
for file in "${ROOT_FILES[@]}"; do
  if [ -f "$REPO_ROOT/$file" ]; then
    cp "$REPO_ROOT/$file" "$ROOT_DEST/$file"
    echo "  ✓ $file"
  else
    echo "  ⚠ $file not found, skipping"
  fi
done

echo "Template copy complete."
