"use client";

import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";
import { Reel } from "@keystoneui/react/reel";
import {
  BookOpen,
  Clapperboard,
  Gamepad2,
  LayoutGrid,
  Music,
  Newspaper,
  Palette,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useState } from "react";

const categories = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "featured", label: "Featured", icon: Sparkles },
  { value: "games", label: "Games", icon: Gamepad2 },
  { value: "music", label: "Music", icon: Music },
  { value: "film", label: "Film & TV", icon: Clapperboard },
  { value: "books", label: "Books", icon: BookOpen },
  { value: "sport", label: "Sport", icon: Trophy },
  { value: "art", label: "Art & Design", icon: Palette },
  { value: "news", label: "News", icon: Newspaper },
];

// FilterChips restyled to the link bar's look through FilterChip's
// className state function: no border or shadow, muted idle text, and the
// quiet secondary fill on the selected chip.
export default function ReelCustomChips() {
  const [category, setCategory] = useState("all");
  return (
    <div className="w-full max-w-md">
      <Reel>
        <FilterChips
          aria-label="Filter by category"
          className="mx-auto w-max flex-nowrap gap-1"
          onValueChange={setCategory}
          size="lg"
          value={category}
        >
          {categories.map((c) => (
            <FilterChip
              className={({ selected }) =>
                selected
                  ? "border-transparent bg-secondary text-secondary-foreground"
                  : "border-transparent bg-transparent text-muted-foreground shadow-none hover:text-foreground dark:bg-transparent"
              }
              key={c.value}
              value={c.value}
            >
              <c.icon aria-hidden="true" />
              {c.label}
            </FilterChip>
          ))}
        </FilterChips>
      </Reel>
    </div>
  );
}
