"use client";

import { Badge } from "keystoneui/badge";
import {
  BadgeCheckIcon,
  BookmarkIcon,
  CheckIcon,
  InfoIcon,
} from "lucide-react";

export default function BadgeWithIcon() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">
        <BadgeCheckIcon data-icon="inline-start" />
        Verified
      </Badge>
      <Badge variant="outline">
        Bookmark
        <BookmarkIcon data-icon="inline-end" />
      </Badge>
      <Badge variant="outline">
        <CheckIcon aria-hidden="true" className="text-emerald-500" />
        Completed
      </Badge>
      <Badge variant="outline">
        <InfoIcon aria-hidden="true" className="text-blue-500" />
        Information
      </Badge>
    </div>
  );
}
