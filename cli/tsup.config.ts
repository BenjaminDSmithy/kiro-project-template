import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  splitting: false,
  sourcemap: true,
  noExternal: ["prompts", "picocolors"],
  banner: {
    js: [
      'import { createRequire } from "node:module";',
      'import { fileURLToPath as __kiro_fileURLToPath } from "node:url";',
      'import { dirname as __kiro_dirname } from "node:path";',
      "const require = createRequire(import.meta.url);",
      "const __filename = __kiro_fileURLToPath(import.meta.url);",
      "const __dirname = __kiro_dirname(__filename);",
    ].join(" "),
  },
  onSuccess: "cp -R templates dist/templates",
});
