/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Property-based tests for template directory validation completeness
 */

import * as fc from "fast-check";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { validateTemplateDir } from "./validator.js";

/** All subdirectories required by the template validator. */
const REQUIRED_SUBDIRS = ["kiro", "docs", "root"] as const;

describe("validateTemplateDir — Property Tests", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), "validator-prop-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  /**
   * **Validates: Requirements 4.1, 4.2, 4.4**
   *
   * Property 4: Template Validation Completeness
   *
   * For any templates directory missing one or more of kiro/, docs/, root/,
   * validateTemplateDir() throws a descriptive error before any copy
   * operation begins.
   */
  it(
    "should throw a descriptive error for any subset missing at least one required subdirectory",
    { timeout: 30000 },
    () => {
      fc.assert(
        fc.property(
          fc.subarray([...REQUIRED_SUBDIRS], { minLength: 0, maxLength: 2 }),
          (presentDirs) => {
            // Arrange — create a fresh temp dir with only the selected subset
            const testDir = mkdtempSync(path.join(tmpDir, "templates-"));
            for (const dir of presentDirs) {
              mkdirSync(path.join(testDir, dir));
            }

            // Act & Assert — at least one dir is missing, so it must throw
            try {
              validateTemplateDir(testDir);
              // If we reach here, the validator did not throw — property fails
              return false;
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              return (
                message.includes("Template directory not found at") &&
                message.includes("reinstalling")
              );
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  /**
   * **Validates: Requirements 4.1, 4.2, 4.4**
   *
   * Property 4 (edge case): When the templates directory itself does not
   * exist, validateTemplateDir() throws a descriptive error.
   */
  it(
    "should throw a descriptive error when the templates directory does not exist",
    { timeout: 30000 },
    () => {
      fc.assert(
        fc.property(fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}$/), (dirName) => {
          // Arrange — build a path that does not exist on disk
          const nonExistentDir = path.join(tmpDir, dirName, "nonexistent");

          // Act & Assert
          try {
            validateTemplateDir(nonExistentDir);
            return false;
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return (
              message.includes("Template directory not found at") &&
              message.includes("reinstalling")
            );
          }
        }),
        { numRuns: 100 },
      );
    },
  );
});
