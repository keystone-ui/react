---
type: llm
---

PASS if the component uses the full Card composition -- CardHeader with
CardTitle, and CardContent -- rather than dumping every element into
CardContent or a bare Card.

PASS if a footer action uses CardFooter or sits inside CardContent
deliberately.

FAIL if it renders a plain `<div>` styled to look like a card, or uses raw
Tailwind colors such as `bg-white`, `text-gray-600` or `bg-blue-500`
instead of semantic tokens.
