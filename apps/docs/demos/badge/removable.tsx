"use client";

import { Badge } from "@keystoneui/react/badge";
import { XIcon } from "lucide-react";
import { useState } from "react";

const initialTags = ["React", "TypeScript", "Tailwind", "Next.js"];

export default function BadgeRemovable() {
  const [tags, setTags] = useState(initialTags);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <Badge className="gap-0" key={tag} variant="outline">
          {tag}
          <button
            className="-my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-foreground/60 outline-none transition-[color,box-shadow] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
            type="button"
          >
            <XIcon aria-hidden="true" size={12} />
          </button>
        </Badge>
      ))}
      {tags.length < initialTags.length && (
        <button
          className="text-muted-foreground text-sm hover:text-foreground"
          onClick={() => setTags(initialTags)}
          type="button"
        >
          Reset
        </button>
      )}
    </div>
  );
}
