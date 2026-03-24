#!/usr/bin/env bash
# Copyright (c) {{YEAR}} {{COPYRIGHT_HOLDER}}. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# Gitflow release script.
#
# Orchestrates a full release cycle:
#   1. Prompt for release type (major / minor / patch)
#   2. Bump version in package.json
#   3. Create release/X.Y.Z branch from develop
#   4. Run tests and build
#   5. Generate AI-powered changelog
#   6. Pause for user review and commit
#   7. Verify clean tree, merge into main, tag, merge back to develop
#   8. Optionally delete the release branch
#
# Usage:
#   bash scripts/release.sh
#
# Prerequisites:
#   - Clean working tree on the develop branch
#   - jq and curl installed (for changelog generation)
#   - ANTHROPIC_API_KEY or OPENAI_API_KEY in .env
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_DIR}"

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No colour

info() { printf '%b%s%b\n' "${CYAN}" "$1" "${NC}"; }
ok() { printf '%b  ok %s%b\n' "${GREEN}" "$1" "${NC}"; }
warn() { printf '%b  !! %s%b\n' "${YELLOW}" "$1" "${NC}"; }
fail() {
	printf '%b  x %s%b\n' "${RED}" "$1" "${NC}"
	exit 1
}

# ── Confirm helper ────────────────────────────────────────────────────────────
confirm() {
	local prompt="$1"
	local response
	printf '%b%s [y/n]: %b' "${CYAN}" "${prompt}" "${NC}"
	read -r response
	case "${response}" in
	[yY] | [yY][eE][sS]) return 0 ;;
	*) return 1 ;;
	esac
}

# ── Pre-flight checks ────────────────────────────────────────────────────────
info "Pre-flight checks..."

# Must be on develop
CURRENT_BRANCH=$(git branch --show-current)
if [[ ${CURRENT_BRANCH} != "develop" ]]; then
	fail "Must be on the develop branch. Currently on: ${CURRENT_BRANCH}"
fi
ok "On develop branch"

# Clean working tree
TREE_STATUS=$(git status --porcelain)
if [[ -n ${TREE_STATUS} ]]; then
	fail "Working tree is dirty -- commit or stash changes first."
fi
ok "Working tree is clean"

# Ensure main branch exists locally
if ! git rev-parse --verify main &>/dev/null; then
	info "Local main branch not found -- creating from origin/main..."
	git branch main origin/main 2>/dev/null || fail "Could not create local main branch. Ensure origin/main exists."
	ok "Created local main branch"
else
	ok "Local main branch exists"
fi

# ── Read current version ─────────────────────────────────────────────────────
CURRENT_VERSION=$(node -p "require('./package.json').version")
info "Current version: ${CURRENT_VERSION}"

# Parse semver components
IFS='.' read -r MAJOR MINOR PATCH <<<"${CURRENT_VERSION}"

# ── Prompt for release type ───────────────────────────────────────────────────
echo ""
info "What type of release is this?"
echo "  1) patch  -- bug fixes only (${MAJOR}.${MINOR}.$((PATCH + 1)))"
echo "  2) minor  -- new features, backwards compatible (${MAJOR}.$((MINOR + 1)).0)"
echo "  3) major  -- breaking changes ($((MAJOR + 1)).0.0)"
echo ""
printf '%b%s%b' "${CYAN}" "Enter choice [1/2/3]: " "${NC}"
read -r RELEASE_TYPE

case "${RELEASE_TYPE}" in
1 | patch)
	NEW_VERSION="${MAJOR}.${MINOR}.$((PATCH + 1))"
	;;
2 | minor)
	NEW_VERSION="${MAJOR}.$((MINOR + 1)).0"
	;;
3 | major)
	NEW_VERSION="$((MAJOR + 1)).0.0"
	;;
*)
	fail "Invalid choice: ${RELEASE_TYPE}. Expected 1, 2, or 3."
	;;
esac

RELEASE_BRANCH="release/${NEW_VERSION}"
info "New version: ${NEW_VERSION}"
info "Release branch: ${RELEASE_BRANCH}"

# Check if release branch already exists
if git rev-parse --verify "${RELEASE_BRANCH}" &>/dev/null; then
	fail "Branch ${RELEASE_BRANCH} already exists. Delete it first or choose a different version."
fi

# ── Confirm start ─────────────────────────────────────────────────────────────
echo ""
# shellcheck disable=SC2310
if ! confirm "Start release ${NEW_VERSION}?"; then
	info "Release cancelled."
	exit 0
fi

# ── Create release branch ────────────────────────────────────────────────────
info "Creating branch ${RELEASE_BRANCH} from develop..."
git checkout -b "${RELEASE_BRANCH}"
ok "Created and switched to ${RELEASE_BRANCH}"

# ── Bump version in package.json ─────────────────────────────────────────────
info "Bumping version to ${NEW_VERSION}..."

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.version = '${NEW_VERSION}';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
ok "Updated package.json to ${NEW_VERSION}"

# Verify version
PKG_VERSION=$(node -p "require('./package.json').version")
if [[ ${PKG_VERSION} != "${NEW_VERSION}" ]]; then
	fail "Version mismatch: package.json says ${PKG_VERSION} but expected ${NEW_VERSION}."
