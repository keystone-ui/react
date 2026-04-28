---
"@keystoneui/react": minor
---

Add `secondary` variant to `Toggle` and `ToggleGroup`.

Filled `bg-secondary` background when unpressed, inverts to `bg-foreground` / `text-background` when pressed. Useful for segmented-control patterns where unpressed items should still read as part of a control rather than empty space — without depending on consumer overrides for selection contrast. Existing `default` and `outline` variants are unchanged.

```tsx
<ToggleGroup variant="secondary" defaultValue={["medium"]}>
  <ToggleGroupItem value="low">Low</ToggleGroupItem>
  <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
  <ToggleGroupItem value="high">High</ToggleGroupItem>
</ToggleGroup>
```

Works in both joined (`spacing=0`, default) and spaced (`spacing>0`) modes. Consumer `aria-pressed:bg-*` overrides on individual items still win via tailwind-merge — useful for semantic colouring (status, risk).
