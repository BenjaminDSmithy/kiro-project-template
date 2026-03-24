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
#   ./setup.sh --dry-run          # Preview what would happen without changes
#
# Or non-interactively:
#   PROJECT_NAME="My App" COPYRIGHT_HOLDER="Acme Inc" YEAR="2026" ./setup.sh
#
# Headless env vars (all optional — defaults shown):
#   HEADLESS=false          # Skip interactive prompts
#   PROJECT_NAME            # Defaults to folder name
#   COPYRIGHT_HOLDER        # Required
#   YEAR                    # Defaults to current year
#   STACK_CHOICE=13         # 1-13 (see menu)
#   PKG_CHOICE=2            # 1-5 (see menu)
#   DLX_CHOICE=1            # 1=npx everywhere, 2=pkg manager equivalent
#   SCAFFOLD_CHOICE=1       # 1=run scaffolder, 2=skip
#   SCAFFOLD_DIR=.          # Directory to scaffold into (. or subdirectory)
#   CLEANUP_CHOICE=2        # 1=remove other steering docs, 2=keep
#   EXAMPLES_CHOICE=2       # 1=remove example specs, 2=keep
#   REMOVE_SELF=y           # y=delete setup.sh, n=keep
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Flags — parsed from command-line arguments
# Usage: ./setup.sh --headless --dry-run
# ---------------------------------------------------------------------------
for arg in "$@"; do
	case "${arg}" in
	--headless) HEADLESS=true ;;
	--dry-run) DRY_RUN=true ;;
	*) ;;
	esac
done
export HEADLESS="${HEADLESS:-false}"
export DRY_RUN="${DRY_RUN:-false}"

# ---------------------------------------------------------------------------
# Source shared libraries
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1091
source "${SCRIPT_DIR}/scripts/lib/utils.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/scripts/lib/validation.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/scripts/lib/banner.sh"

# ---------------------------------------------------------------------------
# Detect project name from folder
# ---------------------------------------------------------------------------
DEFAULT_PROJECT_NAME="$(basename "${SCRIPT_DIR}")"
DEFAULT_YEAR="$(date +%Y)"

# ---------------------------------------------------------------------------
# Banner
# ---------------------------------------------------------------------------
show_project_banner "Setup Wizard"

# ---------------------------------------------------------------------------
# Dry-run mode banner
# ---------------------------------------------------------------------------
if [[ ${DRY_RUN} == "true" ]]; then
	echo ""
	warn "DRY-RUN MODE — no files will be modified, no commands will be executed."
	echo ""
fi

# ---------------------------------------------------------------------------
# run_cmd — Execute a command, or print it in dry-run mode
# Usage: run_cmd <command-string>
# ---------------------------------------------------------------------------
run_cmd() {
	local cmd="$1"
	if [[ ${DRY_RUN} == "true" ]]; then
		info "[dry-run] Would execute: ${cmd}"
		return 0
	fi
	bash -c "${cmd}"
}

# ═══════════════════════════════════════════════════════════════════════════
# Step 1: Project Identity
# ═══════════════════════════════════════════════════════════════════════════
header "Step 1 · Project Identity"

ask "Project name" "${DEFAULT_PROJECT_NAME}" PROJECT_NAME
if ! validate_project_name "${PROJECT_NAME}"; then
	err "Invalid project name."
	exit 1
fi
ask "Copyright holder (company or person)" "" COPYRIGHT_HOLDER
while true; do
	ask "Copyright year (e.g. 2026 or 2022-2026)" "${DEFAULT_YEAR}" YEAR
	if validate_copyright_year "${YEAR}"; then
		break
	fi
	err "Invalid format. Use a 4-digit year or a range (e.g. 2022-2026)."
	unset YEAR
done

if [[ -z ${COPYRIGHT_HOLDER} ]]; then
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

if [[ -z ${STACK_CHOICE-} ]]; then
	while true; do
		ask "Stack [1-13]" "13" STACK_CHOICE
		if validate_choice "${STACK_CHOICE}" 1 13; then
			break
		fi
		err "Please enter a number between 1 and 13."
		unset STACK_CHOICE
	done
fi

