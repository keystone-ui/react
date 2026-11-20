---
"@keystoneui/react": minor
---

Badge: status tones in solid and soft appearances

Badge has four status tones, `variant="success"`, `variant="warning"`, `variant="info"` and `variant="error"`, and a new `appearance` prop that draws each of them `"solid"` (the default) or `"soft"`, a tinted fill with a border in the tone's colour. The status colours are Tailwind palette steps chosen for Badge, with a pair for light and one for dark; no theme token changes. A status Badge rendered as a link keeps its fill on hover and underlines its text. Other variants ignore `appearance`.

Behavior change for consumers: a Badge with `variant="destructive"` now draws the solid red by default. Use `appearance="soft"` for the tinted look, which now has a border, a slightly deeper red in light mode and a slightly fainter tint in dark mode. Prefer `variant="error"`: `destructive` is deprecated on Badge and will be removed in a later release. The red is now a fixed palette red, like the other three tones, so a Badge no longer follows a customised `--destructive` token; only its focus-ring colour modifiers (`focus-visible:ring-destructive/20`, `dark:focus-visible:ring-destructive/40`) still do. Button's `destructive` variant and the `--destructive` token are unchanged.
