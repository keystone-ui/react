---
name: registry-mode-imports
max_turns: 8
allowed_tools: [Read, Skill, Bash]
---

My project vendors Keystone UI through the shadcn registry -- there's a
`components.json` with `aliases.ui` set to `@/components/ui`, and
`@keystoneui/react` is NOT in my package.json. Write a small toolbar with a
search input and a filter dropdown.
