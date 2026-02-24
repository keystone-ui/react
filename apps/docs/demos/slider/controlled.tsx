"use client";

import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@keystoneui/react/slider";
import { useId, useState } from "react";

export default function SliderControlled() {
  const [value, setValue] = useState<number | readonly number[]>(50);
  const id = useId();

  return (
    <div className="w-full max-w-sm space-y-2">
      <Slider aria-labelledby={id} onValueChange={setValue} value={value}>
        <div className="flex justify-between">
          <span className="font-medium text-sm" id={id}>
            Brightness
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
      <p className="text-muted-foreground text-sm">
        Current value: <code>{String(value)}</code>
      </p>
    </div>
  );
}