case "${STACK_CHOICE}" in
1) STACK_NAME="T3 Stack" ;;
2) STACK_NAME="T4 Stack" ;;
3) STACK_NAME="Supabase + Next.js" ;;
# NOTE: Stacks 4-11 do not have dedicated steering docs in .kiro/steering/.
# Only stacks 1 (T3), 2 (T4), 3 (Default Next.js), and 12 (TanStack) have
# corresponding steering files (60-t3-stack.md, 61-t4-stack.md, 53-nextjs.md,
# 62-tanstack.md). For stacks 4-11, create custom steering docs or rely on
# the general steering docs (10-dev-code-style.md, etc.).
4) STACK_NAME="Vite + React" ;;
5) STACK_NAME="SvelteKit" ;;
6) STACK_NAME="Nuxt 3" ;;
7) STACK_NAME="Remix" ;;
8) STACK_NAME="Astro" ;;
9) STACK_NAME="Flutter + Supabase" ;;
10) STACK_NAME="Electron" ;;
11) STACK_NAME="Python FastAPI" ;;
12) STACK_NAME="TanStack Start" ;;
13) STACK_NAME="Custom" ;;
*)
	err "Unexpected stack choice: ${STACK_CHOICE}"
	exit 1
	;;
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

if [[ -z ${PKG_CHOICE-} ]]; then
	while true; do
		ask "Package manager [1-5]" "2" PKG_CHOICE
		if validate_choice "${PKG_CHOICE}" 1 5; then
			break
		fi
		err "Please enter a number between 1 and 5."
		unset PKG_CHOICE
	done
fi

case "${PKG_CHOICE}" in
1)
	PKG_MGR="npm"
	PKG_INSTALL="npm install"
	PKG_DEV="npm run dev"
	PKG_BUILD="npm run build"
	PKG_TEST="npm test"
	;;
2)
	PKG_MGR="pnpm"
	PKG_INSTALL="pnpm install"
	PKG_DEV="pnpm dev"
	PKG_BUILD="pnpm build"
	PKG_TEST="pnpm test -- --run"
	;;
3)
	PKG_MGR="yarn"
	PKG_INSTALL="yarn install"
	PKG_DEV="yarn dev"
	PKG_BUILD="yarn build"
	PKG_TEST="yarn test"
	;;
4)
	PKG_MGR="bun"
	PKG_INSTALL="bun install"
	PKG_DEV="bun dev"
	PKG_BUILD="bun run build"
	PKG_TEST="bun test"
	;;
5)
	PKG_MGR="N/A"
	PKG_INSTALL=""
	PKG_DEV=""
	PKG_BUILD=""
	PKG_TEST=""
	;;
*)
	err "Unexpected package manager choice: ${PKG_CHOICE}"
	exit 1
	;;
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
# Step 3b: Run Official Stack Scaffolder
# ═══════════════════════════════════════════════════════════════════════════

# ---------------------------------------------------------------------------
# Resolve the dlx (download-and-execute) prefix for the selected pkg manager.
# npx is the default; the user can opt for their pkg manager's equivalent.
#
# Sets: DLX_PREFIX  (e.g. "npx", "pnpm dlx", "yarn dlx", "bunx")
#       CREATE_PREFIX (e.g. "npx", "pnpm create", "yarn create", "bun create")
# ---------------------------------------------------------------------------
resolve_runner_prefixes() {
	case "${PKG_MGR}" in
	npm)
		DLX_PREFIX="npx"
		CREATE_PREFIX="npx"
		;;
	pnpm)
		if [[ ${USE_NPX} == "true" ]]; then
			DLX_PREFIX="npx"
		else
			DLX_PREFIX="pnpm dlx"
		fi
		CREATE_PREFIX="pnpm create"
		;;
	yarn)
		if [[ ${USE_NPX} == "true" ]]; then
			DLX_PREFIX="npx"
		else
			DLX_PREFIX="yarn dlx"
		fi
		CREATE_PREFIX="yarn create"
		;;
	bun)
		if [[ ${USE_NPX} == "true" ]]; then
			DLX_PREFIX="npx"
		else
			DLX_PREFIX="bunx"
		fi
		CREATE_PREFIX="bun create"
		;;
	*)
		DLX_PREFIX="npx"
		CREATE_PREFIX="npx"
		;;
	esac
}

