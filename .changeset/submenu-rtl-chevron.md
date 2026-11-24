---
"@keystoneui/react": patch
---

Point the dropdown submenu chevron left with a right-to-left `DirectionProvider`

Inside a right-to-left Base UI `DirectionProvider`, the `DropdownMenuSubTrigger` chevron used to point right and now points left. With `<html dir="rtl">` and no provider, it points right. Wrap your right-to-left menu in `<DirectionProvider direction="rtl">` to use the left-pointing chevron.

When a right-to-left row has space left over beside its label, the chevron can now move to the row's inline end (on the left).
