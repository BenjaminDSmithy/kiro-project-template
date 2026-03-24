/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Unit tests for custom stack presets loader module
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { loadCustomStacks, STACK_PRESETS } from "./stacks.js";

describe("loadCustomStacks", () => {
  let tmpDir: string;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), "stacks-unit-"));
    stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should load valid custom stacks and assign indices starting from 13", () => {
    // Arrange
    const customStacks = [
      {
        name: "MyStack",
        rows: ["| Lang | TS | 5.5+ | Strict |"],
        approved: "React, Vite",
        keepSteering: ["00-core-rules.md"],
      },
    ];
    const filePath = path.join(tmpDir, "stacks.json");
    writeFileSync(filePath, JSON.stringify(customStacks), "utf-8");

    // Act
    const merged = loadCustomStacks(filePath, STACK_PRESETS);

    // Assert
    expect(merged[13]).toEqual({
      name: "MyStack",
      rows: ["| Lang | TS | 5.5+ | Strict |"],
      approved: "React, Vite",
      keepSteering: ["00-core-rules.md"],
    });
  });

  it("should preserve all built-in presets in the merged result", () => {
    // Arrange
    const customStacks = [
      { name: "Extra", rows: [], approved: "", keepSteering: [] },
    ];
    const filePath = path.join(tmpDir, "stacks.json");
    writeFileSync(filePath, JSON.stringify(customStacks), "utf-8");

    // Act
    const merged = loadCustomStacks(filePath, STACK_PRESETS);

    // Assert
    const builtInKeys = Object.keys(STACK_PRESETS).map(Number);
    for (const key of builtInKeys) {
      expect(merged[key]).toBe(STACK_PRESETS[key]);
    }
  });

  it("should throw for entries missing required fields", () => {
    // Arrange — entry missing 'rows' and 'keepSteering'
    const customStacks = [{ name: "Incomplete", approved: "React" }];
    const filePath = path.join(tmpDir, "stacks.json");
    writeFileSync(filePath, JSON.stringify(customStacks), "utf-8");

    // Act & Assert
    expect(() => loadCustomStacks(filePath, STACK_PRESETS)).toThrow(
      /entry at index 0 is missing or has invalid fields.*rows.*keepSteering/,
    );
  });

  it("should throw for non-array JSON", () => {
    // Arrange
    const filePath = path.join(tmpDir, "stacks.json");
    writeFileSync(filePath, JSON.stringify({ name: "NotAnArray" }), "utf-8");

    // Act & Assert
    expect(() => loadCustomStacks(filePath, STACK_PRESETS)).toThrow(
      /must be a JSON array/,
    );
  });

  it("should throw for entries with invalid field types", () => {
    // Arrange — name is a number, rows is a string
    const customStacks = [
      { name: 42, rows: "not-an-array", approved: "React", keepSteering: [] },
    ];
    const filePath = path.join(tmpDir, "stacks.json");
    writeFileSync(filePath, JSON.stringify(customStacks), "utf-8");

    // Act & Assert
    expect(() => loadCustomStacks(filePath, STACK_PRESETS)).toThrow(
      /entry at index 0 is missing or has invalid fields/,
    );
  });

  it("should warn on duplicate names including collisions with built-in presets", () => {
    // Arrange — "T3" collides with built-in preset at index 0
    const customStacks = [
      { name: "T3", rows: [], approved: "", keepSteering: [] },
    ];
    const filePath = path.join(tmpDir, "stacks.json");
    writeFileSync(filePath, JSON.stringify(customStacks), "utf-8");

    // Act
    loadCustomStacks(filePath, STACK_PRESETS);

    // Assert
    expect(stderrSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'custom stack "T3" duplicates a built-in preset name',
      ),
    );
  });

  it("should assign correct indices for multiple custom stacks", () => {
    // Arrange
    const customStacks = [
      { name: "StackA", rows: ["row-a"], approved: "A", keepSteering: [] },
      { name: "StackB", rows: ["row-b"], approved: "B", keepSteering: [] },
      { name: "StackC", rows: ["row-c"], approved: "C", keepSteering: [] },
    ];
    const filePath = path.join(tmpDir, "stacks.json");
    writeFileSync(filePath, JSON.stringify(customStacks), "utf-8");

    // Act
    const merged = loadCustomStacks(filePath, STACK_PRESETS);

    // Assert
    expect(merged[13].name).toBe("StackA");
    expect(merged[14].name).toBe("StackB");
    expect(merged[15].name).toBe("StackC");
  });

  it("should throw for entries with empty name string", () => {
    // Arrange
    const customStacks = [
      { name: "", rows: [], approved: "", keepSteering: [] },
    ];
    const filePath = path.join(tmpDir, "stacks.json");
    writeFileSync(filePath, JSON.stringify(customStacks), "utf-8");

    // Act & Assert
    expect(() => loadCustomStacks(filePath, STACK_PRESETS)).toThrow(
      /entry at index 0 is missing or has invalid fields.*name \(must be a non-empty string\)/,
    );
  });
});
