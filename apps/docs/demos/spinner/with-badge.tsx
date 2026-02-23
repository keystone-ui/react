"use client";

import { Badge } from "@keystoneui/react/badge";
import { Spinner } from "@keystoneui/react/spinner";

export default function SpinnerWithBadge() {
  return (
    <div className="flex items-center gap-4">
      <Badge>
        <Spinner data-icon="inline-start" />
        Syncing
      </Badge>
      <Badge className="border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400">
        <Spinner data-icon="inline-start" />
        Uploading
      </Badge>
      <Badge className="border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400">
        <Spinner data-icon="inline-start" />
        Processing
      </Badge>
    </div>
  );
}
