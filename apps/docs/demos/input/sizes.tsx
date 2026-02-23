"use client";

import { Input } from "@keystoneui/react/input";

export default function InputSizes() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Input placeholder="Default size (40px)" size="default" />
      <Input placeholder="Small size (32px)" size="sm" />
    </div>
  );
}
