/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project configuration file loader module
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Configuration file schema for `.create-kiro-project.json`.
 * All fields are optional — missing fields fall through to
 * interactive prompts or hardcoded defaults.
 */
export type ProjectConfigFile = {
  copyrightHolder?: string;
  stack?: string;
  pkgManager?: string;
  customStacks?: string; // path to stacks.json
};

/** The well-known config filename used for auto-discovery. */
const CONFIG_FILENAME = ".create-kiro-project.json";

/** Allowed values for the `pkgManager` field. */
const VALID_PKG_MANAGERS = new Set(["npm", "pnpm", "yarn", "bun"]);

/** Fields accepted from the config file — everything else is ignored. */
const ACCEPTED_FIELDS = new Set([
  "copyrightHolder",
  "stack",
  "pkgManager",
  "customStacks",
]);

/**
 * Validates and extracts accepted fields from a parsed JSON object.
 * Unknown fields are silently ignored for forward compatibility.
 * Invalid `pkgManager` values are treated as if not set.
 *
 * @param raw - The parsed JSON value
 * @returns A validated ProjectConfigFile with only accepted fields
 */
function validateConfig(raw: unknown): ProjectConfigFile {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const obj = raw as Record<string, unknown>;
  const result: ProjectConfigFile = {};

  for (const key of ACCEPTED_FIELDS) {
    if (!(key in obj)) continue;

    const value = obj[key];

    if (key === "pkgManager") {
      if (typeof value === "string" && VALID_PKG_MANAGERS.has(value)) {
        result.pkgManager = value;
      }
      // Invalid pkgManager is silently dropped
      continue;
    }

    if (typeof value === "string") {
      result[key as keyof ProjectConfigFile] = value;
    }
  }

  return result;
}

/**
 * Searches for `.create-kiro-project.json` starting from startDir,
 * walking up to the filesystem root. Returns parsed config or empty object.
 * If configPath is provided, reads that file directly instead of walking.
 *
 * - Explicit `configPath`: throws if the file does not exist (intentional path)
 * - Auto-discovery: returns `{}` if no config file is found or JSON is malformed
 *
 * @param startDir - Directory to begin the upward search from
 * @param configPath - Optional explicit path to a config file
 * @returns Validated ProjectConfigFile (may be empty)
 */
export function loadConfig(
  startDir: string,
  configPath?: string,
): ProjectConfigFile {
  // Explicit --config path: read directly, throw if missing
  if (configPath !== undefined) {
    const resolved = path.resolve(configPath);
    if (!existsSync(resolved)) {
      throw new Error(`Config file not found at ${resolved}`);
    }
    return parseConfigFile(resolved);
  }

  // Auto-discovery: walk up from startDir looking for the config file
  let dir = path.resolve(startDir);
  while (true) {
    const candidate = path.join(dir, CONFIG_FILENAME);
    if (existsSync(candidate)) {
      return parseConfigFile(candidate);
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      // Reached filesystem root — no config found
      return {};
    }
    dir = parent;
  }
}

/**
 * Reads and parses a config file at the given path.
 * Malformed JSON returns `{}` with a warning to stderr —
 * the CLI degrades gracefully to no-config behaviour.
 *
 * @param filePath - Absolute path to the config file
 * @returns Validated ProjectConfigFile
 */
function parseConfigFile(filePath: string): ProjectConfigFile {
  try {
    const content = readFileSync(filePath, "utf-8");
    const parsed: unknown = JSON.parse(content);
    return validateConfig(parsed);
  } catch {
    process.stderr.write(
      `Warning: Failed to parse config file at ${filePath}\n`,
    );
    return {};
  }
}
