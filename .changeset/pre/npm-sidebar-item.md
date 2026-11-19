---
"@keystoneui/react": patch
---

Add a package flavour of the sidebar

For apps that use the `@keystoneui/react` package instead of vendored components: `npx shadcn@latest add https://keystoneui.io/r/npm/sidebar.json` installs the same `sidebar.tsx`, importing `@keystoneui/react/*`, and is tested with 1.0.0-beta.11. It installs `@base-ui/react` unpinned, so keep yours at the version `@keystoneui/react` pins.
