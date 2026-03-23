import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "node18",
  clean: true,
  splitting: false,
  sourcemap: true,
  noExternal: ["prompts", "picocolors"],
  onSuccess: "cp -R templates dist/templates",
});
