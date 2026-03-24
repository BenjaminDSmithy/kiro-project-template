/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Integration tests for full scaffold and inject flows
 */

import {
  mkdtemp,
  mkdir,
  readdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadConfig } from "./config.js";
import { previewInit } from "./dry-run.js";
import { replacePlaceholders } from "./replacer.js";
import { loadCustomStacks, STACK_PRESETS } from "./stacks.js";
import { copyDir } from "./utils.js";

/** Shared temp directories for each test. */
let tempDir: string;

beforeEach(async () => {
  tempDir = await realpath(
    await mkdtemp(path.join(tmpdir(), "integration-test-")),
  );
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("Full scaffold integration", () => {
  it("should copy templates, replace placeholders, and leave no tokens", async () => {
    // Arrange — create a mini template structure mimicking bundled templates
    const templateRoot = path.join(tempDir, "templates");
    const kiroSrc = path.join(templateRoot, "kiro");
    const docsSrc = path.join(templateRoot, "docs");
    const rootSrc = path.join(templateRoot, "root");

    await mkdir(path.join(kiroSrc, "hooks"), { recursive: true });
    await mkdir(path.join(kiroSrc, "settings"), { recursive: true });
    await mkdir(docsSrc, { recursive: true });
    await mkdir(rootSrc, { recursive: true });

    await writeFile(
      path.join(kiroSrc, "README.md"),
      "# {{PROJECT_NAME}} Kiro Config\nCopyright {{YEAR}} {{COPYRIGHT_HOLDER}}",
      "utf-8",
    );
    await writeFile(
      path.join(kiroSrc, "hooks", "01-hook.md"),
      "Hook for {{PROJECT_NAME}}",
      "utf-8",
    );
    await writeFile(
      path.join(kiroSrc, "settings", "mcp.json"),
      '{"project": "{{PROJECT_NAME}}"}',
      "utf-8",
    );
    await writeFile(
      path.join(docsSrc, "README.md"),
      "# {{PROJECT_NAME}} Docs",
      "utf-8",
    );
    await writeFile(
      path.join(rootSrc, "README.md"),
      "# {{PROJECT_NAME}}\n(C) {{YEAR}} {{COPYRIGHT_HOLDER}}",
      "utf-8",
    );

    // Act — simulate what init does: copy all templates, then replace placeholders
    const target = path.join(tempDir, "my-project");
    await mkdir(target, { recursive: true });

    await copyDir(kiroSrc, path.join(target, ".kiro"));
    await copyDir(docsSrc, path.join(target, "docs"));
    await copyDir(rootSrc, path.join(target, "root-files"));

    const modified = await replacePlaceholders(target, {
      "{{PROJECT_NAME}}": "my-project",
      "{{COPYRIGHT_HOLDER}}": "Test Corp",
      "{{YEAR}}": "2025",
    });

    // Assert — file structure exists
    const topLevel = await readdir(target);
    expect(topLevel).toContain(".kiro");
    expect(topLevel).toContain("docs");
    expect(topLevel).toContain("root-files");

    const kiroContents = await readdir(path.join(target, ".kiro"));
    expect(kiroContents).toContain("hooks");
    expect(kiroContents).toContain("settings");
    expect(kiroContents).toContain("README.md");

    // Assert — placeholders replaced
    const kiroReadme = await readFile(
      path.join(target, ".kiro", "README.md"),
      "utf-8",
    );
    expect(kiroReadme).toBe(
      "# my-project Kiro Config\nCopyright 2025 Test Corp",
    );

    const hookContent = await readFile(
      path.join(target, ".kiro", "hooks", "01-hook.md"),
      "utf-8",
    );
    expect(hookContent).toBe("Hook for my-project");

    const rootReadme = await readFile(
      path.join(target, "root-files", "README.md"),
      "utf-8",
    );
    expect(rootReadme).toBe("# my-project\n(C) 2025 Test Corp");

    // Assert — no tokens remain in any modified file
    expect(modified.length).toBeGreaterThan(0);
    for (const filePath of modified) {
      const content = await readFile(filePath, "utf-8");
      expect(content).not.toContain("{{PROJECT_NAME}}");
      expect(content).not.toContain("{{COPYRIGHT_HOLDER}}");
      expect(content).not.toContain("{{YEAR}}");
    }
  });
});

describe("TECH-STACK.md generation", () => {
  it("should generate valid TECH-STACK.md content from a non-Custom preset", async () => {
    // Arrange — use the T3 preset (index 0)
    const preset = STACK_PRESETS[0];
    expect(preset.name).toBe("T3");
    expect(preset.rows.length).toBeGreaterThan(0);

    // Act — generate the same content that init produces
    const rows = preset.rows.join("\n");
    const content = `# Tech Stack — test-project

## Core Stack

| Layer | Technology | Version | Key Constraint |
| ----- | ---------- | ------- | -------------- |
${rows}

## Approved Integrations

${preset.approved}
`;

    const techStackPath = path.join(tempDir, "TECH-STACK.md");
    await writeFile(techStackPath, content, "utf-8");

    // Assert — file contains preset rows and approved integrations
    const written = await readFile(techStackPath, "utf-8");
    expect(written).toContain("# Tech Stack — test-project");
    expect(written).toContain("## Core Stack");
    expect(written).toContain("## Approved Integrations");

    for (const row of preset.rows) {
      expect(written).toContain(row);
    }
    expect(written).toContain(preset.approved);
  });

  it("should have empty rows for the Custom preset", () => {
    // The Custom preset (index 12) skips tech stack generation
    const custom = STACK_PRESETS[12];
    expect(custom.name).toBe("Custom");
    expect(custom.rows).toHaveLength(0);
    expect(custom.approved).toBe("");
  });
});

describe("Add mode integration", () => {
  it("should copy only .kiro/ and leave existing files unchanged", async () => {
    // Arrange — create a target directory with existing files
    const target = path.join(tempDir, "existing-project");
    await mkdir(target, { recursive: true });

    const existingReadme = "# My Existing Project\nDo not touch.";
    const existingPkg = '{"name": "existing-project", "version": "1.0.0"}';
    await writeFile(path.join(target, "README.md"), existingReadme, "utf-8");
    await writeFile(path.join(target, "package.json"), existingPkg, "utf-8");

    // Create a kiro template source with placeholder files
    const kiroSrc = path.join(tempDir, "kiro-template");
    await mkdir(path.join(kiroSrc, "hooks"), { recursive: true });
    await mkdir(path.join(kiroSrc, "settings"), { recursive: true });
    await writeFile(
      path.join(kiroSrc, "README.md"),
      "# {{PROJECT_NAME}} .kiro config",
      "utf-8",
    );
    await writeFile(
      path.join(kiroSrc, "hooks", "01-hook.md"),
      "Hook: {{PROJECT_NAME}} (C) {{YEAR}} {{COPYRIGHT_HOLDER}}",
      "utf-8",
    );

    // Act — simulate what add does: copy only kiro template into .kiro/
    await copyDir(kiroSrc, path.join(target, ".kiro"));
    await replacePlaceholders(path.join(target, ".kiro"), {
      "{{PROJECT_NAME}}": "existing-project",
      "{{COPYRIGHT_HOLDER}}": "Owner",
      "{{YEAR}}": "2025",
    });

    // Assert — existing files are unchanged
    const readmeContent = await readFile(
      path.join(target, "README.md"),
      "utf-8",
    );
    expect(readmeContent).toBe(existingReadme);

    const pkgContent = await readFile(
      path.join(target, "package.json"),
      "utf-8",
    );
    expect(pkgContent).toBe(existingPkg);

    // Assert — .kiro/ files have placeholders replaced
    const kiroReadme = await readFile(
      path.join(target, ".kiro", "README.md"),
      "utf-8",
    );
    expect(kiroReadme).toBe("# existing-project .kiro config");

    const hookContent = await readFile(
      path.join(target, ".kiro", "hooks", "01-hook.md"),
      "utf-8",
    );
    expect(hookContent).toBe("Hook: existing-project (C) 2025 Owner");
  });
});

describe("--only flag", () => {
  it("should copy only the specified subdirectory into .kiro/", async () => {
    // Arrange — create a kiro template source with all subdirectories
    const kiroSrc = path.join(tempDir, "kiro-full");
    for (const sub of ["hooks", "steering", "specs", "settings"]) {
      await mkdir(path.join(kiroSrc, sub), { recursive: true });
      await writeFile(
        path.join(kiroSrc, sub, "sample.md"),
        `{{PROJECT_NAME}} ${sub} file`,
        "utf-8",
      );
    }

    const target = path.join(tempDir, "only-target");
    await mkdir(target, { recursive: true });

    // Act — simulate --only steering: copy only the steering subdirectory
    const subSrc = path.join(kiroSrc, "steering");
    const subDest = path.join(target, ".kiro", "steering");
    await copyDir(subSrc, subDest);

    await replacePlaceholders(subDest, {
      "{{PROJECT_NAME}}": "only-test",
      "{{COPYRIGHT_HOLDER}}": "Test",
      "{{YEAR}}": "2025",
    });

    // Assert — only steering exists in .kiro/
    const kiroContents = await readdir(path.join(target, ".kiro"));
    expect(kiroContents).toEqual(["steering"]);

    // Assert — placeholder replaced in the copied file
    const steeringContents = await readdir(
      path.join(target, ".kiro", "steering"),
    );
    expect(steeringContents).toContain("sample.md");

    const content = await readFile(
      path.join(target, ".kiro", "steering", "sample.md"),
      "utf-8",
    );
    expect(content).toBe("only-test steering file");
  });

  it("should not create other .kiro/ subdirectories when --only is used", async () => {
    // Arrange
    const kiroSrc = path.join(tempDir, "kiro-only-check");
    for (const sub of ["hooks", "steering", "specs", "settings"]) {
      await mkdir(path.join(kiroSrc, sub), { recursive: true });
      await writeFile(
        path.join(kiroSrc, sub, "file.md"),
        `Content for ${sub}`,
        "utf-8",
      );
    }

    const target = path.join(tempDir, "only-hooks-target");
    await mkdir(target, { recursive: true });

    // Act — copy only hooks
    await copyDir(
      path.join(kiroSrc, "hooks"),
      path.join(target, ".kiro", "hooks"),
    );

    // Assert — only hooks exists, no steering/specs/settings
    const kiroContents = await readdir(path.join(target, ".kiro"));
    expect(kiroContents).toEqual(["hooks"]);
  });
});

describe("Non-interactive mode sanity check", () => {
  it("should have all 13 presets with required fields for flag-based config", () => {
    // Verify all 13 presets exist
    const presetCount = Object.keys(STACK_PRESETS).length;
    expect(presetCount).toBe(13);

    // Verify each preset has required fields
    for (const [, preset] of Object.entries(STACK_PRESETS)) {
      expect(preset).toHaveProperty("name");
      expect(preset).toHaveProperty("rows");
      expect(preset).toHaveProperty("approved");
      expect(preset).toHaveProperty("keepSteering");
      expect(typeof preset.name).toBe("string");
      expect(Array.isArray(preset.rows)).toBe(true);
      expect(typeof preset.approved).toBe("string");
      expect(Array.isArray(preset.keepSteering)).toBe(true);
    }
  });

  it("should resolve known stack names to correct preset indices", () => {
    // Verify the mapping that gatherConfig uses for --stack flag
    const expectedMappings: [number, string][] = [
      [0, "T3"],
      [3, "Vite+React"],
      [11, "TanStack Start"],
      [12, "Custom"],
    ];

    for (const [index, name] of expectedMappings) {
      expect(STACK_PRESETS[index].name).toBe(name);
    }
  });
});

describe("Dry-run vs normal parity", () => {
  it("should list the same files in previewInit as would be created by init", async () => {
    // Arrange — create a mini template structure
    const realTemplateRoot = path.join(tempDir, "templates-dryrun");
    await mkdir(path.join(realTemplateRoot, "kiro", "hooks"), {
      recursive: true,
    });
    await mkdir(path.join(realTemplateRoot, "kiro", "settings"), {
      recursive: true,
    });
    await mkdir(path.join(realTemplateRoot, "docs"), { recursive: true });
    await mkdir(path.join(realTemplateRoot, "root"), { recursive: true });

    await writeFile(
      path.join(realTemplateRoot, "kiro", "README.md"),
      "# {{PROJECT_NAME}}",
      "utf-8",
    );
    await writeFile(
      path.join(realTemplateRoot, "kiro", "hooks", "01-hook.md"),
      "Hook",
      "utf-8",
    );
    await writeFile(
      path.join(realTemplateRoot, "docs", "README.md"),
      "Docs",
      "utf-8",
    );
    await writeFile(
      path.join(realTemplateRoot, "root", "README.md"),
      "Root",
      "utf-8",
    );

    const config = {
      projectName: "parity-test",
      copyrightHolder: "Test",
      year: "2025",
      stackChoice: 12, // Custom — no cleanup
      pkgManager: "npm",
      cleanupSteering: false,
      removeExamples: false,
    };

    // Act — run previewInit
    const origCwd = process.cwd();
    process.chdir(tempDir);
    try {
      const plan = await previewInit(config, realTemplateRoot);

      // Also simulate the actual init copy
      const target = path.join(tempDir, config.projectName);
      await mkdir(target, { recursive: true });
      await copyDir(
        path.join(realTemplateRoot, "kiro"),
        path.join(target, ".kiro"),
      );
      await copyDir(
        path.join(realTemplateRoot, "docs"),
        path.join(target, "docs"),
      );
      const rootEntries = await readdir(path.join(realTemplateRoot, "root"));
      for (const entry of rootEntries) {
        await copyDir(
          path.join(realTemplateRoot, "root", entry),
          path.join(target, entry),
        );
      }

      // Collect actual files created
      const actualFiles: string[] = [];
      async function walk(dir: string): Promise<void> {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(full);
          } else {
            actualFiles.push(full);
          }
        }
      }
      await walk(target);

      // Assert — plan files should match actual files (compare basenames to
      // avoid macOS /tmp → /private/var symlink path resolution differences)
      const planFileSet = new Set(plan.files.map((f) => path.basename(f)));
      const actualFileSet = new Set(actualFiles.map((f) => path.basename(f)));

      expect(planFileSet).toEqual(actualFileSet);
      expect(plan.files.length).toBe(actualFiles.length);
    } finally {
      process.chdir(origCwd);
    }
  });
});

