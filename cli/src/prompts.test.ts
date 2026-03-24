/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Tests for gatherConfig prompt skipping and --yes defaults
 */

import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CliFlags } from "./index.js";

// Mock the prompts module
vi.mock("prompts", () => ({
  default: vi.fn(),
}));

// Mock utils for error/log output
vi.mock("./utils.js", () => ({
  error: vi.fn(),
  log: vi.fn(),
}));

import prompts from "prompts";
import { gatherConfig } from "./prompts.js";
import { error as mockError, log as mockLog } from "./utils.js";

const mockedPrompts = vi.mocked(prompts);

/** Helper to build a CliFlags object with defaults. */
function flags(overrides: Partial<CliFlags> = {}): CliFlags {
  return { add: false, yes: false, ...overrides };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("gatherConfig", () => {
  describe("--yes flag (non-interactive defaults)", () => {
    it("should return all defaults without calling prompts", async () => {
      // Arrange
      const f = flags({ yes: true });

      // Act
      const config = await gatherConfig(f);

      // Assert
      expect(mockedPrompts).not.toHaveBeenCalled();
      expect(config).toEqual({
        projectName: path.basename(process.cwd()),
        copyrightHolder: "",
        year: new Date().getFullYear().toString(),
        stackChoice: 12, // "Custom" index
        pkgManager: "npm",
        cleanupSteering: false,
        removeExamples: false,
      });
    });

    it("should use flag values over defaults when both --yes and flags provided", async () => {
      // Arrange
      const f = flags({
        yes: true,
        name: "my-app",
        copyright: "Acme Corp",
        year: "2024",
        stack: "t3",
        pkg: "pnpm",
      });

      // Act
      const config = await gatherConfig(f);

      // Assert
      expect(mockedPrompts).not.toHaveBeenCalled();
      expect(config.projectName).toBe("my-app");
      expect(config.copyrightHolder).toBe("Acme Corp");
      expect(config.year).toBe("2024");
      expect(config.stackChoice).toBe(0); // T3 is index 0
      expect(config.pkgManager).toBe("pnpm");
    });

    it("should exit with error when --yes and invalid --pkg", async () => {
      // Arrange
      const f = flags({ yes: true, pkg: "invalid-manager" });
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      // Act + Assert
      await expect(gatherConfig(f)).rejects.toThrow("process.exit");
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockError).toHaveBeenCalledWith(
        'Invalid package manager: "invalid-manager"',
      );
      mockExit.mockRestore();
    });
  });

  describe("all flags provided (skip all prompts)", () => {
    it("should skip all prompts when every flag is provided", async () => {
      // Arrange
      const f = flags({
        name: "test-proj",
        copyright: "Test Co",
        year: "2025",
        stack: "vite+react",
        pkg: "yarn",
      });

      // prompts mock returns values for cleanup/removal confirms
      mockedPrompts
        .mockResolvedValueOnce({ value: true }) // cleanupSteering
        .mockResolvedValueOnce({ value: false }); // removeExamples

      // Act
      const config = await gatherConfig(f);

      // Assert — prompts called only for cleanup and removal confirms (2 calls)
      expect(mockedPrompts).toHaveBeenCalledTimes(2);
      expect(config.projectName).toBe("test-proj");
      expect(config.copyrightHolder).toBe("Test Co");
      expect(config.year).toBe("2025");
      expect(config.stackChoice).toBe(3); // Vite+React is index 3
      expect(config.pkgManager).toBe("yarn");
    });
  });

  describe("partial flags (prompt only for missing values)", () => {
    it("should prompt only for missing name when other flags provided", async () => {
      // Arrange
      const f = flags({
        copyright: "Test Co",
        year: "2025",
        stack: "t3",
        pkg: "npm",
      });

      mockedPrompts
        .mockResolvedValueOnce({ value: "prompted-name" }) // project name prompt
        .mockResolvedValueOnce({ value: false }) // cleanupSteering
        .mockResolvedValueOnce({ value: false }); // removeExamples

      // Act
      const config = await gatherConfig(f);

      // Assert
      expect(mockedPrompts).toHaveBeenCalledTimes(3);
      expect(config.projectName).toBe("prompted-name");
      expect(config.copyrightHolder).toBe("Test Co");
      expect(config.year).toBe("2025");
      expect(config.stackChoice).toBe(0);
      expect(config.pkgManager).toBe("npm");
    });

    it("should prompt only for missing stack and pkg when name/copyright/year provided", async () => {
      // Arrange
      const f = flags({
        name: "my-proj",
        copyright: "Me",
        year: "2025",
      });

      mockedPrompts
        .mockResolvedValueOnce({ value: 5 }) // stack select
        .mockResolvedValueOnce({ value: "bun" }) // pkg manager select
        .mockResolvedValueOnce({ value: true }) // cleanupSteering
        .mockResolvedValueOnce({ value: true }); // removeExamples

      // Act
      const config = await gatherConfig(f);

      // Assert — 4 prompts: stack, pkg, cleanup, removal
      expect(mockedPrompts).toHaveBeenCalledTimes(4);
      expect(config.projectName).toBe("my-proj");
      expect(config.copyrightHolder).toBe("Me");
      expect(config.year).toBe("2025");
      expect(config.stackChoice).toBe(5);
      expect(config.pkgManager).toBe("bun");
    });
  });

  describe("stack resolution", () => {
    it("should resolve stack name case-insensitively with --yes", async () => {
      // Arrange
      const f = flags({ yes: true, stack: "T3" });

      // Act
      const config = await gatherConfig(f);

      // Assert
      expect(config.stackChoice).toBe(0);
    });

    it("should exit with error for unrecognised stack name", async () => {
      // Arrange
      const f = flags({ yes: true, stack: "nonexistent" });
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      // Act + Assert
      await expect(gatherConfig(f)).rejects.toThrow("process.exit");
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockError).toHaveBeenCalledWith(
        'Invalid stack preset: "nonexistent"',
      );
      mockExit.mockRestore();
    });
  });

  describe("flag validation", () => {
    it("should exit with error for invalid --stack in interactive mode", async () => {
      // Arrange
      const f = flags({ stack: "bogus" });
      const exitError = new Error("process.exit");
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw exitError;
      });

      // Act + Assert
      await expect(gatherConfig(f)).rejects.toThrow("process.exit");
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockError).toHaveBeenCalledWith('Invalid stack preset: "bogus"');
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining("T3"));
      expect(mockedPrompts).not.toHaveBeenCalled();
      mockExit.mockRestore();
    });

    it("should exit with error for invalid --pkg in interactive mode", async () => {
      // Arrange
      const f = flags({ pkg: "cargo" });
      const exitError = new Error("process.exit");
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw exitError;
      });

      // Act + Assert
      await expect(gatherConfig(f)).rejects.toThrow("process.exit");
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockError).toHaveBeenCalledWith(
        'Invalid package manager: "cargo"',
      );
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining("npm"));
      expect(mockedPrompts).not.toHaveBeenCalled();
      mockExit.mockRestore();
    });

    it("should log valid stack options when --stack is invalid", async () => {
      // Arrange
      const f = flags({ stack: "invalid" });
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      // Act
      await expect(gatherConfig(f)).rejects.toThrow("process.exit");

      // Assert — valid options message includes all preset names
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining("Custom"));
      mockExit.mockRestore();
    });

    it("should log valid pkg options when --pkg is invalid", async () => {
      // Arrange
      const f = flags({ pkg: "invalid" });
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      // Act
      await expect(gatherConfig(f)).rejects.toThrow("process.exit");

      // Assert — valid options message includes all package managers
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining("bun"));
      mockExit.mockRestore();
    });
  });
});
