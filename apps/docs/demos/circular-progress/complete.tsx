"use client";

import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  CircularProgressTrack,
  CircularProgressValue,
} from "@keystoneui/react/circular-progress";

export default function CircularProgressComplete() {
  return (
    <CircularProgress color="success" size="lg" value={100}>
      <CircularProgressTrack />
      <CircularProgressIndicator />
      <div className="flex flex-col items-center">
        <CircularProgressValue />
        <CircularProgressLabel>Done</CircularProgressLabel>
      </div>
    </CircularProgress>
  );
}
