---
"@keystoneui/react": minor
---

Scope the `dark` variant to screens, and ship ink tokens for paper.

Printing a page in dark mode renders every filled surface as a solid black
rectangle — summary tiles, badges, chart bands — because the tokens on paper are
still the dark ones. The usual fix is a list of print overrides, one per token,
which can be forgotten by whoever adds the next token, and forgotten *silently*:
nobody prints a dark page to check. So the variant itself is now screen-scoped
and the `.dark` token block is wrapped in the same `@media screen`. Paper cannot
receive the dark values at all.

The style item also gains a small `@media print` block shifting the light tokens
toward ink — pure black on white rather than the near-blacks a screen wants, and
a `--muted-foreground` dark enough to survive a laser printer.

**If you installed the style item before this, update your CSS by hand:**
replace `@custom-variant dark (&:is(.dark *));` with the nested form and wrap
your `.dark { … }` body in `@media screen { … }`. The Dark Mode guide has both,
along with a `data-slot` recipe for hiding chrome on paper.

No print rules ship in `base.css`. Hiding chrome is policy about your layout,
and `!important` in library CSS cannot be undone by a consumer's class — a
blanket `display: none` on dialogs would break "print the contents of this
dialog" with no way out. Every part carries a stable `data-slot`, so the guide
gives the recipe instead.

Note the style item keeps the **flat** `@custom-variant dark` form. The nested
version does round-trip `shadcn build` intact, but whether it renders as valid
CSS in a consumer's file could not be verified without a live install, and a
malformed `@custom-variant dark` would break dark mode outright — so the
upgrade is documented rather than pushed.
