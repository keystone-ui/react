---
"@keystoneui/react": patch
---

Long TagGroupItem labels end in an ellipsis

A `TagGroupItem` label too long for its container now ends in an ellipsis, as a `Tag` label does, and the remove button from `onRemove` stays visible inside the pill. Before, the label was cut off with no ellipsis and pushed the remove button out of view. Short labels look the same as before, including a `{" "}` between an icon and the label.

This also fixes `Tag`: an ordinary space on its own between parts, such as `<Icon />{" "}<strong>Label</strong>`, no longer adds a second 4px gap and widens the pill. A non-breaking space is still part of the label.
