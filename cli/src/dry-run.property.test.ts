/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project dry-run property tests
 */

import * as fc from "fast-check";
import { afterEach, beforeEach, describe, it } from "vitest";
import {
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
} from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { previewInit, previewAdd } from "./dry-run.js";
import type { ProjectConfig } from "./prompts.js";
import { copyDir } from "./utils.js";
import { replacePlaceholders } from "./replacer.js";

/** Valid package manager values. */
const PKG_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;

/** Resolve the templates directory the same way init.ts does. */
const TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");

/**
 * Recursively snapshots a directory tree, returning a sorted list of
 * relative paths with their modification times. Used to detect any
 * filesystem changes (creates, modifies, deletes).
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
        const mtimeMs = info.mtimeMs;
        entries.push(
          `${relativePath}|${info.isDirectory() ? "d" : "f"}|${mtimeMs}`,
        );
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

/**
 * Arbitrary that generates a valid ProjectConfig object with constrained
 * values matching the CLI's expected input space.
 */
const projectConfigArb: fc.Arbitrary<ProjectConfig> = fc.record({
  projectName: fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/),
  copyrightHolder: fc.string({ minLength: 0, maxLength: 50 }),
  year: fc.stringMatching(/^[0-9]{4}$/),
  stackChoice: fc.integer({ min: 0, max: 12 }),
  pkgManager: fc.constantFrom(...PKG_MANAGERS),
  cleanupSteering: fc.boolean(),
  removeExamples: fc.boolean(),
});

