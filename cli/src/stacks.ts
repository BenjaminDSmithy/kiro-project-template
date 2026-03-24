/*
 * Copyright (c) 2026 Benjamin D. Smith. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root.
 *
 * create-kiro-project stack presets data module
 */

import { readFileSync } from "node:fs";

/**
 * A stack preset defines the core technology configuration for a project,
 * including TECH-STACK.md table rows, approved integrations, and which
 * steering docs to retain during cleanup.
 */
export type StackPreset = {
  name: string;
  rows: string[]; // TECH-STACK.md table rows
  approved: string; // Approved integrations (comma-separated)
  keepSteering: string[]; // Steering doc filenames to keep
};

/**
 * Steering docs common to all presets (00–52). Every preset keeps these
 * regardless of stack choice.
 */
const COMMON_STEERING = [
  "00-core-rules.md",
  "01-product.md",
  "02-tech.md",
  "03-structure.md",
  "10-dev-code-style.md",
  "11-dev-error-handling.md",
  "12-dev-testing.md",
  "20-workflow-git.md",
  "21-workflow-task-completion.md",
  "30-hooks-guide.md",
  "31-kiro-best-practices.md",
  "40-security.md",
  "41-docker.md",
  "42-react-components.md",
  "43-mcp.md",
  "44-authorisation.md",
  "45-api-standards.md",
  "46-logging.md",
  "47-database.md",
  "48-documentation.md",
  "49-cicd.md",
  "50-code-review.md",
  "50a-spec-creation.md",
  "51-accessibility.md",
  "52-bug-tracking.md",
];

/**
 * Stack presets indexed 0–12, matching the order in prompts.ts.
 * Each preset provides data for TECH-STACK.md generation, approved
 * integrations, and steering doc retention during cleanup.
 *
 * The "Custom" preset (index 12) skips tech stack generation entirely
 * and keeps all steering docs (empty keepSteering = keep everything).
 */
