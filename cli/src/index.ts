#!/usr/bin/env node

/* create-kiro-project CLI entry point */

import { createRequire } from "node:module";

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
  --help                 Show this help message
  --version              Show version number
`);
}

function printVersion(): void {
  const require = createRequire(import.meta.url);
  const pkg = require("../package.json") as { version: string };
  console.log(pkg.version);
}

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

  if (flags.add) {
    const { add } = await import("./commands/add.js");
    await add(flags);
  } else {
    const { init } = await import("./commands/init.js");
    await init(flags);
  }
}

// Graceful exit on Ctrl+C with no partial output
process.on("SIGINT", () => {
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
