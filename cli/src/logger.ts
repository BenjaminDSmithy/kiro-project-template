/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project verbose logger module
 */

import pc from "picocolors";

/**
 * Verbose logger interface for detailed CLI operation logging.
 * When verbose mode is off, all methods are no-ops (zero overhead).
 */
export type VerboseLogger = {
  fileOp(op: "copy" | "replace" | "remove" | "skip", filePath: string): void;
  configLoaded(configPath: string): void;
  steeringRemoved(filename: string): void;
  exampleSpecRemoved(dirname: string): void;
  customStackLoaded(presetName: string): void;
};

/**
 * Formats a dim timestamp string for log line prefixes.
 * Uses HH:MM:SS.mmm format for precision during verbose debugging.
 *
 * @returns Dim-styled timestamp string
 */
function timestamp(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  return pc.dim(`[${h}:${m}:${s}.${ms}]`);
}

/**
 * Writes a verbose log line to stderr with a dim timestamp and category tag.
 *
 * @param tag - Category tag (e.g. "file", "config")
 * @param message - Log message content
 */
function logLine(tag: string, message: string): void {
  process.stderr.write(`${timestamp()} ${pc.dim(`[${tag}]`)} ${message}\n`);
}

/** No-op function used when verbose mode is disabled. */
const noop = (): void => {};

/**
 * Creates a verbose logger. When verbose=false, all methods are no-ops
 * with zero overhead — no conditional checks per call.
 *
 * @param verbose - Whether verbose logging is enabled
 * @returns VerboseLogger instance
 */
export function createLogger(verbose: boolean): VerboseLogger {
  if (!verbose) {
    return {
      fileOp: noop,
      configLoaded: noop,
      steeringRemoved: noop,
      exampleSpecRemoved: noop,
      customStackLoaded: noop,
    };
  }

  return {
    fileOp(op, filePath) {
      const label =
        op === "copy"
          ? pc.green("COPY")
          : op === "replace"
            ? pc.yellow("REPLACE")
            : op === "remove"
              ? pc.red("REMOVE")
              : pc.dim("SKIP");
      logLine("file", `${label} ${filePath}`);
    },
    configLoaded(configPath) {
      logLine("config", `Loaded config from ${pc.cyan(configPath)}`);
    },
    steeringRemoved(filename) {
      logLine("steering", `Removed ${pc.yellow(filename)}`);
    },
    exampleSpecRemoved(dirname) {
      logLine("spec", `Removed example spec ${pc.yellow(dirname)}`);
    },
    customStackLoaded(presetName) {
      logLine("stack", `Loaded custom preset ${pc.cyan(presetName)}`);
    },
  };
}