# Ask the user whether to use npx or their package manager's equivalent.
# Only relevant when the selected package manager is not npm.
USE_NPX="true"
if [[ ${PKG_MGR} != "npm" && ${PKG_MGR} != "N/A" ]]; then
	# Determine the alternative dlx command name for display
	case "${PKG_MGR}" in
	pnpm) _alt_dlx="pnpm dlx" ;;
	yarn) _alt_dlx="yarn dlx" ;;
	bun) _alt_dlx="bunx" ;;
	*) _alt_dlx="" ;;
	esac

	if [[ -n ${_alt_dlx} ]]; then
		echo ""
		info "Some scaffolders default to npx to download and run packages."
		info "You can use ${_alt_dlx} instead to stay consistent with ${PKG_MGR}."
		echo ""
		echo "    1)  Use npx everywhere (default, always works)"
		echo "    2)  Use ${_alt_dlx} where possible (consistent with ${PKG_MGR})"
		echo ""

		if [[ -z ${DLX_CHOICE-} ]]; then
			ask "Runner preference [1-2]" "1" DLX_CHOICE
		fi

		if [[ ${DLX_CHOICE} == "2" ]]; then
			USE_NPX="false"
		fi
	fi
	unset _alt_dlx
fi

resolve_runner_prefixes

# ---------------------------------------------------------------------------
# get_scaffolder_command — Returns the scaffolder command and source URL
# Sets: SCAFFOLDER_CMD, SCAFFOLDER_URL, SCAFFOLDER_NOTE
# ---------------------------------------------------------------------------
get_scaffolder_command() {
	SCAFFOLDER_CMD=""
	SCAFFOLDER_URL=""
	SCAFFOLDER_NOTE=""

	case "${STACK_CHOICE}" in
	1) # T3
		SCAFFOLDER_CMD="${CREATE_PREFIX} t3-app@latest"
		SCAFFOLDER_URL="https://create.t3.gg"
		;;
	2) # T4 — bun only
		SCAFFOLDER_CMD="bun create t4-app@latest"
		SCAFFOLDER_URL="https://t4stack.com"
		if [[ ${PKG_MGR} != "bun" ]]; then
			SCAFFOLDER_NOTE="T4 officially supports bun only. The scaffolder will use bun regardless of your package manager selection."
		fi
		;;
	3) # Supabase + Next.js
		SCAFFOLDER_CMD="${CREATE_PREFIX} next-app@latest"
		SCAFFOLDER_URL="https://nextjs.org/docs/getting-started/installation"
		;;
	4) # Vite + React
		if [[ ${PKG_MGR} == "npm" ]]; then
			SCAFFOLDER_CMD="npm create vite@latest -- --template react-ts"
		else
			SCAFFOLDER_CMD="${CREATE_PREFIX} vite@latest --template react-ts"
		fi
		SCAFFOLDER_URL="https://vite.dev/guide/"
		;;
	5) # SvelteKit
		SCAFFOLDER_CMD="${DLX_PREFIX} sv create"
		SCAFFOLDER_URL="https://svelte.dev/docs/kit/creating-a-project"
		;;
	6) # Nuxt 3
		SCAFFOLDER_CMD="${DLX_PREFIX} nuxi@latest init"
		SCAFFOLDER_URL="https://nuxt.com/docs/getting-started/installation"
		;;
	7) # Remix
		SCAFFOLDER_CMD="${DLX_PREFIX} create-remix@latest"
		SCAFFOLDER_URL="https://remix.run/docs/en/main/start/quickstart"
		;;
	8) # Astro
		SCAFFOLDER_CMD="${CREATE_PREFIX} astro@latest"
		SCAFFOLDER_URL="https://astro.build/docs"
		;;
	9) # Flutter + Supabase
		SCAFFOLDER_CMD="flutter create"
		SCAFFOLDER_URL="https://docs.flutter.dev/get-started/install"
		SCAFFOLDER_NOTE="Requires the Flutter SDK to be installed."
		;;
	10) # Electron
		SCAFFOLDER_CMD="${DLX_PREFIX} create-electron-app@latest"
		SCAFFOLDER_URL="https://www.electronforge.io"
		;;
	11) # Python FastAPI — no official scaffolder
		SCAFFOLDER_CMD=""
		SCAFFOLDER_URL=""
		SCAFFOLDER_NOTE="No official scaffolder available for FastAPI. Set up manually."
		;;
	12) # TanStack Start
		SCAFFOLDER_CMD="${DLX_PREFIX} @tanstack/create-router@latest"
		SCAFFOLDER_URL="https://tanstack.com/start/latest/docs/framework/react/quick-start"
		;;
	13) # Custom — no scaffolding
		SCAFFOLDER_CMD=""
		SCAFFOLDER_URL=""
		;;
	*) ;;
	esac
}

get_scaffolder_command

