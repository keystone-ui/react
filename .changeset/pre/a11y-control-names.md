---
"@keystoneui/react": minor
---

Combobox and Button: icon-only controls and loading buttons have an accessible name

Four controls had no name for a screen reader, or lost it:

- The chevron button of `ComboboxInput` is named "Options", with its open or closed state in `aria-expanded`. Under a Base UI `Field.Label` or Base UI's `Combobox.Label` it takes that label as its name instead. A Keystone `FieldLabel` names the input only, so beside it the chevron is "Options".
- `ComboboxClear`, including the one `<ComboboxInput showClear>` renders, is named "Clear selection" by visually hidden text inside the button, and no `title` is added. `<label for>`, `title`, `aria-label` or `aria-labelledby` each replace it, on `ComboboxClear` or on the element you pass as `render`, and so does visible text inside the element you pass as `render`. Children given to `ComboboxClear` itself are not rendered; `aria-label={undefined}` and `title={undefined}` keep it. Clear omits its hidden fallback when the title contains non-whitespace text, using the render element's `title` prop if present and Clear's own `title` otherwise.
- A `ComboboxChip`'s remove button is named "Remove" followed by what the chip shows ("Remove Next.js"). Use "Remove" alone when the chip contributes no accessible text. The browser computes the name from the chip itself, so it follows the chip's content when that changes, leaves out text hidden by CSS and icons hidden with `aria-hidden`, and is in server-rendered HTML.
- A `Button` with `isLoading` keeps its label as its name and sets `aria-busy="true"`. The label is now hidden with `opacity-0` instead of `invisible`, so the button's size and the spinner's position are unchanged.

The chip's children and layout are unchanged. `showRemove` adds a root ID if needed. Only the default name adds the word and ID references. Forward the root `id` when referenced. Set `aria-labelledby` on the chip or render element and forward it unchanged, or supply `removeLabel`. With the default name, the remove button gains `aria-labelledby` and, before its icon, a hidden, empty `<span role="img" aria-label="Remove">`.

Each render reads children once. Use a repeatable iterable or array across renders, including development Strict Mode.

Which of your own names win:

- If you label the chip yourself, the remove button follows: with `aria-label` it is "Remove" plus your label; with `aria-labelledby` it is "Remove" plus the elements you reference. Give a chip you name with `aria-label` a role that can be named, such as `role="group"`.
- The new optional `removeLabel` prop replaces a chip's whole default name with a plain `aria-label`. A blank `removeLabel` keeps the default.
- If you replace the clear button's content through `render`: Name icon-only replacements with `aria-label` or `aria-labelledby`. For visible text, replace the rendered button's children. For a title-based name, forward the supplied title unchanged.
- On the default button, `ComboboxClear` keeps your `title` alongside your `aria-label`. A `title` prop on the element passed directly to `render` overrides Clear's `title`, even when that prop is `undefined`. To keep the chosen `title` on the final button, forward it unchanged through every nested `render`.
- On a `ComboboxTrigger` or `Button` you render yourself, your `aria-label` or `aria-labelledby` is kept; `ComboboxTrigger` itself has no default name.
- The chevron and clear button inside `ComboboxInput` take no props, so their defaults cannot be replaced there. To name them yourself, set `showTrigger={false}` and `showClear={false}` and compose your own named `ComboboxTrigger` and `ComboboxClear`.

For tests: a query by role and name finds these buttons, for example a button named "Options", "Clear selection" or "Remove …". The chip's `textContent` is unchanged. Clear's `textContent` includes "Clear selection" while the fallback is present. A loading button's label is now transparent (`opacity: 0`) instead of `visibility: hidden`. With library CSS in Chromium and WebKit, Playwright's `isVisible()` is true for the loading label and jest-dom's `toBeVisible()` is false. Without CSS both are true. In jsdom 30.1.2 jest-dom returns true with or without the compiled CSS. Snapshots of these buttons may gain `aria-label`, `aria-busy` or `aria-labelledby`, the clear button gains a visually hidden span, a chip's remove button gains its hidden word, and the chip root an `id`.
