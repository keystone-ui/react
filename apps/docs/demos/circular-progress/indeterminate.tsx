"use client";

import { CircularProgress } from "@keystoneui/react/circular-progress";

export default function CircularProgressIndeterminate() {
  return (
    <div className="flex items-center gap-6">
      <CircularProgress size="sm" value={null} />
      <CircularProgress value={null} />
      <CircularProgress size="lg" value={null} />
    </div>
  );
}
