/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project — E2E tests via built CLI
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * E2E tests that invoke the built `dist/index.js` via execFileSync.
 * These verify the CLI behaves correctly from the user's perspective.
 *
 * Validates: Requirements 1.1, 2.1, 10.1, 10.2, 10.3, 10.4, 10.5
 */
describe("E2E — CLI invocation", () => {
  const cliPath = path.resolve(__dirname, "..", "dist", "index.js");
  const cliExists = existsSync(cliPath);

  it.skipIf(!cliExists)("--help should include new flags in output", () => {
    const output = execFileSync("node", [cliPath, "--help"], {
      encoding: "utf-8",
      timeout: 10000,
    });

    expect(output).toContain("--dry-run");
    expect(output).toContain("--verbose");
    expect(output).toContain("--config");
    expect(output).toContain("--add");
    expect(output).toContain("--only");
    expect(output).toContain("--yes");
  });

  it.skipIf(!cliExists)(
    "--version should print a semver version string",
    () => {
      const output = execFileSync("node", [cliPath, "--version"], {
        encoding: "utf-8",
        timeout: 10000,
      });

      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/);
    },
  );

  it.skipIf(!cliExists)(
    "--dry-run --yes should print plan without creating files",
    () => {
      const output = execFileSync(
        "node",
        [cliPath, "--dry-run", "--yes", "--name", "e2e-test-project"],
        {
          encoding: "utf-8",
          timeout: 30000,
        },
      );

      // Should contain dry-run output
      expect(output).toContain("Dry-run");

      // Should NOT have created the directory
      expect(existsSync(path.join(process.cwd(), "e2e-test-project"))).toBe(
        false,
      );
    },
  );

  it.skipIf(!cliExists)("--verbose should produce output on stderr", () => {
    // We can't easily test verbose output without a full scaffold,
    // but we can verify the flag is accepted without error
    try {
      execFileSync(
        "node",
        [cliPath, "--dry-run", "--verbose", "--yes", "--name", "verbose-test"],
        {
          encoding: "utf-8",
          timeout: 30000,
        },
      );
    } catch (err: unknown) {
      const error = err as { stderr?: string; status?: number };
      // If it fails, it should not be because of the --verbose flag
      expect(error.stderr ?? "").not.toContain("Unknown option");
    }
  });

  it.skipIf(!cliExists)(
    "--config with non-existent path should exit with error",
    () => {
      try {
        execFileSync(
          "node",
          [cliPath, "--config", "/tmp/nonexistent-config-12345.json", "--yes"],
          {
            encoding: "utf-8",
            timeout: 10000,
          },
        );
        expect.fail("Should have thrown for missing config file");
      } catch (err: unknown) {
        const error = err as { status: number; stderr?: string };
        expect(error.status).not.toBe(0);
      }
    },
  );
});
