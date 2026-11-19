---
"@keystoneui/react": major
---

Scrollable Tabs scroll in a Reel

`<TabsList scrollable>` keeps its look (a bare chevron at each edge with more tabs, and an edge fade) and is now built on [Reel](/docs/components/reel). For users of `scrollable`:

- The scroll arrows are no longer buttons. They are not Tab stops, so the tab order loses up to two stops: none when the tabs fit, one at either end, two in between. They are not in the accessibility tree, and a press does not take focus. Tab enters the list at its one roving tab stop, and the arrow keys, Home and End move between tabs as before.
- A press on an arrow scrolls 80% of the visible width instead of 150px. Under `prefers-reduced-motion` it jumps instead of gliding.
- Arrows still show on every device, phones included. Each arrow shows when more than 1px remains in its direction. Previously the left arrow appeared at any positive scroll offset in left-to-right layouts.
- The chevron no longer draws over a tab. While an arrow shows, the first five spacing units (1.25rem with the default spacing scale) of the row on that side are hidden, track included. At the default 16px root and spacing scale this leaves 20px of clear surface, including at the end before any scrolling. The fade beyond that strip is 2rem deep where scroll-driven animations are supported. Browsers without scroll-driven animations also hide the row beneath each visible chevron and draw a fixed gradient after the strip. Previously they showed the tab at full opacity beneath the chevron. The arrow and its hidden strip appear and disappear together, at once.
- Hovering or pressing an arrow turns the chevron to the foreground colour. At the default 16px root and spacing scale, the press target is 24px wide (previously 22px) and spans the list's height.
- The active tab is brought into view when the list appears and when another tab becomes active, if the list has room and the tab has width at that moment. A later resize does not bring it into view again. The first reveal, and a reveal when the list regains room after being hidden, jump; later ones glide, or jump under reduced motion. A tab that is already clear issues no scroll, so a glide in flight continues. A change of the active tab from code scrolls the list to it as well, replacing a scroll in progress, including the user's swipe. A tab focused from the keyboard is moved clear the same way, instantly. At those defaults the reveal aims for 52px of clearance, as far as the scroll range allows. A tab wider than the space aligns at its start. None of this moves focus or scrolls the page.
- In `morphing` mode, Reel uses the trigger's width at the time of the reveal. If its label grows afterwards, part of the label can remain under the fade or outside the viewport. This is most likely on a tab near the end of the row.
- The scroller contains horizontal overscroll (`overscroll-behavior-x: contain`), so a sideways swipe at either end no longer scrolls or navigates the page.
- In right-to-left, a scrollable list's fade, arrows and paging mirror, as described for Reel. Put the explicit `dir` on an ancestor of the whole list (the `Tabs` root works); `dir` on `TabsList` alone is below the arrows. The arrows' sides and the paging follow the computed direction, and the fade and the chevrons follow the nearest explicit `dir`. Base UI's `DirectionProvider` still sets the arrow keys' direction. The rest of Tabs' right-to-left support is unchanged.
- Arrow availability now also updates when tabs are added, removed or relabelled without the list changing size.
- At root font sizes below 16px the list keeps at least 4px of padding so focus outlines are not clipped; at a 10px root it is 3px taller.
- Combining `scrollable` with vertical Tabs still scrolls horizontally.
- To choose when the arrows show or how they look, leave `scrollable` off and wrap the `TabsList` in your own `Reel`. Reel finds the active tab by its `aria-selected`.
- Change the fade's depth with `--ks-reel-fade-size` on `Tabs` or any ancestor, for example `className="[--ks-reel-fade-size:1rem]"`.
- Every import of `@keystoneui/react/tabs` now loads Reel and Button, a few kB, whether or not `scrollable` is set. From the registry, `tabs` now installs `reel` and `button` with it.
- **Breaking for anyone who styles or tests the scrollable list:**
  - `data-slot="tabs-list-wrapper"`, `"tabs-list-scroll"` and `"tabs-scroll-button"` are removed. Use `reel`, `reel-viewport` and `reel-arrow`. `reel-arrow` is the chevron's picture, a `span`. The element that takes the press is its parent, `[data-slot="reel"] > span[data-side]`.
  - Both arrows are always in the DOM, hidden with `visibility`, and come after the scroller. Selectors relying on the old buttons, their labels, their order or their focus no longer match.
  - The accessible names "Scroll tabs left" and "Scroll tabs right" are gone, so `getByRole("button", { name: "Scroll tabs right" })` no longer finds anything.
  - `[data-scrollable]` moves from the scroller to `[data-slot="tabs-list"]`.
  - The registered lengths `--tabs-fade-left` and `--tabs-fade-right` and the `tabs-scroll-fade` keyframes are removed. `--ks-reel-fade-size` sets one depth for both edges; it does not replace two independently animated lengths.

Tabs now stores a function-valued selection or `defaultValue` without invoking the function. Previously, initializing or updating Tabs' internal state could call it. In uncontrolled morphing lists this could put the pill and expanded label on the tab matching the return value, or leave them without a matching tab. Morphing lists also keep the pill and label on the previous selection when a user activation is canceled and clear them for a controlled null selection.
