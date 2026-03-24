---
inclusion: fileMatch
fileMatchPattern:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.css"
  - "**/tailwind*"
  - "src/app/**/page.tsx"
  - "src/app/**/layout.tsx"
---

# Frontend Design Standards

Design thinking, aesthetics, and creative direction for building distinctive, production-grade interfaces. This complements `42-react-components.md` (structure) and `55-tailwind-shadcn.md` (styling conventions) by focusing on the design process itself.

## Design Thinking Process

Before writing UI code, answer these questions:

| Question                                | Purpose                                |
| --------------------------------------- | -------------------------------------- |
| What problem does this interface solve? | Grounds design in user needs           |
| Who uses it and in what context?        | Informs tone, density, complexity      |
| What is the aesthetic direction?        | Establishes a cohesive visual identity |
| What makes this memorable?              | Differentiates from generic output     |
| What are the technical constraints?     | Framework, performance, accessibility  |

## Aesthetic Direction

Commit to a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

### Choosing a Direction

Pick a tone that fits the context. Examples for inspiration:

| Direction              | When to use                  | Character                       |
| ---------------------- | ---------------------------- | ------------------------------- |
| Brutally minimal       | Developer tools, dashboards  | Sparse, functional, monospace   |
| Luxury/refined         | Premium products, portfolios | Elegant spacing, serif accents  |
| Playful/toy-like       | Consumer apps, onboarding    | Rounded, colourful, bouncy      |
| Editorial/magazine     | Content-heavy, blogs         | Strong typography hierarchy     |
| Industrial/utilitarian | Admin panels, data tools     | Dense, efficient, no decoration |
| Soft/pastel            | Wellness, creative tools     | Gentle gradients, rounded forms |

Every design should feel intentionally crafted for its specific context. Vary between light and dark themes, different fonts, different aesthetics across projects.

## Typography

| Rule                        | Implementation                                             |
| --------------------------- | ---------------------------------------------------------- |
| Choose distinctive fonts    | Avoid generic choices (Arial, Inter, Roboto, system fonts) |
| Pair display + body fonts   | Distinctive display font with a refined body font          |
| Establish clear hierarchy   | Size, weight, and spacing should guide the eye             |
| Use `next/font` for loading | Zero-CLS, self-hosted font loading                         |
| Limit font weights          | Each weight adds to bundle — use 2-3 max                   |

### Font Pairing Examples

| Display          | Body          | Mood                     |
| ---------------- | ------------- | ------------------------ |
| Playfair Display | Source Sans 3 | Editorial, sophisticated |
| JetBrains Mono   | DM Sans       | Technical, modern        |
| Fraunces         | Work Sans     | Warm, approachable       |
| Sora             | Nunito Sans   | Clean, contemporary      |

Never converge on the same font choices across different projects or pages. Each design deserves its own typographic identity.

## Colour and Theme

| Rule                         | Implementation                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------ |
| Commit to a cohesive palette | Use CSS variables via Tailwind design tokens                                   |
| Dominant + accent strategy   | One dominant colour with sharp accents outperforms evenly-distributed palettes |
| Support dark mode            | Use `dark:` variants, test both themes                                         |
| Avoid clichéd schemes        | Purple gradients on white backgrounds are overused                             |
| Ensure contrast compliance   | WCAG AA minimum (see `51-accessibility.md`)                                    |

```css
/* Example: Define a cohesive palette via CSS variables */
:root {
  --color-surface: oklch(0.98 0.01 240);
  --color-primary: oklch(0.45 0.2 260);
  --color-accent: oklch(0.7 0.25 30);
  --color-muted: oklch(0.7 0.02 240);
}
```

## Motion and Micro-interactions

| Priority | Technique                   | Implementation                              |
| -------- | --------------------------- | ------------------------------------------- |
| High     | Page load reveals           | Staggered `animation-delay` on entry        |
| High     | Hover state transitions     | `transition-colors`, `transition-transform` |
| Medium   | Scroll-triggered animations | Intersection Observer or `framer-motion`    |
| Medium   | Loading skeletons           | `animate-pulse` with realistic shapes       |
| Low      | Cursor effects              | Custom cursors, trail effects               |

### Motion Rules

| Rule                                        | Rationale                                         |
| ------------------------------------------- | ------------------------------------------------- |
| Prefer CSS-only for simple animations       | Smaller bundle, better performance                |
| Use `framer-motion` for complex sequences   | Approved in stack (React ecosystem)               |
| One orchestrated moment > scattered effects | A well-timed page load beats random hover effects |
| Respect `prefers-reduced-motion`            | Accessibility requirement                         |
| Keep durations under 300ms for interactions | Longer feels sluggish                             |

```typescript
// Respect reduced motion preference
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

## Spatial Composition

| Technique               | When to use                              |
| ----------------------- | ---------------------------------------- |
| Asymmetric layouts      | Hero sections, landing pages             |
| Generous negative space | Premium feel, readability                |
| Controlled density      | Data-heavy dashboards, admin panels      |
| Grid-breaking elements  | Visual interest, call-to-action emphasis |
| Overlap and layering    | Depth, visual hierarchy                  |

## Backgrounds and Visual Details

Create atmosphere and depth rather than defaulting to solid colours:

| Technique              | Implementation                             |
| ---------------------- | ------------------------------------------ |
| Gradient meshes        | CSS `radial-gradient` layering             |
| Noise/grain textures   | SVG filter or CSS `background-image`       |
| Geometric patterns     | CSS `repeating-linear-gradient`            |
| Layered transparencies | `backdrop-blur`, semi-transparent surfaces |
| Dramatic shadows       | `shadow-2xl` with coloured shadows         |

## Anti-patterns

Never produce generic "AI slop" aesthetics:

| Avoid                                 | Instead                                  |
| ------------------------------------- | ---------------------------------------- |
| Overused fonts (Inter, Roboto, Arial) | Distinctive, context-appropriate choices |
| Purple gradients on white             | Cohesive palette with intentional colour |
| Predictable card grids                | Varied layouts with visual rhythm        |
| Cookie-cutter component patterns      | Context-specific composition             |
| Identical designs across pages        | Each page deserves its own character     |
| Stock illustration style              | Authentic visual language                |

## Integration with Existing Standards

This steering file works alongside:

| File                     | Relationship                                     |
| ------------------------ | ------------------------------------------------ |
| `42-react-components.md` | Component structure and patterns                 |
| `51-accessibility.md`    | WCAG compliance for all design choices           |
| `55-tailwind-shadcn.md`  | Tailwind conventions and shadcn/ui usage         |
| `57-performance.md`      | Bundle budgets, image optimisation, font loading |
