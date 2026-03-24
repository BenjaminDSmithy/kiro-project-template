#!/usr/bin/env bash
# Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# copy-templates.sh
# Copies template files from the repository root into cli/templates/ at build time.
# Run from the cli/ directory (or via `pnpm prebuild`).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${CLI_DIR}/.." && pwd)"
TEMPLATES_DIR="${CLI_DIR}/templates"

echo "Copying templates from ${REPO_ROOT} into ${TEMPLATES_DIR} ..."

# --- kiro/ templates ---
KIRO_DEST="${TEMPLATES_DIR}/kiro"
rm -rf "${KIRO_DEST}/hooks" "${KIRO_DEST}/settings" "${KIRO_DEST}/specs" "${KIRO_DEST}/steering"

for subdir in hooks settings specs steering; do
	if [[ -d "${REPO_ROOT}/.kiro/${subdir}" ]]; then
		cp -R "${REPO_ROOT}/.kiro/${subdir}" "${KIRO_DEST}/${subdir}"
		echo "  ok .kiro/${subdir}"
	else
		echo "  skip .kiro/${subdir} not found"
	fi
done

# --- docs/ templates ---
DOCS_DEST="${TEMPLATES_DIR}/docs"
find "${DOCS_DEST}" -mindepth 1 ! -name 'README.md' -exec rm -rf {} + 2>/dev/null || true

if [[ -d "${REPO_ROOT}/docs" ]]; then
	rsync -a --exclude='.DS_Store' "${REPO_ROOT}/docs/" "${DOCS_DEST}/"
	echo "  ok docs/"
else
	echo "  skip docs/ not found"
fi

# --- root files ---
ROOT_DEST="${TEMPLATES_DIR}/root"
find "${ROOT_DEST}" -mindepth 1 ! -name 'README.md' -exec rm -rf {} + 2>/dev/null || true

ROOT_FILES=(README.md LICENSE .gitignore package.json .env.example setup.sh)
for file in "${ROOT_FILES[@]}"; do
	if [[ -f "${REPO_ROOT}/${file}" ]]; then
		cp "${REPO_ROOT}/${file}" "${ROOT_DEST}/${file}"
		echo "  ok ${file}"
	else
		echo "  skip ${file} not found"
	fi
done

# --- vscode/ templates ---
VSCODE_DEST="${TEMPLATES_DIR}/vscode"
rm -rf "${VSCODE_DEST}"

if [[ -d "${REPO_ROOT}/.vscode" ]]; then
	cp -R "${REPO_ROOT}/.vscode" "${VSCODE_DEST}"
	echo "  ok .vscode/"
else
	echo "  skip .vscode/ not found"
fi

echo "Template copy complete."
