<!-- lint-skill: allow-repo-paths — this file documents authoring the Keystone
     registry itself, so monorepo paths are its subject rather than an
     instruction a consumer is expected to follow. -->

# Registry Authoring

Keystone UI publishes a shadcn-compatible registry at `https://keystoneui.io/r/`.
This file covers what is **specific to Keystone's registry** — the general
`registry.json` schema is shadcn's and documented at
`https://ui.shadcn.com/docs/registry`.

Read this when extending the Keystone registry, forking it, or standing up your
own registry that depends on Keystone items.

## Contents

- Consuming the registry: URLs and the namespace shorthand
- Item types Keystone publishes
- The explicit `target` rule
- `registry:style` vs `registry:theme`
- Block categories
- Kit and package-flavour metadata (`meta.keystoneui`)
- Registry dependencies across registries

---

## Consuming the registry

Every item is addressable by URL:

```bash
npx shadcn@latest add https://keystoneui.io/r/button.json
npx shadcn@latest add https://keystoneui.io/r/signin-01.json
npx shadcn@latest add https://keystoneui.io/r/themes/slate.json
```

Configure the namespace once in `components.json` to shorten that:

```json
{
  "registries": {
    "@keystone": "https://keystoneui.io/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @keystone/button
npx shadcn@latest add @keystone/default        # the style item: all tokens
npx shadcn@latest add @keystone/themes/slate   # one theme's colors only
```

Slashful names are item names, not file paths — `themes/slate` is a single item
called `themes/slate`.

---

## Item types Keystone publishes

| Type | What it is |
|---|---|
| `registry:ui` | A component. Installs one `.tsx` into `components/ui/`. |
| `registry:block` | A page or feature composition. Installs a `page.tsx` plus its own `components/`. |
| `registry:example` | A named demo variant (`table-with-pagination`, `card-with-image`). Read these for usage patterns; installing one is rarely what you want. |
| `registry:style` | `default` — the full token set, including the theme-independent tokens. |
| `registry:theme` | `themes/{default,zinc,slate,stone,gray,neutral}` — structural grays only. |

Examples vastly outnumber the rest. That is deliberate: they are what
`get_examples` serves, and they are how an agent sees a real composition rather
than guessing from prop types.

---

## The explicit `target` rule

**Every `registry:ui` file carries an explicit `target`.** This is load-bearing,
not decoration:

```json
{
  "path": "packages/ui/src/button.tsx",
  "target": "components/ui/button.tsx",
  "type": "registry:ui"
}
```

Without `target`, shadcn derives the destination from the *source* path and
writes `components/ui/src/button.tsx` — a doubled segment that lands the file
somewhere nothing imports from. The install succeeds and the build then fails
on an unresolved import, which is a considerably worse failure than a rejected
install.

If you author an item whose source path does not already end in the shape you
want on disk, set `target`.

---

## `registry:style` vs `registry:theme`

The two are not interchangeable, and which one a token belongs to is a
**decision, not a side effect**.

- A **theme** is what varies between `zinc` and `slate`: the structural grays.
  All six theme items must declare every one of these.
- The **style** item carries tokens that are theme-independent — they have the
  same value whichever theme is active. `--success`, `--warning`, the
  `--chart-*` ramp and the `--sidebar-*` aliases live here, exactly as
  `--destructive` does.

`apps/docs/tests/registry-themes.test.ts` classifies every token as one or the
other and **fails when a new token belongs to neither**. That failure is the
point: adding a token to the canonical CSS without classifying it would
otherwise either silently obligate twelve hand edits (six themes × two modes)
or silently escape all coverage.

So when you add a token: classify it first, then add it.

---

## Block categories

Blocks and kits carry `categories`; components and examples do not. They
drive `list_components({ type: "block", category })` (or `type: "kit"`) and
`keystoneui blocks --category`, which lists blocks only. The taxonomy in use:

| Category | Blocks | Kits |
|---|---|---|
| `authentication` | 9 — every `signin-*` and `signup-*` | |
| `login` | 4 | |
| `signup` | 5 | |
| `navigation` | 3 | `sidebar`, `npm/sidebar` |
| `admin` | 4 | |
| `settings` | 1 | |
| `dashboard` | 1 | |
| `data` | 3 | `filter-pills`, `npm/filter-pills` |
| `betting` | 5 | |

A block usually carries two: a broad one and a specific one (`authentication` +
`login`). Add to this taxonomy rather than inventing a synonym — a category with
one member that duplicates an existing one makes search worse, not better.

---

## Kit and package-flavour metadata (`meta.keystoneui`)

Kit and flavour metadata comes from `meta.keystoneui`. Each key is checked
independently. A malformed value is ignored and the other valid keys still
apply. A name prefix or description supplies no metadata.

| Key | Accepted shape | Read as |
|---|---|---|
| `docs` | a string matching `^/docs/[a-z0-9/-]+(#[a-z0-9-]+)?$` (a lower-case site path, optional section anchor) | the page section that documents the item |
| `flavourOf` | a non-empty string, not the item's own name | the item this one is the package flavour of |
| `minPackageVersion` | a non-empty string | the lowest `@keystoneui/react` version the flavour supports (printed, never compared) |
| `partOf` | a non-empty array of non-empty strings | the blocks a kit was taken from |

- When two items name the same `flavourOf`, the first in index order is the
  package flavour.
- Relations go one hop: a flavour of a flavour is not followed.
- Docs lookup tries the item's own page first. Only on a 404 does it use
  the item's `docs`, or else its `flavourOf` parent's `docs`, or else the
  parent's own page by type (`block` → `blocks/`, `ui` → `components/`).

---

## Registry dependencies across registries

`registryDependencies` entries are item *addresses*, and a bare name means the
**official shadcn registry**, never a same-registry sibling:

```json
{
  "registryDependencies": ["button", "@keystone/card", "owner/repo/item"]
}
```

- `"button"` → shadcn's `button`, not Keystone's.
- `"@keystone/card"` → Keystone's `card`, via the configured namespace.
- Relative addresses (`"./card"`) are not supported.

Keystone's own items therefore name every Keystone dependency by full URL
(`"https://keystoneui.io/r/button.json"`) — `scripts/sync-registry.mjs`
qualifies them, and `registry-integrity.test.ts` fails on a bare one. Their
`files[].target` is `@ui/<name>.tsx`, shadcn's placeholder for your
`aliases.ui`, which needs **shadcn CLI 4.7 or later**.

This matters more for Keystone than for most registries, because **both
registries install to the same path** (`components/ui/`). A block that means to
pull Keystone's `button` but says `"button"` will quietly fetch shadcn's and
overwrite the file — and shadcn's Button sits on a different control-height
tier, so the result is a visibly mismatched toolbar rather than an error. See
the interop guide at `https://keystoneui.io/docs/interop`.
