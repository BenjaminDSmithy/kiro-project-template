/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project dry-run engine module
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";

import {
  includesCodexHost,
  includesKiroHost,
  includesVSCodeTemplate,
} from "./hosts.js";
import type { HostTarget } from "./hosts.js";
import type { ProjectConfig } from "./prompts.js";
import { STACK_PRESETS } from "./stacks.js";

/** Status emoji prefixes used on example spec directories. */
const EXAMPLE_PREFIXES = ["✅", "📋", "🚧", "⏸️"];

/** Spec directories that must never be removed. */
const PROTECTED_SPECS = ["_TEMPLATE", "_BUGFIX_TEMPLATE"];

/**
 * A plan describing all file operations that a command would perform,
 * without actually writing anything to disk.
 */
export type DryRunPlan = {
  /** Directories that would be created. */
  directories: string[];
  /** Files that would be copied. */
  files: string[];
  /** Files that would have placeholders replaced. */
  replacements: string[];
  /** Files or directories that would be removed. */
  removals: string[];
};

/**
 * Simulates the `init` command and returns a plan of all file operations.
 *
 * Walks the `kiro/`, `codex/`, `docs/`, and `root/` template directories to enumerate
 * files and directories that would be created. Scans file contents for `{{`
 * tokens to identify placeholder replacements. Determines which steering docs
 * and example specs would be removed based on the resolved config.
 *
 * @param config - Resolved project configuration
 * @param templatesDir - Path to the bundled templates directory
 * @returns A DryRunPlan listing all planned operations
 */
export async function previewInit(
  config: ProjectConfig,
  templatesDir: string,
  host: HostTarget = "all",
): Promise<DryRunPlan> {
  const plan: DryRunPlan = {
    directories: [],
    files: [],
    replacements: [],
    removals: [],
  };

  const targetDir = path.resolve(process.cwd(), config.projectName);

  // The target project directory itself
  plan.directories.push(targetDir);

  if (includesKiroHost(host)) {
    await walkTemplate(
      path.join(templatesDir, "kiro"),
      path.join(targetDir, ".kiro"),
      plan,
    );
  }

  if (includesCodexHost(host)) {
    await walkTemplate(
      path.join(templatesDir, "codex"),
      path.join(targetDir, ".codex"),
      plan,
    );
  }

  // Walk docs/ → docs/
  await walkTemplate(
    path.join(templatesDir, "docs"),
    path.join(targetDir, "docs"),
    plan,
  );

  // Walk scripts/ → scripts/
  await walkTemplate(
    path.join(templatesDir, "scripts"),
    path.join(targetDir, "scripts"),
    plan,
  );

  if (includesVSCodeTemplate(host)) {
    await walkTemplate(
      path.join(templatesDir, "vscode"),
      path.join(targetDir, ".vscode"),
      plan,
    );
  }

  // Walk root/ → target root (files copied directly, not into a subdirectory)
  const rootTemplateDir = path.join(templatesDir, "root");
  const rootEntries = await readdir(rootTemplateDir);
  for (const entry of rootEntries) {
    await recordTemplatePath(
      path.join(rootTemplateDir, entry),
      path.join(targetDir, entry),
      plan,
    );
  }

  // Steering cleanup removals
  const preset = STACK_PRESETS[config.stackChoice];
  if (config.cleanupSteering && preset && preset.keepSteering.length > 0) {
    const steeringDir = path.join(templatesDir, "kiro", "steering");
    const targetSteeringDir = path.join(targetDir, ".kiro", "steering");

    try {
      const entries = await readdir(steeringDir);
      for (const entry of entries) {
        if (!preset.keepSteering.includes(entry)) {
          plan.removals.push(path.join(targetSteeringDir, entry));
        }
      }
    } catch {
      // Steering directory may not exist — skip silently
    }
  }

  // Example spec removals
  if (config.removeExamples) {
    const specsDir = path.join(templatesDir, "kiro", "specs");
    const targetSpecsDir = path.join(targetDir, ".kiro", "specs");

    try {
      const entries = await readdir(specsDir);
      for (const entry of entries) {
        if (PROTECTED_SPECS.includes(entry)) {
          continue;
        }
        const isExample = EXAMPLE_PREFIXES.some((prefix) =>
          entry.startsWith(prefix),
        );
        if (isExample) {
          plan.removals.push(path.join(targetSpecsDir, entry));
        }
      }
    } catch {
      // Specs directory may not exist — skip silently
    }
  }

  return plan;
}

