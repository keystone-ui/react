"use client";

import { Tag, TagRemove } from "@keystoneui/react/tag";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Star as StarIcon,
} from "lucide-react";

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
