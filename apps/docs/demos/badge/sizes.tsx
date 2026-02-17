"use client";

import { Badge } from "keystoneui/badge";

export default function BadgeSizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
    </div>
  );
}
