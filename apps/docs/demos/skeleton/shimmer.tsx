"use client";

import { Skeleton, SkeletonGroup } from "keystoneui/skeleton";

export default function SkeletonShimmer() {
  return (
    <SkeletonGroup className="w-full max-w-sm rounded-xl border p-4">
      <div className="flex items-center gap-4">
        <Skeleton animationType="none" className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton animationType="none" className="h-4 w-3/4" />
          <Skeleton animationType="none" className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton animationType="none" className="h-4 w-full" />
        <Skeleton animationType="none" className="h-4 w-5/6" />
        <Skeleton animationType="none" className="h-4 w-2/3" />
      </div>
    </SkeletonGroup>
  );
}
