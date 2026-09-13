---
name: data-table-patterns
description: Conventions for filterable data-table surfaces — filter toolbars, applied state, sorting, pagination footers, and the mobile fold. Apply when building or editing block demos under apps/docs/demos/blocks/.
globs: apps/docs/demos/blocks/**/*
alwaysApply: false
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(pnpm test*), Bash(pnpm dev*)
---

# Data-table patterns — repo-only notes

**The rules themselves live in
[`skills/keystoneui-react/rules/data-tables.md`](../../../skills/keystoneui-react/rules/data-tables.md)
— read that first.** It is the published, consumer-facing copy: filter
toolbars, applied state, sorting, the pagination footer, the mobile fold, and
the Incorrect/Correct pairs for each.

This file used to restate all of it. The two copies shared 87 identical lines
and had to be edited in lockstep by hand, which is exactly the drift the
`contributing` skill exists to prevent — so the rules now have one home and
this file keeps only what is true of *this repository* and would make no sense
in a consumer's project.

## Guards

Make every guard fail before trusting it. An assertion that passes because it
measured nothing is worse than none, and this repo has produced several:

- a `toHaveClass("h-10")` that was vacuously true on a component with the class
  unconditionally;
- a sweep that skipped the rows it existed to check, because `closest()` matches
  the element itself;
- a border assertion that would have defended the emphasis it was meant to
  remove.

So: break the thing, watch the guard fail with the message you expect, restore,
re-run. Note the verification in the commit body.

**Colour and emphasis guards run in dark mode.** That is the half where
specificity collisions live; a light-only check passes throughout.

**Dismiss popups explicitly.** A bare `Escape` pressed while a popup is still
animating open is swallowed, and the next assertion waits out its whole timeout
against a menu that never closed. Assert visible, press Escape, assert gone.
