"use client";

import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@keystoneui/react/slider";
import { useId } from "react";

export default function SliderCustomStep() {
  const id = useId();

  return (
    <div className="w-full max-w-sm">
      <Slider aria-labelledby={id} defaultValue={50} step={10}>
        <div className="flex justify-between">
          <span className="font-medium text-sm" id={id}>
            Quality
          </span>
          <SliderValue>
            {(formattedValues) => `${formattedValues[0]}%`}
          </SliderValue>
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </div>
  );
}
