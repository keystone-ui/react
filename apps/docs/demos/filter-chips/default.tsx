"use client";

import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";

export default function FilterChipsDefault() {
  return (
    <FilterChips aria-label="Topic" defaultValue="all">
      <FilterChip count={6} value="all">
        All
      </FilterChip>
      <FilterChip count={3} value="typography">
        Typography
      </FilterChip>
      <FilterChip count={2} value="color">
        Color
      </FilterChip>
      <FilterChip count={0} value="motion">
        Motion
      </FilterChip>
    </FilterChips>
  );
}
