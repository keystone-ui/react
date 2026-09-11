"use client";

import { CopyButton } from "@keystoneui/react/copy-button";

export default function CopyButtonDefault() {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">u_01</span>
      <CopyButton value="u_01" />
    </div>
  );
}
