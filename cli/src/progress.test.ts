/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Unit tests for progress reporter module
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

import { createProgress } from "./progress.js";

/** Spy type matching the overloaded process.stderr.write signature. */
type WriteSpy = MockInstance<{
  (buffer: string | Uint8Array, cb?: (err?: Error | null) => void): boolean;
  (
    str: string | Uint8Array,
    encoding?: BufferEncoding,
    cb?: (err?: Error | null) => void,
  ): boolean;
}>;

describe("createProgress", () => {
  let originalIsTTY: typeof process.stderr.isTTY;
  let stderrSpy: WriteSpy;

  beforeEach(() => {
    originalIsTTY = process.stderr.isTTY;
    stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  afterEach(() => {
    (process.stderr as { isTTY?: boolean }).isTTY = originalIsTTY;
    vi.restoreAllMocks();
  });

  describe("tick", () => {
    it("should increment copied count correctly", () => {
      // Arrange
      const progress = createProgress();

      // Act
      progress.tick("copied");
      progress.tick("copied");
      progress.tick("copied");

      // Assert
      const summary = progress.summary();
      expect(summary).toContain("3 copied");
    });

    it("should increment replaced count correctly", () => {
      // Arrange
      const progress = createProgress();

      // Act
      progress.tick("replaced");
      progress.tick("replaced");

      // Assert
      const summary = progress.summary();
      expect(summary).toContain("2 replaced");
    });

    it("should increment removed count correctly", () => {
      // Arrange
      const progress = createProgress();

      // Act
      progress.tick("removed");

      // Assert
      const summary = progress.summary();
      expect(summary).toContain("1 removed");
    });

    it("should track multiple categories independently", () => {
      // Arrange
      const progress = createProgress();

      // Act
      progress.tick("copied");
      progress.tick("copied");
      progress.tick("replaced");
      progress.tick("removed");
      progress.tick("removed");
      progress.tick("removed");

      // Assert
      const summary = progress.summary();
      expect(summary).toContain("2 copied");
      expect(summary).toContain("1 replaced");
      expect(summary).toContain("3 removed");
    });
  });

  describe("summary", () => {
    it("should return formatted string with correct counts", () => {
      // Arrange
      const progress = createProgress();
      progress.tick("copied");
      progress.tick("replaced");
      progress.tick("removed");

      // Act
      const result = progress.summary();

      // Assert
      expect(result).toContain("1 copied");
      expect(result).toContain("1 replaced");
      expect(result).toContain("1 removed");
    });

    it("should return 'No file operations performed.' when no ticks", () => {
      // Arrange
      const progress = createProgress();

      // Act
      const result = progress.summary();

      // Assert
      expect(result).toBe("No file operations performed.");
    });

    it("should omit categories with zero counts", () => {
      // Arrange
      const progress = createProgress();
      progress.tick("copied");

      // Act
      const result = progress.summary();

      // Assert
      expect(result).toContain("1 copied");
      expect(result).not.toContain("replaced");
      expect(result).not.toContain("removed");
    });
  });

  describe("TTY mode", () => {
    it("should hide cursor on start in TTY mode", () => {
      // Arrange
      (process.stderr as { isTTY?: boolean }).isTTY = true;
      const progress = createProgress();

      // Act
      progress.start("Copying files...");

      // Assert — check for cursor hide escape sequence
      const allOutput = stderrSpy.mock.calls
        .map((call) => String(call[0]))
        .join("");
      expect(allOutput).toContain("\x1B[?25l");

      // Cleanup
      progress.stop();
    });

    it("should restore cursor on stop in TTY mode", () => {
      // Arrange
      (process.stderr as { isTTY?: boolean }).isTTY = true;
      const progress = createProgress();
      progress.start("Working...");

      // Act
      progress.stop();

      // Assert — check for cursor show escape sequence
      const allOutput = stderrSpy.mock.calls
        .map((call) => String(call[0]))
        .join("");
      expect(allOutput).toContain("\x1B[?25h");
    });

    it("should begin spinner animation in TTY mode", () => {
      // Arrange
      vi.useFakeTimers();
      (process.stderr as { isTTY?: boolean }).isTTY = true;
      const progress = createProgress();

      // Act
      progress.start("Scaffolding...");
      vi.advanceTimersByTime(200);

      // Assert — spinner writes use \r for overwrite
      const calls = stderrSpy.mock.calls.map((call) => String(call[0]));
      const spinnerWrites = calls.filter((c) => c.includes("\r"));
      expect(spinnerWrites.length).toBeGreaterThan(0);

      // Cleanup
      progress.stop();
      vi.useRealTimers();
    });
  });

  describe("non-TTY mode", () => {
    it("should write newline-terminated line on start", () => {
      // Arrange
      (process.stderr as { isTTY?: boolean }).isTTY = undefined;
      const progress = createProgress();

      // Act
      progress.start("Copying files...");

      // Assert
      const output = String(stderrSpy.mock.calls[0]?.[0]);
      expect(output).toBe("Copying files...\n");

      // Cleanup
      progress.stop();
    });

    it("should write newline-terminated line on update", () => {
      // Arrange
      (process.stderr as { isTTY?: boolean }).isTTY = undefined;
      const progress = createProgress();
      progress.start("Starting...");

      // Act
      progress.update("Processing 10 files...");

      // Assert — second call (after start) should be the update
      const updateOutput = String(stderrSpy.mock.calls[1]?.[0]);
      expect(updateOutput).toBe("Processing 10 files...\n");

      // Cleanup
      progress.stop();
    });

    it("should not emit cursor control sequences", () => {
      // Arrange
      (process.stderr as { isTTY?: boolean }).isTTY = undefined;
      const progress = createProgress();

      // Act
      progress.start("Working...");
      progress.update("Still working...");
      progress.stop();

      // Assert — no cursor hide/show sequences
      const allOutput = stderrSpy.mock.calls
        .map((call) => String(call[0]))
        .join("");
      expect(allOutput).not.toContain("\x1B[?25l");
      expect(allOutput).not.toContain("\x1B[?25h");
    });

    it("should not use carriage return for overwrites", () => {
      // Arrange
      (process.stderr as { isTTY?: boolean }).isTTY = false;
      const progress = createProgress();

      // Act
      progress.start("Working...");
      progress.update("Still working...");
      progress.stop();

      // Assert — no \r characters
      const allOutput = stderrSpy.mock.calls
        .map((call) => String(call[0]))
        .join("");
      expect(allOutput).not.toContain("\r");
    });
  });

  describe("stop", () => {
    it("should clear interval and allow safe re-start", () => {
      // Arrange
      vi.useFakeTimers();
      (process.stderr as { isTTY?: boolean }).isTTY = true;
      const progress = createProgress();
      progress.start("Working...");

      // Act
      progress.stop();
      const callCountAfterStop = stderrSpy.mock.calls.length;
      vi.advanceTimersByTime(500);

      // Assert — no more writes after stop
      expect(stderrSpy.mock.calls.length).toBe(callCountAfterStop);

      // Cleanup
      vi.useRealTimers();
    });
  });
});
