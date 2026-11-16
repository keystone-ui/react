---
"@keystoneui/react": patch
---

Joined ToggleGroup items no longer shrink while pressed

Joined items (`spacing` 0, the default) no longer shrink while held and gain press feedback using their variant's hover tokens; spaced groups and a single `Toggle` keep their press scale. Your `hover:` fill can give way while held, and `dark:hover:` does so in dark `outline` (including on items); `dark:hover:` in `default` and `secondary` retains its previous precedence, other on-item appearance is unchanged, and press fills can be customized with `active:` or with `dark:active:` to override dark rules.
