"use client";

import { Badge } from "@keystoneui/react/badge";

export default function BadgeCustomColors() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
        Blue
      </Badge>
      <Badge className="border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
        Green
      </Badge>
      <Badge className="border-transparent bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
        Purple
      </Badge>
      <Badge className="border-transparent bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
        Amber
      </Badge>
      <Badge className="border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
        Red
      </Badge>
    </div>
  );
}
