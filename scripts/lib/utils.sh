#!/usr/bin/env bash
# ============================================================================
# utils.sh — Shared utilities for project scripts
#
# Provides: coloured output, structured logging, prerequisite checks
#
# Usage:
#   source scripts/lib/utils.sh
#   log_info "Starting build..."
#   log_warn "Missing optional dependency"
#   log_error "Build failed"
# ============================================================================

# ---------------------------------------------------------------------------
# Colour / ANSI setup — disabled in headless mode or when stderr is not a TTY
# ---------------------------------------------------------------------------
_setup_colours() {
	if [[ ${HEADLESS:-false} == "true" ]] || [[ ! -t 2 ]]; then
		COLOR_RESET=""
		COLOR_RED=""
		COLOR_GREEN=""
		COLOR_YELLOW=""
		COLOR_DIM=""
		COLOR_CYAN=""
		COLOR_BOLD=""
		# shellcheck disable=SC2034 # USE_COLOR is read by consumers of this lib
		USE_COLOR=false
	else
		COLOR_RESET=$'\033[0m'
		COLOR_RED=$'\033[0;31m'
		COLOR_GREEN=$'\033[0;32m'
		COLOR_YELLOW=$'\033[0;33m'
		COLOR_DIM=$'\033[2m'
		COLOR_CYAN=$'\033[0;36m'
		COLOR_BOLD=$'\033[1m'
		# shellcheck disable=SC2034 # USE_COLOR is read by consumers of this lib
		USE_COLOR=true
	fi
}

# Initialise colours on source
_setup_colours

# ---------------------------------------------------------------------------
# Logging — all output goes to stderr so stdout stays clean for piped output
# ---------------------------------------------------------------------------

log_info() {
	echo "${COLOR_GREEN}[INFO]${COLOR_RESET} $*" >&2
}

log_warn() {
	echo "${COLOR_YELLOW}[WARN]${COLOR_RESET} $*" >&2
}

log_error() {
	echo "${COLOR_RED}[ERROR]${COLOR_RESET} $*" >&2
}

log_debug() {
	if [[ ${DEBUG:-false} == "true" ]]; then
		echo "${COLOR_DIM}[DEBUG]${COLOR_RESET} $*" >&2
	fi
}

# ---------------------------------------------------------------------------
# Friendly output helpers — for interactive scripts (setup wizards, etc.)
# ---------------------------------------------------------------------------

info() { echo -e "${COLOR_CYAN}ℹ${COLOR_RESET}  $1" >&2; }
success() { echo -e "${COLOR_GREEN}✔${COLOR_RESET}  $1" >&2; }
warn() { echo -e "${COLOR_YELLOW}⚠${COLOR_RESET}  $1" >&2; }
err() { echo -e "${COLOR_RED}✘${COLOR_RESET}  $1" >&2; }
header() {
	echo -e "\n${COLOR_BOLD}$1${COLOR_RESET}" >&2
	echo "─────────────────────────────────────────" >&2
}

# ---------------------------------------------------------------------------
# ask — Prompt for user input with an optional default value
#
# Arguments:
#   $1  Prompt text
#   $2  Default value (empty string for no default)
#   $3  Variable name to store the result
#
# If the variable is already set in the environment, the prompt is skipped.
# ---------------------------------------------------------------------------
ask() {
	local prompt="$1" default="$2" var="$3"
	if [[ -n ${!var-} ]]; then return; fi
	local input
	if [[ -n ${default} ]]; then
		read -rp "$(echo -e "${COLOR_CYAN}?${COLOR_RESET}  ${prompt} ${COLOR_YELLOW}[${default}]${COLOR_RESET}: ")" input
		printf -v "${var}" '%s' "${input:-${default}}"
	else
		read -rp "$(echo -e "${COLOR_CYAN}?${COLOR_RESET}  ${prompt}: ")" input
		printf -v "${var}" '%s' "${input}"
	fi
}

# ---------------------------------------------------------------------------
# Cross-platform sed in-place helper
# macOS sed requires -i '' while GNU/Linux sed requires -i (no argument).
# ---------------------------------------------------------------------------
sed_inplace() {
	if [[ "$(uname -s)" == "Darwin" ]]; then
		sed -i '' "$@"
	else
		sed -i "$@"
	fi
}

# ---------------------------------------------------------------------------
# check_prereqs — Verify required tools are installed
#
# Arguments: tool names as positional args
# Returns: 0 if all present, 1 if any missing (with install hints)
# ---------------------------------------------------------------------------
check_prereqs() {
	local missing=()

	for tool in "$@"; do
		if ! command -v "${tool}" &>/dev/null; then
			missing+=("${tool}")
		fi
	done

	if [[ ${#missing[@]} -gt 0 ]]; then
		log_error "Missing required tool(s): ${missing[*]}"
		echo "" >&2
		for tool in "${missing[@]}"; do
			case "${tool}" in
			node)
				echo "  node — Install via: https://nodejs.org/ or nvm" >&2
				;;
			pnpm)
				echo "  pnpm — Install via: corepack enable && corepack prepare pnpm@latest --activate" >&2
				;;
			trunk)
				echo "  trunk — Install via: curl https://get.trunk.io -fsSL | bash" >&2
				;;
			jq)
				echo "  jq — Install via: brew install jq (macOS) or apt-get install jq (Linux)" >&2
				;;
			*)
				echo "  ${tool} — Install it before continuing" >&2
				;;
			esac
			echo "" >&2
		done
		return 1
	fi

	return 0
}

# ---------------------------------------------------------------------------
# generate_secret — Generate a random secret string
# Output: base64-encoded secret (48+ chars) on stdout
# ---------------------------------------------------------------------------
generate_secret() {
	if command -v openssl &>/dev/null; then
		openssl rand -base64 36
	else
		head -c 48 /dev/urandom | base64 | tr -d '\n'
	fi
}
