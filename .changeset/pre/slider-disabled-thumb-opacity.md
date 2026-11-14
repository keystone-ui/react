---
"@keystoneui/react": patch
---

Disabled Slider thumb no longer dimmed twice

A disabled `Slider` dimmed its thumb to 50% on top of the 50% already applied to `SliderControl`, so the thumb showed at 25% opacity, fainter than the track and range around it. The thumb now inherits the control's dimming only and matches the rest of the disabled slider at 50%. Cursor, track and range are unchanged.
