"use client";

import { TagGroup, TagGroupItem } from "@keystoneui/react/tag-group";

export default function TagGroupDefault() {
  return (
    <TagGroup defaultValue={["fitness", "parking"]} multiple>
      <TagGroupItem value="laundry">Laundry</TagGroupItem>
      <TagGroupItem value="fitness">Fitness center</TagGroupItem>
      <TagGroupItem value="parking">Parking</TagGroupItem>
      <TagGroupItem value="pool">Swimming pool</TagGroupItem>
      <TagGroupItem value="breakfast">Breakfast</TagGroupItem>
    </TagGroup>
  );
}
