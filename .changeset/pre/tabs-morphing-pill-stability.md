---
"@keystoneui/react": patch
---

`Tabs` (morphing): stabilize the pill animation in vertically-centered containers and soften the morph spring.

When a morphing `Tabs` was rendered inside a parent that vertically centered it (e.g. `flex items-center` in a fixed-height container), Base UI's one-frame dual-mount of `TabsContent` panels — kept around so consumers can drive an exit transition — temporarily inflated the Tabs root height. That shifted the active position Framer Motion's `layoutId` FLIP captured for the pill, producing a U-shaped path on every tab change (the pill dropped toward the content area then sprang back). Hiding the leaving (`inert`) panel via a `:has()`-scoped CSS rule keeps the dual-mount frame from growing the root, eliminating the drop. Scoped to morphing tabs only — non-morphing tabs continue to use Base UI's CSS-variable indicator and are unaffected.

Also retuned `MORPH_SPRING` to `{ duration: 0.4, bounce: 0.15 }` so the mid-morph FLIP scale spreads across more frames, making the horizontal stretch read softer.
