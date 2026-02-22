"use client";

import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  CircularProgressTrack,
  CircularProgressValue,
} from "@keystoneui/react/circular-progress";

export default function CircularProgressWithLabel() {
  return (
    <div className="flex items-center gap-6">
      <CircularProgress size="lg" value={72}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="flex flex-col items-center">
          <CircularProgressValue />
          <CircularProgressLabel>Done</CircularProgressLabel>
        </div>
      </CircularProgress>
      <CircularProgress color="success" size="lg" value={100}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="flex flex-col items-center">
          <CircularProgressValue />
          <CircularProgressLabel>Complete</CircularProgressLabel>
        </div>
      </CircularProgress>
    </div>
  );
}
