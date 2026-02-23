"use client";

import { Separator } from "@keystoneui/react/separator";

export default function SeparatorWithContent() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs uppercase">or</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-sm">
          Continue with email
        </span>
        <Separator className="flex-1" />
      </div>
    </div>
  );
}
