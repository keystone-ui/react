"use client";

import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "keystoneui/slider";

export default function SliderDisabled() {
  return (
    <Slider defaultValue={40} disabled>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb aria-label="Disabled slider" />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}