if [[ -n ${SCAFFOLDER_CMD} ]]; then
	header "Step 3b · Stack Scaffolder"

	# --- Prerequisite check ---------------------------------------------------
	# Determine which tool the scaffolder needs and verify it's installed.
	_scaffolder_tool="${SCAFFOLDER_CMD%% *}" # first word of the command
	case "${_scaffolder_tool}" in
	npx | npm) _prereq="npx" ;;
	pnpm) _prereq="pnpm" ;;
	yarn) _prereq="yarn" ;;
	bun | bunx) _prereq="bun" ;;
	flutter) _prereq="flutter" ;;
	*) _prereq="" ;;
	esac

	if [[ -n ${_prereq} ]] && ! command -v "${_prereq}" &>/dev/null; then
		err "${_prereq} is not installed but is required by the scaffolder."
		warn "Install ${_prereq} first, then run the scaffolder manually:"
		warn "  ${SCAFFOLDER_CMD}"
		# Skip scaffolding — fall through to placeholder replacement
	else
		# --- Scaffold target directory ----------------------------------------
		echo ""
		echo "  The following official scaffolder will initialise your project:"
		echo ""
		echo -e "    ${COLOR_BOLD}Command:${COLOR_RESET}  ${SCAFFOLDER_CMD}"
		echo -e "    ${COLOR_BOLD}Source:${COLOR_RESET}   ${SCAFFOLDER_URL}"

		if [[ -n ${SCAFFOLDER_NOTE} ]]; then
			echo ""
			warn "${SCAFFOLDER_NOTE}"
		fi

		echo ""
		info "Most scaffolders create a new subdirectory. You can also scaffold"
		info "into the current directory (.) if the scaffolder supports it."
		echo ""
		echo "    1)  Current directory (.) — scaffold in place"
		echo "    2)  New subdirectory   — let the scaffolder create one"
		echo ""

		if [[ -z ${SCAFFOLD_DIR_CHOICE-} ]]; then
			ask "Scaffold location [1-2]" "2" SCAFFOLD_DIR_CHOICE
		fi

		if [[ ${SCAFFOLD_DIR_CHOICE} == "1" ]]; then
			SCAFFOLD_DIR="."
			info "Will scaffold into the current directory."
		else
			SCAFFOLD_DIR=""
			info "Will let the scaffolder create a new subdirectory."
		fi

		echo ""
		echo "    1)  Yes — run the scaffolder now"
		echo "    2)  No  — skip (you can run it manually later)"
		echo ""

		if [[ -z ${SCAFFOLD_CHOICE-} ]]; then
			ask "Run scaffolder? [1-2]" "1" SCAFFOLD_CHOICE
		fi

		if [[ ${SCAFFOLD_CHOICE} == "1" ]]; then
			# Append target directory to command if user chose current dir
			_full_cmd="${SCAFFOLDER_CMD}"
			if [[ -n ${SCAFFOLD_DIR} ]]; then
				_full_cmd="${SCAFFOLDER_CMD} ${SCAFFOLD_DIR}"
			fi

			info "Running: ${_full_cmd}"
			echo ""
			if run_cmd "${_full_cmd}"; then
				success "Scaffolder completed successfully."

				# --- Nested git repo warning ----------------------------------
				# Some scaffolders run `git init` inside the new project. If we
				# are already in a git repo, warn about the nested .git directory.
				if [[ ${DRY_RUN} != "true" ]]; then
					# Check for any new .git dirs that aren't the repo root's
					_root_git="${SCRIPT_DIR}/.git"
					while IFS= read -r -d '' _nested_git; do
						if [[ ${_nested_git} != "${_root_git}" ]]; then
							warn "Nested .git directory detected: ${_nested_git}"
							warn "The scaffolder ran 'git init' inside the new project."
							warn "You may want to remove it: rm -rf ${_nested_git}"
						fi
					done < <(find "${SCRIPT_DIR}" -maxdepth 3 -name ".git" -type d -print0 2>/dev/null)
				fi
			else
				warn "Scaffolder exited with a non-zero status. You may need to run it manually."
				warn "Command: ${_full_cmd}"
			fi
		else
			info "Skipped scaffolder. Run it manually later:"
			info "  ${SCAFFOLDER_CMD}"
		fi
	fi
	unset _prereq _scaffolder_tool _full_cmd _root_git _nested_git
elif [[ -n ${SCAFFOLDER_NOTE} ]]; then
	header "Step 3b · Stack Scaffolder"
	echo ""
	info "${SCAFFOLDER_NOTE}"
	echo ""
fi

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
	"bugs.md"
	"package.json"
	"LICENSE"
)

