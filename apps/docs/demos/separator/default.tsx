"use client";

import { Separator } from "keystoneui/separator";

export default function SeparatorDefault() {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-1 font-medium text-sm leading-none">
          Horizontal Separator
        </h4>
        <p className="text-muted-foreground text-sm">
          Content above the separator.
        </p>
        <Separator className="my-4" />
        <p className="text-muted-foreground text-sm">
          Content below the separator.
        </p>
      </div>
      <div>
        <h4 className="mb-3 font-medium text-sm leading-none">
          Vertical Separator
        </h4>
        <div className="flex h-5 items-center space-x-4 text-sm">
          <span>Blog</span>
          <Separator orientation="vertical" />
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Source</span>
        </div>
      </div>
    </div>
  );
}