fi

# Update lock file if pnpm is available
if command -v pnpm &>/dev/null; then
	info "Updating pnpm-lock.yaml..."
	pnpm install --lockfile-only 2>/dev/null || warn "Could not update lock file. You may need to run pnpm install manually."
	ok "Lock file updated"
fi

# Commit the version bump
git add package.json pnpm-lock.yaml 2>/dev/null || git add package.json
git commit -m "chore(release): bump version to ${NEW_VERSION}"
ok "Committed version bump"

# ── Run tests ─────────────────────────────────────────────────────────────────
echo ""
info "Running tests..."
if ! pnpm test; then
	warn "Tests failed. Fix the issues before continuing."
	warn "You are on branch ${RELEASE_BRANCH}. Fix, commit, then re-run this script step by step."
	exit 1
fi
ok "All tests passed"

# ── Build ─────────────────────────────────────────────────────────────────────
info "Running build..."
if ! pnpm build; then
	fail "Build failed."
fi
ok "Build succeeded"

# ── Generate changelog ────────────────────────────────────────────────────────
echo ""
info "Generating changelog for ${NEW_VERSION}..."
if ! bash "${SCRIPT_DIR}/changelog.sh"; then
	warn "Changelog generation failed. You can write it manually."
	warn "Edit CHANGELOG.md, then continue below."
fi

# Verify CHANGELOG.md mentions the new version
if ! grep -q "${NEW_VERSION}" CHANGELOG.md 2>/dev/null; then
	warn "CHANGELOG.md does not mention version ${NEW_VERSION}."
	warn "Please update CHANGELOG.md manually before continuing."
fi

# ── Pause for user review ────────────────────────────────────────────────────
echo ""
info "=== REVIEW CHECKPOINT ==="
echo ""
echo "  The release branch ${RELEASE_BRANCH} is ready for your review."
echo ""
echo "  Please:"
echo "    1. Review and edit CHANGELOG.md if needed"
echo "    2. Make any last-minute fixes"
echo "    3. Commit all changes to this branch"
echo "    4. Ensure the working tree is clean"
echo ""

# shellcheck disable=SC2310
if ! confirm "Have you reviewed and committed everything? Ready to finalise?"; then
	echo ""
	info "Release paused. You are on branch ${RELEASE_BRANCH}."
	info "When ready, commit your changes and re-run this script."
	info "Or finalise manually:"
	echo "  git checkout main && git merge --no-ff ${RELEASE_BRANCH}"
	echo "  git tag -a v${NEW_VERSION} -m 'Release ${NEW_VERSION}'"
	echo "  git checkout develop && git merge --no-ff main"
	exit 0
fi

# ── Verify clean tree before merge ───────────────────────────────────────────
TREE_STATUS=$(git status --porcelain)
if [[ -n ${TREE_STATUS} ]]; then
	echo ""
	warn "Working tree is not clean. Uncommitted changes:"
	git status --short
	echo ""
	warn "Please commit or stash all changes before finalising."
	warn "Options:"
	echo "  1. git add -A && git commit -m 'chore(release): finalise ${NEW_VERSION}'"
	echo "  2. git stash  (then re-run this script)"
	exit 1
fi
ok "Working tree is clean"

# ── Verify CHANGELOG.md is committed ─────────────────────────────────────────
if ! grep -q "${NEW_VERSION}" CHANGELOG.md 2>/dev/null; then
	fail "CHANGELOG.md still does not mention version ${NEW_VERSION}. Cannot proceed."
fi
ok "CHANGELOG.md mentions ${NEW_VERSION}"

# ── Merge into main ──────────────────────────────────────────────────────────
echo ""
info "Merging ${RELEASE_BRANCH} into main..."
git checkout main
git merge --no-ff "${RELEASE_BRANCH}" -m "release: merge ${RELEASE_BRANCH} into main"
ok "Merged into main"

# ── Tag the release ──────────────────────────────────────────────────────────
TAG_NAME="v${NEW_VERSION}"
info "Tagging ${TAG_NAME}..."
git tag -a "${TAG_NAME}" -m "Release ${NEW_VERSION}"
ok "Tagged ${TAG_NAME}"

# ── Merge main back into develop ─────────────────────────────────────────────
info "Merging main back into develop..."
git checkout develop
git merge --no-ff main -m "chore: merge main back into develop after ${TAG_NAME}"
ok "Merged main into develop"

# ── Optionally delete release branch ─────────────────────────────────────────
echo ""
# shellcheck disable=SC2310
if confirm "Delete release branch ${RELEASE_BRANCH}?"; then
	git branch -d "${RELEASE_BRANCH}"
	ok "Deleted ${RELEASE_BRANCH}"
else
	info "Kept ${RELEASE_BRANCH}. You can delete it later with: git branch -d ${RELEASE_BRANCH}"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
printf '%b=== Release %s complete ===%b\n' "${GREEN}" "${NEW_VERSION}" "${NC}"
echo ""
echo "  Tag:     ${TAG_NAME}"
echo "  Branch:  main (updated)"
echo "  Develop: merged back"
echo ""
echo "  Next steps:"
echo "    git push origin main develop ${TAG_NAME}"
echo ""
