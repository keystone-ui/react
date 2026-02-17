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

export default function SliderRange() {
  const id = useId();

  return (
    <Slider aria-labelledby={id} defaultValue={[25, 75]}>
      <div className="flex justify-between">
        <span className="font-medium text-sm" id={id}>
          Price range
        </span>
        <SliderValue>
          {(formattedValues) => formattedValues.join(" – ")}
        </SliderValue>
      </div>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb aria-label="Minimum price" index={0} />
          <SliderThumb aria-label="Maximum price" index={1} />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}
