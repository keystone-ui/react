---
"@keystoneui/react": patch
---

Accordion: every part has a `data-slot`

`Accordion`, `AccordionItem`, `AccordionHeader`, `AccordionTrigger` and `AccordionPanel` now render `data-slot="accordion"`, `"accordion-item"`, `"accordion-header"`, `"accordion-trigger"` and `"accordion-panel"`, like every other component's parts. Target them in CSS or tests with `[data-slot="accordion-trigger"]` instead of Base UI's internal attributes. Nothing else about the markup changes.
