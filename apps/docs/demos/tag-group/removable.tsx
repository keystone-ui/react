"use client";

import { TagGroup, TagGroupItem } from "keystoneui/tag-group";
import { useState } from "react";

export default function TagGroupRemovable() {
  const [items, setItems] = useState(["news", "travel", "gaming", "shopping"]);
  const labels: Record<string, string> = {
    news: "News",
    travel: "Travel",
    gaming: "Gaming",
    shopping: "Shopping",
  };

  const handleRemove = (value: string) => {
    setItems((prev) => prev.filter((item) => item !== value));
  };

  return (
    <div className="flex flex-col gap-3">
      <TagGroup defaultValue={["gaming"]} onRemove={handleRemove}>
        {items.map((item) => (
          <TagGroupItem key={item} value={item}>
            {labels[item]}
          </TagGroupItem>
        ))}
      </TagGroup>
      <p className="text-muted-foreground text-sm">
        Click the X to remove tags
      </p>
    </div>
  );
}
