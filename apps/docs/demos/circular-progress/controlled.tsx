"use client";

import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressTrack,
  CircularProgressValue,
} from "@keystoneui/react/circular-progress";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@keystoneui/react/slider";
import { useState } from "react";

export default function CircularProgressControlled() {
  const [value, setValue] = useState<number | readonly number[]>(50);
  const numericValue = Array.isArray(value) ? value[0] : value;

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <CircularProgress color="success" size="lg" value={numericValue}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <CircularProgressValue />
      </CircularProgress>
      <Slider className="w-full" onValueChange={setValue} value={value}>
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
