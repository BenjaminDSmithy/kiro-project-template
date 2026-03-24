/* Unit tests for verbose logger module */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

import { createLogger } from "./logger.js";

/** Spy type matching the overloaded process.stderr.write / process.stdout.write signature. */
type WriteSpy = MockInstance<{
  (buffer: string | Uint8Array, cb?: (err?: Error | null) => void): boolean;
  (
    str: string | Uint8Array,
    encoding?: BufferEncoding,
    cb?: (err?: Error | null) => void,
  ): boolean;
}>;

describe("createLogger", () => {
  let stderrSpy: WriteSpy;
  let stdoutSpy: WriteSpy;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    stdoutSpy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("verbose=false (no-op mode)", () => {
    it("should produce zero output for fileOp calls", () => {
      // Arrange
      const logger = createLogger(false);

      // Act
      logger.fileOp("copy", "/tmp/file.ts");
      logger.fileOp("replace", "/tmp/other.ts");
      logger.fileOp("remove", "/tmp/gone.ts");
      logger.fileOp("skip", "/tmp/skip.ts");

      // Assert
      expect(stderrSpy).not.toHaveBeenCalled();
      expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it("should produce zero output for configLoaded", () => {
      // Arrange
      const logger = createLogger(false);

      // Act
      logger.configLoaded("/home/user/.create-kiro-project.json");

      // Assert
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it("should produce zero output for steeringRemoved", () => {
      // Arrange
      const logger = createLogger(false);

      // Act
      logger.steeringRemoved("53-nextjs.md");

      // Assert
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it("should produce zero output for exampleSpecRemoved", () => {
      // Arrange
      const logger = createLogger(false);

      // Act
      logger.exampleSpecRemoved("sample-auth-setup");

      // Assert
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it("should produce zero output for customStackLoaded", () => {
      // Arrange
      const logger = createLogger(false);

      // Act
      logger.customStackLoaded("My Custom Stack");

      // Assert
      expect(stderrSpy).not.toHaveBeenCalled();
    });
  });

  describe("verbose=true (active logging)", () => {
    describe("stderr targeting", () => {
      it("should write all output to stderr, not stdout", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.fileOp("copy", "/tmp/file.ts");
        logger.configLoaded("/path/to/config.json");
        logger.steeringRemoved("53-nextjs.md");
        logger.exampleSpecRemoved("sample-auth");
        logger.customStackLoaded("MyStack");

        // Assert
        expect(stderrSpy).toHaveBeenCalledTimes(5);
        expect(stdoutSpy).not.toHaveBeenCalled();
      });
    });

    describe("timestamp prefix", () => {
      it("should include a bracketed timestamp in each log line", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.fileOp("copy", "/tmp/file.ts");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toMatch(/\[/);
        expect(output).toMatch(/\]/);
        expect(output).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
      });
    });

    describe("category tags", () => {
      it("should include [file] tag for fileOp calls", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.fileOp("copy", "/tmp/file.ts");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("[file]");
      });

      it("should include [config] tag for configLoaded calls", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.configLoaded("/path/to/config.json");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("[config]");
      });

      it("should include [steering] tag for steeringRemoved calls", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.steeringRemoved("53-nextjs.md");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("[steering]");
      });

      it("should include [spec] tag for exampleSpecRemoved calls", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.exampleSpecRemoved("sample-auth");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("[spec]");
      });

      it("should include [stack] tag for customStackLoaded calls", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.customStackLoaded("MyStack");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("[stack]");
      });
    });

    describe("fileOp operations", () => {
      it("should log COPY with the file path", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.fileOp("copy", "/project/src/index.ts");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("COPY");
        expect(output).toContain("/project/src/index.ts");
      });

      it("should log REPLACE with the file path", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.fileOp("replace", "/project/README.md");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("REPLACE");
        expect(output).toContain("/project/README.md");
      });

      it("should log REMOVE with the file path", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.fileOp("remove", "/project/.kiro/steering/old.md");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("REMOVE");
        expect(output).toContain("/project/.kiro/steering/old.md");
      });

      it("should log SKIP with the file path", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.fileOp("skip", "/project/existing-file.ts");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("SKIP");
        expect(output).toContain("/project/existing-file.ts");
      });
    });

    describe("configLoaded", () => {
      it("should log the resolved config file path", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.configLoaded("/home/user/.create-kiro-project.json");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("/home/user/.create-kiro-project.json");
      });
    });

    describe("steeringRemoved", () => {
      it("should log the removed steering doc filename", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.steeringRemoved("53-nextjs.md");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("53-nextjs.md");
      });
    });

    describe("exampleSpecRemoved", () => {
      it("should log the removed example spec directory name", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.exampleSpecRemoved("sample-auth-setup");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("sample-auth-setup");
      });
    });

    describe("customStackLoaded", () => {
      it("should log the loaded preset name", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.customStackLoaded("Enterprise Stack");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toContain("Enterprise Stack");
      });
    });

    describe("newline termination", () => {
      it("should terminate each log line with a newline", () => {
        // Arrange
        const logger = createLogger(true);

        // Act
        logger.fileOp("copy", "/tmp/file.ts");

        // Assert
        const output = String(stderrSpy.mock.calls[0]?.[0]);
        expect(output).toMatch(/\n$/);
      });
    });
  });
});