describe("Dry-Run Property Tests", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = realpathSync(mkdtempSync(path.join(tmpdir(), "dryrun-prop-")));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tmpDir, { recursive: true, force: true });
  });

  /**
   * **Validates: Requirements 1.1, 1.4, 1.5**
   *
   * Property 2: Dry-Run Purity (previewInit)
   *
   * For any valid ProjectConfig and templates directory, calling
   * previewInit(config, templatesDir) produces zero side effects —
   * no files are created, modified, or deleted on disk.
   */
  it(
    "previewInit should produce zero side effects on the filesystem",
    { timeout: 120000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(projectConfigArb, async (config) => {
          // Arrange — snapshot the temp directory before calling previewInit
          const before = snapshotDir(tmpDir);

          // Act — call previewInit with the generated config
          await previewInit(config, TEMPLATES_DIR);

          // Assert — the temp directory is unchanged
          const after = snapshotDir(tmpDir);
          return (
            before.length === after.length &&
            before.every((entry, i) => entry === after[i])
          );
        }),
        { numRuns: 100 },
      );
    },
  );

  /**
   * **Validates: Requirements 1.1, 1.4, 1.5**
   *
   * Property 2: Dry-Run Purity (previewAdd)
   *
   * For any valid ProjectConfig and templates directory, calling
   * previewAdd(config, templatesDir) produces zero side effects —
   * no files are created, modified, or deleted on disk.
   */
  it(
    "previewAdd should produce zero side effects on the filesystem",
    { timeout: 120000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(projectConfigArb, async (config) => {
          // Arrange — snapshot the temp directory before calling previewAdd
          const before = snapshotDir(tmpDir);

          // Act — call previewAdd with the generated config
          await previewAdd(config, TEMPLATES_DIR);

          // Assert — the temp directory is unchanged
          const after = snapshotDir(tmpDir);
          return (
            before.length === after.length &&
            before.every((entry, i) => entry === after[i])
          );
        }),
        { numRuns: 100 },
      );
    },
  );

  /**
   * **Validates: Requirements 1.1, 1.4, 1.5**
   *
   * Property 2: Dry-Run Purity (previewAdd with --only subset)
   *
   * For any valid ProjectConfig and any --only subset value, calling
   * previewAdd(config, templatesDir, only) produces zero side effects.
   */
  it(
    "previewAdd with --only subset should produce zero side effects on the filesystem",
    { timeout: 30000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(
          projectConfigArb,
          fc.constantFrom("hooks", "steering", "specs", "settings"),
          async (config, only) => {
            // Arrange — snapshot the temp directory before calling previewAdd
            const before = snapshotDir(tmpDir);

            // Act — call previewAdd with the generated config and subset
            await previewAdd(config, TEMPLATES_DIR, only);

            // Assert — the temp directory is unchanged
            const after = snapshotDir(tmpDir);
            return (
              before.length === after.length &&
              before.every((entry, i) => entry === after[i])
            );
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  /**
   * **Validates: Requirements 1.2, 1.3, 10.1**
   *
   * Property 3: Dry-Run / Normal Correspondence
   *
   * For any identical resolved ProjectConfig (post-prompts, post-config-merge)
   * and identical template directory contents, the set of files listed in
   * `previewInit(config, templatesDir).files` is identical to the set of files
   * actually created by the init file operations when run with that same
   * resolved config. Uses cleanupSteering=false and removeExamples=false to
   * avoid removal logic complexity, and stackChoice=12 (Custom) to skip
   * dynamic TECH-STACK.md generation.
   */
  it(
    "previewInit file list should match files actually created by init operations",
    { timeout: 30000 },
    async () => {
      /**
       * Constrained arbitrary: cleanupSteering and removeExamples are false,
       * stackChoice is 12 (Custom) to avoid dynamic TECH-STACK.md generation.
       */
      const simpleConfigArb: fc.Arbitrary<ProjectConfig> = fc.record({
        projectName: fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/),
        copyrightHolder: fc.string({ minLength: 0, maxLength: 50 }),
        year: fc.stringMatching(/^[0-9]{4}$/),
        stackChoice: fc.constant(12),
        pkgManager: fc.constantFrom(...PKG_MANAGERS),
        cleanupSteering: fc.constant(false),
        removeExamples: fc.constant(false),
      });

      /**
       * Recursively collects all file paths (not directories) under a root,
       * returning them as sorted relative paths.
       */
      async function collectFiles(root: string): Promise<string[]> {
        const results: string[] = [];

        async function walk(dir: string): Promise<void> {
          const entries = await readdir(dir);
          for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const info = await stat(fullPath);
            if (info.isDirectory()) {
              await walk(fullPath);
            } else if (info.isFile()) {
              results.push(path.relative(root, fullPath));
            }
          }
        }

        await walk(root);
        return results.sort();
      }

      await fc.assert(
        fc.asyncProperty(simpleConfigArb, async (config) => {
          // Arrange — get the dry-run plan
          const plan = await previewInit(config, TEMPLATES_DIR);

          // Act — replicate what init() does without interactive prompts
          const targetDir = path.resolve(tmpDir, config.projectName);
          await mkdir(targetDir, { recursive: true });

          // Copy kiro/ → .kiro/
          await copyDir(
            path.join(TEMPLATES_DIR, "kiro"),
            path.join(targetDir, ".kiro"),
          );

          // Copy codex/ → .codex/
          await copyDir(
            path.join(TEMPLATES_DIR, "codex"),
            path.join(targetDir, ".codex"),
          );

          // Copy docs/ → docs/
          await copyDir(
            path.join(TEMPLATES_DIR, "docs"),
            path.join(targetDir, "docs"),
          );

          // Copy root/ entries directly into target
          const rootTemplateDir = path.join(TEMPLATES_DIR, "root");
          const rootEntries = await readdir(rootTemplateDir);
          for (const entry of rootEntries) {
            await copyDir(
              path.join(rootTemplateDir, entry),
              path.join(targetDir, entry),
            );
          }

          // Replace placeholders
          await replacePlaceholders(targetDir, {
            "{{PROJECT_NAME}}": config.projectName,
            "{{COPYRIGHT_HOLDER}}": config.copyrightHolder,
            "{{YEAR}}": config.year,
          });

          // Collect actual files created (relative to targetDir)
          const actualFiles = await collectFiles(targetDir);

          // Normalise dry-run plan files to relative paths from targetDir
          const plannedFiles = plan.files
            .map((f) => path.relative(targetDir, f))
            .sort();

          // Assert — the sets should match
          if (plannedFiles.length !== actualFiles.length) {
            return false;
          }
          return plannedFiles.every((f, i) => f === actualFiles[i]);
        }),
        { numRuns: 10 },
      );
    },
  );
});
