"use client";

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "keystoneui/progress";

const COLORS = [
  { color: "default", label: "Default", value: 70 },
  { color: "success", label: "Success", value: 100 },
  { color: "warning", label: "Warning", value: 45 },
  { color: "destructive", label: "Destructive", value: 25 },
] as const;

export default function ProgressColors() {
  return (
    <div className="grid w-full max-w-md gap-6">
      {COLORS.map((item) => (
        <Progress color={item.color} key={item.color} value={item.value}>
          <div className="flex items-center justify-between">
            <ProgressLabel>{item.label}</ProgressLabel>
            <ProgressValue />
          </div>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      ))}
    </div>
  );
}
