/*
 * Copyright (c) 2026 Binary Sword Pty Ltd. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project utility module
 */

import { cp, rm } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";

/**
 * Recursively copies a directory and all its contents to a destination.
 * Uses `fs/promises.cp` for cross-platform compatibility — no shell commands.
 *
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await cp(path.join(src), path.join(dest), { recursive: true });
}

/**
 * Recursively removes a directory and all its contents.
 * Uses `fs/promises.rm` for cross-platform compatibility — no shell commands.
 *
 * @param dir - Directory path to remove
 */
export async function removeDir(dir: string): Promise<void> {
  await rm(path.join(dir), { recursive: true, force: true });
}

/**
 * Logs an informational message to the console.
 *
 * @param message - The message to display
 */
export function log(message: string): void {
  console.log(message);
}

/**
 * Logs a success message in green colour to the console.
 *
 * @param message - The success message to display
 */
export function success(message: string): void {
  console.log(pc.green(message));
}

/**
 * Logs a warning message in yellow colour to the console.
 *
 * @param message - The warning message to display
 */
export function warn(message: string): void {
  console.log(pc.yellow(message));
}

/**
 * Logs an error message in red colour to the console.
 *
 * @param message - The error message to display
 */
export function error(message: string): void {
  console.error(pc.red(message));
}
