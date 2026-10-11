---
"@keystoneui/react": patch
---

`NativeSelect`'s dropdown no longer renders white in dark mode.

The closed control was always correct — it computes the same background and colour as `Input` in both themes. The open list was not. Chromium paints a `<select>` popup from the control's own background, and `--input-bg` is `transparent` in light and a 5% white wash in dark, so there was nothing opaque to paint the list against and Chromium fell back to its default white. In dark mode that put near-white option text on a white popup.

The options now name `--popover` and `--popover-foreground` themselves, which is the same surface `Select`'s listbox uses — so the two selects' dropdowns match. The control keeps `--input-bg`, because matching `Input` is the whole point of it.

Platforms that draw the popup natively rather than from CSS — macOS, iOS, Android — ignore these and follow `color-scheme`, which was already correct there.

Pinned by a Storybook story that asserts the options compute to a *fully opaque* background, not merely a set one: a translucent wash still composites onto whatever the browser paints underneath, which is exactly the bug.
