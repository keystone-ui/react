"use client";

import { Label } from "keystoneui/label";
import { RadioGroup, RadioGroupItem } from "keystoneui/radio-group";

export default function RadioGroupHorizontal() {
  return (
    <RadioGroup className="flex gap-6" defaultValue="comfortable">
      <div className="flex items-center gap-2">
        <RadioGroupItem id="h-r1" value="default" />
        <Label htmlFor="h-r1">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="h-r2" value="comfortable" />
        <Label htmlFor="h-r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="h-r3" value="compact" />
        <Label htmlFor="h-r3">Compact</Label>
      </div>
    </RadioGroup>
  );
}
