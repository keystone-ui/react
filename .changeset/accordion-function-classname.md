---
"@keystoneui/react": patch
---

Function `className` now works on every Accordion part and on `CollapsibleContent`.

`Accordion`, `AccordionItem`, `AccordionHeader`, `AccordionTrigger`, `AccordionPanel` and `CollapsibleContent` accept `className` as a function of the part's state (`className={(state) => state.open ? "…" : "…"}`), as their types already declared. Before this, the function was silently dropped and none of its classes reached the element. The function is now called with the Base UI state and its result is merged over the part's own classes, exactly as a string `className` is. A string `className` behaves as before.
