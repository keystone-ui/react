"use client";

import { CircularProgress } from "keystoneui/circular-progress";

const SIZES = ["sm", "default", "lg"] as const;

export default function CircularProgressSizes() {
  return (
    <div className="flex items-center gap-6">
      {SIZES.map((size) => (
        <CircularProgress key={size} size={size} value={65} />
      ))}
    </div>
  );
}
