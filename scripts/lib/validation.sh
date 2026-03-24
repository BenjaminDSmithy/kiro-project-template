#!/usr/bin/env bash
# ============================================================================
# validation.sh — Input validation and .env file validation helpers
#
# Provides:
#   validate_non_empty, validate_numeric, validate_copyright_year,
#   validate_choice, validate_project_name, validate_path_exists,
#   validate_env_file
#
# Requires: utils.sh to be sourced first (for log_info, log_warn, log_error)
#
# Usage:
#   source scripts/lib/utils.sh
#   source scripts/lib/validation.sh
#   validate_non_empty "VAR_NAME" "$value"
#   validate_env_file "path/to/.env"
# ============================================================================

# ---------------------------------------------------------------------------
# validate_non_empty — Reject empty values for required variables
# Usage: validate_non_empty "VAR_NAME" "$value"
# Returns: 0 if value is non-empty, 1 if empty (logs error)
# ---------------------------------------------------------------------------
validate_non_empty() {
	local var_name="$1"
	local value="${2-}"

	if [[ -z ${value} ]]; then
		log_error "${var_name} is required and cannot be empty"
		return 1
	fi
	return 0
}

# ---------------------------------------------------------------------------
# validate_numeric — Reject non-numeric values (positive integers only)
# Usage: validate_numeric "VAR_NAME" "$value"
# Returns: 0 if value is a positive integer, 1 otherwise (logs error)
# ---------------------------------------------------------------------------
validate_numeric() {
	local var_name="$1"
	local value="${2-}"

	if [[ -z ${value} ]]; then
		log_error "${var_name} is required and cannot be empty"
		return 1
	fi

	if ! [[ ${value} =~ ^[0-9]+$ ]]; then
		log_error "${var_name} must be a positive integer, got: '${value}'"
		return 1
	fi

	return 0
}

# ---------------------------------------------------------------------------
# validate_copyright_year — Accept a single year (2026) or range (2022-2026)
# Usage: validate_copyright_year "$value"
# Returns: 0 if valid, 1 otherwise (logs error)
# ---------------------------------------------------------------------------
validate_copyright_year() {
	local value="${1-}"

	if [[ -z ${value} ]]; then
		log_error "Copyright year is required and cannot be empty"
		return 1
	fi

	# Must contain only digits and optionally one dash
	if ! [[ ${value} =~ ^[0-9]{4}(-[0-9]{4})?$ ]]; then
		log_error "Copyright year must be a 4-digit year (e.g. 2026) or range (e.g. 2022-2026), got: '${value}'"
		return 1
	fi

	# If range, ensure end year >= start year
	if [[ ${value} == *-* ]]; then
		local start_year="${value%%-*}"
		local end_year="${value##*-}"
		if ((end_year < start_year)); then
			log_error "Copyright year range end (${end_year}) must be >= start (${start_year})"
			return 1
		fi
	fi

	return 0
}

# ---------------------------------------------------------------------------
# validate_choice — Validate a bounded numeric menu choice (e.g. 1-13)
# Usage: validate_choice "$value" min max
# Returns: 0 if value is an integer within [min, max], 1 otherwise
# ---------------------------------------------------------------------------
validate_choice() {
	local value="${1-}"
	local min="$2"
	local max="$3"

	if [[ -z ${value} ]]; then
		log_error "Choice is required and cannot be empty"
		return 1
	fi

	if ! [[ ${value} =~ ^[0-9]+$ ]]; then
		log_error "Choice must be a number, got: '${value}'"
		return 1
	fi

	if ((value < min || value > max)); then
		log_error "Choice must be between ${min} and ${max}, got: ${value}"
		return 1
	fi

	return 0
}

# ---------------------------------------------------------------------------
# validate_project_name — Validate project name (alphanumeric, dashes, underscores)
# Usage: validate_project_name "$value"
# Returns: 0 if valid, 1 otherwise (logs error)
# ---------------------------------------------------------------------------
validate_project_name() {
	local value="${1-}"

	if [[ -z ${value} ]]; then
		log_error "Project name is required and cannot be empty"
		return 1
	fi

	# Allow alphanumeric, dashes, underscores, dots, and spaces
	if ! [[ ${value} =~ ^[a-zA-Z0-9][a-zA-Z0-9._\ -]*$ ]]; then
		log_error "Project name must start with a letter or number and contain only letters, numbers, dashes, underscores, dots, or spaces, got: '${value}'"
		return 1
	fi

	return 0
}

