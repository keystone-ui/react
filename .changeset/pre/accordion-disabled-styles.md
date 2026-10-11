---
"@keystoneui/react": patch
---

`AccordionTrigger` now shows a disabled state: `cursor-not-allowed` and `opacity-50`, applied for both the native `disabled` attribute and Base UI's `data-disabled`. Before this, a disabled trigger looked interactive and kept the pointer cursor.
