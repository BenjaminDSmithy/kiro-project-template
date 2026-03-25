/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project template directory validator module
 */

import { existsSync } from "node:fs";
import path from "node:path";

/** Subdirectories expected inside the templates directory. */
const REQUIRED_SUBDIRS = ["kiro", "codex", "docs", "root"] as const;

/**
 * Builds a user-friendly error message for a missing template path,
 * suggesting reinstallation as the likely fix.
 *
 * @param missingPath - The absolute path that was not found
 * @returns Formatted error message string
 */
function missingPathError(missingPath: string): string {
  return `Template directory not found at ${missingPath}. The package may be corrupted — try reinstalling with npm install -g create-kiro-project.`;
}

/**
 * Asserts that the templates directory exists and contains expected
 * subdirectories (kiro/, codex/, docs/, root/). Throws a user-friendly error
 * if missing — not a cryptic ENOENT.
 *
 * @param templatesDir - Absolute path to the bundled templates directory
 * @throws Error if templatesDir or any required subdirectory is missing
 */
export function validateTemplateDir(templatesDir: string): void {
  if (!existsSync(templatesDir)) {
    throw new Error(missingPathError(templatesDir));
  }

  for (const subdir of REQUIRED_SUBDIRS) {
    const subdirPath = path.join(templatesDir, subdir);
    if (!existsSync(subdirPath)) {
      throw new Error(missingPathError(subdirPath));
    }
  }
}
