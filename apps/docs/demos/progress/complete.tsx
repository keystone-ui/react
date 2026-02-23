"use client";

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@keystoneui/react/progress";

export default function ProgressComplete() {
  return (
    <div className="w-full max-w-sm">
      <Progress color="success" value={100}>
        <div className="flex justify-between">
          <ProgressLabel>Upload complete</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
