"use client";

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "keystoneui/progress";

export default function ProgressWithLabel() {
  return (
    <Progress className="max-w-md" value={45}>
      <div className="flex items-center justify-between">
        <ProgressLabel>Uploading files...</ProgressLabel>
        <ProgressValue />
      </div>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
}
