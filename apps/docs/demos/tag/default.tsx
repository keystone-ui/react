"use client";

import { Tag } from "@keystoneui/react/tag";

export default function TagDefault() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tag value="bold">Bold</Tag>
      <Tag value="italic">Italic</Tag>
      <Tag defaultPressed value="underline">
        Underline
      </Tag>
    </div>
  );
}
