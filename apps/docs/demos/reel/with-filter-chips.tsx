"use client";

import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";
import { Reel } from "@keystoneui/react/reel";
import { useState } from "react";

const topics = [
  { value: "all", label: "All", count: 42 },
  { value: "typography", label: "Typography", count: 9 },
  { value: "color", label: "Color", count: 7 },
  { value: "motion", label: "Motion", count: 6 },
  { value: "layout", label: "Layout", count: 8 },
  { value: "forms", label: "Forms", count: 5 },
  { value: "icons", label: "Icons", count: 4 },
  { value: "charts", label: "Charts", count: 3 },
];

export default function ReelWithFilterChips() {
  const [topic, setTopic] = useState("all");
  return (
    <div className="w-full max-w-md">
      <Reel>
        <FilterChips
          aria-label="Topic"
          className="mx-auto w-max flex-nowrap"
          onValueChange={setTopic}
          value={topic}
        >
          {topics.map((t) => (
            <FilterChip count={t.count} key={t.value} value={t.value}>
              {t.label}
            </FilterChip>
          ))}
        </FilterChips>
      </Reel>
    </div>
  );
}