CHANGED_FILES=()

for file in "${TARGET_FILES[@]}"; do
	filepath="${SCRIPT_DIR}/${file}"
	if [[ ! -f ${filepath} ]]; then
		warn "Skipping missing file: ${file}"
		continue
	fi

	changed=false

	# Escape sed special characters in replacement strings (&, \, /)
	SAFE_PROJECT_NAME="${PROJECT_NAME//\\/\\\\}"
	SAFE_PROJECT_NAME="${SAFE_PROJECT_NAME//&/\\&}"
	SAFE_PROJECT_NAME="${SAFE_PROJECT_NAME//\//\\/}"

	SAFE_COPYRIGHT="${COPYRIGHT_HOLDER//\\/\\\\}"
	SAFE_COPYRIGHT="${SAFE_COPYRIGHT//&/\\&}"
	SAFE_COPYRIGHT="${SAFE_COPYRIGHT//\//\\/}"

	if grep -q '{{PROJECT_NAME}}' "${filepath}" 2>/dev/null; then
		if [[ ${DRY_RUN} == "true" ]]; then
			info "[dry-run] Would replace {{PROJECT_NAME}} in ${file}"
		else
			sed_inplace "s/{{PROJECT_NAME}}/${SAFE_PROJECT_NAME}/g" "${filepath}"
		fi
		changed=true
	fi

	if grep -q '{{COPYRIGHT_HOLDER}}' "${filepath}" 2>/dev/null; then
		if [[ ${DRY_RUN} == "true" ]]; then
			info "[dry-run] Would replace {{COPYRIGHT_HOLDER}} in ${file}"
		else
			sed_inplace "s/{{COPYRIGHT_HOLDER}}/${SAFE_COPYRIGHT}/g" "${filepath}"
		fi
		changed=true
	fi

	if grep -q '{{YEAR}}' "${filepath}" 2>/dev/null; then
		if [[ ${DRY_RUN} == "true" ]]; then
			info "[dry-run] Would replace {{YEAR}} in ${file}"
		else
			sed_inplace "s/{{YEAR}}/${YEAR}/g" "${filepath}"
		fi
		changed=true
	fi

	if [[ ${changed} == "true" ]]; then
		CHANGED_FILES+=("${file}")
		success "Updated: ${file}"
	fi
done

# ═══════════════════════════════════════════════════════════════════════════
# Optional: Generate pre-filled TECH-STACK.md
# ═══════════════════════════════════════════════════════════════════════════
if [[ ${STACK_CHOICE} != "13" ]] && [[ ${#STACK_ROWS[@]} -gt 0 ]]; then
	header "Generating TECH-STACK.md"

	TECH_STACK_FILE="${SCRIPT_DIR}/docs/TECH-STACK.md"

	if [[ ${DRY_RUN} == "true" ]]; then
		info "[dry-run] Would generate: docs/TECH-STACK.md (${STACK_NAME} preset)"
		CHANGED_FILES+=("docs/TECH-STACK.md (generated)")
	else

		# Build the Core Stack table rows
		CORE_TABLE=""
		for row in "${STACK_ROWS[@]}"; do
			CORE_TABLE="${CORE_TABLE}| ${row} |
"
		done

		cat >"${TECH_STACK_FILE}" <<TECHEOF
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
	fi # end dry-run guard
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

if [[ -z ${CLEANUP_CHOICE-} ]]; then
	ask "Clean up? [1-2]" "2" CLEANUP_CHOICE
fi

if [[ ${CLEANUP_CHOICE} == "1" ]]; then
	STEERING_DIR="${SCRIPT_DIR}/.kiro/steering"
	REMOVED_STEERING=()

	# Stack-specific steering docs to conditionally remove
	# Only remove docs for stacks the user did NOT choose
	case "${STACK_CHOICE}" in
	1) # T3 — keep 60, remove 53 (default Next.js patterns overlap with T3), 61, 62
		for f in "53-nextjs.md" "61-t4-stack.md" "62-tanstack.md"; do
			if [[ -f "${STEERING_DIR}/${f}" ]]; then
				if [[ ${DRY_RUN} == "true" ]]; then
					info "[dry-run] Would remove: .kiro/steering/${f}"
				else
					rm -f "${STEERING_DIR}/${f}"
				fi
				REMOVED_STEERING+=("${f}")
			fi
		done
		;;
	2) # T4 — keep 61, remove 53, 60, 62
		for f in "53-nextjs.md" "60-t3-stack.md" "62-tanstack.md"; do
			if [[ -f "${STEERING_DIR}/${f}" ]]; then
				if [[ ${DRY_RUN} == "true" ]]; then
					info "[dry-run] Would remove: .kiro/steering/${f}"
				else
					rm -f "${STEERING_DIR}/${f}"
				fi
				REMOVED_STEERING+=("${f}")
			fi
		done
		;;
	3) # Supabase + Next.js (Default) — keep 53, remove 60, 61, 62
		for f in "60-t3-stack.md" "61-t4-stack.md" "62-tanstack.md"; do
			if [[ -f "${STEERING_DIR}/${f}" ]]; then
				if [[ ${DRY_RUN} == "true" ]]; then
					info "[dry-run] Would remove: .kiro/steering/${f}"
				else
					rm -f "${STEERING_DIR}/${f}"
				fi
				REMOVED_STEERING+=("${f}")
			fi
		done
		;;
	12) # TanStack Start — keep 62, remove 53, 60, 61
		for f in "53-nextjs.md" "60-t3-stack.md" "61-t4-stack.md"; do
			if [[ -f "${STEERING_DIR}/${f}" ]]; then
				if [[ ${DRY_RUN} == "true" ]]; then
					info "[dry-run] Would remove: .kiro/steering/${f}"
				else
					rm -f "${STEERING_DIR}/${f}"
				fi
				REMOVED_STEERING+=("${f}")
			fi
		done
		;;
	*) # Other stacks (Vite, Svelte, Nuxt, etc.) — remove all 4 stack-specific docs
		for f in "53-nextjs.md" "60-t3-stack.md" "61-t4-stack.md" "62-tanstack.md"; do
			if [[ -f "${STEERING_DIR}/${f}" ]]; then
				if [[ ${DRY_RUN} == "true" ]]; then
					info "[dry-run] Would remove: .kiro/steering/${f}"
				else
					rm -f "${STEERING_DIR}/${f}"
				fi
				REMOVED_STEERING+=("${f}")
			fi
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