export const STACK_PRESETS: Record<number, StackPreset> = {
  // 0: T3 — Next.js + tRPC + Tailwind + TypeScript
  0: {
    name: "T3",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Framework | Next.js (App Router) | 15.x | RSC default, no Pages Router |",
      "| API | tRPC | 11.x | End-to-end type safety |",
      "| Styling | Tailwind CSS | 4.x | Utility-first, no custom CSS files |",
      "| Database | PostgreSQL (Drizzle) | 16 | Drizzle ORM, no raw SQL |",
      "| Auth | NextAuth.js | 5.x | OAuth + credentials |",
      "| Testing | Vitest | 2.x | Co-located tests, fast-check for props |",
    ],
    approved:
      "Next.js, React, tRPC, Tailwind CSS, Drizzle ORM, NextAuth.js, Vitest, fast-check",
    keepSteering: [
      ...COMMON_STEERING,
      "53-nextjs.md",
      "54-state-management.md",
      "55-tailwind-shadcn.md",
      "57-performance.md",
      "58-env-variables.md",
      "60-t3-stack.md",
      "63-stack-selection.md",
      "65-error-boundaries.md",
    ],
  },

  // 1: T4 — Expo + Next.js + Tamagui + tRPC + Solito
  1: {
    name: "T4",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Web Framework | Next.js (App Router) | 15.x | RSC default |",
      "| Mobile Framework | Expo | 52.x | Managed workflow |",
      "| Styling | Tamagui | 1.x | Cross-platform UI primitives |",
      "| API | tRPC | 11.x | End-to-end type safety |",
      "| Navigation | Solito | 4.x | Cross-platform routing |",
      "| Testing | Vitest | 2.x | Co-located tests |",
    ],
    approved:
      "Next.js, React, Expo, Tamagui, tRPC, Solito, Drizzle ORM, Vitest",
    keepSteering: [
      ...COMMON_STEERING,
      "53-nextjs.md",
      "54-state-management.md",
      "57-performance.md",
      "58-env-variables.md",
      "61-t4-stack.md",
      "63-stack-selection.md",
      "64-monorepo.md",
      "65-error-boundaries.md",
    ],
  },

  // 2: Supabase+Next.js
  2: {
    name: "Supabase+Next.js",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Framework | Next.js (App Router) | 15.x | RSC default |",
      "| Styling | Tailwind CSS | 4.x | Utility-first |",
      "| Database | PostgreSQL | 16 | Via Supabase, RLS enabled |",
      "| Auth | Supabase Auth | 2.x | Email + OAuth |",
      "| ORM | Drizzle | 0.36+ | Type-safe queries |",
      "| Testing | Vitest | 2.x | Co-located tests, fast-check |",
    ],
    approved:
      "Next.js, React, Supabase, Drizzle ORM, Tailwind CSS, shadcn/ui, Vitest, fast-check",
    keepSteering: [
      ...COMMON_STEERING,
      "53-nextjs.md",
      "54-state-management.md",
      "55-tailwind-shadcn.md",
      "57-performance.md",
      "58-env-variables.md",
      "59-realtime.md",
      "63-stack-selection.md",
      "65-error-boundaries.md",
    ],
  },

  // 3: Vite+React
  3: {
    name: "Vite+React",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Framework | React | 19.x | Client-side SPA |",
      "| Bundler | Vite | 6.x | HMR, ESM-first |",
      "| Styling | Tailwind CSS | 4.x | Utility-first |",
      "| Routing | React Router | 7.x | File-based optional |",
      "| Testing | Vitest | 2.x | Co-located tests |",
    ],
    approved:
      "React, Vite, Tailwind CSS, React Router, Vitest, Testing Library",
    keepSteering: [
      ...COMMON_STEERING,
      "54-state-management.md",
      "55-tailwind-shadcn.md",
      "57-performance.md",
      "58-env-variables.md",
      "63-stack-selection.md",
      "65-error-boundaries.md",
      "70-frontend-design.md",
    ],
  },

  // 4: SvelteKit
  4: {
    name: "SvelteKit",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Framework | SvelteKit | 2.x | SSR + SPA hybrid |",
      "| Styling | Tailwind CSS | 4.x | Utility-first |",
      "| Database | PostgreSQL | 16 | Via Drizzle ORM |",
      "| Auth | Lucia | 3.x | Session-based |",
      "| Testing | Vitest | 2.x | Co-located tests |",
    ],
    approved: "SvelteKit, Svelte, Tailwind CSS, Drizzle ORM, Lucia, Vitest",
    keepSteering: [
      ...COMMON_STEERING,
      "55-tailwind-shadcn.md",
      "57-performance.md",
      "58-env-variables.md",
      "63-stack-selection.md",
    ],
  },

  // 5: Nuxt 3
  5: {
    name: "Nuxt 3",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Framework | Nuxt | 3.x | Auto-imports, SSR default |",
      "| Styling | Tailwind CSS | 4.x | Utility-first |",
      "| Database | PostgreSQL | 16 | Via Drizzle ORM |",
      "| Auth | Nuxt Auth Utils | latest | Session-based |",
      "| Testing | Vitest | 2.x | Nuxt test utils |",
    ],
    approved: "Nuxt, Vue, Tailwind CSS, Drizzle ORM, Vitest",
    keepSteering: [
      ...COMMON_STEERING,
      "55-tailwind-shadcn.md",
      "57-performance.md",
      "58-env-variables.md",
      "63-stack-selection.md",
    ],
  },

  // 6: Remix
  6: {
    name: "Remix",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Framework | Remix | 2.x | Nested routes, loaders/actions |",
      "| Styling | Tailwind CSS | 4.x | Utility-first |",
      "| Database | PostgreSQL | 16 | Via Drizzle ORM |",
      "| Auth | Remix Auth | latest | Strategy-based |",
      "| Testing | Vitest | 2.x | Co-located tests |",
    ],
    approved: "Remix, React, Tailwind CSS, Drizzle ORM, Vitest",
    keepSteering: [
      ...COMMON_STEERING,
      "54-state-management.md",
      "55-tailwind-shadcn.md",
      "57-performance.md",
      "58-env-variables.md",
      "63-stack-selection.md",
      "65-error-boundaries.md",
    ],
  },

  // 7: Astro
  7: {
    name: "Astro",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Framework | Astro | 5.x | Islands architecture, SSG default |",
      "| Styling | Tailwind CSS | 4.x | Utility-first |",
      "| Content | Astro Content Collections | built-in | Type-safe Markdown/MDX |",
      "| Testing | Vitest | 2.x | Co-located tests |",
    ],
    approved: "Astro, React, Tailwind CSS, MDX, Vitest",
    keepSteering: [
      ...COMMON_STEERING,
      "55-tailwind-shadcn.md",
      "56-i18n.md",
      "57-performance.md",
      "58-env-variables.md",
      "63-stack-selection.md",
    ],
  },

  // 8: Flutter+Supabase
  8: {
    name: "Flutter+Supabase",
    rows: [
      "| Language | Dart | 3.x | Null safety enabled |",
      "| Framework | Flutter | 3.x | Material 3 design |",
      "| Backend | Supabase | 2.x | Auth + Database + Storage |",
      "| State | Riverpod | 2.x | Compile-safe providers |",
      "| Testing | flutter_test | built-in | Widget + unit tests |",
    ],
    approved: "Flutter, Dart, Supabase, Riverpod, flutter_test",
    keepSteering: [
      ...COMMON_STEERING,
      "58-env-variables.md",
      "59-realtime.md",
      "63-stack-selection.md",
    ],
  },

  // 9: Electron
  9: {
    name: "Electron",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Framework | Electron | 33.x | Main + renderer process |",
      "| UI | React | 19.x | Renderer process UI |",
      "| Bundler | Vite | 6.x | Electron-vite plugin |",
      "| Styling | Tailwind CSS | 4.x | Utility-first |",
      "| Testing | Vitest | 2.x | Co-located tests |",
    ],
    approved: "Electron, React, Vite, Tailwind CSS, Vitest",
    keepSteering: [
      ...COMMON_STEERING,
      "54-state-management.md",
      "55-tailwind-shadcn.md",
      "57-performance.md",
      "58-env-variables.md",
      "63-stack-selection.md",
      "65-error-boundaries.md",
    ],
  },

  // 10: Python FastAPI
  10: {
    name: "Python FastAPI",
    rows: [
      "| Language | Python | 3.12+ | Type hints required |",
      "| Framework | FastAPI | 0.115+ | Async-first, OpenAPI auto-docs |",
      "| ORM | SQLAlchemy | 2.x | Async sessions |",
      "| Database | PostgreSQL | 16 | Via asyncpg driver |",
      "| Auth | FastAPI Users | latest | JWT + OAuth2 |",
      "| Testing | pytest | 8.x | pytest-asyncio for async tests |",
    ],
    approved: "FastAPI, SQLAlchemy, PostgreSQL, pytest, Pydantic",
    keepSteering: [
      ...COMMON_STEERING,
      "57-performance.md",
      "58-env-variables.md",
      "63-stack-selection.md",
    ],
  },

  // 11: TanStack Start
  11: {
    name: "TanStack Start",
    rows: [
      "| Language | TypeScript | 5.5+ | Strict mode |",
      "| Framework | TanStack Start | 1.x | Full-stack React framework |",
      "| Routing | TanStack Router | 1.x | Type-safe file-based routing |",
      "| Data | TanStack Query | 5.x | Server state management |",
      "| Styling | Tailwind CSS | 4.x | Utility-first |",
      "| Testing | Vitest | 2.x | Co-located tests |",
    ],
    approved:
      "TanStack Start, TanStack Router, TanStack Query, React, Tailwind CSS, Vitest",
    keepSteering: [
      ...COMMON_STEERING,
      "54-state-management.md",
      "55-tailwind-shadcn.md",
      "57-performance.md",
      "58-env-variables.md",
      "62-tanstack.md",
      "63-stack-selection.md",
      "65-error-boundaries.md",
    ],
  },

  // 12: Custom — skip tech stack generation, keep all steering docs
  12: {
    name: "Custom",
    rows: [],
    approved: "",
    keepSteering: [],
  },
};

