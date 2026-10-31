---
"@keystoneui/mcp": minor
---

Add `keystoneui theme <code> [--only theme,font]`.

The theme builder now encodes a theme as a short code (`k1_<base>_<L>_<C>_<H>_<radius>_<font>`), and keystoneui.io serves each code as a shadcn `registry:theme` item at `/r/theme/<code>.json`. The verb prints the decoded settings, the `shadcn add` command (optionally partial: only the colours and radius, or only the font), and a link back into the builder. `get_theme_info` documents the same flow for agents.