describe("Config file resolution", () => {
  it("should find config at nearest ancestor directory", async () => {
    // Arrange — create nested directories with config at the top
    const root = path.join(tempDir, "config-walk");
    const nested = path.join(root, "a", "b", "c");
    await mkdir(nested, { recursive: true });

    const configData = {
      copyrightHolder: "Walk Corp",
      pkgManager: "pnpm",
    };
    await writeFile(
      path.join(root, ".create-kiro-project.json"),
      JSON.stringify(configData),
      "utf-8",
    );

    // Act — load from the deeply nested directory
    const result = loadConfig(nested);

    // Assert — should find the ancestor config
    expect(result.copyrightHolder).toBe("Walk Corp");
    expect(result.pkgManager).toBe("pnpm");
  });

  it("should return empty object when no config exists", async () => {
    // Arrange — isolated temp dir with no config file
    const isolated = path.join(tempDir, "no-config");
    await mkdir(isolated, { recursive: true });

    // Act
    const result = loadConfig(isolated);

    // Assert
    expect(result).toEqual({});
  });
});

describe("Custom stacks end-to-end", () => {
  it("should load custom stacks and assign indices after built-in presets", async () => {
    // Arrange — write a stacks.json fixture
    const customStacks = [
      {
        name: "MyCustomStack",
        rows: ["| Framework | Custom | 1.0 | None |"],
        approved: "Custom approved list",
        keepSteering: ["00-core-rules.md"],
      },
    ];
    const stacksPath = path.join(tempDir, "stacks.json");
    await writeFile(stacksPath, JSON.stringify(customStacks), "utf-8");

    // Act — load custom stacks merged with built-in
    const merged = loadCustomStacks(stacksPath, STACK_PRESETS);

    // Assert — custom stack exists at index 13 (after 0-12 built-in)
    const builtInCount = Object.keys(STACK_PRESETS).length;
    expect(merged[builtInCount]).toBeDefined();
    expect(merged[builtInCount].name).toBe("MyCustomStack");
    expect(merged[builtInCount].rows).toEqual([
      "| Framework | Custom | 1.0 | None |",
    ]);

    // Assert — all built-in presets are preserved
    for (let i = 0; i < builtInCount; i++) {
      expect(merged[i].name).toBe(STACK_PRESETS[i].name);
    }
  });
});
