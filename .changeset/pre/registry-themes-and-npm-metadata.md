---
"@keystoneui/react": patch
---

Publish the style and theme registry items, and fill in the npm metadata.

`npx shadcn add https://keystoneui.io/r/default.json` and
`https://keystoneui.io/r/themes/<name>.json` now resolve. The seven theme
definitions in `packages/ui/registry/` were never wired into the registry
build, so every documented theme-install URL 404'd. They are also included in
the published tarball now (`files` gained `registry`), and `--ring` in the
default and zinc themes was aligned to the canonical token set so installing
the style and then re-applying the default theme no longer changes the design.

The package also declares `repository`, `homepage`, `bugs` and
`engines` (`node >=22`) for the first time.
