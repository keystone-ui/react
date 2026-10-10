---
"@keystoneui/react": patch
---

Fix `Button` `fullWidth` prop.

The prop was declared on `ButtonProps` and present in the CVA variant map, but was never destructured or passed to `buttonVariants(...)`. As a result `<Button fullWidth>` did not actually apply `w-full` and the boolean leaked onto the underlying DOM element, triggering React's "unknown prop" warning. Now wired through correctly — `<Button fullWidth>` produces a full-width button and no longer warns.
