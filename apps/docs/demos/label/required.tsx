"use client";

import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";

export default function LabelRequired() {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">
        Password <span className="text-destructive">*</span>
      </Label>
      <Input
        id="password"
        placeholder="Enter your password"
        required
        type="password"
      />
    </div>
  );
}
