"use client";

import { Tag, TagRemove } from "keystoneui/tag";
import { BoldIcon, ItalicIcon, StarIcon } from "lucide-react";

export default function TagWithRemove() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag value="bold">
        <BoldIcon />
        Bold
        <TagRemove />
      </Tag>
      <Tag value="italic">
        <ItalicIcon />
        Italic
        <TagRemove />
      </Tag>
      <Tag defaultPressed value="star">
        <StarIcon />
        Star
        <TagRemove />
      </Tag>
    </div>
  );
}
