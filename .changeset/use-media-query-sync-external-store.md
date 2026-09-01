---
"@keystoneui/react": patch
---

Fix `useMediaQuery` painting the wrong branch for a frame.

The hook was `useState(false)` + `useEffect`, so it always returned `false` on the first render and corrected itself in an effect — which runs *after paint*. Anything branching on a `min-width` query therefore rendered its small-viewport layout for a frame on desktop before swapping: the `Drawer` + `Modal` responsive-dialog pattern would mount the Drawer, then replace it with the Modal.

It is now backed by `useSyncExternalStore`, so the value is already correct on the first client render, and it is tear-free under concurrent rendering. Same signature, no API change.

Two follow-on effects worth noting:

- `useMediaQuery` no longer throws where `matchMedia` is absent — it returns `false` instead. The old implementation called bare `matchMedia(query)` inside its effect and crashed in environments without it.
- Server renders still report `false`, since the true value cannot be known without a viewport. React reads `getServerSnapshot` during hydration and reconciles afterwards, so there is no hydration mismatch warning. A layout that must be correct in the first server-rendered paint still belongs in CSS.

Adds the hook's first test file, covering first-render correctness, `change` subscription and updates, cleanup on unmount, re-subscription when the query changes, and the missing-`matchMedia` fallback.