# ---------------------------------------------------------------------------
# validate_path_exists — Check if a path exists; offer to create it
# Usage: validate_path_exists "/path/to/dir"
# In interactive mode: prompts user to create the directory
# In headless mode: returns 1 if path doesn't exist
# Returns: 0 if path exists (or was created), 1 otherwise
# ---------------------------------------------------------------------------
validate_path_exists() {
	local path="$1"

	if [[ -d ${path} ]]; then
		return 0
	fi

	if [[ ${HEADLESS:-false} == "true" ]]; then
		log_error "Path does not exist: ${path}"
		return 1
	fi

	# Interactive mode — offer to create the directory
	log_warn "Path does not exist: ${path}"
	local reply
	read -r -p "Create directory '${path}'? [y/N] " reply </dev/tty
	case "${reply}" in
	[yY] | [yY][eE][sS])
		if mkdir -p "${path}" 2>/dev/null; then
			log_info "Created directory: ${path}"
			return 0
		else
			log_error "Failed to create directory: ${path}"
			return 1
		fi
		;;
	*)
		log_error "Path does not exist and was not created: ${path}"
		return 1
		;;
	esac
}

# ---------------------------------------------------------------------------
# validate_env_file — Validate a .env file against its .env.example
#
# Checks:
#   - Missing required variables (present in .env.example but not in .env)
#   - Unchanged placeholder passwords (CHANGE_ME / changeme)
#   - Invalid port numbers (*_PORT variables must be numeric, 1–65535)
#
# Arguments: $1=env_file_path  $2=example_file_path (optional, defaults to $1.example)
# Returns: 0 if valid, 1 if errors found
# ---------------------------------------------------------------------------
validate_env_file() {
	local env_file="$1"
	local example_file="${2:-${env_file}.example}"
	local errors=0
	local file_label
	file_label="$(basename "${env_file}")"

	if [[ ! -f ${env_file} ]]; then
		log_warn "${file_label}: file not found, skipping"
		return 1
	fi

	if [[ ! -f ${example_file} ]]; then
		log_warn "${file_label}: no matching .env.example found, skipping"
		return 1
	fi

	log_info "Checking ${file_label}..."

	# Extract variable names from a file (ignoring comments and blank lines)
	_extract_vars() {
		grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$1" | cut -d'=' -f1 | sort -u
	}

	# Get value of a variable from a file
	_get_value() {
		grep -E "^${2}=" "$1" | tail -1 | cut -d'=' -f2-
	}

	# Check for missing required variables
	while IFS= read -r var; do
		if ! grep -qE "^${var}=" "${env_file}"; then
			log_error "[${file_label}] ${var}: missing (defined in ${file_label}.example)"
			((errors++)) || true
		fi
	done < <(_extract_vars "${example_file}")

	# Check for unchanged placeholder passwords
	while IFS= read -r var; do
		local value
		value="$(_get_value "${env_file}" "${var}")"
		if [[ ${value} == "CHANGE_ME" || ${value} == "CHANGE_ME_GENERATE_A_SECRET" || ${value} == "changeme" ]]; then
			log_error "[${file_label}] ${var}: still set to placeholder '${value}'"
			((errors++)) || true
		fi
	done < <(_extract_vars "${env_file}")

	# Check port variables
	while IFS= read -r var; do
		local value
		value="$(_get_value "${env_file}" "${var}")"
		[[ -z ${value} ]] && continue

		if ! [[ ${value} =~ ^[0-9]+$ ]]; then
			log_error "[${file_label}] ${var}: invalid port '${value}' — must be a number (1–65535)"
			((errors++)) || true
			continue
		fi

		if ((value < 1 || value > 65535)); then
			log_error "[${file_label}] ${var}: port ${value} out of range (1–65535)"
			((errors++)) || true
		fi
	done < <(_extract_vars "${env_file}" | grep '_PORT$')

	if [[ ${errors} -gt 0 ]]; then
		log_error "${file_label}: ${errors} error(s) found"
		return 1
	fi

	log_info "${file_label}: OK"
	return 0
}
