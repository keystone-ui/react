---
"@keystoneui/react": minor
---

Add the `density/compact` registry item: the control ladder one step denser (xs 24 · sm 28 · default 32 · lg 40) for dense app screens.

```bash
npx shadcn@latest add https://keystoneui.io/r/density/compact.json
```

It sets the four `--ks-control-*` variables and nothing else — colours, radius and spacing are untouched — so it composes with any theme. To make only one area denser, set the variables on a container instead.
