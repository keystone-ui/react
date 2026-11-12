---
"@keystoneui/react": patch
---

Function `className` now works on 91 more parts whose type accepts one.

Base UI lets `className` be a function of the part's state (`className={(state) => state.checked ? "…" : "…"}`). The prop types of 91 parts already declared it, across Button, Checkbox, Switch, RadioGroup, Toggle, ToggleGroup, Tag, TagGroup, Tabs, Slider, Progress, CircularProgress, Avatar, InputOTP, Select, Combobox, DropdownMenu, Popover, Tooltip, Modal, Drawer, AlertDialog, Carousel arrows, CopyButton, CodeBlock's copy button, InputGroupButton and SelectionBar. Before this, those parts silently dropped the function. Now Base UI calls it with the part's state, and the result is merged over the part's own classes exactly as a string `className` is. A string `className` behaves as before.

`ComboboxInput` is the one exception. It applies `className` to its `InputGroup` wrapper, which is a plain element, so a function there is still dropped. Pass it a string.

`@keystoneui/react/utils` gains `mergeClassName(base, className)`, the helper these parts use. A registry install receives it inlined into each component file that needs it, so `@/lib/utils` still only has to provide `cn`.
