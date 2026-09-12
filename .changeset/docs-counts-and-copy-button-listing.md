---
"@keystoneui/react": patch
---

Correct three stale figures in the agent-facing docs.

`copy-button` was missing from the skill's component list entirely, so a consumer or agent reading it could not discover a component this library ships. The count beside that list said 56 and there are 57. And the RTL guide's ratio said "30 of its 56 components" against "12 logical" utilities; recounted from source it is 30 of 57, against 21 — the contributing guide says to recompute that ratio rather than increment it, which is why both halves moved.

Also drops a redundant `className="h-8"` in `tickets-01`, on an `Input` that already passed `size="sm"` — the same 32px, written twice.
