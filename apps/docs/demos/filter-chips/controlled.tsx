"use client";

import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";
import { useState } from "react";

const articles = [
  { title: "Choosing a type scale", topic: "typography" },
  { title: "Line height for long text", topic: "typography" },
  { title: "Tinted neutrals", topic: "color" },
  { title: "Contrast on coloured surfaces", topic: "color" },
  { title: "Picking a typeface pair", topic: "typography" },
];

const topics = [
  { value: "all", label: "All" },
  { value: "typography", label: "Typography" },
  { value: "color", label: "Color" },
  { value: "motion", label: "Motion" },
];

function countFor(value: string) {
  return value === "all"
    ? articles.length
    : articles.filter((article) => article.topic === value).length;
}

export default function FilterChipsControlled() {
  const [topic, setTopic] = useState<string | null>("all");
  const shown = articles.filter(
    (article) => topic === "all" || article.topic === topic
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <FilterChips aria-label="Topic" onValueChange={setTopic} value={topic}>
        {topics.map((t) => (
          <FilterChip count={countFor(t.value)} key={t.value} value={t.value}>
            {t.label}
          </FilterChip>
        ))}
      </FilterChips>
      <ul className="flex flex-col gap-1 text-sm">
        {shown.map((article) => (
          <li key={article.title}>{article.title}</li>
        ))}
      </ul>
    </div>
  );
}
