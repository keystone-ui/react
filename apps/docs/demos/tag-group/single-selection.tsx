"use client";

import { TagGroup, TagGroupItem } from "@keystoneui/react/tag-group";
import { useState } from "react";

export default function TagGroupSingleSelection() {
  const [selected, setSelected] = useState<string[]>(["react"]);

  return (
    <div className="flex flex-col gap-3">
      <TagGroup onValueChange={setSelected} value={selected}>
        <TagGroupItem value="react">React</TagGroupItem>
        <TagGroupItem value="vue">Vue</TagGroupItem>
        <TagGroupItem value="angular">Angular</TagGroupItem>
        <TagGroupItem value="svelte">Svelte</TagGroupItem>
      </TagGroup>
      <p className="text-muted-foreground text-sm">
        Selected: {selected.length > 0 ? selected.join(", ") : "none"}
      </p>
    </div>
  );
}
