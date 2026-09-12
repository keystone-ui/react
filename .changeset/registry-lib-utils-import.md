---
"@keystoneui/react": patch
---

Fix `combobox`, `command`, `dropdown-menu` and `select` shipping an import that resolves to nothing.

The registry build rewrites `from "./utils"` to `from "@/lib/utils"`, which is shadcn's own file and contains `cn` and nothing else. These four also import `POPUP_ITEM_HEIGHT`, so every registry install of them landed a type error — and, at runtime, `undefined` interpolated into four `className` templates, producing `flex undefined cursor-pointer …`. Fifty registry items pull in at least one of the four, including five blocks.

Shared constants from `utils.ts` are now inlined into the emitted file, read from source so the value cannot drift from the one this repo compiles against. The component keeps importing them normally; only what a consumer receives changes.

`registry-integrity.test.ts` gains the assertion that would have caught it: nothing may import a symbol other than `cn` from `@/lib/utils`. The existing check could not see this — it tests the *specifier*, and by that point the specifier is correct; it was the symbol that was wrong.

The underlying gap is that there is no `registry:lib` item, so shared non-component code has nowhere to be installed. Inlining is the fix that needs no new registry type.
