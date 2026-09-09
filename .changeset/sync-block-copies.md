---
"@keystoneui/react": patch
---

Generate each block's installable registry copy from its docs demo, rather than
maintaining both by hand.

Every block existed twice — the docs demo importing `@keystoneui/react/*`, and
the `registry/default/blocks/**` copy importing `@/components/ui/*` — differing
only by mechanical import rewrites, with nothing in the repo noticing when an
edit landed in only one of them. `pnpm sync:blocks` now applies the rewrites and
formats the result, and `pnpm lint:docs` runs it in `--check` mode so drift
fails the build. Regenerating `tickets-01` reproduced all fourteen committed
files byte for byte, which is the evidence the rules are right.

`pnpm lint:docs` also now runs in CI. It previously ran in no workflow and no
git hook, so every rule it enforces — the block MDX structure, story-vs-demo
parity, and now block-copy sync — was advisory.
