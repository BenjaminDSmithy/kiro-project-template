/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Unit tests for replacer edge cases — placeholder replacement module
 */

import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { replacePlaceholders } from "./replacer.js";
import type { Replacements } from "./replacer.js";

/** Shared temp directory for each test. */
let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), "replacer-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

/** Helper to build a standard replacements object. */
function makeReplacements(overrides: Partial<Replacements> = {}): Replacements {
  return {
    "{{PROJECT_NAME}}": "my-project",
    "{{COPYRIGHT_HOLDER}}": "Acme Corp",
    "{{YEAR}}": "2025",
    ...overrides,
  };
}

describe("replacePlaceholders", () => {
  describe("basic replacement", () => {
    it("should replace all three placeholder tokens in a single file", async () => {
      // Arrange
      const filePath = path.join(tempDir, "readme.md");
      await writeFile(
        filePath,
        "# {{PROJECT_NAME}}\nCopyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}",
        "utf-8",
      );

      // Act
      const modified = await replacePlaceholders(tempDir, makeReplacements());

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("# my-project\nCopyright (C) 2025 Acme Corp");
      expect(modified).toContain(filePath);
    });
  });

  describe("special characters in replacement values", () => {
    it("should handle ampersand (&) in replacement values", async () => {
      // Arrange
      const filePath = path.join(tempDir, "file.txt");
      await writeFile(filePath, "Owner: {{COPYRIGHT_HOLDER}}", "utf-8");

      // Act
      await replacePlaceholders(
        tempDir,
        makeReplacements({ "{{COPYRIGHT_HOLDER}}": "Smith & Wesson" }),
      );

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("Owner: Smith & Wesson");
    });

    it("should handle backslash (\\) in replacement values", async () => {
      // Arrange
      const filePath = path.join(tempDir, "file.txt");
      await writeFile(filePath, "Path: {{PROJECT_NAME}}", "utf-8");

      // Act
      await replacePlaceholders(
        tempDir,
        makeReplacements({ "{{PROJECT_NAME}}": "C:\\Users\\project" }),
      );

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("Path: C:\\Users\\project");
    });

    it("should handle forward slash (/) in replacement values", async () => {
      // Arrange
      const filePath = path.join(tempDir, "file.txt");
      await writeFile(filePath, "Name: {{PROJECT_NAME}}", "utf-8");

      // Act
      await replacePlaceholders(
        tempDir,
        makeReplacements({ "{{PROJECT_NAME}}": "org/repo" }),
      );

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("Name: org/repo");
    });

    it('should handle double quotes (") in replacement values', async () => {
      // Arrange
      const filePath = path.join(tempDir, "file.txt");
      await writeFile(filePath, "Name: {{COPYRIGHT_HOLDER}}", "utf-8");

      // Act
      await replacePlaceholders(
        tempDir,
        makeReplacements({ "{{COPYRIGHT_HOLDER}}": '"Quoted" Corp' }),
      );

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe('Name: "Quoted" Corp');
    });

    it("should handle single quotes (') in replacement values", async () => {
      // Arrange
      const filePath = path.join(tempDir, "file.txt");
      await writeFile(filePath, "Name: {{COPYRIGHT_HOLDER}}", "utf-8");

      // Act
      await replacePlaceholders(
        tempDir,
        makeReplacements({ "{{COPYRIGHT_HOLDER}}": "O'Brien" }),
      );

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("Name: O'Brien");
    });

    it("should handle regex-special $& pattern in replacement values", async () => {
      // Arrange — $& is a special replacement pattern in String.prototype.replace
      const filePath = path.join(tempDir, "file.txt");
      await writeFile(filePath, "Name: {{PROJECT_NAME}}", "utf-8");

      // Act
      await replacePlaceholders(
        tempDir,
        makeReplacements({ "{{PROJECT_NAME}}": "test$&value" }),
      );

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("Name: test$&value");
    });

    it("should handle regex-special $' pattern in replacement values", async () => {
      // Arrange — $' is a special replacement pattern in String.prototype.replace
      const filePath = path.join(tempDir, "file.txt");
      await writeFile(filePath, "Name: {{PROJECT_NAME}}", "utf-8");

      // Act
      await replacePlaceholders(
        tempDir,
        makeReplacements({ "{{PROJECT_NAME}}": "test$'value" }),
      );

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("Name: test$'value");
    });
  });

  describe("binary file skipping", () => {
    it("should skip files with null bytes in the first 512 bytes", async () => {
      // Arrange — create a file with a null byte early on (simulates binary)
      const filePath = path.join(tempDir, "image.png");
      const binaryContent = "{{PROJECT_NAME}}\0" + "x".repeat(500);
      await writeFile(filePath, binaryContent, "utf-8");

      // Act
      const modified = await replacePlaceholders(tempDir, makeReplacements());

      // Assert — file should be untouched, not in modified list
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe(binaryContent);
      expect(modified).not.toContain(filePath);
    });
  });

  describe("empty files", () => {
    it("should not crash on empty files and not include them in modified list", async () => {
      // Arrange
      const filePath = path.join(tempDir, "empty.txt");
      await writeFile(filePath, "", "utf-8");

      // Act
      const modified = await replacePlaceholders(tempDir, makeReplacements());

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("");
      expect(modified).not.toContain(filePath);
    });
  });

  describe("files with no placeholders", () => {
    it("should not include files without placeholders in the modified list", async () => {
      // Arrange
      const filePath = path.join(tempDir, "plain.txt");
      await writeFile(filePath, "No placeholders here, mate.", "utf-8");

      // Act
      const modified = await replacePlaceholders(tempDir, makeReplacements());

      // Assert
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("No placeholders here, mate.");
      expect(modified).not.toContain(filePath);
    });
  });

  describe("modified file tracking", () => {
    it("should return only the paths of files that were actually modified", async () => {
      // Arrange — one file with placeholders, one without
      const withPlaceholder = path.join(tempDir, "with.txt");
      const withoutPlaceholder = path.join(tempDir, "without.txt");
      await writeFile(withPlaceholder, "Name: {{PROJECT_NAME}}", "utf-8");
      await writeFile(withoutPlaceholder, "Static content", "utf-8");

      // Act
      const modified = await replacePlaceholders(tempDir, makeReplacements());

      // Assert
      expect(modified).toHaveLength(1);
      expect(modified).toContain(withPlaceholder);
      expect(modified).not.toContain(withoutPlaceholder);
    });
  });

  describe("nested directory processing", () => {
    it("should recursively process files in nested directories", async () => {
      // Arrange — create a nested structure
      const subDir = path.join(tempDir, "level1", "level2");
      await mkdir(subDir, { recursive: true });

      const rootFile = path.join(tempDir, "root.txt");
      const nestedFile = path.join(subDir, "deep.txt");
      await writeFile(rootFile, "Root: {{PROJECT_NAME}}", "utf-8");
      await writeFile(nestedFile, "Deep: {{COPYRIGHT_HOLDER}}", "utf-8");

      // Act
      const modified = await replacePlaceholders(tempDir, makeReplacements());

      // Assert
      const rootContent = await readFile(rootFile, "utf-8");
      const nestedContent = await readFile(nestedFile, "utf-8");
      expect(rootContent).toBe("Root: my-project");
      expect(nestedContent).toBe("Deep: Acme Corp");
      expect(modified).toHaveLength(2);
      expect(modified).toContain(rootFile);
      expect(modified).toContain(nestedFile);
    });
  });
});
