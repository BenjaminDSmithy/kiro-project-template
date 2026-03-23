/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Property-based tests for progress reporter TTY degradation
 */

import * as fc from "fast-check";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

import type { TickCategory } from "./progress.js";
import { createProgress } from "./progress.js";

/** All valid tick categories accepted by the progress reporter. */
const TICK_CATEGORIES: TickCategory[] = ["copied", "replaced", "removed"];

/**
 * Arbitrary that generates a single progress operation as a thunk.
 * Covers start, update, tick, and stop with random string arguments.
 */
const progressOpArb = fc.oneof(
  fc
    .string({ minLength: 1 })
    .map((msg) => (p: ReturnType<typeof createProgress>) => p.start(msg)),
  fc
    .string({ minLength: 1 })
    .map((msg) => (p: ReturnType<typeof createProgress>) => p.update(msg)),
  fc
    .constantFrom(...TICK_CATEGORIES)
    .map((cat) => (p: ReturnType<typeof createProgress>) => p.tick(cat)),
  fc.constant((p: ReturnType<typeof createProgress>) => p.stop()),
);

/**
 * Arbitrary that generates a valid operation sequence: always starts
 * with a `start` call and ends with a `stop` call, with arbitrary
 * operations in between.
 */
const progressSequenceArb = fc
  .tuple(
    fc.string({ minLength: 1 }),
    fc.array(progressOpArb, { minLength: 0, maxLength: 20 }),
  )
  .map(([startMsg, middleOps]) => {
    const start = (p: ReturnType<typeof createProgress>) => p.start(startMsg);
    const stop = (p: ReturnType<typeof createProgress>) => p.stop();
    return [start, ...middleOps, stop];
  });

describe("createProgress — Property Tests", () => {
  let originalIsTTY: typeof process.stderr.isTTY;

  beforeEach(() => {
    originalIsTTY = process.stderr.isTTY;
  });

  afterEach(() => {
    (process.stderr as { isTTY?: boolean }).isTTY = originalIsTTY;
    vi.restoreAllMocks();
  });

  /**
   * **Validates: Requirements 5.2, 5.6**
   *
   * Property 8: Progress Reporter TTY Degradation
   *
   * For any non-TTY environment, the ProgressReporter from createProgress()
   * produces only newline-terminated lines on stderr — no \r cursor overwrites
   * and no cursor control sequences.
   */
  it(
    "should produce only newline-terminated lines on stderr with no cursor control in non-TTY",
    { timeout: 30000 },
    () => {
      fc.assert(
        fc.property(
          progressSequenceArb,
          fc.constantFrom(undefined, false),
          (ops, ttyValue) => {
            // Arrange — simulate non-TTY environment
            (process.stderr as { isTTY?: boolean }).isTTY = ttyValue as
              | boolean
              | undefined;

            const writtenChunks: string[] = [];
            const stderrSpy = vi
              .spyOn(process.stderr, "write")
              .mockImplementation((chunk: string | Uint8Array) => {
                writtenChunks.push(String(chunk));
                return true;
              });

            // Act — create progress reporter and run all operations
            const progress = createProgress();
            for (const op of ops) {
              op(progress);
            }

            // Cleanup spy before assertions
            stderrSpy.mockRestore();

            // Assert — all output must be newline-terminated lines
            for (const chunk of writtenChunks) {
              // No carriage return characters allowed
              if (chunk.includes("\r")) {
                return false;
              }

              // No cursor hide/show escape sequences
              if (chunk.includes("\x1B[?25l") || chunk.includes("\x1B[?25h")) {
                return false;
              }

              // Every non-empty chunk must end with \n
              if (chunk.length > 0 && !chunk.endsWith("\n")) {
                return false;
              }
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
