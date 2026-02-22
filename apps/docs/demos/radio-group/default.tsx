"use client";

import { Label } from "@keystoneui/react/label";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";

export default function RadioGroupDefault() {
  return (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center gap-3">
        <RadioGroupItem id="r1" value="default" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem id="r2" value="comfortable" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem id="r3" value="compact" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  );
}
