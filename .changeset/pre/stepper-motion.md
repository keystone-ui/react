---
"@keystoneui/react": minor
---

`Stepper` steps move faster, and `StepperContent` can stop animating its height.

The step transition is a 350ms spring, down from 500ms — the length of an iOS push. A step is a drill-in made several times in a session, in and back out, and half a second each way made every edit through a stepped drawer feel slow.

`StepperContent` takes `animateHeight` (default `true`). Turn it off where the container is a fixed height anyway — a sheet pinned to a set height, say — and the measured height would otherwise be animated, on the main thread, for no visible change.
