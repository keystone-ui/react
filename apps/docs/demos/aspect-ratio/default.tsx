"use client";

import { AspectRatio } from "@keystoneui/react/aspect-ratio";

export default function AspectRatioDefault() {
  return (
    <div className="max-w-md overflow-hidden rounded-lg border">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          16 : 9
        </div>
      </AspectRatio>
    </div>
  );
}
