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
err()     { echo -e "${RED}✘${NC}  $1"; }
header()  { echo -e "\n${BOLD}$1${NC}"; echo "─────────────────────────────────────────"; }

ask() {
  local prompt="$1" default="$2" var="$3"
  if [[ -n "${!var:-}" ]]; then return; fi
  if [[ -n "${default}" ]]; then
    read -rp "$(echo -e "${CYAN}?${NC}  ${prompt} ${YELLOW}[${default}]${NC}: ")" input
    eval "${var}=\"\${input:-${default}}\""
  else
    read -rp "$(echo -e "${CYAN}?${NC}  ${prompt}: ")" input
    eval "${var}=\"\${input}\""
  fi
}

# ---------------------------------------------------------------------------
# Detect project name from folder
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_PROJECT_NAME="$(basename "${SCRIPT_DIR}")"
DEFAULT_YEAR="$(date +%Y)"

# ---------------------------------------------------------------------------
# Banner
# ---------------------------------------------------------------------------
echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         Kiro Project Template — Setup Wizard         ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# Step 1: Project Identity
# ═══════════════════════════════════════════════════════════════════════════
header "Step 1 · Project Identity"

ask "Project name" "${DEFAULT_PROJECT_NAME}" PROJECT_NAME
ask "Copyright holder (company or person)" "" COPYRIGHT_HOLDER
ask "Copyright year" "${DEFAULT_YEAR}" YEAR

if [[ -z "${COPYRIGHT_HOLDER}" ]]; then
  err "Copyright holder is required."
  exit 1
fi

success "Project: ${PROJECT_NAME}"
success "Copyright: ${YEAR} ${COPYRIGHT_HOLDER}"

# ═══════════════════════════════════════════════════════════════════════════
# Step 2: Tech Stack Selection
# ═══════════════════════════════════════════════════════════════════════════
header "Step 2 · Tech Stack"

echo ""
echo "  Choose a preset stack (or Custom to skip pre-filling):"
echo ""
echo "    1)  T3 Stack          (Next.js + tRPC + Tailwind + Drizzle)"
echo "    2)  T4 Stack          (T3 + Supabase Auth + Realtime)"
echo "    3)  Supabase + Next   (Next.js + Supabase + Tailwind)"
echo "    4)  Vite + React      (Vite + React + Tailwind)"
echo "    5)  SvelteKit         (SvelteKit + Tailwind)"
echo "    6)  Nuxt 3            (Nuxt 3 + Vue + Tailwind)"
echo "    7)  Remix             (Remix + React + Tailwind)"
echo "    8)  Astro             (Astro + Tailwind)"
echo "    9)  Flutter + Supa    (Flutter + Supabase)"
echo "   10)  Electron          (Electron + React + Tailwind)"
echo "   11)  Python FastAPI    (FastAPI + SQLAlchemy + Alembic)"
echo "   12)  TanStack Start   (TanStack Start + Router + Query + Vite)"
echo "   13)  Custom            (skip tech stack pre-fill)"
echo ""

if [[ -z "${STACK_CHOICE:-}" ]]; then
  ask "Stack [1-13]" "13" STACK_CHOICE
fi

case "${STACK_CHOICE}" in
  1)  STACK_NAME="T3 Stack" ;;
  2)  STACK_NAME="T4 Stack" ;;
  3)  STACK_NAME="Supabase + Next.js" ;;
  4)  STACK_NAME="Vite + React" ;;
  5)  STACK_NAME="SvelteKit" ;;
  6)  STACK_NAME="Nuxt 3" ;;
  7)  STACK_NAME="Remix" ;;
  8)  STACK_NAME="Astro" ;;
  9)  STACK_NAME="Flutter + Supabase" ;;
  10) STACK_NAME="Electron" ;;
  11) STACK_NAME="Python FastAPI" ;;
  12) STACK_NAME="TanStack Start" ;;
  13) STACK_NAME="Custom" ;;
  *)  warn "Invalid choice, defaulting to Custom."; STACK_CHOICE="13"; STACK_NAME="Custom" ;;
