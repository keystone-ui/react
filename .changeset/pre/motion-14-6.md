---
"@keystoneui/react": patch
---

Raise the `motion` dependency floor to `^14.6.0`. Since 14.2, Motion runs `x`/`y` animations on the compositor, so Stepper's slide no longer drops frames when the main thread is busy. It also dedupes with the version the docs already used.
