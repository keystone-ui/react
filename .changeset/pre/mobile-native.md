---
"@keystoneui/react": patch
---

Mobile-native polish:

- **No focus zoom on touch.** Input, Textarea, InputOTP, InputGroup, DateInput, NativeSelect, CommandInput, Combobox and ComboboxChips render at 16px under a coarse pointer and 14px only under a fine pointer (`pointer-fine:text-sm`). The old `md:text-sm` gate keyed off width, so iPads — wide, but touch — zoomed on every field, and NativeSelect, CommandInput and ComboboxChips were 14px everywhere. Mouse and trackpad users still see 14px; touch devices get 16px at every width. Control heights come from `--ks-control-*` and are unchanged.
- **Modal `scrollBehavior="inside"`** caps the popup at `calc(100dvh - 2rem)` and scrolls it, so long content no longer runs off a phone screen with nothing to scroll.
- **Drawer** top/bottom caps use `80dvh` instead of `80vh`, so the sheet tracks the mobile URL bar instead of hiding under it.
- **Carousel**: the track sets `touch-action: pan-y pinch-zoom` (`pan-x` when vertical), so a vertical swipe across a horizontal carousel scrolls the page. Auto-hidden arrows are always visible on touch and when focused from the keyboard. Dots keep their 8px look with a 24px-tall hit area.
- **Button and Toggle** drop the grey `-webkit-tap-highlight-color` flash; both already have their own `active:` feedback.
- **ResizableHandle** hit area widens from 4px to 12px.
- **CommandInput** defaults `enterKeyHint="search"` (overridable).
- Sign-in and sign-up blocks set `autoComplete` and `enterKeyHint` on their fields.

Drawer, Toast and SelectionBar's `env(safe-area-inset-*)` padding only applies when the page sets `viewport-fit=cover`; the installation guide now says so.
