/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Unit tests for template directory validator module
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { validateTemplateDir } from "./validator.js";

describe("validateTemplateDir", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), "validator-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should pass when all required subdirectories exist", () => {
    // Arrange
    mkdirSync(path.join(tmpDir, "kiro"));
    mkdirSync(path.join(tmpDir, "docs"));
    mkdirSync(path.join(tmpDir, "root"));

    // Act & Assert
    expect(() => validateTemplateDir(tmpDir)).not.toThrow();
  });

  it("should throw when templatesDir does not exist", () => {
    // Arrange
    const missingDir = path.join(tmpDir, "nonexistent");

    // Act & Assert
    expect(() => validateTemplateDir(missingDir)).toThrow(
      /Template directory not found at/,
    );
    expect(() => validateTemplateDir(missingDir)).toThrow(
      /try reinstalling with npm install -g create-kiro-project/,
    );
  });

  it("should throw when kiro/ subdirectory is missing", () => {
    // Arrange
    mkdirSync(path.join(tmpDir, "docs"));
    mkdirSync(path.join(tmpDir, "root"));

    // Act & Assert
    expect(() => validateTemplateDir(tmpDir)).toThrow(
      new RegExp(`Template directory not found at .*kiro`),
    );
  });

  it("should throw when docs/ subdirectory is missing", () => {
    // Arrange
    mkdirSync(path.join(tmpDir, "kiro"));
    mkdirSync(path.join(tmpDir, "root"));

    // Act & Assert
    expect(() => validateTemplateDir(tmpDir)).toThrow(
      new RegExp(`Template directory not found at .*docs`),
    );
  });

  it("should throw when root/ subdirectory is missing", () => {
    // Arrange
    mkdirSync(path.join(tmpDir, "kiro"));
    mkdirSync(path.join(tmpDir, "docs"));

    // Act & Assert
    expect(() => validateTemplateDir(tmpDir)).toThrow(
      new RegExp(`Template directory not found at .*root`),
    );
  });

  it("should include the missing path in the error message", () => {
    // Arrange
    const missingDir = path.join(tmpDir, "does-not-exist");

    // Act & Assert
    expect(() => validateTemplateDir(missingDir)).toThrow(
      `Template directory not found at ${missingDir}`,
    );
  });

  it("should include reinstallation suggestion in the error message", () => {
    // Arrange — no subdirectories created

    // Act & Assert
    expect(() => validateTemplateDir(path.join(tmpDir, "missing"))).toThrow(
      /npm install -g create-kiro-project/,
    );
  });
});
