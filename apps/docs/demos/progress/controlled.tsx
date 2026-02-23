"use client";

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@keystoneui/react/progress";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@keystoneui/react/slider";
import { useState } from "react";

export default function ProgressControlled() {
  const [value, setValue] = useState<number | number[]>(50);
  const numericValue = Array.isArray(value) ? value[0] : value;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress value={numericValue}>
        <div className="flex justify-between">
          <ProgressLabel>Progress</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
      <Slider onValueChange={setValue} value={value}>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb aria-label="Progress value" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </div>
  );
}
