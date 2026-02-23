"use client";

import { Skeleton } from "@keystoneui/react/skeleton";

export default function SkeletonNoAnimation() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton
        animationType="none"
        className="size-10 shrink-0 rounded-full"
      />
      <div className="grid gap-2">
        <Skeleton animationType="none" className="h-4 w-[150px]" />
        <Skeleton animationType="none" className="h-4 w-[100px]" />
      </div>
    </div>
  );
}
