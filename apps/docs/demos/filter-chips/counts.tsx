"use client";

import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";

const compact = new Intl.NumberFormat("en-US", { notation: "compact" });

function formatCount(count: number) {
  return compact.format(count);
}

export default function FilterChipsCounts() {
  return (
    <div className="flex flex-col items-start gap-4">
      <FilterChips aria-label="Topic" defaultValue="all">
        <FilterChip count={6} value="all">
          All
        </FilterChip>
        <FilterChip count={3} value="typography">
          Typography
        </FilterChip>
        <FilterChip count={0} value="motion">
          Motion
        </FilterChip>
        <FilterChip value="saved">Saved</FilterChip>
      </FilterChips>
      <FilterChips
        aria-label="Region"
        defaultValue="all"
        formatCount={formatCount}
      >
        <FilterChip count={12_840} value="all">
          All
        </FilterChip>
        <FilterChip count={1200} value="europe">
          Europe
        </FilterChip>
        <FilterChip count={940} value="asia">
          Asia
        </FilterChip>
      </FilterChips>
    </div>
  );
}
