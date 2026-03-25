/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project — init command (scaffold)
 */

import { existsSync } from "node:fs";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import prompts from "prompts";

import type { CliFlags, CommandOptions } from "../index.js";
import {
  includesCodexHost,
  includesKiroHost,
  includesVSCodeTemplate,
  resolveHostTarget,
} from "../hosts.js";
import type { VerboseLogger } from "../logger.js";
import type { ProgressReporter } from "../progress.js";
import { gatherConfig } from "../prompts.js";
import { replacePlaceholders } from "../replacer.js";
import { STACK_PRESETS } from "../stacks.js";
import { copyDir, log, removeDir, success, warn } from "../utils.js";

/** Resolve the bundled templates directory relative to the built output. */
const TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");

/** Status emoji prefixes used on example spec directories. */
const EXAMPLE_PREFIXES = ["✅", "📋", "🚧", "⏸️"];

/** Spec directories that must never be removed. */
const PROTECTED_SPECS = ["_TEMPLATE", "_BUGFIX_TEMPLATE"];

/**
 * Full project scaffold — copy all templates, run prompts,
 * replace placeholders, generate TECH-STACK.md, clean up.
 *
 * @param flags - Parsed CLI flags
 * @param options - Optional command dependencies (logger, progress, configDefaults)
 */
export async function init(
  flags: CliFlags,
  options?: CommandOptions,
): Promise<void> {
  const config = await gatherConfig(flags);
  const host = resolveHostTarget(flags.host, "init");
  const targetDir = path.resolve(process.cwd(), config.projectName);

  // Handle existing directory
  if (existsSync(targetDir)) {
    const { overwrite } = await prompts(
      {
        type: "confirm",
        name: "overwrite",
        message: `Directory "${config.projectName}" already exists. Overwrite?`,
        initial: false,
      },
      { onCancel: () => process.exit(0) },
    );

    if (!overwrite) {
      log("Aborted — no files were changed.");
      return;
    }

    await removeDir(targetDir);
  }

  await mkdir(targetDir, { recursive: true });

  options?.progress.start("Scaffolding project...");

  // Copy host-specific template directories into the target
  if (includesKiroHost(host)) {
    await copyDir(
      path.join(TEMPLATES_DIR, "kiro"),
      path.join(targetDir, ".kiro"),
    );
    options?.logger.fileOp("copy", ".kiro/");
    options?.progress.tick("copied");
  }

  if (includesCodexHost(host)) {
    await copyDir(
      path.join(TEMPLATES_DIR, "codex"),
      path.join(targetDir, ".codex"),
    );
    options?.logger.fileOp("copy", ".codex/");
    options?.progress.tick("copied");
  }

  await copyDir(path.join(TEMPLATES_DIR, "docs"), path.join(targetDir, "docs"));
  options?.logger.fileOp("copy", "docs/");
  options?.progress.tick("copied");

  if (includesVSCodeTemplate(host)) {
    await copyDir(
      path.join(TEMPLATES_DIR, "vscode"),
      path.join(targetDir, ".vscode"),
    );
    options?.logger.fileOp("copy", ".vscode/");
    options?.progress.tick("copied");
  }

  await copyDir(
    path.join(TEMPLATES_DIR, "scripts"),
    path.join(targetDir, "scripts"),
  );
  options?.logger.fileOp("copy", "scripts/");
  options?.progress.tick("copied");

  // Root template contents are copied directly into the target (not into a subdirectory)
  const rootTemplateDir = path.join(TEMPLATES_DIR, "root");
  const rootEntries = await readdir(rootTemplateDir);
  for (const entry of rootEntries) {
    await copyDir(
      path.join(rootTemplateDir, entry),
      path.join(targetDir, entry),
    );
    options?.logger.fileOp("copy", entry);
    options?.progress.tick("copied");
  }

  // Replace placeholders across the entire target directory
  const modifiedFiles = await replacePlaceholders(targetDir, {
    "{{PROJECT_NAME}}": config.projectName,
    "{{COPYRIGHT_HOLDER}}": config.copyrightHolder,
    "{{YEAR}}": config.year,
  });

  for (const file of modifiedFiles) {
    options?.logger.fileOp("replace", file);
    options?.progress.tick("replaced");
  }

  // Generate TECH-STACK.md from the selected stack preset (skip for "Custom")
  const preset = STACK_PRESETS[config.stackChoice];
  if (preset && preset.name !== "Custom" && preset.rows.length > 0) {
    await generateTechStackDoc(targetDir, config.projectName, preset);
    options?.logger.fileOp("replace", "docs/TECH-STACK.md");
    options?.progress.tick("replaced");
  }

  // Steering cleanup — remove docs not in the preset's keepSteering list
  if (config.cleanupSteering && preset && preset.keepSteering.length > 0) {
    await cleanupSteering(
      targetDir,
      preset.keepSteering,
      options?.logger,
      options?.progress,
    );
  }

  // Example spec removal — delete directories prefixed with status emojis
  if (config.removeExamples) {
    await removeExampleSpecs(targetDir, options?.logger, options?.progress);
  }

  options?.progress.stop();

  // Print summary
  success("\n✔ Project scaffolded successfully!\n");
  log(`  Project:         ${config.projectName}`);
  log(`  Directory:       ${targetDir}`);
  log(`  Stack:           ${preset?.name ?? "Custom"}`);
  log(`  Package manager: ${config.pkgManager}`);
  log(`  Files created:   ${rootEntries.length + modifiedFiles.length}`);
  log(`  Placeholders:    ${modifiedFiles.length} files updated`);
  log("");
  success(`Next steps:`);
  log(`  cd ${config.projectName}`);
  log(`  ${config.pkgManager} install`);
}

