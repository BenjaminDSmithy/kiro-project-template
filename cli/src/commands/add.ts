/* create-kiro-project — add command (inject .kiro/) */

import { existsSync } from "node:fs";
import path from "node:path";
import prompts from "prompts";

import type { CliFlags, CommandOptions } from "../index.js";
import { gatherConfig } from "../prompts.js";
import { replacePlaceholders } from "../replacer.js";
import { copyDir, log, success, warn } from "../utils.js";

/** Resolve the bundled templates directory relative to the built output. */
const TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");

/** Valid values for the --only flag. */
const VALID_ONLY_TARGETS = ["steering", "hooks", "specs", "settings"] as const;

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

  const kiroTemplateSrc = path.join(TEMPLATES_DIR, "kiro");
  const kiroTargetDir = path.join(process.cwd(), ".kiro");

  // Determine what to copy based on --only flag
  if (flags.only) {
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

  // No --only flag — copy the entire .kiro/ directory
  if (existsSync(kiroTargetDir)) {
    warn("A .kiro/ directory already exists in the current directory.");

    const { overwrite } = await prompts(
      {
        type: "confirm",
        name: "overwrite",
        message: "Overwrite existing .kiro/ directory?",
        initial: false,
      },
      { onCancel: () => process.exit(0) },
    );

    if (!overwrite) {
      log("Aborted — no files were changed.");
      return;
    }
  }

  options?.progress.start("Injecting .kiro/...");

  await copyDir(kiroTemplateSrc, kiroTargetDir);
  options?.logger.fileOp("copy", ".kiro/");
  options?.progress.tick("copied");

  options?.progress.update("Replacing placeholders...");

  // Replace placeholders across the entire .kiro/ directory
  const modified = await replacePlaceholders(kiroTargetDir, {
    "{{PROJECT_NAME}}": config.projectName,
    "{{COPYRIGHT_HOLDER}}": config.copyrightHolder,
    "{{YEAR}}": config.year,
  });

  for (const file of modified) {
    options?.logger.fileOp("replace", file);
    options?.progress.tick("replaced");
  }

  options?.progress.stop();

  printSummary(undefined, modified.length, options);
}

/**
 * Prints a summary of what was injected.
 *
 * @param only - The --only subset that was copied, or undefined for the full .kiro/
 * @param filesUpdated - Number of files with placeholders replaced
 * @param options - Optional command dependencies for progress summary
 */
function printSummary(
  only: string | undefined,
  filesUpdated: number,
  options?: CommandOptions,
): void {
  const target = only ? `.kiro/${only}/` : ".kiro/";
  success(`\n✔ Injected ${target} successfully!\n`);
  log(`  Target:       ${target}`);
  log(`  Placeholders: ${filesUpdated} file(s) updated`);
  if (options?.progress) {
    log(`  Operations:   ${options.progress.summary()}`);
  }
}
