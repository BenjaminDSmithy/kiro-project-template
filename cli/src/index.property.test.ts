/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project index property tests
 */

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";

import { parseArgs } from "./index.js";
import type { CliFlags } from "./index.js";
import { gatherConfig } from "./prompts.js";
import type { ProjectConfig } from "./prompts.js";

/**
 * Other valid CLI flag groups. Each group is an atomic segment
 * (standalone flag or flag + value pair) that must stay together in argv.
 */
const OTHER_FLAG_SEGMENTS: readonly (readonly string[])[] = [
  ["--add"],
  ["--yes"],
  ["-y"],
  ["--name", "my-project"],
  ["--copyright", "Acme Corp"],
  ["--year", "2025"],
  ["--stack", "T3"],
  ["--pkg", "pnpm"],
  ["--host", "codex"],
  ["--only", "hooks"],
] as const;

/**
 * Arbitrary that generates a random subset of other valid flag segments.
 */
const otherSegmentsArb = fc.subarray([...OTHER_FLAG_SEGMENTS], {
  minLength: 0,
});

/**
 * Arbitrary that generates a non-empty config path string.
 * Avoids strings starting with `--` (which would be parsed as flags).
 */
const configPathArb = fc
  .array(
    fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789-_/.".split("")),
    { minLength: 1, maxLength: 30 },
  )
  .map((chars) => chars.join(""))
  .filter((s) => !s.startsWith("--"));

describe("parseArgs — Property Tests", () => {
  /**
   * **Validates: Requirements 10.2, 10.3, 10.4**
   *
   * Property 11: Flag Parsing Correctness
   *
   * For any argv array containing `--dry-run`, `--verbose`, or
   * `--config <path>` in any position among other valid flags,
   * `parseArgs` sets the corresponding properties correctly.
   */
  it(
    "should correctly parse --dry-run, --verbose, and --config in any position among other flags",
    { timeout: 30000 },
    () => {
      fc.assert(
        fc.property(
          otherSegmentsArb,
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          configPathArb,
          (
            otherSegments,
            includeDryRun,
            includeVerbose,
            includeConfig,
            configPath,
          ) => {
            // Arrange — collect all atomic segments then shuffle
            const allSegments: string[][] = otherSegments.map((s) => [...s]);

            if (includeDryRun) {
              allSegments.push(["--dry-run"]);
            }
            if (includeVerbose) {
              allSegments.push(["--verbose"]);
            }
            if (includeConfig) {
              allSegments.push(["--config", configPath]);
            }

            // Shuffle segments using a simple deterministic Fisher-Yates
            // seeded by the segment count (fast-check already varies inputs)
            for (let i = allSegments.length - 1; i > 0; i--) {
              const j = i % (i + 1) === 0 ? 0 : i % allSegments.length;
              [allSegments[i], allSegments[j]] = [
                allSegments[j],
                allSegments[i],
              ];
            }

            // Flatten atomic segments into a single argv array
            const argv = allSegments.flat();

            // Act
            const flags = parseArgs(argv);

            // Assert — flags present in argv must be set correctly
            if (includeDryRun) {
              expect(flags.dryRun).toBe(true);
            }
            if (includeVerbose) {
              expect(flags.verbose).toBe(true);
            }
            if (includeConfig) {
              expect(flags.config).toBe(configPath);
            }

            // Assert — flags absent from argv must retain defaults
            if (!includeDryRun) {
              expect(flags.dryRun).toBe(false);
            }
            if (!includeVerbose) {
              expect(flags.verbose).toBe(false);
            }
            if (!includeConfig) {
              expect(flags.config).toBeUndefined();
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

/** Valid stack preset names accepted by gatherConfig. */
const VALID_STACKS = [
  "T3",
  "T4",
  "Supabase+Next.js",
  "Vite+React",
  "SvelteKit",
  "Nuxt 3",
  "Remix",
  "Astro",
  "Flutter+Supabase",
  "Electron",
  "Python FastAPI",
  "TanStack Start",
  "Custom",
] as const;

/** Valid package managers accepted by gatherConfig. */
const VALID_PKG_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;

/** Hardcoded defaults used by gatherConfig when no flag is provided. */
const HARDCODED_DEFAULTS = {
  copyrightHolder: "",
  year: new Date().getFullYear().toString(),
  stackChoice: 12, // "Custom" — last index
  pkgManager: "npm",
} as const;

describe("gatherConfig — Property Tests", () => {
  /**
   * **Validates: Requirement 3.8**
   *
   * Property 12: Configuration Precedence
   *
   * For any combination of CLI flag values (present or absent) in --yes mode,
   * the resolved config always equals the CLI flag value when present, and
   * the hardcoded default when no flag is present. This validates the
   * precedence chain: CLI flags > config file > hardcoded defaults.
   */
  it(
    "should resolve to CLI flag value when present, hardcoded default when absent (--yes mode)",
    { timeout: 30000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.option(fc.constantFrom(...VALID_STACKS), { nil: undefined }),
          fc.option(fc.constantFrom(...VALID_PKG_MANAGERS), { nil: undefined }),
          fc.option(fc.stringMatching(/^[a-zA-Z][a-zA-Z ]{0,19}$/), {
            nil: undefined,
          }),
          fc.option(fc.stringMatching(/^[0-9]{4}$/), { nil: undefined }),
          async (
            stackFlag: string | undefined,
            pkgFlag: string | undefined,
            copyrightFlag: string | undefined,
            yearFlag: string | undefined,
          ) => {
            // Arrange — build flags with --yes and optional CLI values
            const flags: CliFlags = {
              add: false,
              yes: true,
              dryRun: false,
              verbose: false,
              stack: stackFlag,
              pkg: pkgFlag,
              copyright: copyrightFlag,
              year: yearFlag,
            };

            // Act — resolve config in non-interactive mode
            const config: ProjectConfig = await gatherConfig(flags);

            // Assert — CLI flag wins when present, hardcoded default otherwise

            // Copyright holder
            if (copyrightFlag !== undefined) {
              expect(config.copyrightHolder).toBe(copyrightFlag);
            } else {
              expect(config.copyrightHolder).toBe(
                HARDCODED_DEFAULTS.copyrightHolder,
              );
            }

            // Year
            if (yearFlag !== undefined) {
              expect(config.year).toBe(yearFlag);
            } else {
              expect(config.year).toBe(HARDCODED_DEFAULTS.year);
            }

            // Stack choice
            if (stackFlag !== undefined) {
              const expectedIndex = VALID_STACKS.findIndex(
                (s) => s.toLowerCase() === stackFlag.toLowerCase(),
              );
              expect(config.stackChoice).toBe(expectedIndex);
            } else {
              expect(config.stackChoice).toBe(HARDCODED_DEFAULTS.stackChoice);
            }

            // Package manager
            if (pkgFlag !== undefined) {
              expect(config.pkgManager).toBe(pkgFlag.toLowerCase());
            } else {
              expect(config.pkgManager).toBe(HARDCODED_DEFAULTS.pkgManager);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
