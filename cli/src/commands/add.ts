/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project — add command (inject .kiro/)
 */

import { existsSync } from "node:fs";
import path from "node:path";
import prompts from "prompts";

import type { CliFlags, CommandOptions } from "../index.js";
import { resolveHostTarget } from "../hosts.js";
import { gatherConfig } from "../prompts.js";
import { replacePlaceholders } from "../replacer.js";
import { copyDir, error, log, success, warn } from "../utils.js";

/** Resolve the bundled templates directory relative to the built output. */
const TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");

/** Valid values for the --only flag. */
const VALID_ONLY_TARGETS = ["steering", "hooks", "specs", "settings"] as const;

type CopyTarget = {
  dest: string;
  label: string;
  src: string;
};

/**
 * Inject `.kiro/` (or a subset) into the current working directory.
 *
 * Copies only the `.kiro/` template — no docs, root files, or other
 * scaffolding. Prompts for project name, copyright holder, and year
 * so placeholders in the copied files can be replaced.
 *
 * @param flags - Parsed CLI flags
 * @param options - Optional command dependencies (logger, progress, configDefaults)
 */
export async function add(
  flags: CliFlags,
  options?: CommandOptions,
): Promise<void> {
  const config = await gatherConfig(flags);
  const host = resolveHostTarget(flags.host, "add");

  const kiroTemplateSrc = path.join(TEMPLATES_DIR, "kiro");
  const kiroTargetDir = path.join(process.cwd(), ".kiro");
  const copyTargets = buildAddTargets(host);

  // Determine what to copy based on --only flag
  if (flags.only) {
    if (host !== "kiro") {
      error("--only is only supported with --host kiro.");
      process.exit(1);
    }

    // Validate the --only value (should already be validated by arg parser, but be safe)
    if (
      !VALID_ONLY_TARGETS.includes(
        flags.only as (typeof VALID_ONLY_TARGETS)[number],
      )
    ) {
      warn(`Unknown --only value: "${flags.only}"`);
      return;
    }

    const subSrc = path.join(kiroTemplateSrc, flags.only);
    const subDest = path.join(kiroTargetDir, flags.only);

    options?.progress.start(`Injecting .kiro/${flags.only}/...`);

    await copyDir(subSrc, subDest);
    options?.logger.fileOp("copy", `.kiro/${flags.only}/`);
    options?.progress.tick("copied");

    options?.progress.update("Replacing placeholders...");

    // Replace placeholders in the copied subdirectory only
    const modified = await replacePlaceholders(subDest, {
      "{{PROJECT_NAME}}": config.projectName,
      "{{COPYRIGHT_HOLDER}}": config.copyrightHolder,
      "{{YEAR}}": config.year,
    });

    for (const file of modified) {
      options?.logger.fileOp("replace", file);
      options?.progress.tick("replaced");
    }

    options?.progress.stop();

    printSummary(flags.only, modified.length, options);
    return;
  }

  // No --only flag — copy the requested host targets
  const existingTargets = copyTargets.filter((target) => existsSync(target.dest));
  if (existingTargets.length > 0) {
    warn(
      `Existing target(s) detected: ${existingTargets.map((target) => target.label).join(", ")}`,
    );

    const { overwrite } = await prompts(
      {
        type: "confirm",
        name: "overwrite",
        message: "Overwrite existing host config files?",
        initial: false,
      },
      { onCancel: () => process.exit(0) },
    );

    if (!overwrite) {
      log("Aborted — no files were changed.");
      return;
    }
  }

  options?.progress.start(
    `Injecting ${copyTargets.map((target) => target.label).join(", ")}...`,
  );

  for (const target of copyTargets) {
    await copyDir(target.src, target.dest);
    options?.logger.fileOp("copy", target.label);
    options?.progress.tick("copied");
  }

  options?.progress.update("Replacing placeholders...");

  const replacementRoots = copyTargets
    .map((target) => target.dest)
    .filter((dest) => [".kiro", ".codex"].includes(path.basename(dest)));

  const modified: string[] = [];
  for (const root of replacementRoots) {
    const updated = await replacePlaceholders(root, {
      "{{PROJECT_NAME}}": config.projectName,
      "{{COPYRIGHT_HOLDER}}": config.copyrightHolder,
      "{{YEAR}}": config.year,
    });
    modified.push(...updated);
  }

  for (const file of modified) {
    options?.logger.fileOp("replace", file);
    options?.progress.tick("replaced");
  }

  options?.progress.stop();

  printSummary(copyTargets.map((target) => target.label), modified.length, options);
}

/**
 * Prints a summary of what was injected.
 *
 * @param only - The --only subset that was copied, or undefined for the full .kiro/
 * @param filesUpdated - Number of files with placeholders replaced
 * @param options - Optional command dependencies for progress summary
 */
function printSummary(
  targets: string[] | undefined,
  filesUpdated: number,
  options?: CommandOptions,
): void {
  const target =
    targets && targets.length > 0 ? targets.join(", ") : "host config";
  success(`\n✔ Injected ${target} successfully!\n`);
  log(`  Target:       ${target}`);
  log(`  Placeholders: ${filesUpdated} file(s) updated`);
  if (options?.progress) {
    log(`  Operations:   ${options.progress.summary()}`);
  }
}

function buildAddTargets(
  host: ReturnType<typeof resolveHostTarget>,
): CopyTarget[] {
  const cwd = process.cwd();
  const targets: CopyTarget[] = [];

  if (host === "all" || host === "kiro") {
    targets.push({
      src: path.join(TEMPLATES_DIR, "kiro"),
      dest: path.join(cwd, ".kiro"),
      label: ".kiro/",
    });
  }

  if (host === "all" || host === "codex") {
    targets.push({
      src: path.join(TEMPLATES_DIR, "codex"),
      dest: path.join(cwd, ".codex"),
      label: ".codex/",
    });
  }

  if (host === "all" || host === "codex" || host === "portable") {
    targets.push({
      src: path.join(TEMPLATES_DIR, "root", "AGENTS.md"),
      dest: path.join(cwd, "AGENTS.md"),
      label: "AGENTS.md",
    });
  }

  return targets;
}
