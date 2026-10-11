---
"@keystoneui/react": patch
---

Fix `combobox`, `command`, `dropdown-menu` and `select` shipping an import that resolves to nothing.

The registry build rewrites `from "./utils"` to `from "@/lib/utils"`, which is shadcn's own file and contains `cn` and nothing else. These four also import `POPUP_ITEM_HEIGHT`, so every registry install of them landed a type error — and, at runtime, `undefined` interpolated into four `className` templates, producing `flex undefined cursor-pointer …`. Fifty registry items pull in at least one of the four, including five blocks.

Shared constants from `utils.ts` are now inlined into the emitted file, read from source so the value cannot drift from the one this repo compiles against. The component keeps importing them normally; only what a consumer receives changes.

`registry-integrity.test.ts` gains the assertion that would have caught it: nothing may import a symbol other than `cn` from `@/lib/utils`. The existing check could not see this — it tests the *specifier*, and by that point the specifier is correct; it was the symbol that was wrong.

Inlining rather than shipping a `registry:lib` item is deliberate. The type exists in shadcn's schema, but the file it would land in is `@/lib/utils` — shadcn's own, which `shadcn add` writes on init and then refuses to overwrite. A keystone item declaring it would either lose the race silently or clobber a file another registry owns, and a consumer mixing both registries gets whichever ran first. Inlining has no such ordering.
