/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Property-based tests for verbose logger zero overhead
 */

import * as fc from "fast-check";
import { afterEach, describe, it, vi } from "vitest";

import { createLogger } from "./logger.js";

/** All valid file operation types accepted by `fileOp`. */
const FILE_OPS = ["copy", "replace", "remove", "skip"] as const;

/**
 * Arbitrary that generates a single logger method call as a thunk.
 * Covers all five VerboseLogger methods with random string arguments.
 */
const loggerCallArb = fc.oneof(
  fc.tuple(fc.constantFrom(...FILE_OPS), fc.string()).map(
    ([op, path]) =>
      (l: ReturnType<typeof createLogger>) =>
        l.fileOp(op, path),
  ),
  fc
    .string()
    .map((s) => (l: ReturnType<typeof createLogger>) => l.configLoaded(s)),
  fc
    .string()
    .map((s) => (l: ReturnType<typeof createLogger>) => l.steeringRemoved(s)),
  fc
    .string()
    .map(
      (s) => (l: ReturnType<typeof createLogger>) => l.exampleSpecRemoved(s),
    ),
  fc
    .string()
    .map((s) => (l: ReturnType<typeof createLogger>) => l.customStackLoaded(s)),
);

describe("createLogger — Property Tests", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * **Validates: Requirements 2.6**
   *
   * Property 7: Verbose Logger Zero Overhead
   *
   * For any sequence of logger method calls, `createLogger(false)` produces
   * zero output to stdout or stderr.
   */
  it(
    "should produce zero output to stdout or stderr when verbose is false",
    { timeout: 30000 },
    () => {
      fc.assert(
        fc.property(fc.array(loggerCallArb, { minLength: 1 }), (calls) => {
          // Arrange — spy on process write methods
          const stderrSpy = vi
            .spyOn(process.stderr, "write")
            .mockReturnValue(true);
          const stdoutSpy = vi
            .spyOn(process.stdout, "write")
            .mockReturnValue(true);

          // Act — create a silent logger and invoke all generated calls
          const logger = createLogger(false);
          for (const call of calls) {
            call(logger);
          }

          // Assert — zero writes to either stream
          const stderrCalls = stderrSpy.mock.calls.length;
          const stdoutCalls = stdoutSpy.mock.calls.length;

          stderrSpy.mockRestore();
          stdoutSpy.mockRestore();

          return stderrCalls === 0 && stdoutCalls === 0;
        }),
        { numRuns: 100 },
      );
    },
  );
});
