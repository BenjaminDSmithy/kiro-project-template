/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Property-based tests for config file idempotency
 */

import * as fc from "fast-check";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { loadConfig } from "./config.js";

/** Valid package manager values accepted by the config loader. */
const VALID_PKG_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;

/**
 * Arbitrary that generates a valid ProjectConfigFile object with
 * optional fields: copyrightHolder, stack, pkgManager, customStacks.
 */
const configArb = fc.record(
  {
    copyrightHolder: fc.string({ minLength: 1 }),
    stack: fc.string({ minLength: 1 }),
    pkgManager: fc.constantFrom(...VALID_PKG_MANAGERS),
    customStacks: fc.string({ minLength: 1 }),
  },
  { requiredKeys: [] },
);

describe("loadConfig — Property Tests", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), "config-prop-"));
    vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  /**
   * **Validates: Requirements 3.1, 3.5**
   *
   * Property 1: Config File Idempotency
   *
   * For any valid `.create-kiro-project.json` file, calling `loadConfig(dir)`
   * multiple times from the same directory always returns the same
   * `ProjectConfigFile` object.
   */
  it(
    "should return deeply equal results when called multiple times from the same directory",
    { timeout: 30000 },
    () => {
      fc.assert(
        fc.property(configArb, (config) => {
          // Arrange — write config to temp directory
          const configPath = path.join(tmpDir, ".create-kiro-project.json");
          writeFileSync(configPath, JSON.stringify(config));

          // Act — call loadConfig three times from the same directory
          const result1 = loadConfig(tmpDir);
          const result2 = loadConfig(tmpDir);
          const result3 = loadConfig(tmpDir);

          // Assert — all calls return deeply equal results
          const eq12 = JSON.stringify(result1) === JSON.stringify(result2);
          const eq23 = JSON.stringify(result2) === JSON.stringify(result3);

          return eq12 && eq23;
        }),
        { numRuns: 100 },
      );
    },
  );

  /**
   * **Validates: Requirements 3.3, 3.4**
   *
   * Property 10: Config File Walk-Up Termination
   *
   * For any starting directory (arbitrary nested depth), `loadConfig(startDir)`
   * terminates — it walks up at most to the filesystem root and returns an
   * empty object if no config file is found.
   */
  it(
    "should terminate for any nested directory depth without a config file present",
    { timeout: 30000 },
    () => {
      /** Arbitrary that generates a list of 1-10 subdirectory name segments. */
      const segmentsArb = fc.array(fc.stringMatching(/^[a-zA-Z0-9]{1,8}$/), {
        minLength: 1,
        maxLength: 10,
      });

      fc.assert(
        fc.property(segmentsArb, (segments) => {
          // Arrange — create arbitrarily nested directory with no config file
          const deepDir = path.join(tmpDir, ...segments);
          mkdirSync(deepDir, { recursive: true });

          // Act — call loadConfig from the deepest directory
          const result = loadConfig(deepDir);

          // Assert — returns empty object (terminated without finding config)
          return (
            typeof result === "object" &&
            result !== null &&
            Object.keys(result).length === 0
          );
        }),
        { numRuns: 100 },
      );
    },
  );

  /**
   * **Validates: Requirements 3.3, 3.4**
   *
   * Property 10 (walk-up finds config): For any nested directory depth,
   * when a config file exists at the temp dir root, `loadConfig(deepDir)`
   * walks up and finds it — proving it traverses ancestors correctly.
   */
  it(
    "should walk up and find a config file placed at an ancestor directory",
    { timeout: 30000 },
    () => {
      const segmentsArb = fc.array(fc.stringMatching(/^[a-zA-Z0-9]{1,8}$/), {
        minLength: 1,
        maxLength: 10,
      });

      fc.assert(
        fc.property(segmentsArb, configArb, (segments, config) => {
          // Arrange — place config at tmpDir root, create nested subdirectory
          const configPath = path.join(tmpDir, ".create-kiro-project.json");
          writeFileSync(configPath, JSON.stringify(config));

          const deepDir = path.join(tmpDir, ...segments);
          mkdirSync(deepDir, { recursive: true });

          // Act — call loadConfig from the deepest directory
          const result = loadConfig(deepDir);

          // Assert — result matches what loadConfig returns from the root
          const expected = loadConfig(tmpDir);
          return JSON.stringify(result) === JSON.stringify(expected);
        }),
        { numRuns: 100 },
      );
    },
  );
});
