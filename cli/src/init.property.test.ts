/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Property-based tests for idempotent defaults (deterministic output)
 */

import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as fc from "fast-check";
import { describe, it, expect } from "vitest";

import type { CliFlags } from "./index.js";
import { gatherConfig } from "./prompts.js";
import { replacePlaceholders } from "./replacer.js";
import type { Replacements } from "./replacer.js";

/**
 * Arbitrary that generates non-empty strings suitable for CLI flag values.
 * Avoids null bytes (which would make files appear binary) and empty strings.
 */
const flagValueArb = fc
  .string({ minLength: 1 })
  .filter((s) => !s.includes("\0"));

/**
 * Template content with all placeholder tokens, used to verify
 * that replacePlaceholders produces identical output on repeated runs.
 */
const TEMPLATE_CONTENT = `Project: {{PROJECT_NAME}}
Copyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}
Built by {{COPYRIGHT_HOLDER}} — {{PROJECT_NAME}} v{{YEAR}}`;

describe("init — Property Tests", () => {
  /**
   * **Validates: Requirements R5**
   *
   * Property 3: Idempotent Defaults
   *
   * For any set of CLI flag values (name, copyright, year), calling
   * gatherConfig with --yes twice produces identical ProjectConfig objects.
   * This confirms the non-interactive path is fully deterministic.
   */
  it(
    "should produce identical ProjectConfig for any flags when called twice with --yes",
    { timeout: 30000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(
          flagValueArb,
          flagValueArb,
          flagValueArb,
          async (name, copyright, year) => {
            // Arrange — build flags with --yes so no prompts fire
            const flags: CliFlags = {
              add: false,
              yes: true,
              name,
              copyright,
              year,
            };

            // Act — gather config twice with the same flags
            const first = await gatherConfig(flags);
            const second = await gatherConfig(flags);

            // Assert — both runs must yield identical config
            expect(second).toEqual(first);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  /**
   * **Validates: Requirements R5**
   *
   * Property 3: Idempotent Defaults (replacePlaceholders)
   *
   * For any replacement values, running replacePlaceholders twice on
   * identical file content produces identical results each time.
   */
  it(
    "should produce identical file content when replacePlaceholders runs twice with the same inputs",
    { timeout: 30000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(
          flagValueArb,
          flagValueArb,
          flagValueArb,
          async (projectName, copyrightHolder, year) => {
            // Arrange — create two identical temp directories
            const dirA = await mkdtemp(path.join(tmpdir(), "idempotent-a-"));
            const dirB = await mkdtemp(path.join(tmpdir(), "idempotent-b-"));

            try {
              // Write identical template files into both directories
              const subA = path.join(dirA, "sub");
              const subB = path.join(dirB, "sub");
              await mkdir(subA, { recursive: true });
              await mkdir(subB, { recursive: true });

              await writeFile(
                path.join(dirA, "file.txt"),
                TEMPLATE_CONTENT,
                "utf-8",
              );
              await writeFile(
                path.join(subA, "nested.md"),
                TEMPLATE_CONTENT,
                "utf-8",
              );
              await writeFile(
                path.join(dirB, "file.txt"),
                TEMPLATE_CONTENT,
                "utf-8",
              );
              await writeFile(
                path.join(subB, "nested.md"),
                TEMPLATE_CONTENT,
                "utf-8",
              );

              const replacements: Replacements = {
                "{{PROJECT_NAME}}": projectName,
                "{{COPYRIGHT_HOLDER}}": copyrightHolder,
                "{{YEAR}}": year,
              };

              // Act — run replacement on both directories independently
              await replacePlaceholders(dirA, replacements);
              await replacePlaceholders(dirB, replacements);

              // Assert — file contents must be identical across both runs
              const rootA = await readFile(
                path.join(dirA, "file.txt"),
                "utf-8",
              );
              const rootB = await readFile(
                path.join(dirB, "file.txt"),
                "utf-8",
              );
              const nestedA = await readFile(
                path.join(subA, "nested.md"),
                "utf-8",
              );
              const nestedB = await readFile(
                path.join(subB, "nested.md"),
                "utf-8",
              );

              expect(rootB).toBe(rootA);
              expect(nestedB).toBe(nestedA);
            } finally {
              await rm(dirA, { recursive: true, force: true });
              await rm(dirB, { recursive: true, force: true });
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