if [[ -z ${EXAMPLES_CHOICE-} ]]; then
	ask "Remove examples? [1-2]" "2" EXAMPLES_CHOICE
fi

if [[ ${EXAMPLES_CHOICE} == "1" ]]; then
	SPECS_DIR="${SCRIPT_DIR}/.kiro/specs"
	for spec_dir in "${SPECS_DIR}"/✅_* "${SPECS_DIR}"/📋_* "${SPECS_DIR}"/🚧_* "${SPECS_DIR}"/⏸️_*; do
		if [[ -d ${spec_dir} ]]; then
			if [[ ${DRY_RUN} == "true" ]]; then
				info "[dry-run] Would remove: $(basename "${spec_dir}")"
			else
				rm -rf "${spec_dir}"
				success "Removed: $(basename "${spec_dir}")"
			fi
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
echo -e "  ${COLOR_BOLD}Project:${COLOR_RESET}     ${PROJECT_NAME}"
echo -e "  ${COLOR_BOLD}Copyright:${COLOR_RESET}   ${YEAR} ${COPYRIGHT_HOLDER}"
echo -e "  ${COLOR_BOLD}Stack:${COLOR_RESET}       ${STACK_NAME}"
echo -e "  ${COLOR_BOLD}Pkg Manager:${COLOR_RESET} ${PKG_MGR}"
echo ""

if [[ ${#CHANGED_FILES[@]} -gt 0 ]]; then
	info "Files updated:"
	for f in "${CHANGED_FILES[@]}"; do
		echo -e "    ${COLOR_GREEN}•${COLOR_RESET} ${f}"
	done
	echo ""
fi

info "Remaining TODO markers in steering and doc files need manual customisation."
info "Search for <!-- TODO: to find them."
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# Self-Cleanup
# ═══════════════════════════════════════════════════════════════════════════
if [[ -z ${REMOVE_SELF-} ]]; then
	ask "Remove setup.sh now that setup is complete? (y/n)" "y" REMOVE_SELF
fi

if [[ ${REMOVE_SELF} == "y" || ${REMOVE_SELF} == "Y" ]]; then
	if [[ ${DRY_RUN} == "true" ]]; then
		info "[dry-run] Would remove: setup.sh"
	else
		rm -f "${SCRIPT_DIR}/setup.sh"
		success "Removed setup.sh"
	fi
else
	info "Kept setup.sh — you can delete it manually later."
fi

echo ""
success "You're all set. Happy building!"
echo ""
