#!/usr/bin/env bash
# Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
# Licensed under the MIT License. See LICENSE file in the project root.
#
# AI-powered changelog generator.
# Gathers conventional commits between git tags and uses Claude or ChatGPT
# to produce user-facing changelog entries in Keep a Changelog format.
#
# Usage:
#   bash scripts/changelog.sh [options] [from-tag] [to-tag]
#
# Options:
#   --write       Write directly to CHANGELOG.md (default: stdout)
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
WRITE_MODE=false
MODEL_OVERRIDE=""
CHANGELOG="CHANGELOG.md"

# ── Parse flags ───────────────────────────────────────────────────────────────
POSITIONAL=()
while [[ $# -gt 0 ]]; do
	case "$1" in
	--write)
		WRITE_MODE=true
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
	set -a
	# shellcheck source=/dev/null
	source "${ENV_FILE}"
	set +a
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

# ── System prompt ─────────────────────────────────────────────────────────────
# Adjust this prompt to match your project's changelog style.
read -r -d '' SYSTEM_PROMPT <<'PROMPT_EOF' || true
You are a changelog writer for an npm package. You receive a list of git commits
and produce a user-facing changelog entry in Keep a Changelog format.

Rules:
- Write from the end-user's perspective — what they gain, not what files changed.
- Strip conventional commit prefixes (feat, fix, refactor, etc.) from output.
- Group entries under: Added, Changed, Fixed, Removed, Security (omit empty sections).
- Each bullet should be a single concise sentence.
- Merge related commits into one bullet where it makes sense.
- Ignore commits about internal tooling, CI, steering docs, or template files
  unless they directly affect the end-user experience.
- Use Australian English (optimise, behaviour, colour, etc.).
- Do NOT include a version header — just the grouped sections.
- Output raw markdown only — no code fences, no preamble, no commentary.
PROMPT_EOF

USER_PROMPT="Generate changelog entries for version ${VERSION} from these commits:

${RAW_COMMITS}"

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

# ── Output or write ──────────────────────────────────────────────────────────
if [[ ${WRITE_MODE} == true ]]; then
	if [[ -f ${CHANGELOG} ]]; then
		EXISTING=$(cat "${CHANGELOG}")
		# Remove the top heading and any leading blank lines
		BODY=$(echo "${EXISTING}" | sed '1{/^# Changelog$/d;}' | sed '/./,$!d')
		{
			echo "# Changelog"
			echo ""
			echo "${ENTRY}"
			echo ""
			echo "${BODY}"
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
	echo "✔ Updated ${CHANGELOG} with version ${VERSION}" >&2
else
	echo "${ENTRY}"
fi
