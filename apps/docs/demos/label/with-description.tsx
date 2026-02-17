"use client";

import { Input } from "keystoneui/input";
import { Description, Label } from "keystoneui/label";

export default function LabelWithDescription() {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor="username">Username</Label>
        <Description>This will be displayed on your profile.</Description>
      </div>
      <Input id="username" placeholder="Enter a username" />
    </div>
  );
}
