---
type: llm
---

This is the dual-distribution case: the same components reach a project
either as an npm dependency (subpath imports) or as vendored source (alias
imports). The prompt states the project vendored them.

PASS if every Keystone import comes from the project's own alias
(`@/components/ui/...`).

FAIL if anything is imported from `@keystoneui/react/...`. That package is
not a dependency here, so the import would not resolve.
