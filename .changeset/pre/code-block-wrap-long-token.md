---
"@keystoneui/react": patch
---

CodeBlock `wrap` wraps unbreakable tokens

With `wrap`, a line with no break opportunity (a URL, a hash, a base64 string) now wraps instead of scrolling sideways. With `lineNumbers` as well, a wrapped line starts beside its number and its later rows indent past the gutter. Blocks without `wrap` are unchanged.
