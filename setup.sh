#!/usr/bin/env bash
# ============================================================================
# Kiro Project Template — Interactive Setup Script
# Copyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}. All rights reserved.
#
# Replaces all {{PLACEHOLDER}} tokens with your project-specific values
# and optionally pre-fills the TECH-STACK.md based on your chosen stack.
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
#
# Or non-interactively:
#   PROJECT_NAME="My App" COPYRIGHT_HOLDER="Acme Inc" YEAR="2026" ./setup.sh
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Colours
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()    { echo -e "${CYAN}ℹ${NC}  $1"; }
success() { echo -e "${GREEN}✔${NC}  $1"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $1"; }
header()  { echo -e "\n${BOLD}$1${NC}"; echo "─────────────────────────────────────────"; }

ask() {
  local prompt="$1" default="$2" var="$3"
  if [[ -n "${!var:-}" ]]; then return; fi
  if [[ -n "$default" ]]; then
    read -rp "$(echo -e "${CYAN}?${NC}  ${prompt} ${YELLOW}[${default}]${NC}: ")" input
    eval "$var=\"\${input:-$default}\""
  else
    read -rp "$(echo -e "${CYAN}?${NC}  ${prompt}: ")" input
    eval "$var=\"$input\""
  fi
}

# ---------------------------------------------------------------------------
# Detect project name from folder
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_PROJECT_NAME="$(basename "$SCRIPT_DIR")"

