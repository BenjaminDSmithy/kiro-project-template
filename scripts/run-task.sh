#!/usr/bin/env bash
# ============================================================================
# run-task.sh — Unified task runner for the project
#
# Usage: scripts/run-task.sh <task-name> [args...]
#
# Provides a single entry point for common development tasks.
# Add new tasks by extending the case statement below.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Source shared libraries
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/utils.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/banner.sh"

TASK="${1:?Usage: run-task.sh <task-name> [args...]}"
shift || true

case "${TASK}" in

# ── Validation ───────────────────────────────────────────────────
validate-env)
	# shellcheck disable=SC1091
	source "${SCRIPT_DIR}/lib/validation.sh"
	show_project_banner "Environment Validator"
	validate_env_file "${PROJECT_ROOT}/.env" "${PROJECT_ROOT}/.env.example"
	;;

# ── Linting ──────────────────────────────────────────────────────
lint)
	trunk check --fix "$@"
	;;
lint-all)
	trunk check --fix --all
	;;
fmt)
	trunk fmt "$@"
	;;

# ── Testing ──────────────────────────────────────────────────────
test)
	pnpm test -- --run "$@"
	;;

# ── Building ─────────────────────────────────────────────────────
build)
	pnpm build "$@"
	;;

# ── Setup ────────────────────────────────────────────────────────
setup)
	bash "${PROJECT_ROOT}/setup.sh" "$@"
	;;

# ── Help ─────────────────────────────────────────────────────────
*)
	echo "Unknown task: ${TASK}" >&2
	echo "" >&2
	echo "Available tasks:" >&2
	echo "  validate-env          Validate .env against .env.example" >&2
	echo "  lint [files...]       Lint and auto-fix specified files" >&2
	echo "  lint-all              Lint and auto-fix all files" >&2
	echo "  fmt [files...]        Format specified files" >&2
	echo "  test [args...]        Run tests (single run, no watch)" >&2
	echo "  build [args...]       Production build" >&2
	echo "  setup [args...]       Run project setup wizard" >&2
	exit 1
	;;
esac
