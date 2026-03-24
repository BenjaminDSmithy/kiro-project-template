/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Unit tests for configuration file loader module
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import type { MockInstance } from "vitest";

import { loadConfig } from "./config.js";

type WriteSpy = MockInstance<{
  (buffer: string | Uint8Array, cb?: (err?: Error | null) => void): boolean;
  (
    str: string | Uint8Array,
    encoding?: BufferEncoding,
    cb?: (err?: Error | null) => void,
  ): boolean;
}>;

describe("loadConfig", () => {
  let tmpDir: string;
  let stderrSpy: WriteSpy;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), "config-test-"));
    stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe("explicit configPath", () => {
    it("should load a valid config from an explicit path", () => {
      // Arrange
      const configFile = path.join(tmpDir, "my-config.json");
      writeFileSync(
        configFile,
        JSON.stringify({ copyrightHolder: "Acme Corp", pkgManager: "pnpm" }),
      );

      // Act
      const result = loadConfig(tmpDir, configFile);

      // Assert
      expect(result).toEqual({
        copyrightHolder: "Acme Corp",
        pkgManager: "pnpm",
      });
    });

    it("should throw when explicit config path does not exist", () => {
      // Arrange
      const missingPath = path.join(tmpDir, "nonexistent.json");

      // Act & Assert
      expect(() => loadConfig(tmpDir, missingPath)).toThrow(
        /Config file not found at/,
      );
    });
  });

  describe("auto-discovery", () => {
    it("should find config in the start directory", () => {
      // Arrange
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        JSON.stringify({ stack: "T3" }),
      );

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({ stack: "T3" });
    });

    it("should walk up and find config in a parent directory", () => {
      // Arrange
      const child = path.join(tmpDir, "a", "b", "c");
      mkdirSync(child, { recursive: true });
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        JSON.stringify({ copyrightHolder: "Parent Corp" }),
      );

      // Act
      const result = loadConfig(child);

      // Assert
      expect(result).toEqual({ copyrightHolder: "Parent Corp" });
    });

    it("should return empty object when no config file is found", () => {
      // Arrange — tmpDir has no config file

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({});
    });

    it("should find the nearest ancestor config file", () => {
      // Arrange
      const child = path.join(tmpDir, "deep");
      mkdirSync(child, { recursive: true });
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        JSON.stringify({ stack: "root-level" }),
      );
      writeFileSync(
        path.join(child, ".create-kiro-project.json"),
        JSON.stringify({ stack: "child-level" }),
      );

      // Act
      const result = loadConfig(child);

      // Assert
      expect(result).toEqual({ stack: "child-level" });
    });
  });

  describe("JSON parsing and validation", () => {
    it("should return empty object for malformed JSON and warn to stderr", () => {
      // Arrange
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        "{ not valid json",
      );

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({});
      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining("Warning: Failed to parse config file"),
      );
    });

    it("should return empty object for a JSON array", () => {
      // Arrange
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        JSON.stringify([1, 2, 3]),
      );

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({});
    });

    it("should return empty object for JSON null", () => {
      // Arrange
      writeFileSync(path.join(tmpDir, ".create-kiro-project.json"), "null");

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({});
    });

    it("should silently ignore unknown fields", () => {
      // Arrange
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        JSON.stringify({
          copyrightHolder: "Acme",
          unknownField: "should be ignored",
          anotherUnknown: 42,
        }),
      );

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({ copyrightHolder: "Acme" });
      expect(result).not.toHaveProperty("unknownField");
      expect(result).not.toHaveProperty("anotherUnknown");
    });

    it("should accept all valid fields", () => {
      // Arrange
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        JSON.stringify({
          copyrightHolder: "Acme Corp",
          stack: "T3",
          pkgManager: "yarn",
          customStacks: "./stacks.json",
        }),
      );

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({
        copyrightHolder: "Acme Corp",
        stack: "T3",
        pkgManager: "yarn",
        customStacks: "./stacks.json",
      });
    });

    it("should skip non-string field values", () => {
      // Arrange
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        JSON.stringify({
          copyrightHolder: 123,
          stack: true,
          customStacks: null,
        }),
      );

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({});
    });
  });

  describe("pkgManager validation", () => {
    it.each(["npm", "pnpm", "yarn", "bun"])(
      "should accept valid pkgManager '%s'",
      (manager) => {
        // Arrange
        writeFileSync(
          path.join(tmpDir, ".create-kiro-project.json"),
          JSON.stringify({ pkgManager: manager }),
        );

        // Act
        const result = loadConfig(tmpDir);

        // Assert
        expect(result).toEqual({ pkgManager: manager });
      },
    );

    it("should drop invalid pkgManager value", () => {
      // Arrange
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        JSON.stringify({ pkgManager: "deno" }),
      );

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({});
      expect(result).not.toHaveProperty("pkgManager");
    });

    it("should drop non-string pkgManager value", () => {
      // Arrange
      writeFileSync(
        path.join(tmpDir, ".create-kiro-project.json"),
        JSON.stringify({ pkgManager: 42 }),
      );

      // Act
      const result = loadConfig(tmpDir);

      // Assert
      expect(result).toEqual({});
    });
  });
});
