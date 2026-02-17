"use client";

import { AspectRatio } from "keystoneui/aspect-ratio";

export default function AspectRatioSquare() {
  return (
    <div className="max-w-xs overflow-hidden rounded-lg border">
      <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          1 : 1
        </div>
      </AspectRatio>
    </div>
  );
}
