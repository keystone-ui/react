---
"@keystoneui/react": minor
---

Upgrade `react-day-picker` 9.14 → 10.0.

**Public API change (minor):** `Calendar` forwards its props straight to `DayPicker`, so the props, slots, and aliases that v10 removes are gone from `Calendar` as well. They are now type errors, and at runtime they do nothing without warning:

| Removed | Use instead |
| --- | --- |
| `fromDate` / `fromMonth` / `fromYear` | `startMonth` (and `disabled={{ before }}` for dates) |
| `toDate` / `toMonth` / `toYear` | `endMonth` (and `disabled={{ after }}` for dates) |
| `initialFocus` | `autoFocus` |
| `onDayKeyUp`, `onDayKeyPress`, `onDayPointerEnter/Leave`, `onDayTouch*`, `onWeekNumberClick` | handle events in a custom `DayButton` / `WeekNumber` |
| `formatters.formatMonthCaption` / `formatYearCaption`, `labels.labelDay` / `labelCaption` | `formatCaption` / `formatYearDropdown`, `labelDayButton` / `labelGrid` |
| `components.Button` | `components.NextMonthButton` / `PreviousMonthButton` |
| `classNames.table` (and other deprecated `UI` keys) | `classNames.month_grid` |

Other notes:

- Persian, Hijri, and other non-Gregorian calendars moved to separate `@daypicker/*` packages, and the `react-day-picker/persian` and similar subpaths are gone.
- `date-fns` 4 and `@date-fns/tz` stay regular dependencies; no peer changes.
- The calendar looks the same as before.
