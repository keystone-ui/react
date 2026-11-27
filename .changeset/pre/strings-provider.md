---
"@keystoneui/react": minor
---

Strings: replace the built-in English with a StringsProvider

`@keystoneui/react/strings` adds `StringsProvider`, which replaces the library's built-in English for everything inside it. Wrap your app once:

```tsx
import { StringsProvider, type StringsOverrides } from "@keystoneui/react/strings";

const strings: StringsOverrides = { modal: { close: "Fermer", footerClose: "Fermer" } };

<StringsProvider strings={strings}>
  <App />
</StringsProvider>
```

With no provider nothing changes: every component renders the same English as before. A part's own prop or children still win over the provider. Nested providers merge, the nearest winning per key; a key left out or set to `undefined` inherits, and `""` is kept. Pass a stable object (a module constant or `useMemo`), since every new `strings` object re-renders the components that read it.

In this release Modal reads it: `modal.close` names ModalContent's corner close button and `modal.footerClose` is the text of ModalFooter's close button. Other components keep their built-in English.

The subpath also exports `useStrings(namespace)`, the frozen English as `defaultStrings` (readable in `"use client"` files only), and the types `KeystoneStrings` and `StringsOverrides`; type your translations as `StringsOverrides`. The registry adds a `strings` item, installed with Modal.
