/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Property-based tests for add mode file boundary (template preservation)
 */

import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as fc from "fast-check";
import { describe, it, expect } from "vitest";

import { replacePlaceholders } from "./replacer.js";
import type { Replacements } from "./replacer.js";
import { copyDir } from "./utils.js";

/**
 * Arbitrary that generates non-empty strings without null bytes.
 * Null bytes would cause the replacer to treat files as binary, skipping them.
 */
const safeStringArb = fc
  .string({ minLength: 1 })
  .filter((s) => !s.includes("\0"));

/** Template content containing every placeholder token. */
const KIRO_TEMPLATE_CONTENT = `# {{PROJECT_NAME}}
Copyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}`;

/** Simulated "existing" project files that must remain untouched. */
const EXISTING_FILES: ReadonlyArray<{ name: string; content: string }> = [
  { name: "README.md", content: "# My Existing Project\nDo not touch me.\n" },
  {
    name: "package.json",
    content: '{"name":"existing-project","version":"1.0.0"}\n',
  },
  { name: "src/index.ts", content: 'console.log("hello world");\n' },
];

describe("add mode — Property Tests", () => {
  /**
   * **Validates: Requirements R2**
   *
   * Property 2: Template Preservation
   *
   * For any `--add` operation (simulated via copyDir + replacePlaceholders
   * on a `.kiro/` subdirectory), no files outside `.kiro/` shall be
   * created or modified in the target directory.
   */
  it(
    "should never create or modify files outside .kiro/ for any replacement values",
    { timeout: 30000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(
          safeStringArb,
          safeStringArb,
          safeStringArb,
          async (projectName, copyrightHolder, year) => {
            // Arrange — create a temp directory simulating a project root
            const projectRoot = await mkdtemp(path.join(tmpdir(), "add-pbt-"));

            try {
              // Create "existing" project files outside .kiro/
              await mkdir(path.join(projectRoot, "src"), { recursive: true });
              for (const file of EXISTING_FILES) {
                await writeFile(
                  path.join(projectRoot, file.name),
                  file.content,
                  "utf-8",
                );
              }

              // Record original content of files outside .kiro/
              const originalContents = new Map<string, string>();
              for (const file of EXISTING_FILES) {
                const content = await readFile(
                  path.join(projectRoot, file.name),
                  "utf-8",
                );
                originalContents.set(file.name, content);
              }

              // Create a temporary "template source" with .kiro/ content
              const templateSrc = await mkdtemp(
                path.join(tmpdir(), "add-tpl-"),
              );
              const kiroTemplateSrc = path.join(templateSrc, "kiro");
              await mkdir(path.join(kiroTemplateSrc, "hooks"), {
                recursive: true,
              });
              await writeFile(
                path.join(kiroTemplateSrc, "README.md"),
                KIRO_TEMPLATE_CONTENT,
                "utf-8",
              );
              await writeFile(
                path.join(kiroTemplateSrc, "hooks", "01-hook.txt"),
                "Hook for {{PROJECT_NAME}} by {{COPYRIGHT_HOLDER}}",
                "utf-8",
              );

              // Simulate the add command: copy .kiro/ into project root
              const kiroTargetDir = path.join(projectRoot, ".kiro");
              await copyDir(kiroTemplateSrc, kiroTargetDir);

              // Replace placeholders in .kiro/ only (as the add command does)
              const replacements: Replacements = {
                "{{PROJECT_NAME}}": projectName,
                "{{COPYRIGHT_HOLDER}}": copyrightHolder,
                "{{YEAR}}": year,
              };
              await replacePlaceholders(kiroTargetDir, replacements);

              // Assert — files outside .kiro/ must have identical content
              for (const file of EXISTING_FILES) {
                const currentContent = await readFile(
                  path.join(projectRoot, file.name),
                  "utf-8",
                );
                expect(currentContent).toBe(originalContents.get(file.name));
              }

              // Assert — files inside .kiro/ were actually modified
              const kiroReadme = await readFile(
                path.join(kiroTargetDir, "README.md"),
                "utf-8",
              );
              expect(kiroReadme).not.toContain("{{PROJECT_NAME}}");
              expect(kiroReadme).not.toContain("{{COPYRIGHT_HOLDER}}");
              expect(kiroReadme).not.toContain("{{YEAR}}");

              // Clean up template source
              await rm(templateSrc, { recursive: true, force: true });
            } finally {
              await rm(projectRoot, { recursive: true, force: true });
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
