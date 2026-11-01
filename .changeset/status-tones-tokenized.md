---
"@keystoneui/react": minor
---

**Alert, Toast and SelectionBar take their status colour from tokens.** Add the `--info` token.

The three components hard-coded Tailwind's palette with `dark:` overrides — the warning Alert was `yellow`, every other warning in the library was the `--warning` amber, and none of them followed a theme.

- **Behavior change for consumers** of `Alert`: the status variants now tint the surface and colour the icon from `--success`, `--warning`, `--destructive` (for `error`) and the new `--info`. Title and description stay neutral (`text-card-foreground` / `text-muted-foreground`), as Toast's already do — the status tokens are tuned as fills, and `text-warning` on a tint is under 2:1.
- `Toast` icons use the same four tokens.
- `SelectionBar`'s `success` and `destructive` tones mix their token toward `--background`, which lightens them on the dark bar and darkens them on the light one.
- New `--info` / `--info-foreground` tokens (blue). `base.css` registers `--color-info` with a light-mode fallback, so an app whose theme predates the token still gets `bg-info` / `text-info`; add `--info` to `:root` and `.dark` (see the theming docs) to re-step it for dark mode.

`status-tokens.test.ts` now fails on any chromatic palette class in component source outside Badge.
