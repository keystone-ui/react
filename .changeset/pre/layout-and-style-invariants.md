---
"@keystoneui/react": patch
---

Add layout and computed-style invariant tests.

**Overflow invariants (Playwright, `apps/docs`).** Every block preview at 375,
768 and 1280 must not give the document a horizontal scrollbar. Grid and flex
children resolve to `min-content`, so one wide child pushes its track open and
the whole page scrolls sideways — invisible until real data arrives, and the
reason `[&>*]:min-w-0` is a convention rather than a preference. Confirmed to
catch a real regression: removing that class and lengthening one metric value
failed with "overflows the viewport by 45px at 375px wide".

Includes a **positive control**, which is not optional: "nothing overflows"
passes just as well when no content is wide enough to overflow anything, so the
suite would go green the day a table stopped being wide. The control asserts a
wide table really does scroll, inside its own container.

**Computed-style assertions (Storybook `play:`).** `toHaveClass` passes while
the rule it names is being out-specified by another — which is precisely how
`Card`'s `--card-spacing` API first shipped broken. These assert resolved
values instead: the flush card's padding really computes to `0px` at every
size, the two Card variants differ in fill while sharing interior geometry, and
a `down-is-good` metric that fell resolves to the *same* colour as an
`up-is-good` metric that rose.

They live in `apps/storybook` rather than `packages/ui` because that jsdom
setup loads no CSS at all, so a computed-style assertion there silently
measures nothing. Recorded in `component-architecture/SKILL.md`, since it is
not obvious.

Also reconciles the component count, which was hardcoded in ~12 places with
three different values. Only the two that state an exact number are maintained
now; everywhere else says `50+`, and the policy is written down.
