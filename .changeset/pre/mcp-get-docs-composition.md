---
"@keystoneui/mcp": patch
---

`get_docs` now tells agents to read a component's `## Composition` tree before composing it. The tree is the parts hierarchy, and its "Invalid nesting" notes list the placements Base UI throws on, such as `DropdownMenuLabel` outside `DropdownMenuGroup`.
