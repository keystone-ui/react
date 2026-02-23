"use client";

import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";

export default function ToggleGroupTextLabels() {
  return (
    <ToggleGroup defaultValue={["day"]} size="sm" variant="outline">
      <ToggleGroupItem value="day">Day</ToggleGroupItem>
      <ToggleGroupItem value="week">Week</ToggleGroupItem>
      <ToggleGroupItem value="month">Month</ToggleGroupItem>
      <ToggleGroupItem value="year">Year</ToggleGroupItem>
    </ToggleGroup>
  );
}
