"use client";

import { Tag } from "@keystoneui/react/tag";

export default function TagDisabled() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag disabled value="disabled">
        Disabled
      </Tag>
      <Tag defaultPressed disabled value="pressed-disabled">
        Pressed & Disabled
      </Tag>
    </div>
  );
}