/**
 * Generates a pre-filled `docs/TECH-STACK.md` from the selected stack preset.
 *
 * @param targetDir - The scaffolded project root
 * @param projectName - The project name for the heading
 * @param preset - The selected stack preset
 */
async function generateTechStackDoc(
  targetDir: string,
  projectName: string,
  preset: (typeof STACK_PRESETS)[number],
): Promise<void> {
  const rows = preset.rows.join("\n");
  const content = `# Tech Stack — ${projectName}

## Core Stack

| Layer | Technology | Version | Key Constraint |
| ----- | ---------- | ------- | -------------- |
${rows}

## Approved Integrations

${preset.approved}
`;

  const techStackPath = path.join(targetDir, "docs", "TECH-STACK.md");
  await writeFile(techStackPath, content, "utf-8");
}

/**
 * Removes steering docs that are not in the preset's keepSteering list.
 *
 * @param targetDir - The scaffolded project root
 * @param keepSteering - Filenames to retain
 * @param logger - Optional verbose logger for per-file logging
 * @param progress - Optional progress reporter for tick tracking
 */
async function cleanupSteering(
  targetDir: string,
  keepSteering: string[],
  logger?: VerboseLogger,
  progress?: ProgressReporter,
): Promise<void> {
  const steeringDir = path.join(targetDir, ".kiro", "steering");

  if (!existsSync(steeringDir)) {
    return;
  }

  const entries = await readdir(steeringDir);
  let removed = 0;

  for (const entry of entries) {
    if (!keepSteering.includes(entry)) {
      await unlink(path.join(steeringDir, entry));
      logger?.steeringRemoved(entry);
      progress?.tick("removed");
      removed++;
    }
  }

  if (removed > 0) {
    warn(
      `  Removed ${removed} steering doc(s) not matching the selected preset.`,
    );
  }
}

/**
 * Removes example spec directories (prefixed with status emojis) while
 * preserving `_TEMPLATE/` and `_BUGFIX_TEMPLATE/`.
 *
 * @param targetDir - The scaffolded project root
 * @param logger - Optional verbose logger for per-file logging
 * @param progress - Optional progress reporter for tick tracking
 */
async function removeExampleSpecs(
  targetDir: string,
  logger?: VerboseLogger,
  progress?: ProgressReporter,
): Promise<void> {
  const specsDir = path.join(targetDir, ".kiro", "specs");

  if (!existsSync(specsDir)) {
    return;
  }

  const entries = await readdir(specsDir);
  let removed = 0;

  for (const entry of entries) {
    // Never remove protected template directories
    if (PROTECTED_SPECS.includes(entry)) {
      continue;
    }

    // Remove directories whose name starts with a status emoji
    const isExample = EXAMPLE_PREFIXES.some((prefix) =>
      entry.startsWith(prefix),
    );
    if (isExample) {
      await removeDir(path.join(specsDir, entry));
      logger?.exampleSpecRemoved(entry);
      progress?.tick("removed");
      removed++;
    }
  }

  if (removed > 0) {
    warn(`  Removed ${removed} example spec(s).`);
  }
}
