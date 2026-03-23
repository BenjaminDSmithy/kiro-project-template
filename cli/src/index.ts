#!/usr/bin/env node

/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project CLI entry point
 */

import { createRequire } from "node:module";
import path from "node:path";

import { loadConfig } from "./config.js";
import type { ProjectConfigFile } from "./config.js";
import { previewAdd, previewInit, formatPlan } from "./dry-run.js";
import { createLogger } from "./logger.js";
import type { VerboseLogger } from "./logger.js";
import { createProgress } from "./progress.js";
import type { ProgressReporter } from "./progress.js";
import { gatherConfig } from "./prompts.js";
import { validateTemplateDir } from "./validator.js";

/**
 * CLI flags parsed from process.argv.
 *
 * @property add - Whether to run in inject mode (--add)
 * @property only - Subset of .kiro/ to inject (steering, hooks, specs, settings)
 * @property name - Project name
 * @property copyright - Copyright holder
 * @property year - Copyright year
 * @property stack - Stack preset identifier
 * @property pkg - Package manager (npm, pnpm, yarn, bun)
 * @property yes - Accept all defaults without prompting
 * @property dryRun - Preview operations without writing to disk (--dry-run)
 * @property verbose - Enable detailed logging to stderr (--verbose)
 * @property config - Explicit path to a .create-kiro-project.json config file (--config)
 */
export type CliFlags = {
  add: boolean;
  only?: "steering" | "hooks" | "specs" | "settings";
  name?: string;
  copyright?: string;
  year?: string;
  stack?: string;
  pkg?: string;
  yes: boolean;
  dryRun: boolean;
  verbose: boolean;
  config?: string;
};

/**
 * Options object passed to `init()` and `add()` for dependency injection.
 * Created in `main()` based on parsed flags and passed through — commands
 * don't create their own dependencies.
 *
 * @property logger - Verbose logger instance (no-op when --verbose is off)
 * @property progress - Progress reporter for spinner and file-count feedback
 * @property configDefaults - Defaults loaded from the config file (may be empty)
 */
export type CommandOptions = {
  logger: VerboseLogger;
  progress: ProgressReporter;
  configDefaults: ProjectConfigFile;
};

const VALID_ONLY_VALUES = ["steering", "hooks", "specs", "settings"] as const;

/**
 * Parses process.argv into a structured CliFlags object.
 *
 * @param argv - The argument array to parse (typically process.argv.slice(2))
 * @returns Parsed CLI flags
 */
export function parseArgs(argv: string[]): CliFlags {
  const flags: CliFlags = {
    add: false,
    yes: false,
    dryRun: false,
    verbose: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case "--add":
        flags.add = true;
        break;
      case "--only": {
        const value = argv[++i];
        if (
          value &&
          VALID_ONLY_VALUES.includes(
            value as (typeof VALID_ONLY_VALUES)[number],
          )
        ) {
          flags.only = value as CliFlags["only"];
        }
        break;
      }
      case "--name": {
        const value = argv[++i];
        if (value) flags.name = value;
        break;
      }
      case "--copyright": {
        const value = argv[++i];
        if (value) flags.copyright = value;
        break;
      }
      case "--year": {
        const value = argv[++i];
        if (value) flags.year = value;
        break;
      }
      case "--stack": {
        const value = argv[++i];
        if (value) flags.stack = value;
        break;
      }
      case "--pkg": {
        const value = argv[++i];
        if (value) flags.pkg = value;
        break;
      }
      case "--yes":
      case "-y":
        flags.yes = true;
        break;
      case "--dry-run":
        flags.dryRun = true;
        break;
      case "--verbose":
        flags.verbose = true;
        break;
      case "--config": {
        const value = argv[++i];
        if (value) flags.config = value;
        break;
      }
    }
  }

  return flags;
}

function printHelp(): void {
  console.log(`
Usage: create-kiro-project [options]

Options:
  --name <name>          Project name
  --copyright <holder>   Copyright holder
  --year <year>          Copyright year
  --stack <preset>       Stack preset
  --pkg <manager>        Package manager (npm, pnpm, yarn, bun)
  --yes, -y              Accept all defaults
  --add                  Inject .kiro/ into current directory
  --only <subset>        With --add: only copy steering, hooks, specs, or settings
  --dry-run              Preview operations without writing to disk
  --verbose              Enable detailed logging to stderr
  --config <path>        Path to .create-kiro-project.json config file
  --help                 Show this help message
  --version              Show version number
`);
}

function printVersion(): void {
  const require = createRequire(import.meta.url);
  const pkg = require("../package.json") as { version: string };
  console.log(pkg.version);
}

/** Resolve the bundled templates directory relative to the built output. */
const TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");

/** Active progress reporter — stopped on SIGINT for clean exit. */
let activeProgress: ProgressReporter | undefined;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  if (argv.includes("--version")) {
    printVersion();
    process.exit(0);
  }

  const flags = parseArgs(argv);

  // Load config file defaults (explicit path or auto-discovery)
  const configDefaults = loadConfig(process.cwd(), flags.config);

  // Create dependency instances based on parsed flags
  const logger = createLogger(flags.verbose);
  const progress = createProgress();
  activeProgress = progress;

  // Validate templates directory before any command execution
  validateTemplateDir(TEMPLATES_DIR);

  const options: CommandOptions = { logger, progress, configDefaults };

  if (flags.dryRun) {
    // Dry-run mode — gather config via prompts, then preview
    const config = await gatherConfig(flags);

    if (flags.add) {
      const plan = await previewAdd(config, TEMPLATES_DIR, flags.only);
      console.log(formatPlan(plan));
    } else {
      const plan = await previewInit(config, TEMPLATES_DIR);
      console.log(formatPlan(plan));
    }
  } else if (flags.add) {
    const { add } = await import("./commands/add.js");
    await add(flags, options);
  } else {
    const { init } = await import("./commands/init.js");
    await init(flags, options);
  }
}

// Graceful exit on Ctrl+C — stop progress reporter, then exit
process.on("SIGINT", () => {
  if (activeProgress) activeProgress.stop();
  process.exit(0);
});

main().catch((err: unknown) => {
  if (err instanceof Error) {
    // User-friendly messages for common error types
    if ("code" in err && (err as NodeJS.ErrnoException).code === "EEXIST") {
      console.error(`Directory already exists: ${err.message}`);
    } else if (
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "EACCES"
    ) {
      console.error(`Permission denied: ${err.message}`);
    } else {
      console.error(err.message);
    }
  } else {
    console.error("An unexpected error occurred");
  }
  process.exit(1);
});
