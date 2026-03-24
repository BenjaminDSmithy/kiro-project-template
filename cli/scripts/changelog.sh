#!/usr/bin/env bash
# Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# AI-powered release notes generator.
# Gathers conventional commits between git tags and uses Claude or ChatGPT
# to produce user-facing release notes for npm package releases.
#
# Usage:
#   bash scripts/changelog.sh [options] [from-tag] [to-tag]
#
# Options:
#   --dry-run     Preview to stdout without updating CHANGELOG.md
#   --model NAME  Override the AI model (default: auto per provider)
#   --help        Show this help message
#
# Environment:
#   ANTHROPIC_API_KEY   Claude API key (checked first)
#   OPENAI_API_KEY      ChatGPT API key (fallback)
#
# Provider auto-detection: uses Claude if ANTHROPIC_API_KEY is set,
# otherwise falls back to OpenAI if OPENAI_API_KEY is set.
#
# Re-purpose this script for your own project by adjusting the SYSTEM_PROMPT.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${SCRIPT_DIR}"

# ── Defaults ──────────────────────────────────────────────────────────────────
WRITE_MODE=true
MODEL_OVERRIDE=""
CHANGELOG="CHANGELOG.md"

# ── Parse flags ───────────────────────────────────────────────────────────────
POSITIONAL=()
while [[ $# -gt 0 ]]; do
	case "$1" in
	--dry-run)
		WRITE_MODE=false
		shift
		;;
	--model)
		MODEL_OVERRIDE="$2"
		shift 2
		;;
	--help | -h)
		sed -n '2,/^set -euo/{ /^#/s/^# \?//p }' "$0"
		exit 0
		;;
	*)
		POSITIONAL+=("$1")
		shift
		;;
	esac
done
set -- "${POSITIONAL[@]+"${POSITIONAL[@]}"}"

# ── Load .env if present ─────────────────────────────────────────────────────
ENV_FILE="${SCRIPT_DIR}/.env"
if [[ ! -f ${ENV_FILE} ]]; then
	ENV_FILE="${SCRIPT_DIR}/../.env"
