/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project dry-run unit tests
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { previewInit, previewAdd, formatPlan } from "./dry-run.js";
import type { HostTarget } from "./hosts.js";
import type { DryRunPlan } from "./dry-run.js";
import type { ProjectConfig } from "./prompts.js";
import { STACK_PRESETS } from "./stacks.js";

/** Resolve the templates directory the same way init.ts does. */
const TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");

/**
 * Creates a base ProjectConfig with sensible defaults.
 * Override individual fields as needed per test.
 */
function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    projectName: "test-project",
    copyrightHolder: "Test Corp",
    year: "2025",
    stackChoice: 12, // Custom
    pkgManager: "pnpm",
    cleanupSteering: false,
    removeExamples: false,
    ...overrides,
  };
}

describe("dry-run", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = realpathSync(mkdtempSync(path.join(tmpdir(), "dryrun-unit-")));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("previewInit", () => {
    it("should return a valid DryRunPlan with non-empty directories, files, and replacements", async () => {
      // Arrange
      const config = makeConfig();

      // Act
      const plan = await previewInit(config, TEMPLATES_DIR);

      // Assert
      expect(plan.directories.length).toBeGreaterThan(0);
      expect(plan.files.length).toBeGreaterThan(0);
      expect(plan.replacements.length).toBeGreaterThan(0);
      expect(plan.removals).toEqual([]);
    });

    it("should include expected template directories in the plan", async () => {
      // Arrange
      const config = makeConfig();

      // Act
      const plan = await previewInit(config, TEMPLATES_DIR);

      // Assert — check for key .kiro/.codex subdirectories and docs
      const dirPaths = plan.directories.map((d) =>
        d.replace(tmpDir, "").replace(/\\/g, "/"),
      );
      expect(dirPaths.some((d) => d.includes(".codex/agents"))).toBe(true);
      expect(dirPaths.some((d) => d.includes(".codex/rules"))).toBe(true);
      expect(dirPaths.some((d) => d.includes(".kiro/hooks"))).toBe(true);
      expect(dirPaths.some((d) => d.includes(".kiro/steering"))).toBe(true);
      expect(dirPaths.some((d) => d.includes(".kiro/specs"))).toBe(true);
      expect(dirPaths.some((d) => d.includes("/scripts"))).toBe(true);
      expect(dirPaths.some((d) => d.includes("/.vscode"))).toBe(true);
      expect(dirPaths.some((d) => d.includes("/docs"))).toBe(true);
    });

    it("should identify placeholder files in the replacements array", async () => {
      // Arrange
      const config = makeConfig();

      // Act
      const plan = await previewInit(config, TEMPLATES_DIR);

      // Assert — replacements should contain files with {{ tokens
      expect(plan.replacements.length).toBeGreaterThan(0);
      // All replacement paths should also appear in the files list
      for (const replacement of plan.replacements) {
        expect(plan.files).toContain(replacement);
      }
    });

    it("should list steering removals when cleanupSteering is true", async () => {
      // Arrange — T3 preset (index 0) has a defined keepSteering list
      const config = makeConfig({ cleanupSteering: true, stackChoice: 0 });
      const preset = STACK_PRESETS[0];

      // Act
      const plan = await previewInit(config, TEMPLATES_DIR);

      // Assert — removals should contain steering docs NOT in the preset's keepSteering
      expect(plan.removals.length).toBeGreaterThan(0);
      for (const removal of plan.removals) {
        const filename = path.basename(removal);
        expect(preset.keepSteering).not.toContain(filename);
      }
    });

    it("should list example spec removals when removeExamples is true", async () => {
      // Arrange
      const config = makeConfig({ removeExamples: true });

      // Act
      const plan = await previewInit(config, TEMPLATES_DIR);

      // Assert — removals should contain directories starting with status emoji prefixes
      const examplePrefixes = ["✅", "📋", "🚧", "⏸️"];
      const specRemovals = plan.removals.filter(
        (r) => r.includes(".kiro/specs") || r.includes(".kiro\\specs"),
      );
      expect(specRemovals.length).toBeGreaterThan(0);
      for (const removal of specRemovals) {
        const dirname = path.basename(removal);
        const hasPrefix = examplePrefixes.some((p) => dirname.startsWith(p));
        expect(hasPrefix).toBe(true);
      }
    });

    it("should produce no side effects on the filesystem", async () => {
      // Arrange — snapshot the temp directory before calling previewInit
      const config = makeConfig();
      const before = snapshotDir(tmpDir);

      // Act
      await previewInit(config, TEMPLATES_DIR);

      // Assert — the temp directory is unchanged
      const after = snapshotDir(tmpDir);
      expect(after).toEqual(before);
    });
  });

  describe("previewAdd", () => {
    it("should return a valid DryRunPlan for full .kiro/", async () => {
      // Arrange
      const config = makeConfig();

      // Act
      const plan = await previewAdd(config, TEMPLATES_DIR);

      // Assert
      expect(plan.directories.length).toBeGreaterThan(0);
      expect(plan.files.length).toBeGreaterThan(0);
      // Removals and replacements may or may not be present
      expect(Array.isArray(plan.removals)).toBe(true);
    });

    it("should return only hooks subset when only is 'hooks'", async () => {
      // Arrange
      const config = makeConfig();

      // Act
      const plan = await previewAdd(config, TEMPLATES_DIR, "kiro", "hooks");

      // Assert — all files should be under the hooks/ subdirectory
      expect(plan.files.length).toBeGreaterThan(0);
      for (const file of plan.files) {
        const normalised = file.replace(/\\/g, "/");
        expect(normalised).toContain("/hooks/");
      }
      // Directories should include the hooks directory
      expect(
        plan.directories.some((d) => d.replace(/\\/g, "/").endsWith("/hooks")),
      ).toBe(true);
    });

    it.each([
      ["kiro", ".kiro/"],
      ["codex", ".codex/"],
      ["portable", "AGENTS.md"],
      ["all", ".codex/"],
    ] satisfies [HostTarget, string][])(
      "should respect host target %s",
      async (host, expectedPath) => {
        const config = makeConfig();
        const plan = await previewAdd(config, TEMPLATES_DIR, host);

        const normalisedFiles = plan.files.map((file) => file.replace(/\\/g, "/"));
        expect(normalisedFiles.some((file) => file.includes(expectedPath))).toBe(
          true,
        );
      },
    );
  });

  describe("formatPlan", () => {
    it("should produce readable output with expected section labels", () => {
      // Arrange
      const plan: DryRunPlan = {
        directories: ["/a", "/b", "/c"],
        files: ["/a/f1", "/a/f2", "/b/f3", "/b/f4", "/c/f5"],
        replacements: ["/a/f1", "/b/f3"],
        removals: ["/c/f5"],
      };

      // Act
      const output = formatPlan(plan);

      // Assert — contains section labels
      expect(output).toContain("Directories:");
      expect(output).toContain("Files:");
      expect(output).toContain("Replacements:");
      expect(output).toContain("Removals:");
    });

    it("should include correct counts in the output", () => {
      // Arrange
      const plan: DryRunPlan = {
        directories: ["/a", "/b"],
        files: ["/a/f1", "/a/f2", "/a/f3"],
        replacements: ["/a/f1"],
        removals: [],
      };

      // Act
      const output = formatPlan(plan);

      // Assert — counts match
      expect(output).toContain("2 would be created");
      expect(output).toContain("3 would be copied");
      expect(output).toContain("1 would have placeholders replaced");
      expect(output).toContain("0 would be removed");
    });
  });
});

/**
 * Recursively snapshots a directory tree, returning a sorted list of
 * relative paths with type indicators. Used to detect filesystem changes.
 */
function snapshotDir(dir: string): string[] {
  const entries: string[] = [];

  function walk(current: string, prefix: string): void {
    let items: string[];
    try {
      items = readdirSync(current);
    } catch {
      return;
    }
    for (const item of items) {
      const fullPath = path.join(current, item);
      const relativePath = path.join(prefix, item);
      try {
        const info = statSync(fullPath);
        entries.push(`${relativePath}|${info.isDirectory() ? "d" : "f"}`);
        if (info.isDirectory()) {
          walk(fullPath, relativePath);
        }
      } catch {
        // Skip inaccessible entries
      }
    }
  }

  walk(dir, "");
  return entries.sort();
}
