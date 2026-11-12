---
"@keystoneui/react": minor
---

Tag gains a `remove` prop that puts the X beside the toggle

New: pass the remove button as `remove`, `<Tag remove={<TagRemove onClick={…} />}>React</Tag>`. Tag then renders a pill `<span data-slot="tag">` holding the toggle `<button data-slot="tag-toggle">` and the remove button side by side, so there is no longer a button inside a button (invalid HTML, which React warns about and which can break hydration). It looks the same as before. Clicking the X does not toggle the tag. When the tag is disabled, its X is disabled too.

On a Tag with `remove`, `className`, `style`, `dir` and `hidden` go to the pill, so layout and hiding classes act on the whole pill, X included. `ref`, `aria-*`, other `data-*` attributes and event handlers go to the toggle button. The pill carries `data-pressed` and `data-disabled`: style its states with `data-pressed:` and `data-disabled:`, because `aria-pressed:`, `disabled:` and `focus-visible:` classes do not match a `span`.

`remove` is typed `Exclude<ReactNode, true>`. `null`, `undefined`, `false` and `""` render a plain Tag, so `remove={canRemove && <TagRemove />}` works; a bare `<Tag remove>` is a type error (and a plain Tag at runtime). Any other value renders the pill, even one that renders nothing. A wrapper that forwards the prop should type it `TagProps["remove"]`, since a `ReactNode` may be `true`. Pass one remove control per Tag: two `TagRemove`s overlap.

What a removable Tag costs compared with the child form:

- `justify-*`, `gap-*` and `cursor-*` classes act on the pill, not on the label row inside the toggle. In a stretched pill the label stays centred; `[&>[data-slot=tag-toggle]]:justify-start` puts it at the start (the X stays at the end).
- `ref` lands on the toggle and `style` on the pill, so a library that measures the ref and moves the styled element (drag and drop, an anchored popup) sees two different elements.
- A custom control that is not a `TagRemove` is not disabled with the Tag: it stays tabbable and clickable.
- A `Tag remove` placed directly in a plain Base UI `ToggleGroup` gets none of the X's key handling: an arrow pressed on the X moves from the group's current item rather than from the X's own Tag, Home and End do nothing, and Shift+Tab goes to the previous tab stop rather than to the X's own toggle. Inside a group, use `TagGroup` with `onRemove`.

Unchanged: a Tag without `remove` renders exactly as before, and `<Tag>React<TagRemove /></Tag>` (the X as a child) still works and still renders the X inside the toggle. Use `remove` in new code.

`TagGroupItem` keeps its API, but with `onRemove` on the `TagGroup` each item now renders as `<span data-slot="tag-group-item">` holding `<button data-slot="tag-toggle">` and `<button data-slot="tag-remove">`. If you select on the old structure, check:

- `[data-slot="tag-group-item"]` is now the pill `span`; the button with `aria-pressed` is its `[data-slot="tag-toggle"]` child, and the label is inside that button.
- `[data-slot="tag-remove"]` is the toggle's next sibling, not its child.
- A `ref` or `data-testid` on the item lands on the toggle button; `className` lands on the pill, so `justify-*`, `gap-*` and `cursor-*` no longer reach the label row (see above).
- The toggle's accessible name is now its label alone ("Alpha", not "Alpha Remove"); the X is a separate button named "Remove". A test that finds the toggle by its old name needs the new one.
- Arrow keys, Home and End pressed on an X move from its own item with the group's orientation, and Shift+Tab goes back to that item, as before. Inside a Base UI `Toolbar` the Toolbar's orientation rules and Home and End do nothing, as before. One difference: in a group with `loopFocus={false}`, an arrow on the first or last X that cannot move now leaves focus on that item's toggle rather than on the X.
- A custom remove control inside a `TagGroup` still uses the child form (`<TagGroupItem>Alpha<TagRemove>…</TagRemove></TagGroupItem>`), which nests a button in a button as before.
- Turning `onRemove` on or off at runtime keeps each item's pressed state and focus, but remounts the label's children.
