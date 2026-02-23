"use client";

import { AspectRatio } from "@keystoneui/react/aspect-ratio";

export default function AspectRatioPortrait() {
  return (
    <div className="max-w-40 overflow-hidden rounded-lg border">
      <AspectRatio ratio={3 / 4}>
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          3 : 4
        </div>
      </AspectRatio>
    </div>
  );
}
