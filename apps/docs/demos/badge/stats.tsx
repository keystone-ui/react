"use client";

import { Badge } from "@keystoneui/react/badge";
import {
  AlertCircleIcon,
  CalendarIcon,
  CheckIcon,
  UsersIcon,
} from "lucide-react";

export default function BadgeStats() {
  return (
    <div className="flex flex-wrap gap-3">
      <Badge className="border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400">
        <UsersIcon />
        128 users
      </Badge>
      <Badge className="border-transparent bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400">
        <CheckIcon />
        87% complete
      </Badge>
      <Badge className="border-transparent bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
        <CalendarIcon />3 days left
      </Badge>
      <Badge className="border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400">
        <AlertCircleIcon />2 issues
      </Badge>
    </div>
  );
}