esac

success "Stack: ${STACK_NAME}"


# ═══════════════════════════════════════════════════════════════════════════
# Step 3: Package Manager
# ═══════════════════════════════════════════════════════════════════════════
header "Step 3 · Package Manager"

echo ""
echo "    1)  npm"
echo "    2)  pnpm"
echo "    3)  yarn"
echo "    4)  bun"
echo "    5)  N/A (not applicable)"
echo ""

if [[ -z "${PKG_CHOICE:-}" ]]; then
  ask "Package manager [1-5]" "2" PKG_CHOICE
fi

case "${PKG_CHOICE}" in
  1) PKG_MGR="npm"  ; PKG_INSTALL="npm install" ; PKG_DEV="npm run dev"  ; PKG_BUILD="npm run build" ; PKG_TEST="npm test" ;;
  2) PKG_MGR="pnpm" ; PKG_INSTALL="pnpm install" ; PKG_DEV="pnpm dev"    ; PKG_BUILD="pnpm build"    ; PKG_TEST="pnpm test -- --run" ;;
  3) PKG_MGR="yarn" ; PKG_INSTALL="yarn install" ; PKG_DEV="yarn dev"    ; PKG_BUILD="yarn build"    ; PKG_TEST="yarn test" ;;
  4) PKG_MGR="bun"  ; PKG_INSTALL="bun install"  ; PKG_DEV="bun dev"     ; PKG_BUILD="bun run build" ; PKG_TEST="bun test" ;;
  5) PKG_MGR="N/A"  ; PKG_INSTALL=""             ; PKG_DEV=""            ; PKG_BUILD=""              ; PKG_TEST="" ;;
  *) warn "Invalid choice, defaulting to pnpm."
     PKG_MGR="pnpm" ; PKG_INSTALL="pnpm install" ; PKG_DEV="pnpm dev" ; PKG_BUILD="pnpm build" ; PKG_TEST="pnpm test -- --run" ;;
esac

success "Package manager: ${PKG_MGR}"


# ═══════════════════════════════════════════════════════════════════════════
# Stack Preset Definitions
# ═══════════════════════════════════════════════════════════════════════════
# Each preset defines rows for the TECH-STACK.md Core Stack table.
# Format: "Layer | Technology | Version | Key Constraint"

