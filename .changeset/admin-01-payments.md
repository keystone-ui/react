---
"@keystoneui/react": patch
---

`admin-01` gains a Payments section, and the filter pattern for a table too wide to filter from a rail.

Eleven filters is more than a toolbar row holds, so the three highest-frequency ones — type, status, sort — stay inline and the rest move into a right-hand `Drawer`. A persistent sidebar was the other candidate and does not fit: the eight-column table needs roughly 1050px against a 1024px content area at a 1280px viewport, so a 300px rail would cost a third of the width the columns already need. A panel costs nothing until it is opened.

What makes the panel acceptable is that nothing it holds is invisible. Every applied filter renders as a `TagGroupItem` chip below the toolbar, each removing only itself, so "why am I looking at four rows?" is answerable with the panel shut. The `Filters` badge counts only the filters the panel owns — counting one that already has its own visible control would read as a second, contradictory signal.

One `Drawer swipeDirection="right"` serves both breakpoints rather than a media query picking between two components: the primitive is already responsive, taking three-quarters of the width on a phone and settling into a floating panel at `md`. Below `sm` the three inline dropdowns fold away and the panel carries everything, the same fork the users toolbar uses.

Payment ids are middle-truncated with a `CopyButton` beside them — the head and tail are what you eyeball against another system, and the full value is one click away.

Block-only change; no library API is affected.
