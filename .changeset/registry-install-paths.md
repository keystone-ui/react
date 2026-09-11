---
"@keystoneui/react": patch
---

Fix `shadcn add` writing components that cannot resolve their own imports.

Three defects in the built registry, all confirmed against shadcn 4.21 with a real install rather than by reading the CLI:

**`./utils` shipped verbatim in 55 items.** `shadcn build` embeds each source file as-is, so every component carried `import { cn } from "./utils"` — correct inside this repo, wrong once installed, because the component lands at `components/ui/<name>.tsx` while `cn` lives at `lib/utils.ts`. shadcn leaves the specifier alone since it does not start with `@/`, so it resolved to a sibling no item creates. The built output now rewrites it to `@/lib/utils`, which the CLI resolves through the consumer's `aliases.utils`.

**No `registry:ui` file declared a `target`.** shadcn derived the destination from the source path and wrote `components/ui/src/<name>.tsx` — a doubled segment, outside where anything imports from. Every file now targets `components/ui/<name>.tsx` explicitly.

**`date-input` and `input-group` imported siblings they did not declare.** `registryDependencies` are hand-maintained, so `input-group` was missing `input` and `textarea`, and `date-input` was missing `input-group` — those files were never installed. They are now derived from the source's relative imports, so the omission cannot recur.

No source or API change; components installed before this shipped need reinstalling, or the two imports fixing by hand.
