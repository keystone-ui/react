"use client";

import { CopyButton } from "@keystoneui/react/copy-button";

export default function CopyButtonDefault() {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">usr_3f9a2c81</span>
      <CopyButton value="usr_3f9a2c81" />
    </div>
  );
}
