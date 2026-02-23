"use client";

import { CircularProgress } from "@keystoneui/react/circular-progress";

export default function CircularProgressColors() {
  return (
    <div className="flex items-center gap-6">
      <CircularProgress color="default" value={60} />
      <CircularProgress color="success" value={80} />
      <CircularProgress color="warning" value={45} />
      <CircularProgress color="destructive" value={25} />
    </div>
  );
}
