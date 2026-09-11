"use client";

import { CopyButton } from "@keystoneui/react/copy-button";

export default function CopyButtonVariants() {
  return (
    <div className="flex items-center gap-4">
      <CopyButton value="ghost" variant="ghost" />
      <CopyButton value="outline" variant="outline" />
      <CopyButton value="secondary" variant="secondary" />
    </div>
  );
}
