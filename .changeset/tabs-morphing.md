---
"@keystoneui/react": minor
---

`Tabs`: add `morphing` prop on `TabsList` and a new `TabsTriggerLabel` sub-component for Notion-style collapsed-icon tabs.

When `morphing` is set, inactive triggers collapse to icon-only and only the active trigger reveals its `TabsTriggerLabel`. Clicking another tab smoothly morphs the new trigger open while the previously active one collapses back. The existing sliding indicator follows the resize automatically. Works with both `default` and `line` variants and respects `prefers-reduced-motion`.

```tsx
<Tabs defaultValue="meetings">
  <TabsList morphing shape="pill">
    <TabsTrigger value="home">
      <HomeIcon />
      <TabsTriggerLabel>Home</TabsTriggerLabel>
    </TabsTrigger>
    {/* ... */}
  </TabsList>
</Tabs>
```

Outside `morphing` mode, `TabsTriggerLabel` is a no-op wrapper, so existing tab usage is unaffected.
