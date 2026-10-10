---
"@keystoneui/react": patch
---

Document that `Tooltip` is a visual enhancement only, and ship the accessible
info-tip pattern.

Base UI's tooltip wires no `aria-describedby` and no `role` — the only `aria-*`
attribute anywhere in its tooltip implementation is `aria-hidden` on the arrow —
and its trigger is mouse-only. A `Tooltip` is therefore announced to no screen
reader and opens on no touch device. It *is* keyboard-reachable, which is what
makes the gap easy to miss.

No API change: adding `role="tooltip"` was considered and rejected, because on
its own it is inert. Announcement needs `aria-describedby`, so the role alone
would have improved automated audit scores while leaving every tooltip just as
silent.

Instead the docs now say plainly that information must never live only in a
tooltip, and carry the pattern for when a tooltip is the only place some text
appears: the text in an always-present `sr-only` span wired via
`aria-describedby` (pointing at the popup dangles — it is unmounted while
closed), `aria-hidden` on the popup so it is not read twice, and a controlled
click toggle with `closeOnClick={false}` so it works on touch.
