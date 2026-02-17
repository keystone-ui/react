"use client";

import { Tag } from "keystoneui/tag";
import { BellIcon, BookmarkIcon, HeartIcon, StarIcon } from "lucide-react";

export default function TagWithIcon() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag value="star">
        <StarIcon />
        Star
      </Tag>
      <Tag value="bookmark">
        <BookmarkIcon />
        Bookmark
      </Tag>
      <Tag defaultPressed value="heart">
        <HeartIcon />
        Favorite
      </Tag>
      <Tag value="bell">
        <BellIcon />
        Notify
      </Tag>
    </div>
  );
}
