"use client";

import { Spinner } from "@keystoneui/react/spinner";

export default function SpinnerSizes() {
  return (
    <div className="flex items-center gap-4">
      <Spinner className="size-3" />
      <Spinner />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  );
}
