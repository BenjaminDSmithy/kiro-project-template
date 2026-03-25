/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * Host target helpers for agent configuration scaffolding
 */

import { error, log } from "./utils.js";

export const HOST_TARGETS = ["all", "kiro", "codex", "portable"] as const;

export type HostTarget = (typeof HOST_TARGETS)[number];

type CommandMode = "init" | "add";

/**
 * Resolves the requested host target, applying command-specific defaults.
 *
 * - init defaults to `all`
 * - add defaults to `kiro` for backward compatibility
 *
 * Invalid values print a user-friendly message and exit.
 */
export function resolveHostTarget(
  value: string | undefined,
  mode: CommandMode,
): HostTarget {
  const fallback: HostTarget = mode === "add" ? "kiro" : "all";

  if (value === undefined) {
    return fallback;
  }

  const lower = value.toLowerCase();
  if (HOST_TARGETS.includes(lower as HostTarget)) {
    return lower as HostTarget;
  }

  error(`Invalid host target: "${value}"`);
  log(`Valid options: ${HOST_TARGETS.join(", ")}`);
  process.exit(1);
}

export function includesKiroHost(host: HostTarget): boolean {
  return host === "all" || host === "kiro";
}

export function includesCodexHost(host: HostTarget): boolean {
  return host === "all" || host === "codex";
}

export function includesVSCodeTemplate(host: HostTarget): boolean {
  return includesKiroHost(host);
}