define_stack_preset() {
  case "${STACK_CHOICE}" in
    1) # T3 Stack
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode, no \`any\`"
        "Framework   | Next.js       | 15.x  | App Router, Server Components default"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first, no custom CSS files"
        "Database    | PostgreSQL    | 16    | Via Drizzle ORM, type-safe queries"
        "Auth        | NextAuth.js   | 5.x   | Credential + OAuth providers"
        "API         | tRPC          | 11.x  | End-to-end type-safe RPC"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="Next.js, React, tRPC, Drizzle ORM, NextAuth.js, Tailwind CSS, shadcn/ui, Vitest, Playwright"
      ;;
    2) # T4 Stack
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode, no \`any\`"
        "Framework   | Next.js       | 15.x  | App Router, Server Components default"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first, no custom CSS files"
        "Database    | PostgreSQL    | 16    | Via Supabase + Drizzle ORM"
        "Auth        | Supabase Auth | 2.x   | Email + OAuth providers"
        "API         | tRPC          | 11.x  | End-to-end type-safe RPC"
        "Realtime    | Supabase RT   | 2.x   | WebSocket subscriptions"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="Next.js, React, tRPC, Supabase, Drizzle ORM, Tailwind CSS, shadcn/ui, Vitest, Playwright"
      ;;
    3) # Supabase + Next.js
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode, no \`any\`"
        "Framework   | Next.js       | 15.x  | App Router, Server Components default"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first, no custom CSS files"
        "Database    | PostgreSQL    | 16    | Via Supabase, Row Level Security on"
        "Auth        | Supabase Auth | 2.x   | Email + OAuth providers"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="Next.js, React, Supabase, Drizzle ORM, Tailwind CSS, shadcn/ui, Vitest, Playwright"
      ;;
    4) # Vite + React
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode, no \`any\`"
        "Framework   | React + Vite  | 19/6  | SPA, client-side rendering"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first, no custom CSS files"
        "Database    | —             | —     | API-driven, no direct DB access"
        "Auth        | —             | —     | Depends on backend choice"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="React, Vite, Tailwind CSS, shadcn/ui, Vitest, Playwright"
      ;;
    5) # SvelteKit
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode"
        "Framework   | SvelteKit     | 2.x   | File-based routing, SSR default"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first"
        "Database    | PostgreSQL    | 16    | Via Drizzle ORM"
        "Auth        | Lucia         | 3.x   | Session-based auth"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="SvelteKit, Svelte, Drizzle ORM, Tailwind CSS, Lucia, Vitest, Playwright"
      ;;
    6) # Nuxt 3
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode"
        "Framework   | Nuxt 3        | 3.x   | File-based routing, SSR default"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first"
        "Database    | PostgreSQL    | 16    | Via Drizzle ORM"
        "Auth        | Nuxt Auth     | —     | Session-based auth"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="Nuxt 3, Vue, Drizzle ORM, Tailwind CSS, Vitest, Playwright"
      ;;
    7) # Remix
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode, no \`any\`"
        "Framework   | Remix         | 2.x   | Nested routes, loader/action pattern"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first"
        "Database    | PostgreSQL    | 16    | Via Drizzle ORM"
        "Auth        | Remix Auth    | —     | Session-based auth"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="Remix, React, Drizzle ORM, Tailwind CSS, Vitest, Playwright"
      ;;
    8) # Astro
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode"
        "Framework   | Astro         | 5.x   | Islands architecture, static-first"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first"
        "Database    | —             | —     | Content collections or API-driven"
        "Auth        | —             | —     | Depends on integration"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="Astro, React (islands), Tailwind CSS, Vitest, Playwright"
      ;;
    9) # Flutter + Supabase
      STACK_ROWS=(
        "Language    | Dart          | 3.x   | Null safety enabled"
        "Framework   | Flutter       | 3.x   | Cross-platform mobile + web"
        "Styling     | Material 3    | —     | Material Design system"
        "Database    | PostgreSQL    | 16    | Via Supabase, Row Level Security on"
        "Auth        | Supabase Auth | 2.x   | Email + OAuth providers"
        "Testing     | flutter_test  | —     | Widget + integration tests"
        "Linting     | flutter_lints | —     | Recommended lint rules"
        "Package Mgr | pub           | —     | Dart package manager"
      )
      STACK_APPROVED="Flutter, Dart, Supabase, Material 3"
      ;;
    10) # Electron
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode, no \`any\`"
        "Framework   | Electron      | 33.x  | Main + renderer process"
        "UI          | React         | 19.x  | Renderer process UI"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first"
        "Database    | SQLite        | —     | Local-first via better-sqlite3"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="Electron, React, Tailwind CSS, SQLite, Vitest"
      ;;
    11) # Python FastAPI
      STACK_ROWS=(
        "Language    | Python        | 3.12+ | Type hints required"
        "Framework   | FastAPI       | 0.115 | Async-first, OpenAPI auto-docs"
        "Database    | PostgreSQL    | 16    | Via SQLAlchemy 2.0 + Alembic"
        "Auth        | FastAPI Users | —     | JWT + OAuth2"
        "Testing     | pytest        | 8.x   | pytest-asyncio for async tests"
        "Linting     | Ruff          | 0.8+  | Replaces flake8 + isort + black"
        "Package Mgr | uv            | —     | Fast Python package manager"
      )
      STACK_APPROVED="FastAPI, SQLAlchemy, Alembic, Pydantic, pytest, Ruff"
      ;;
    12) # TanStack Start
      STACK_ROWS=(
        "Language    | TypeScript    | 5.5+  | Strict mode, no \`any\`"
        "Framework   | TanStack Start| 1.x   | Full-stack React with Vite + Nitro"
        "Routing     | TanStack Router| 1.x  | Type-safe file-based routing"
        "Data        | TanStack Query| 5.x   | Server state management"
        "Styling     | Tailwind CSS  | 4.x   | Utility-first, no custom CSS files"
        "Database    | PostgreSQL    | 16    | Via Drizzle ORM"
        "Auth        | —             | —     | Flexible (Supabase Auth or custom)"
        "Testing     | Vitest        | 2.x   | Co-located tests, \`--run\` flag"
        "Linting     | Trunk         | 1.25+ | Single tool for lint + format"
        "Package Mgr | ${PKG_MGR}    | —     | —"
      )
      STACK_APPROVED="TanStack Start, TanStack Router, TanStack Query, React, Drizzle ORM, Tailwind CSS, Vitest, Playwright"
      ;;
    *) # Custom — no preset
      STACK_ROWS=()
      STACK_APPROVED=""
      ;;
  esac
}

define_stack_preset


# ═══════════════════════════════════════════════════════════════════════════
# Placeholder Replacement
# ═══════════════════════════════════════════════════════════════════════════
header "Applying replacements"

# Files that contain {{PLACEHOLDER}} tokens (excludes .git/)
TARGET_FILES=(
  "README.md"
  "setup.sh"
  "docs/README.md"
  "docs/TECH-STACK.md"
  "docs/ARCHITECTURE.md"
  "docs/CONTRIBUTING.md"
  "docs/API.md"
  "docs/DEPLOYMENT.md"
  "docs/ADR/000-template.md"
  "docs/examples/TECH-STACK-example.md"
)

CHANGED_FILES=()

for file in "${TARGET_FILES[@]}"; do
  filepath="${SCRIPT_DIR}/${file}"
  if [[ ! -f "${filepath}" ]]; then
    warn "Skipping missing file: ${file}"
    continue
  fi

  changed=false

  if grep -q '{{PROJECT_NAME}}' "${filepath}" 2>/dev/null; then
    sed -i '' "s/{{PROJECT_NAME}}/${PROJECT_NAME//\//\\/}/g" "${filepath}"
    changed=true
  fi

  if grep -q '{{COPYRIGHT_HOLDER}}' "${filepath}" 2>/dev/null; then
    sed -i '' "s/{{COPYRIGHT_HOLDER}}/${COPYRIGHT_HOLDER//\//\\/}/g" "${filepath}"
    changed=true
  fi

  if grep -q '{{YEAR}}' "${filepath}" 2>/dev/null; then
    sed -i '' "s/{{YEAR}}/${YEAR}/g" "${filepath}"
    changed=true
  fi

  if [[ "${changed}" == "true" ]]; then
    CHANGED_FILES+=("${file}")
    success "Updated: ${file}"
  fi
done


# ═══════════════════════════════════════════════════════════════════════════
# Optional: Generate pre-filled TECH-STACK.md
# ═══════════════════════════════════════════════════════════════════════════
if [[ "${STACK_CHOICE}" != "13" ]] && [[ ${#STACK_ROWS[@]} -gt 0 ]]; then
  header "Generating TECH-STACK.md"

  TECH_STACK_FILE="${SCRIPT_DIR}/docs/TECH-STACK.md"

  # Build the Core Stack table rows
  CORE_TABLE=""
  for row in "${STACK_ROWS[@]}"; do
    CORE_TABLE="${CORE_TABLE}| ${row} |
"
  done

  cat > "${TECH_STACK_FILE}" << TECHEOF
# Tech Stack

| Field        | Value      |
| ------------ | ---------- |
| Type         | Reference  |
| Status       | Draft      |
| Last Updated | $(date +%Y-%m-%d) |

---

## Overview

<!-- TODO: One paragraph describing the technology philosophy and key constraints -->

## Core Stack

| Layer       | Technology    | Version | Key Constraint |
| ----------- | ------------- | ------- | -------------- |
${CORE_TABLE}
## Architecture Decisions

| Decision         | Choice        | Rationale     |
| ---------------- | ------------- | ------------- |
| Rendering        | <!-- TODO --> | <!-- TODO --> |
| Database access  | <!-- TODO --> | <!-- TODO --> |
| State management | <!-- TODO --> | <!-- TODO --> |
| API layer        | <!-- TODO --> | <!-- TODO --> |

## Infrastructure

| Component  | Technology    | Purpose       |
| ---------- | ------------- | ------------- |
| Hosting    | <!-- TODO --> | <!-- TODO --> |
| CI/CD      | <!-- TODO --> | <!-- TODO --> |
| Monitoring | <!-- TODO --> | <!-- TODO --> |
| Logging    | <!-- TODO --> | <!-- TODO --> |

## Development Commands

| Command | When |
| ------- | ---- |
| \`${PKG_INSTALL:-"<!-- TODO -->"}\` | First-time setup |
| \`${PKG_DEV:-"<!-- TODO -->"}\` | Start dev server |
| \`${PKG_BUILD:-"<!-- TODO -->"}\` | Production build |
| \`${PKG_TEST:-"<!-- TODO -->"}\` | Run tests |
| \`trunk check\` | Lint and format |

## Environment Variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| \`DATABASE_URL\` | Yes | <!-- TODO --> |
| \`AUTH_SECRET\` | Yes | <!-- TODO --> |

Never commit secrets. Use \`.env\` for local development, \`.env.example\` for documentation.

## Approved Integrations

| Category  | Approved |
| --------- | -------- |
| Framework | ${STACK_APPROVED} |

<!-- TODO: Expand with additional categories (Database, Auth, Testing, Styling, etc.) -->

## Not Approved

<!-- TODO: List technologies explicitly excluded and why -->

| Technology | Reason |
| ---------- | ------ |
| <!-- TODO --> | <!-- TODO --> |

---

\`\`\`
Copyright (C) ${YEAR} ${COPYRIGHT_HOLDER}. All rights reserved.
\`\`\`
TECHEOF

  success "Generated: docs/TECH-STACK.md (${STACK_NAME} preset)"
  CHANGED_FILES+=("docs/TECH-STACK.md (generated)")
fi


# ═══════════════════════════════════════════════════════════════════════════
# Step 4: Clean Up Irrelevant Steering Docs
# ═══════════════════════════════════════════════════════════════════════════
header "Step 4 · Steering Cleanup"

echo ""
echo "  Your chosen stack may not need all steering docs."
echo "  Remove irrelevant stack-specific steering files?"
echo ""
echo "    1)  Yes — remove steering docs for other stacks"
echo "    2)  No  — keep all steering docs"
echo ""

if [[ -z "${CLEANUP_CHOICE:-}" ]]; then
  ask "Clean up? [1-2]" "2" CLEANUP_CHOICE
fi

if [[ "${CLEANUP_CHOICE}" == "1" ]]; then
  STEERING_DIR="${SCRIPT_DIR}/.kiro/steering"
  REMOVED_STEERING=()

  # Stack-specific steering docs to conditionally remove
  # Only remove docs for stacks the user did NOT choose
  case "${STACK_CHOICE}" in
    1) # T3 — keep 60, remove 53 (default Next.js patterns overlap with T3), 61, 62
      for f in "53-nextjs.md" "61-t4-stack.md" "62-tanstack.md"; do
        [[ -f "${STEERING_DIR}/${f}" ]] && rm -f "${STEERING_DIR}/${f}" && REMOVED_STEERING+=("${f}")
      done
      ;;
    2) # T4 — keep 61, remove 53, 60, 62
      for f in "53-nextjs.md" "60-t3-stack.md" "62-tanstack.md"; do
        [[ -f "${STEERING_DIR}/${f}" ]] && rm -f "${STEERING_DIR}/${f}" && REMOVED_STEERING+=("${f}")
      done
      ;;
    3) # Supabase + Next.js (Default) — keep 53, remove 60, 61, 62
      for f in "60-t3-stack.md" "61-t4-stack.md" "62-tanstack.md"; do
        [[ -f "${STEERING_DIR}/${f}" ]] && rm -f "${STEERING_DIR}/${f}" && REMOVED_STEERING+=("${f}")
      done
      ;;
    12) # TanStack Start — keep 62, remove 53, 60, 61
      for f in "53-nextjs.md" "60-t3-stack.md" "61-t4-stack.md"; do
        [[ -f "${STEERING_DIR}/${f}" ]] && rm -f "${STEERING_DIR}/${f}" && REMOVED_STEERING+=("${f}")
      done
      ;;
    *) # Other stacks (Vite, Svelte, Nuxt, etc.) — remove all 4 stack-specific docs
      for f in "53-nextjs.md" "60-t3-stack.md" "61-t4-stack.md" "62-tanstack.md"; do
        [[ -f "${STEERING_DIR}/${f}" ]] && rm -f "${STEERING_DIR}/${f}" && REMOVED_STEERING+=("${f}")
      done
      ;;
  esac

  if [[ ${#REMOVED_STEERING[@]} -gt 0 ]]; then
    for f in "${REMOVED_STEERING[@]}"; do
      success "Removed: .kiro/steering/${f}"
    done
  else
    info "No irrelevant steering docs found to remove."
  fi
else
  info "Kept all steering docs."
fi


# ═══════════════════════════════════════════════════════════════════════════
# Step 5: Remove Example Specs
# ═══════════════════════════════════════════════════════════════════════════
header "Step 5 · Example Specs"

echo ""
echo "  The template includes 4 example specs demonstrating the spec lifecycle."
echo "  Remove them to start fresh?"
echo ""
echo "    1)  Yes — remove example specs (keep templates)"
echo "    2)  No  — keep example specs for reference"
echo ""

if [[ -z "${EXAMPLES_CHOICE:-}" ]]; then
  ask "Remove examples? [1-2]" "2" EXAMPLES_CHOICE
fi

if [[ "${EXAMPLES_CHOICE}" == "1" ]]; then
  SPECS_DIR="${SCRIPT_DIR}/.kiro/specs"
  for spec_dir in "${SPECS_DIR}"/✅_* "${SPECS_DIR}"/📋_* "${SPECS_DIR}"/🚧_* "${SPECS_DIR}"/⏸️_*; do
    if [[ -d "${spec_dir}" ]]; then
      rm -rf "${spec_dir}"
      success "Removed: $(basename "${spec_dir}")"
    fi
  done
else
  info "Kept example specs for reference."
fi


# ═══════════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════════
header "Setup Complete"

echo ""
echo -e "  ${BOLD}Project:${NC}     ${PROJECT_NAME}"
echo -e "  ${BOLD}Copyright:${NC}   ${YEAR} ${COPYRIGHT_HOLDER}"
echo -e "  ${BOLD}Stack:${NC}       ${STACK_NAME}"
echo -e "  ${BOLD}Pkg Manager:${NC} ${PKG_MGR}"
echo ""

if [[ ${#CHANGED_FILES[@]} -gt 0 ]]; then
  info "Files updated:"
  for f in "${CHANGED_FILES[@]}"; do
    echo -e "    ${GREEN}•${NC} ${f}"
  done
  echo ""
fi

info "Remaining TODO markers in steering and doc files need manual customisation."
info "Search for <!-- TODO: to find them."
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# Self-Cleanup
# ═══════════════════════════════════════════════════════════════════════════
if [[ -z "${REMOVE_SELF:-}" ]]; then
  ask "Remove setup.sh now that setup is complete? (y/n)" "y" REMOVE_SELF
fi

if [[ "${REMOVE_SELF}" == "y" || "${REMOVE_SELF}" == "Y" ]]; then
  rm -f "${SCRIPT_DIR}/setup.sh"
  success "Removed setup.sh"
else
  info "Kept setup.sh — you can delete it manually later."
fi

echo ""
success "You're all set. Happy building!"
echo ""