fi
if [[ -f ${ENV_FILE} ]]; then
	# Export only uncommented KEY=VALUE lines (safe for values with special chars)
	while IFS='=' read -r key value; do
		# Skip blank lines and comments
		[[ -z ${key} || ${key} == \#* ]] && continue
		# Trim leading/trailing whitespace from key
		key=$(echo "${key}" | xargs)
		export "${key}=${value}"
	done <"${ENV_FILE}"
fi

# ── Detect provider ──────────────────────────────────────────────────────────
PROVIDER=""
if [[ -n ${ANTHROPIC_API_KEY-} ]]; then
	PROVIDER="anthropic"
elif [[ -n ${OPENAI_API_KEY-} ]]; then
	PROVIDER="openai"
else
	echo "Error: No API key found." >&2
	echo "Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env or your environment." >&2
	exit 1
fi

# ── Version and date ─────────────────────────────────────────────────────────
VERSION=$(node -p "require('./package.json').version")
DATE=$(date +%Y-%m-%d)

# ── Resolve tag range ────────────────────────────────────────────────────────
FROM_TAG="${1:-$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo '')}"
TO_TAG="${2:-HEAD}"

if [[ -z ${FROM_TAG} ]]; then
	RANGE="${TO_TAG}"
else
	RANGE="${FROM_TAG}..${TO_TAG}"
fi

# ── Gather commits ───────────────────────────────────────────────────────────
RAW_COMMITS=$(git log "${RANGE}" --pretty=format:"%h %s" 2>/dev/null || true)

if [[ -z ${RAW_COMMITS} ]]; then
	echo "No commits found in range — nothing to generate." >&2
	exit 0
fi

COMMIT_COUNT=$(echo "${RAW_COMMITS}" | wc -l | tr -d ' ')
echo "Found ${COMMIT_COUNT} commits in ${RANGE:-all history}" >&2
echo "Using provider: ${PROVIDER}" >&2

# ── Gather existing changelog for style reference ─────────────────────────────
EXISTING_ENTRIES=""
if [[ -f ${CHANGELOG} ]]; then
	# Extract up to 100 lines of existing entries (skip the header/boilerplate)
	EXISTING_ENTRIES=$(sed -n '/^## \[/,$ p' "${CHANGELOG}" | head -100)
fi

# ── System prompt ─────────────────────────────────────────────────────────────
# Adjust this prompt to match your project's release notes style.
read -r -d '' SYSTEM_PROMPT <<'PROMPT_EOF' || true
You are a release notes writer for an npm package called create-kiro-project.
You receive a list of git commits and produce user-facing release notes in two
sections. You MUST match the exact style, tone, and formatting of the existing
changelog entries provided as reference.

Output format (follow exactly):

SECTION 1 — Summary paragraph:
Write a short, friendly paragraph (2-4 sentences) summarising what this release
brings. Speak directly to the developer installing the package. Keep it warm and
informative — no marketing fluff.

SECTION 2 — Technical breakdown:
Group entries under these headings (omit any that are empty):
  ### Added
  ### Changed
  ### Fixed
  ### Removed
  ### Security

Formatting rules (CRITICAL — match existing style exactly):
- Each heading (### Added, ### Changed, etc.) must be preceded by a blank line.
- Each bullet starts with "- " (hyphen space) and is a single concise sentence
  ending with a full stop.
- NO sub-headings (#### ...) under the ### sections — flat bullet lists only.
- NO nested bullets or indented sub-items.
- NO "### Testing" section — fold test-related items into ### Added or omit.
- NO bold text, no inline code blocks in bullets unless naming a specific flag
  or command (e.g. `--dry-run`).
- Keep bullets short: one line each, no wrapping into multi-line paragraphs.

Content rules:
- Write for the npm package consumer — focus on what they get in this release.
- Strip conventional commit prefixes (feat, fix, refactor, etc.) from output.
- Merge related commits into one bullet where it makes sense.
- Ignore commits about internal tooling, CI, steering docs, linting config,
  or template files unless they directly affect the package consumer.
- If any breaking changes exist, add a ### Breaking Changes section before all
  other headings and describe the migration path.
- Use Australian English (optimise, behaviour, colour, etc.).
- Do NOT include a version header — just the summary paragraph then the grouped
  sections.
- Separate the summary paragraph from the first ### heading with a blank line.
- Output raw markdown only — no code fences, no preamble, no commentary.
PROMPT_EOF

# Build user prompt with optional style reference
if [[ -n ${EXISTING_ENTRIES} ]]; then
	USER_PROMPT="Generate changelog entries for version ${VERSION} from these commits:

${RAW_COMMITS}

Here are the existing changelog entries for style reference — match this format exactly:

${EXISTING_ENTRIES}"
else
	USER_PROMPT="Generate changelog entries for version ${VERSION} from these commits:

${RAW_COMMITS}"
fi

# ── API call: Anthropic (Claude) ──────────────────────────────────────────────
call_anthropic() {
	local model="${MODEL_OVERRIDE:-claude-sonnet-4-20250514}"
	local payload
	payload=$(jq -n \
		--arg model "${model}" \
		--arg system "${SYSTEM_PROMPT}" \
		--arg user "${USER_PROMPT}" \
		'{
      model: $model,
      max_tokens: 2048,
      system: $system,
      messages: [{ role: "user", content: $user }]
    }')

	local response
	response=$(curl -sS https://api.anthropic.com/v1/messages \
		-H "x-api-key: ${ANTHROPIC_API_KEY}" \
		-H "anthropic-version: 2023-06-01" \
		-H "content-type: application/json" \
		-d "${payload}")

	# Check for API errors
	local err_type
	err_type=$(echo "${response}" | jq -r '.type // empty')
	if [[ ${err_type} == "error" ]]; then
		local err_msg
		err_msg=$(echo "${response}" | jq -r '.error.message // "Unknown error"')
		echo "Anthropic API error: ${err_msg}" >&2
		exit 1
	fi

	echo "${response}" | jq -r '.content[0].text'
}

# ── API call: OpenAI (ChatGPT) ───────────────────────────────────────────────
call_openai() {
	local model="${MODEL_OVERRIDE:-gpt-4o}"
	local payload
	payload=$(jq -n \
		--arg model "${model}" \
		--arg system "${SYSTEM_PROMPT}" \
		--arg user "${USER_PROMPT}" \
		'{
      model: $model,
      max_tokens: 2048,
      messages: [
        { role: "system", content: $system },
        { role: "user", content: $user }
      ]
    }')

	local response
	response=$(curl -sS https://api.openai.com/v1/chat/completions \
		-H "Authorization: Bearer ${OPENAI_API_KEY}" \
		-H "content-type: application/json" \
		-d "${payload}")

	# Check for API errors
	local err_msg
	err_msg=$(echo "${response}" | jq -r '.error.message // empty')
	if [[ -n ${err_msg} ]]; then
		echo "OpenAI API error: ${err_msg}" >&2
		exit 1
	fi

	echo "${response}" | jq -r '.choices[0].message.content'
}

# ── Check dependencies ────────────────────────────────────────────────────────
if ! command -v jq &>/dev/null; then
	echo "Error: jq is required but not installed." >&2
	echo "Install it with: brew install jq (macOS) or apt-get install jq (Linux)" >&2
	exit 1
fi

if ! command -v curl &>/dev/null; then
	echo "Error: curl is required but not installed." >&2
	exit 1
fi

# ── Call the AI ───────────────────────────────────────────────────────────────
echo "Generating changelog with ${PROVIDER}..." >&2

AI_OUTPUT=""
case "${PROVIDER}" in
anthropic) AI_OUTPUT=$(call_anthropic) ;;
openai) AI_OUTPUT=$(call_openai) ;;
*)
	echo "Error: Unknown provider '${PROVIDER}'" >&2
	exit 1
	;;
esac

if [[ -z ${AI_OUTPUT} ]]; then
	echo "Error: AI returned empty response." >&2
	exit 1
fi

# ── Build the version entry ──────────────────────────────────────────────────
ENTRY="## [${VERSION}] - ${DATE}

${AI_OUTPUT}"

# ── Remove existing entry for same version (if any) ─────────────────────────
strip_version_entry() {
	local file="$1"
	local ver="$2"
	local in_target=false
	local result=""
	local line

	while IFS= read -r line || [[ -n ${line} ]]; do
		# Detect start of the target version section
		if [[ ${line} == "## [${ver}]"* ]]; then
			in_target=true
			continue
		fi
		# Detect start of the next version section — stop stripping
		if ${in_target} && [[ ${line} == "## ["* ]]; then
			in_target=false
		fi
		if ! ${in_target}; then
			result+="${line}"$'\n'
		fi
	done <"${file}"

	echo "${result}"
}

# ── Output or write ──────────────────────────────────────────────────────────
if [[ ${WRITE_MODE} == true ]]; then
	if [[ -f ${CHANGELOG} ]]; then
		# Strip any existing entry for this version so we replace rather than duplicate
		CLEANED=$(strip_version_entry "${CHANGELOG}" "${VERSION}")
		# Remove the top heading and boilerplate, then any leading blank lines
		BODY=$(echo "${CLEANED}" |
			sed '1{/^# Changelog$/d;}' |
			sed '/^All notable changes/d' |
			sed '/^The format is based on/d' |
			sed '/^and this project adheres/d' |
			sed '/./,$!d')
		{
			echo "# Changelog"
			echo ""
			echo "All notable changes to this project will be documented in this file."
			echo ""
			echo "The format is based on [Keep a Changelog](https://keepachangelog.com/),"
			echo "and this project adheres to [Semantic Versioning](https://semver.org/)."
			echo ""
			echo "${ENTRY}"
			if [[ -n ${BODY} ]]; then
				echo ""
				echo "${BODY}"
			fi
		} >"${CHANGELOG}"
	else
		{
			echo "# Changelog"
			echo ""
			echo "All notable changes to this project will be documented in this file."
			echo ""
			echo "The format is based on [Keep a Changelog](https://keepachangelog.com/),"
			echo "and this project adheres to [Semantic Versioning](https://semver.org/)."
			echo ""
			echo "${ENTRY}"
		} >"${CHANGELOG}"
	fi
	echo "Updated ${CHANGELOG} with version ${VERSION}" >&2
else
	echo "${ENTRY}"
	echo ""
	echo "(dry run — pass without --dry-run to update ${CHANGELOG})" >&2
fi
