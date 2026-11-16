"use client";

import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";
import { Tabs, TabsList, TabsTrigger } from "@keystoneui/react/tabs";

export default function FilterChipsUnderTabs() {
  return (
    <Tabs className="w-fit" defaultValue="articles">
      <TabsList>
        <TabsTrigger value="articles">Articles</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
      </TabsList>
      <FilterChips aria-label="Topic" className="mt-3" defaultValue="all">
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
    </Tabs>
  );
}
