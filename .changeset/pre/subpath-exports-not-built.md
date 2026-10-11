---
"@keystoneui/react": patch
---

Fix `stat`, `table-pagination` and `copy-button` shipping subpaths that resolve to nothing.

All three were declared in `exports` but missing from `tsup.config.ts`, so
`dist/` never contained them. `@keystoneui/react/stat` and its two siblings
failed to resolve for every npm consumer since the components landed.

Nothing in this repo could see it. `exports` points at `./src/*.tsx` so the
monorepo resolves components from source, and only `publishConfig.exports`
swaps each subpath to `./dist/*.js` at publish time — so the docs app, Storybook
and every test exercised a path the published package does not have. The three
were added by hand rather than through `pnpm add:component`, which wires
exports, tsup and `_registry.ts` together and would have caught it.

`exports.test.ts` closes the gap in both directions: every built subpath
`publishConfig` declares must have a tsup entry, every `exports` key must be
published, every raw asset published from source (`./base.css`) must sit inside
a `files` root, and no tsup entry may be orphaned. Each of the four was
confirmed to fail on a deliberate break before being trusted.
