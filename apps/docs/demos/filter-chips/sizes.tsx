"use client";

import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";

const topics = [
  { value: "all", label: "All", count: 6 },
  { value: "typography", label: "Typography", count: 3 },
  { value: "color", label: "Color", count: 2 },
];

export default function FilterChipsSizes() {
  return (
    <div className="flex flex-col items-start gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <FilterChips
          aria-label={`Topic, ${size}`}
          defaultValue="all"
          key={size}
          size={size}
        >
          {topics.map((topic) => (
            <FilterChip
              count={topic.count}
              key={topic.value}
              value={topic.value}
            >
              {topic.label}
            </FilterChip>
          ))}
        </FilterChips>
      ))}
    </div>
  );
}
