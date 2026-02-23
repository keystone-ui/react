"use client";

import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressTrack,
} from "@keystoneui/react/circular-progress";
import { FlameIcon, TrendingUpIcon, ZapIcon } from "lucide-react";

export default function CircularProgressCustomCenterContent() {
  return (
    <div className="flex items-center gap-6">
      <CircularProgress color="success" size="lg" value={85}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="relative flex flex-col items-center">
          <TrendingUpIcon className="size-6 text-foreground" />
          <span className="text-muted-foreground text-xs">Growth</span>
        </div>
      </CircularProgress>
      <CircularProgress color="destructive" size="lg" value={92}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="relative flex flex-col items-center">
          <FlameIcon className="size-6 text-foreground" />
          <span className="text-muted-foreground text-xs">CPU</span>
        </div>
      </CircularProgress>
      <CircularProgress color="warning" size="lg" value={60}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="relative flex flex-col items-center">
          <ZapIcon className="size-6 text-foreground" />
          <span className="text-muted-foreground text-xs">Energy</span>
        </div>
      </CircularProgress>
    </div>
  );
}
