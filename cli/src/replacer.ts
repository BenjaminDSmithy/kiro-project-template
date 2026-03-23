/* create-kiro-project placeholder replacer module */

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Map of placeholder tokens to their replacement values.
 * Keys are the exact token strings found in template files.
 */
export type Replacements = {
  "{{PROJECT_NAME}}": string;
  "{{COPYRIGHT_HOLDER}}": string;
  "{{YEAR}}": string;
};

/** All recognised placeholder tokens. */
const PLACEHOLDER_KEYS: readonly (keyof Replacements)[] = [
  "{{PROJECT_NAME}}",
  "{{COPYRIGHT_HOLDER}}",
  "{{YEAR}}",
];

/**
 * Checks whether a file is likely binary by looking for null bytes
 * in the first 512 bytes of its content.
 *
 * @param content - The file content read as a UTF-8 string
 * @returns `true` if the file appears to be binary
 */
function isBinaryContent(content: string): boolean {
  const slice = content.slice(0, 512);
  return slice.includes("\0");
}

/**
 * Recursively walks a directory and replaces placeholder tokens in all
 * text files. Binary files (detected via null bytes) are skipped.
 *
 * Uses `split().join()` for direct string replacement, which handles
 * special characters (`&`, `\`, `/`, `$&`, `$'`) in values without
 * corruption — unlike `replaceAll()` which interprets `$` patterns.
 *
 * @param dir - Root directory to walk
 * @param replacements - Token-to-value mapping
 * @returns List of file paths that were modified
 */
export async function replacePlaceholders(
  dir: string,
  replacements: Replacements,
): Promise<string[]> {
  const modified: string[] = [];
  await walkAndReplace(dir, replacements, modified);
  return modified;
}

/**
 * Internal recursive walker that processes every file in a directory tree.
 *
 * @param currentDir - Directory currently being processed
 * @param replacements - Token-to-value mapping
 * @param modified - Accumulator for paths of modified files
 */
async function walkAndReplace(
  currentDir: string,
  replacements: Replacements,
  modified: string[],
): Promise<void> {
  const entries = await readdir(currentDir);

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry);
    const info = await stat(fullPath);

    if (info.isDirectory()) {
      await walkAndReplace(fullPath, replacements, modified);
    } else if (info.isFile()) {
      const content = await readFile(fullPath, "utf-8");

      // Skip binary files
      if (isBinaryContent(content)) {
        continue;
      }

      let updated = content;
      for (const key of PLACEHOLDER_KEYS) {
        // Use split/join instead of replaceAll to avoid $& and other
        // special replacement patterns being interpreted in values.
        updated = updated.split(key).join(replacements[key]);
      }

      // Only write back if something actually changed
      if (updated !== content) {
        await writeFile(fullPath, updated, "utf-8");
        modified.push(fullPath);
      }
    }
  }
}
