/* create-kiro-project progress reporter module */

import pc from "picocolors";

/** Spinner frame characters for TTY animation. */
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/** Interval in milliseconds between spinner frame updates. */
const SPINNER_INTERVAL_MS = 80;

/** Categories tracked by the progress reporter. */
export type TickCategory = "copied" | "replaced" | "removed";

/**
 * Progress reporter interface for visual feedback during file operations.
 * Animates a spinner on TTY stderr; degrades to plain lines on non-TTY.
 */
export type ProgressReporter = {
  start(message: string): void;
  update(message: string): void;
  tick(category: TickCategory): void;
  stop(): void;
  summary(): string;
};

/**
 * Creates a progress reporter. Uses an animated spinner on TTY environments,
 * plain newline-terminated lines otherwise. All output goes to stderr so
 * stdout remains clean for piping.
 *
 * No external dependencies — built on process.stderr.write and picocolors.
 *
 * @returns ProgressReporter instance
 */
export function createProgress(): ProgressReporter {
  const counts: Record<TickCategory, number> = {
    copied: 0,
    replaced: 0,
    removed: 0,
  };

  const isTTY = Boolean(process.stderr.isTTY);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let frameIndex = 0;
  let currentMessage = "";
  let running = false;

  /**
   * Renders the current spinner frame and message to stderr using \r overwrite.
   * Only called in TTY mode.
   */
  function renderFrame(): void {
    const frame = pc.cyan(SPINNER_FRAMES[frameIndex % SPINNER_FRAMES.length]);
    process.stderr.write(`\r${frame} ${currentMessage}`);
    frameIndex++;
  }

  /** Hides the terminal cursor (TTY only). */
  function hideCursor(): void {
    if (isTTY) {
      process.stderr.write("\x1B[?25l");
    }
  }

  /** Shows the terminal cursor (TTY only). */
  function showCursor(): void {
    if (isTTY) {
      process.stderr.write("\x1B[?25h");
    }
  }

  /** Cleans up spinner state — stops interval, restores cursor. */
  function cleanup(): void {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (running && isTTY) {
      process.stderr.write("\r\x1B[K");
      showCursor();
    }
    running = false;
  }

  /** SIGINT handler — stop spinner, restore cursor, then exit. */
  function onSigint(): void {
    cleanup();
    process.exit(0);
  }

  return {
    start(message: string): void {
      if (running) {
        this.stop();
      }

      currentMessage = message;
      running = true;
      frameIndex = 0;

      process.on("SIGINT", onSigint);

      if (isTTY) {
        hideCursor();
        renderFrame();
        intervalId = setInterval(renderFrame, SPINNER_INTERVAL_MS);
      } else {
        process.stderr.write(`${message}\n`);
      }
    },

    update(message: string): void {
      currentMessage = message;

      if (!isTTY && running) {
        process.stderr.write(`${message}\n`);
      }
    },

    tick(category: TickCategory): void {
      counts[category]++;
    },

    stop(): void {
      cleanup();
      process.removeListener("SIGINT", onSigint);
    },

    summary(): string {
      const parts: string[] = [];

      if (counts.copied > 0) {
        parts.push(pc.green(`${counts.copied} copied`));
      }
      if (counts.replaced > 0) {
        parts.push(pc.yellow(`${counts.replaced} replaced`));
      }
      if (counts.removed > 0) {
        parts.push(pc.red(`${counts.removed} removed`));
      }

      if (parts.length === 0) {
        return "No file operations performed.";
      }

      return parts.join(", ");
    },
  };
}
