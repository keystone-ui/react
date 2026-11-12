---
"@keystoneui/react": patch
---

Function `className` now works on every part whose type accepts one.

Base UI lets `className` be a function of the part's state (`className={(state) => state.checked ? "…" : "…"}`), and the prop types of about 85 parts across Button, Checkbox, Switch, RadioGroup, Toggle, ToggleGroup, Tag, TagGroup, Tabs, Slider, Progress, CircularProgress, Avatar, InputOTP, Select, Combobox, DropdownMenu, Popover, Tooltip, Modal, Drawer, AlertDialog, Carousel arrows, CopyButton, InputGroupButton and SelectionBar already declared it. Before this, those parts silently dropped the function. Now Base UI calls it with the part's state, and the result is merged over the part's own classes exactly as a string `className` is. A string `className` behaves as before.

`@keystoneui/react/utils` gains `mergeClassName(base, className)`, the helper these parts use. A registry install receives it inlined into each component file that needs it, so `@/lib/utils` still only has to provide `cn`.
