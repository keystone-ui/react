---
"@keystoneui/react": minor
---

Add `ks-typeset`: one class that styles rendered markdown, CMS HTML and chat replies.

```tsx
<article className="ks-typeset">{content}</article>
```

It ships in `base.css` as a Tailwind `@utility`, so it is emitted only where you use it and takes variants (`md:ks-typeset`). Headings, paragraphs, lists, links, quotes, inline and block code, tables and images all draw from your theme tokens. Three custom properties tune it — `--ks-typeset-size`, `--ks-typeset-leading` and `--ks-typeset-flow` — and everything inside is sized in `em`, so one property rescales the block.

Every rule is wrapped in `:where()`, so a class on an element inside wins, and no rule depends on later siblings, so content streamed in at the end never restyles what is already rendered.
