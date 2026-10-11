---
"@keystoneui/react": minor
"@keystoneui/mcp": patch
---

Upgrade dependencies to latest stable + modernize React 19 patterns.

**Public API change (minor):** primitives no longer use `React.forwardRef` —
`ref` is now a regular prop in keeping with React 19. Consumers that read
the component prop type via `React.ComponentProps<typeof Foo>` will see
`ref` as a regular prop (typed as `React.RefAttributes<T>`). Most callers
need no change.

**Headline upstream bumps:**
- `@base-ui/react` 1.2 → 1.4 (Drawer is stable; new optional Label/InputGroup
  parts on Combobox/Select/Slider/Autocomplete; many bug fixes)
- `lucide-react` 0.575 → 1.11 (`*Icon` suffix dropped from default exports;
  imports rewritten as aliases throughout the codebase; brand icons removed,
  `Github` replaced with `Code` in the docs home)
- `shadcn` CLI 3 → 4, `vite` 7 → 8, `typescript` 5.9 → 6, `next` 16.1 → 16.2,
  `motion` 12.34 → 12.38, `react-day-picker` 9.13 → 9.14,
  `react-resizable-panels` 4.6 → 4.10, `react-aria-components` 1.15 → 1.17,
  `chromatic` 15 → 16, `vitest` 4.0 → 4.1, `storybook` 10.2 → 10.3,
  `jsdom` 28 → 29, `zod` 3 → 4 (mcp), Tailwind 4.2.0 → 4.2.4, biome 2.4.4 →
  2.4.13, ultracite 7.2 → 7.6.

**Tooling note:** TS 6 deprecates `baseUrl`. The shared `typescript-config`
sets `ignoreDeprecations: "6.0"` to silence the warning while keeping
`apps/docs`'s path-alias setup working. Revisit when TS 7 lands.
