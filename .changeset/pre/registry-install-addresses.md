---
"@keystoneui/react": patch
---

**Registry installs get Keystone's components, in the directory you configured.**

- **Fix:** every Keystone item named its Keystone dependencies by bare name (`"button"`, `"input-group"`), and a bare name is an address in *shadcn's* registry. Installing `combobox` by URL therefore wrote shadcn's Radix Button, Input, InputGroup and Textarea beside Keystone's combobox, and they have a different API. Dependencies are now full URLs (`https://keystoneui.io/r/button.json`).
- **Fix:** `admin-01` depended on shadcn's `sidebar` item, and that item's dependencies replaced Keystone's Button, Input, Separator, Skeleton and Tooltip with shadcn's. The block now ships its sidebar, adapted onto Keystone primitives, as `components/sidebar.tsx`.
- **Fix:** `profile-dropdown-01` imported `circular-progress` without declaring it, so its install did not typecheck.
- `registry:ui` files target `@ui/<name>.tsx`, which follows your `aliases.ui` instead of always writing `components/ui/`. This requires shadcn CLI 4.7 or later.

`pnpm smoke:install` (now in CI) installs every ui item, and each block on its own, into fresh Vite, Next.js and custom-alias projects with the real shadcn CLI, then typechecks the result.
