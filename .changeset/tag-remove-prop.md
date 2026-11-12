---
"@keystoneui/react": minor
---

Tag gains a `remove` prop that puts the X beside the toggle

New: pass the remove button as `remove`, `<Tag remove={<TagRemove onClick={…} />}>React</Tag>`. Tag then renders a pill `<span data-slot="tag">` holding the toggle `<button data-slot="tag-toggle">` and the remove button side by side, so there is no longer a button inside a button (invalid HTML, which React warns about and which can break hydration). It looks the same as before. Clicking the X does not toggle the tag. When the tag is disabled, its X is disabled too.

On a Tag with `remove`, `className`, `style`, `dir` and `hidden` go to the pill, so layout and hiding classes act on the whole pill, X included. `ref`, `aria-*`, other `data-*` attributes and event handlers go to the toggle button. The pill carries `data-pressed` and `data-disabled`: style its states with `data-pressed:` and `data-disabled:`, because `aria-pressed:`, `disabled:` and `focus-visible:` classes do not match a `span`.

Unchanged: a Tag without `remove` renders exactly as before, and `<Tag>React<TagRemove /></Tag>` (the X as a child) still works and still renders the X inside the toggle. Use `remove` in new code.

`TagGroupItem` keeps its API, but with `onRemove` on the `TagGroup` each item now renders as `<span data-slot="tag-group-item">` holding `<button data-slot="tag-toggle">` and `<button data-slot="tag-remove">`. If you select on the old structure, check:

- `[data-slot="tag-group-item"]` is now the pill `span`; the button with `aria-pressed` is its `[data-slot="tag-toggle"]` child, and the label is inside that button.
- `[data-slot="tag-remove"]` is the toggle's next sibling, not its child.
- A `ref` or `data-testid` on the item lands on the toggle button; `className` lands on the pill.
- Arrow keys, Home and End pressed on an X move from its own item, and Shift+Tab goes back to that item, as before. One difference: in a group with `loopFocus={false}`, an arrow on the first or last X that cannot move now leaves focus on that item's toggle rather than on the X.
- Turning `onRemove` on or off at runtime keeps each item's pressed state and focus, but remounts the label's children.
