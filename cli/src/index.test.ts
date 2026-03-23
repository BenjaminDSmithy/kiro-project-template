/* Tests for CLI argument parsing */

import { describe, expect, it } from "vitest";
import { parseArgs } from "./index.js";

describe("parseArgs", () => {
  it("returns defaults when no arguments provided", () => {
    const flags = parseArgs([]);
    expect(flags).toEqual({ add: false, yes: false });
  });

  it("parses --add flag", () => {
    const flags = parseArgs(["--add"]);
    expect(flags.add).toBe(true);
  });

  it("parses --yes flag", () => {
    const flags = parseArgs(["--yes"]);
    expect(flags.yes).toBe(true);
  });

  it("parses -y shorthand", () => {
    const flags = parseArgs(["-y"]);
    expect(flags.yes).toBe(true);
  });

  it("parses --name with value", () => {
    const flags = parseArgs(["--name", "my-project"]);
    expect(flags.name).toBe("my-project");
  });

  it("parses --copyright with value", () => {
    const flags = parseArgs(["--copyright", "Acme Corp"]);
    expect(flags.copyright).toBe("Acme Corp");
  });

  it("parses --year with value", () => {
    const flags = parseArgs(["--year", "2025"]);
    expect(flags.year).toBe("2025");
  });

  it("parses --stack with value", () => {
    const flags = parseArgs(["--stack", "t3"]);
    expect(flags.stack).toBe("t3");
  });

  it("parses --pkg with value", () => {
    const flags = parseArgs(["--pkg", "pnpm"]);
    expect(flags.pkg).toBe("pnpm");
  });

  it("parses --only with valid value", () => {
    const flags = parseArgs(["--only", "steering"]);
    expect(flags.only).toBe("steering");
  });

  it("ignores --only with invalid value", () => {
    const flags = parseArgs(["--only", "invalid"]);
    expect(flags.only).toBeUndefined();
  });

  it("parses all flags together", () => {
    const flags = parseArgs([
      "--add",
      "--only",
      "hooks",
      "--name",
      "test-proj",
      "--copyright",
      "Test Co",
      "--year",
      "2024",
      "--stack",
      "t4",
      "--pkg",
      "yarn",
      "-y",
    ]);

    expect(flags).toEqual({
      add: true,
      only: "hooks",
      name: "test-proj",
      copyright: "Test Co",
      year: "2024",
      stack: "t4",
      pkg: "yarn",
      yes: true,
    });
  });

  it("accepts all valid --only values", () => {
    for (const value of ["steering", "hooks", "specs", "settings"] as const) {
      const flags = parseArgs(["--only", value]);
      expect(flags.only).toBe(value);
    }
  });
});
