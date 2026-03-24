/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Property-based tests for custom stack index isolation
 */

import * as fc from "fast-check";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { loadCustomStacks, STACK_PRESETS } from "./stacks.js";

describe("loadCustomStacks — Property Tests", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), "stacks-prop-"));
    // Suppress duplicate-name warnings written to stderr during tests
    vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  /**
   * **Validates: Requirements 6.4, 6.5**
   *
   * Property 6: Custom Stack Index Isolation
   *
   * For any set of custom stacks loaded via loadCustomStacks(), all custom
   * preset indices are strictly greater than the maximum built-in preset
   * index (12), and no built-in preset is overwritten.
   */
  it(
    "should assign custom indices strictly greater than the max built-in index and preserve all built-in presets",
    { timeout: 30000 },
    () => {
      const builtInKeys = Object.keys(STACK_PRESETS).map(Number);
      const maxBuiltInIndex = Math.max(...builtInKeys);

      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9 _-]{0,19}$/),
              rows: fc.array(fc.string()),
              approved: fc.string(),
              keepSteering: fc.array(fc.string()),
            }),
            { minLength: 1, maxLength: 10 },
          ),
          (customStacks) => {
            // Arrange — write custom stacks to a temp JSON file
            const filePath = path.join(tmpDir, `stacks-${Date.now()}.json`);
            writeFileSync(filePath, JSON.stringify(customStacks), "utf-8");

            // Act — load and merge with built-in presets
            const merged = loadCustomStacks(filePath, STACK_PRESETS);

            // Assert 1 — all custom indices are strictly greater than max built-in
            const mergedKeys = Object.keys(merged).map(Number);
            const customKeys = mergedKeys.filter(
              (k) => !builtInKeys.includes(k),
            );
            const allCustomAboveMax = customKeys.every(
              (k) => k > maxBuiltInIndex,
            );

            // Assert 2 — all built-in presets are preserved unchanged
            const builtInsPreserved = builtInKeys.every(
              (k) =>
                merged[k] !== undefined &&
                merged[k].name === STACK_PRESETS[k].name &&
                merged[k].approved === STACK_PRESETS[k].approved,
            );

            // Assert 3 — no built-in key is overwritten with a custom entry
            const noBuiltInOverwritten = builtInKeys.every(
              (k) => merged[k] === STACK_PRESETS[k],
            );

            return (
              allCustomAboveMax && builtInsPreserved && noBuiltInOverwritten
            );
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
