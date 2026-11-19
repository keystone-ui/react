---
"@keystoneui/react": minor
---

Add Countdown and useCountdown, the time left until a deadline

`@keystoneui/react/countdown` shows the time left until `target` (a `Date` or epoch milliseconds) as compact digits (`01:36:53`, or `2d 04:12:33` with days) or as labelled groups (`variant="labelled"`), in three sizes. It rounds up to the smallest unit it displays and works the value out from the clock on every tick, so a late tick, a background tab or a sleeping device may skip values but the next tick shows the right one. With matching props and compatible Intl locale data, the server and the hydrating client render the same `--` placeholders. After hydration, a valid target and a finite clock reading produce the live value. `onComplete` runs once when the current run completes. Changing to another target and back starts a new run. The root defaults to `role="timer"` and the accessible name "Time remaining". Countdown leaves `aria-live` unset. Visually hidden text exposes the remaining time in words using `locale`, which defaults to `en-US`. `animated` renders each value as a RollingNumber that rolls down, so every Countdown build includes RollingNumber's code. `useCountdown` returns the same parts as numbers for a custom layout. Copying the compact form gives its text once; copying the labelled form gives each label and value once, on separate lines (tested in Chromium).
