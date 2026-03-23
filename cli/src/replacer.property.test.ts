/* Property-based tests for placeholder replacement completeness */

import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as fc from "fast-check";
import { describe, it } from "vitest";

import { replacePlaceholders } from "./replacer.js";
import type { Replacements } from "./replacer.js";

/** All placeholder tokens that must be fully replaced. */
const PLACEHOLDER_TOKENS = [
  "{{PROJECT_NAME}}",
  "{{COPYRIGHT_HOLDER}}",
  "{{YEAR}}",
] as const;

/**
 * Template content containing every placeholder token at least once.
 * Used to verify that all tokens are replaced regardless of input values.
 */
const TEMPLATE_CONTENT = `Project: {{PROJECT_NAME}}
Copyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}
Name again: {{PROJECT_NAME}}`;

describe("replacePlaceholders — Property Tests", () => {
  /**
   * **Validates: Requirements R4.1, R4.2**
   *
   * Property 1: Placeholder Completeness
   *
   * For any set of replacement values (including special characters),
   * no {{PROJECT_NAME}}, {{COPYRIGHT_HOLDER}}, or {{YEAR}} tokens
   * shall remain in any processed file.
   */
  it(
    "should leave no placeholder tokens after replacement for any input values",
    { timeout: 30000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (projectName, copyrightHolder, year) => {
            // Arrange — create a temp directory with a template file
            const tempDir = await mkdtemp(path.join(tmpdir(), "replacer-pbt-"));

            try {
              const subDir = path.join(tempDir, "nested");
              await mkdir(subDir, { recursive: true });

              await writeFile(
                path.join(tempDir, "root.txt"),
                TEMPLATE_CONTENT,
                "utf-8",
              );
              await writeFile(
                path.join(subDir, "nested.md"),
                TEMPLATE_CONTENT,
                "utf-8",
              );

              const replacements: Replacements = {
                "{{PROJECT_NAME}}": projectName,
                "{{COPYRIGHT_HOLDER}}": copyrightHolder,
                "{{YEAR}}": year,
              };

              // Act — run placeholder replacement
              await replacePlaceholders(tempDir, replacements);

              // Assert — no placeholder tokens remain in any file
              const rootContent = await readFile(
                path.join(tempDir, "root.txt"),
                "utf-8",
              );
              const nestedContent = await readFile(
                path.join(subDir, "nested.md"),
                "utf-8",
              );

              for (const token of PLACEHOLDER_TOKENS) {
                if (rootContent.includes(token)) return false;
                if (nestedContent.includes(token)) return false;
              }

              return true;
            } finally {
              await rm(tempDir, { recursive: true, force: true });
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
