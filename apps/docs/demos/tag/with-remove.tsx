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
      <Tag remove={<TagRemove />} value="bold">
        <BoldIcon />
        Bold
      </Tag>
      <Tag remove={<TagRemove />} value="italic">
        <ItalicIcon />
        Italic
      </Tag>
      <Tag defaultPressed remove={<TagRemove />} value="star">
        <StarIcon />
        Star
      </Tag>
    </div>
  );
}
