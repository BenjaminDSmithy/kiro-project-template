#!/usr/bin/env bash
# ============================================================================
# banner.sh — Project ASCII banner with gradient colouring
#
# Provides: show_project_banner [subtitle]
#
# Displays a gradient ASCII wordmark with an optional subtitle line.
# Designed to be sourced by any script that wants a branded header.
# Customise the _BANNER_ART array and gradient endpoints below.
#
# Usage:
#   source scripts/lib/banner.sh
#   show_project_banner                    # wordmark only
#   show_project_banner "Setup Wizard"     # wordmark + subtitle
#
# Gradient: cyan (0,210,255) → purple (155,80,255) — truecolor (24-bit).
# Falls back to plain text when stderr is not a TTY or HEADLESS=true.
# ============================================================================

# ---------------------------------------------------------------------------
# ASCII art — customise these lines for your project name.
# Keep all lines the same length (pad with trailing spaces).
# Generate block text at: https://patorjk.com/software/taag/
# ---------------------------------------------------------------------------
_BANNER_ART=(
	"██╗  ██╗██╗██████╗  ██████╗ "
	"██║ ██╔╝██║██╔══██╗██╔═══██╗"
	"█████╔╝ ██║██████╔╝██║   ██║"
	"██╔═██╗ ██║██╔══██╗██║   ██║"
	"██║  ██╗██║██║  ██║╚██████╔╝"
	"╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ "
)

# ---------------------------------------------------------------------------
# Gradient endpoints — tweak these to change the colour scheme.
# ---------------------------------------------------------------------------
_BANNER_R1=0 _BANNER_G1=210 _BANNER_B1=255  # start: cyan
_BANNER_R2=155 _BANNER_G2=80 _BANNER_B2=255 # end:   purple

# ---------------------------------------------------------------------------
# _banner_lerp — Linear interpolation between two integers.
# ---------------------------------------------------------------------------
_banner_lerp() {
	local s=$1 e=$2 n=$3 d=$4
	echo $((s + (e - s) * n / d))
}

# ---------------------------------------------------------------------------
# show_project_banner — Print the ASCII wordmark with gradient colouring.
#
# Arguments:
#   $1  (optional) Subtitle text shown below the wordmark.
#
# Environment:
#   HEADLESS     — set to "true" to suppress the banner entirely.
#   PROJECT_NAME — used in the fallback plain-text line.
#   COLOR_RESET  — ANSI reset sequence (set by _setup_colours in utils.sh).
#                  Falls back to \033[0m if unset.
# ---------------------------------------------------------------------------
show_project_banner() {
	local subtitle="${1-}"
	local name="${PROJECT_NAME:-Kiro Project}"

	# Skip in headless / non-TTY
	if [[ ${HEADLESS:-false} == "true" ]] || [[ ! -t 2 ]]; then
		[[ -n ${subtitle} ]] && echo "=== ${name} — ${subtitle} ===" >&2
		return 0
	fi

	local reset="${COLOR_RESET:-\033[0m}"

	# Find the longest line for gradient scaling
	local max_len=0
	for line in "${_BANNER_ART[@]}"; do
		local len=${#line}
		((len > max_len)) && max_len=${len}
	done
	((max_len == 0)) && max_len=1

	echo "" >&2
	for line in "${_BANNER_ART[@]}"; do
		local output=""
		local i
		for ((i = 0; i < ${#line}; i++)); do
			local ch="${line:i:1}"
			if [[ ${ch} == " " ]]; then
				output+=" "
			else
				local r g b
				r=$(_banner_lerp "${_BANNER_R1}" "${_BANNER_R2}" "${i}" "${max_len}")
				g=$(_banner_lerp "${_BANNER_G1}" "${_BANNER_G2}" "${i}" "${max_len}")
				b=$(_banner_lerp "${_BANNER_B1}" "${_BANNER_B2}" "${i}" "${max_len}")
				output+="$(printf '\033[38;2;%d;%d;%dm%s' "${r}" "${g}" "${b}" "${ch}")"
			fi
		done
		echo -e "  ${output}${reset}" >&2
	done

	if [[ -n ${subtitle} ]]; then
		echo "" >&2
		echo "  ${name} — ${subtitle}" >&2
	fi
	echo "" >&2
}
