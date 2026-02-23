"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressTrack,
} from "@keystoneui/react/circular-progress";

export default function CircularProgressWithAvatar() {
  return (
    <div className="flex items-center gap-6">
      <CircularProgress className="size-11" color="success" value={75}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <Avatar className="relative">
          <AvatarImage
            alt="User"
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </CircularProgress>
      <CircularProgress color="warning" value={60}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <Avatar className="relative" size="lg">
          <AvatarImage
            alt="User"
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face"
          />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
      </CircularProgress>
    </div>
  );
}
