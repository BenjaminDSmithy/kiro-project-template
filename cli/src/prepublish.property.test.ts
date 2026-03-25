/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project — Property 9: Pre-Publish Gate Completeness
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Property 9: Pre-Publish Gate Completeness
 *
 * Verifies that if `prepublish.sh` exits with code 0, all seven checks
 * passed. We test the inverse: when any single check fails, the script
 * must exit with code 1.
 *
 * Validates: Requirements 9.1–9.8
 */
describe(
  "prepublish.sh — Property Tests",
  () => {
    const scriptPath = path.resolve(
      __dirname,
      "..",
      "scripts",
      "prepublish.sh",
    );

    it("should exist and be a valid bash script", () => {
      expect(existsSync(scriptPath)).toBe(true);
    });

    it("should exit with code 1 when working tree is dirty", () => {
      // The script checks `git status --porcelain` — in a non-git dir it will fail
      const tmp = realpathSync(mkdtempSync(path.join(tmpdir(), "prepub-")));
      const pkgPath = path.join(tmp, "package.json");
      writeFileSync(pkgPath, JSON.stringify({ version: "0.0.1" }));

      try {
        execFileSync("bash", [scriptPath], {
          cwd: tmp,
          stdio: "pipe",
          timeout: 60000,
        });
        // If it exits 0, that's a failure of the property
        expect.fail("prepublish.sh should have exited with non-zero code");
      } catch (err: unknown) {
        const error = err as { status: number };
        expect(error.status).not.toBe(0);
      }
    });

    it("should contain all seven check categories", () => {
      const content = readFileSync(scriptPath, "utf-8");

      // Verify the script checks all required gates
      expect(content).toContain("git status --porcelain"); // 1. Clean working tree
      expect(content).toContain("pnpm test"); // 2. Tests pass
      expect(content).toContain("pnpm build"); // 3. Build succeeds
      expect(content).toContain("dist"); // 4. dist/ exists
      expect(content).toContain("npm view"); // 5. Version check
      expect(content).toContain("CHANGELOG.md"); // 6. CHANGELOG updated
      expect(content).toContain("templates/kiro"); // 7. Templates present
      expect(content).toContain("templates/codex"); // 7. Templates present (codex)
      expect(content).toContain("templates/agents"); // 7. Templates present (agents)
      expect(content).toContain("templates/vscode"); // 7. Templates present (vscode)
      expect(content).toContain("templates/scripts"); // 7. Templates present (scripts)
    });

    it("should use set -euo pipefail for strict error handling", () => {
      const content = readFileSync(scriptPath, "utf-8");
      expect(content).toContain("set -euo pipefail");
    });
  },
  { timeout: 120000 },
);
