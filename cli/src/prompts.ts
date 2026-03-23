/* create-kiro-project shared prompts module */

import path from "node:path";
import prompts from "prompts";

import type { CliFlags } from "./index.js";
import { error, log } from "./utils.js";

/**
 * Configuration gathered from interactive prompts or CLI flags.
 */
export type ProjectConfig = {
  projectName: string;
  copyrightHolder: string;
  year: string;
  stackChoice: number;
  pkgManager: string;
  cleanupSteering: boolean;
  removeExamples: boolean;
};

/** Stack preset names in display order. Index matches `stackChoice`. */
const STACK_PRESET_NAMES = [
  "T3",
  "T4",
  "Supabase+Next.js",
  "Vite+React",
  "SvelteKit",
  "Nuxt 3",
  "Remix",
  "Astro",
  "Flutter+Supabase",
  "Electron",
  "Python FastAPI",
  "TanStack Start",
  "Custom",
] as const;

/** Supported package managers. */
const PKG_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;

/**
 * Handles Ctrl+C during prompts by exiting cleanly with no partial output.
 * Passed to `prompts` as the `onCancel` callback.
 */
function onCancel(): void {
  process.exit(0);
}

/**
 * Resolves the stack preset index from a flag value (name match, case-insensitive).
 * Returns -1 if no match is found.
 *
 * @param name - The stack preset name provided via --stack flag
 * @returns The numeric index (0-12) or -1 if unrecognised
 */
function resolveStackIndex(name: string): number {
  const lower = name.toLowerCase();
  return STACK_PRESET_NAMES.findIndex((p) => p.toLowerCase() === lower);
}

/**
 * Resolves the package manager from a flag value (case-insensitive).
 * Returns undefined if the value is not a recognised package manager.
 *
 * @param name - The package manager name provided via --pkg flag
 * @returns The normalised package manager name or undefined
 */
function resolvePkgManager(name: string): string | undefined {
  const lower = name.toLowerCase();
  return PKG_MANAGERS.find((p) => p === lower);
}

/**
 * Gathers project configuration from interactive prompts, skipping any
 * values already provided via CLI flags. When `--yes` is set, all prompts
 * are skipped and sensible defaults are used.
 *
 * @param flags - Parsed CLI flags from the entry point
 * @returns Fully resolved project configuration
 */
export async function gatherConfig(flags: CliFlags): Promise<ProjectConfig> {
  // Validate --stack flag value if provided
  if (flags.stack !== undefined) {
    const idx = resolveStackIndex(flags.stack);
    if (idx === -1) {
      error(`Invalid stack preset: "${flags.stack}"`);
      log(`Valid options: ${STACK_PRESET_NAMES.join(", ")}`);
      process.exit(1);
    }
  }

  // Validate --pkg flag value if provided
  if (flags.pkg !== undefined) {
    const resolved = resolvePkgManager(flags.pkg);
    if (!resolved) {
      error(`Invalid package manager: "${flags.pkg}"`);
      log(`Valid options: ${PKG_MANAGERS.join(", ")}`);
      process.exit(1);
    }
  }

  const defaults = {
    projectName: path.basename(process.cwd()),
    copyrightHolder: "",
    year: new Date().getFullYear().toString(),
    stackChoice: STACK_PRESET_NAMES.length - 1, // "Custom"
    pkgManager: "npm",
    cleanupSteering: false,
    removeExamples: false,
  };

  // Non-interactive mode — use flags or defaults for everything
  if (flags.yes) {
    return {
      projectName: flags.name ?? defaults.projectName,
      copyrightHolder: flags.copyright ?? defaults.copyrightHolder,
      year: flags.year ?? defaults.year,
      stackChoice:
        flags.stack !== undefined
          ? resolveStackIndex(flags.stack)
          : defaults.stackChoice,
      pkgManager:
        flags.pkg !== undefined
          ? (resolvePkgManager(flags.pkg) ?? defaults.pkgManager)
          : defaults.pkgManager,
      cleanupSteering: defaults.cleanupSteering,
      removeExamples: defaults.removeExamples,
    };
  }

  // Interactive mode — prompt for each value not already provided via flags

  const projectName =
    flags.name ??
    (
      await prompts(
        {
          type: "text",
          name: "value",
          message: "Project name",
          initial: defaults.projectName,
        },
        { onCancel },
      )
    ).value;

  const copyrightHolder =
    flags.copyright ??
    (
      await prompts(
        {
          type: "text",
          name: "value",
          message: "Copyright holder",
          initial: defaults.copyrightHolder,
        },
        { onCancel },
      )
    ).value;

  const year =
    flags.year ??
    (
      await prompts(
        {
          type: "text",
          name: "value",
          message: "Copyright year",
          initial: defaults.year,
        },
        { onCancel },
      )
    ).value;

  let stackChoice: number;
  if (flags.stack !== undefined) {
    stackChoice = resolveStackIndex(flags.stack);
  } else {
    const result = await prompts(
      {
        type: "select",
        name: "value",
        message: "Stack preset",
        choices: STACK_PRESET_NAMES.map((name, i) => ({
          title: name,
          value: i,
        })),
        initial: defaults.stackChoice,
      },
      { onCancel },
    );
    stackChoice = result.value;
  }

  let pkgManager: string;
  if (flags.pkg !== undefined) {
    pkgManager = resolvePkgManager(flags.pkg) ?? defaults.pkgManager;
  } else {
    const result = await prompts(
      {
        type: "select",
        name: "value",
        message: "Package manager",
        choices: PKG_MANAGERS.map((name) => ({ title: name, value: name })),
        initial: 0,
      },
      { onCancel },
    );
    pkgManager = result.value;
  }

  const cleanupSteering = (
    await prompts(
      {
        type: "confirm",
        name: "value",
        message: "Remove steering docs for other stacks?",
        initial: false,
      },
      { onCancel },
    )
  ).value;

  const removeExamples = (
    await prompts(
      {
        type: "confirm",
        name: "value",
        message: "Remove example specs?",
        initial: false,
      },
      { onCancel },
    )
  ).value;

  return {
    projectName,
    copyrightHolder,
    year,
    stackChoice,
    pkgManager,
    cleanupSteering,
    removeExamples,
  };
}
