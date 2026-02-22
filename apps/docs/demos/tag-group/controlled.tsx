"use client";

import { TagGroup, TagGroupItem } from "@keystoneui/react/tag-group";
import { useState } from "react";

export default function TagGroupControlled() {
  const [value, setValue] = useState<string[]>(["news", "travel"]);

  return (
    <div className="flex flex-col gap-3">
      <TagGroup multiple onValueChange={setValue} value={value}>
        <TagGroupItem value="news">News</TagGroupItem>
        <TagGroupItem value="travel">Travel</TagGroupItem>
        <TagGroupItem value="gaming">Gaming</TagGroupItem>
        <TagGroupItem value="shopping">Shopping</TagGroupItem>
      </TagGroup>
      <p className="text-muted-foreground text-sm">
        Selected: {value.length > 0 ? value.join(", ") : "none"}
      </p>
    </div>
  );
}
