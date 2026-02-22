"use client";

import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";

export default function LabelDefault() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="Enter your email" type="email" />
    </div>
  );
}