/**
 * Required fields for each entry in a custom stacks JSON file.
 */
const CUSTOM_STACK_REQUIRED_FIELDS = [
  "name",
  "rows",
  "approved",
  "keepSteering",
] as const;

/**
 * Loads custom stack presets from a JSON file and merges them with built-in
 * presets. Custom presets are assigned indices starting from
 * `Object.keys(builtIn).length` so they never overwrite built-in entries.
 *
 * @param filePath - Absolute or relative path to the stacks.json file
 * @param builtIn - The built-in STACK_PRESETS record to merge with
 * @returns A new record containing all built-in presets plus custom presets
 * @throws If the file cannot be read, is not valid JSON, is not an array,
 *         or any entry is missing required fields
 */
export function loadCustomStacks(
  filePath: string,
  builtIn: Record<number, StackPreset>,
): Record<number, StackPreset> {
  const raw = readFileSync(filePath, "utf-8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`Custom stacks file at ${filePath} must be a JSON array.`);
  }

  const merged: Record<number, StackPreset> = { ...builtIn };
  let nextIndex = Object.keys(builtIn).length;

  // Collect all preset names (built-in + custom) for duplicate detection
  const seenNames = new Map<string, string>();
  for (const preset of Object.values(builtIn)) {
    seenNames.set(preset.name, "built-in");
  }

  for (let i = 0; i < parsed.length; i++) {
    const entry = parsed[i];

    // Validate required fields
    const missing: string[] = [];
    for (const field of CUSTOM_STACK_REQUIRED_FIELDS) {
      if (!(field in entry) || entry[field] === undefined) {
        missing.push(field);
      }
    }

    // Type-level validation for present fields
    if (missing.length === 0) {
      if (typeof entry.name !== "string" || entry.name.trim() === "") {
        missing.push("name (must be a non-empty string)");
      }
      if (!Array.isArray(entry.rows)) {
        missing.push("rows (must be an array)");
      }
      if (typeof entry.approved !== "string") {
        missing.push("approved (must be a string)");
      }
      if (!Array.isArray(entry.keepSteering)) {
        missing.push("keepSteering (must be an array)");
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Custom stacks entry at index ${i} is missing or has invalid fields: ${missing.join(", ")}. File: ${filePath}`,
      );
    }

    const name = entry.name as string;

    // Warn on duplicate names (including collisions with built-in presets)
    if (seenNames.has(name)) {
      const source = seenNames.get(name);
      process.stderr.write(
        `Warning: custom stack "${name}" duplicates a ${source} preset name — last definition wins.\n`,
      );
    }
    seenNames.set(name, "custom");

    merged[nextIndex] = {
      name,
      rows: entry.rows as string[],
      approved: entry.approved as string,
      keepSteering: entry.keepSteering as string[],
    };
    nextIndex++;
  }

  return merged;
}
