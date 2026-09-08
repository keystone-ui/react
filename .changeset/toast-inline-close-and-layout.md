---
"@keystoneui/react": minor
---

`Toast`: move the close button into the content row and fix the phantom height.

The close button carried both `absolute` and `relative` in one `cn()` call.
Those are the same tailwind-merge conflict group, so the later `relative` won
and silently stripped `absolute top-0 right-0` — dropping the button into
normal flow below the content, where it rendered at the bottom-left corner.
Base UI measures the root's natural height to publish `--toast-height`, so
that stray button was also baked into the card as ~20px of empty space beneath
the text.

The close button is now an inline flex child at the end of the row, always
visible, and sized to line up with the action button. A title-only toast goes
from 74px to 54px, and title + description from 82px to 66px.

Alongside it:

- Row children are vertically centred. The text block previously stretched to
  the row height (set by the close button) and left the title hanging at its
  top edge — 12px above it, 21px below.
- The leading semantic icon is centred rather than pinned to the first line.
- The description is `text-sm` (14px), matching every other description in the
  library; it was the lone `text-xs`.
- Semantic types colour only their icon. The title and description stay
  neutral, so the icon carries the signal instead of the type tinting the text.
- Dropped the `max-sm:` wrap, so the text column and the button column hold at
  every width: the message wraps short of the buttons instead of one of them
  dropping to a second row.

Docs fix: the `toast()` reference listed `duration` as defaulting to `4000`
(it is `5000`) and documented a `richColors` prop on `Toaster` that has never
existed — semantic colours are always applied.