/**
 * Simulates the `add` command and returns a plan of all file operations.
 *
 * Walks the `kiro/` template directory (or a subset when `only` is provided)
 * to enumerate files that would be copied into `.kiro/`. Scans file contents
 * for `{{` tokens to identify placeholder replacements.
 *
 * @param config - Resolved project configuration
 * @param templatesDir - Path to the bundled templates directory
 * @param only - Optional subset to limit the preview (e.g. "hooks", "steering")
 * @returns A DryRunPlan listing all planned operations
 */
export async function previewAdd(
  config: ProjectConfig,
  templatesDir: string,
  host: HostTarget = "kiro",
  only?: string,
): Promise<DryRunPlan> {
  const plan: DryRunPlan = {
    directories: [],
    files: [],
    replacements: [],
    removals: [],
  };

  if (only && host !== "kiro") {
    throw new Error("--only is only supported with --host kiro");
  }

  if (only) {
    // Walk only the specified subset
    const kiroTargetDir = path.join(process.cwd(), ".kiro");
    const subSrc = path.join(templatesDir, "kiro", only);
    const subDest = path.join(kiroTargetDir, only);
    await walkTemplate(subSrc, subDest, plan);
  } else {
    if (host === "all" || host === "kiro") {
      await walkTemplate(
        path.join(templatesDir, "kiro"),
        path.join(process.cwd(), ".kiro"),
        plan,
      );
    }

    if (host === "all" || host === "codex") {
      await walkTemplate(
        path.join(templatesDir, "codex"),
        path.join(process.cwd(), ".codex"),
        plan,
      );
    }

    if (host === "all" || host === "codex" || host === "portable") {
      await recordTemplatePath(
        path.join(templatesDir, "root", "AGENTS.md"),
        path.join(process.cwd(), "AGENTS.md"),
        plan,
      );
    }
  }

  return plan;
}

/**
 * Formats a DryRunPlan as human-readable terminal output with colour-coded
 * counts per category.
 *
 * @param plan - The dry-run plan to format
 * @returns A formatted string suitable for printing to the terminal
 */
export function formatPlan(plan: DryRunPlan): string {
  const lines: string[] = [];

  lines.push(pc.bold("\nDry-run preview:\n"));

  lines.push(
    `  ${pc.cyan("Directories:")}  ${plan.directories.length} would be created`,
  );
  lines.push(
    `  ${pc.green("Files:")}        ${plan.files.length} would be copied`,
  );
  lines.push(
    `  ${pc.yellow("Replacements:")} ${plan.replacements.length} would have placeholders replaced`,
  );
  lines.push(
    `  ${pc.red("Removals:")}     ${plan.removals.length} would be removed`,
  );

  lines.push(
    `\n  ${pc.dim("Total operations:")} ${plan.directories.length + plan.files.length + plan.replacements.length + plan.removals.length}`,
  );

  lines.push("");

  return lines.join("\n");
}

/**
 * Recursively walks a template source directory and records all directories
 * and files that would be created at the corresponding destination paths.
 * Scans each file for placeholder tokens to populate the replacements list.
 *
 * @param srcDir - Source template directory to walk
 * @param destDir - Corresponding destination directory path
 * @param plan - The DryRunPlan to populate
 */
async function walkTemplate(
  srcDir: string,
  destDir: string,
  plan: DryRunPlan,
): Promise<void> {
  plan.directories.push(destDir);

  const entries = await readdir(srcDir);

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    const info = await stat(srcPath);

    if (info.isDirectory()) {
      await walkTemplate(srcPath, destPath, plan);
    } else if (info.isFile()) {
      plan.files.push(destPath);

      if (await containsPlaceholder(srcPath)) {
        plan.replacements.push(destPath);
      }
    }
  }
}

async function recordTemplatePath(
  srcPath: string,
  destPath: string,
  plan: DryRunPlan,
): Promise<void> {
  const info = await stat(srcPath);

  if (info.isDirectory()) {
    await walkTemplate(srcPath, destPath, plan);
    return;
  }

  if (info.isFile()) {
    plan.files.push(destPath);
    if (await containsPlaceholder(srcPath)) {
      plan.replacements.push(destPath);
    }
  }
}

/**
 * Checks whether a file contains placeholder tokens by scanning for `{{`.
 * Reads the file as UTF-8 and checks for the presence of the opening
 * double-brace token. Binary files with null bytes in the first 512 bytes
 * are skipped.
 *
 * @param filePath - Path to the file to scan
 * @returns `true` if the file contains at least one `{{` token
 */
async function containsPlaceholder(filePath: string): Promise<boolean> {
  try {
    const content = await readFile(filePath, "utf-8");

    // Skip binary files (same heuristic as replacer.ts)
    const slice = content.slice(0, 512);
    if (slice.includes("\0")) {
      return false;
    }

    return content.includes("{{");
  } catch {
    return false;
  }
}
