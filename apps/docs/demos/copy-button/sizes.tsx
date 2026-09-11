"use client";

import { CopyButton } from "@keystoneui/react/copy-button";

export default function CopyButtonSizes() {
  return (
    <div className="flex items-center gap-4">
      <CopyButton size="icon-xs" value="extra small" />
      <CopyButton size="icon-sm" value="small" />
      <CopyButton size="icon" value="default" />
      <CopyButton size="icon-lg" value="large" />
    </div>
  );
}
