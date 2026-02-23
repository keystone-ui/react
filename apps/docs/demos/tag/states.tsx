"use client";

import { Tag } from "@keystoneui/react/tag";

export default function TagStates() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag value="unpressed">Unpressed</Tag>
      <Tag defaultPressed value="pressed">
        Pressed
      </Tag>
      <Tag disabled value="disabled">
        Disabled
      </Tag>
      <Tag defaultPressed disabled value="pressed-disabled">
        Pressed & Disabled
      </Tag>
    </div>
  );
}
