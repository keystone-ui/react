"use client";

import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "keystoneui/slider";
import { useId } from "react";

export default function SliderWithLabel() {
  const id = useId();

  return (
    <Slider aria-labelledby={id} defaultValue={48}>
      <div className="flex justify-between">
        <span className="font-medium text-sm" id={id}>
          Volume
        </span>
        <SliderValue />
      </div>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}
