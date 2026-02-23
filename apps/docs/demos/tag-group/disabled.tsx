"use client";

import { TagGroup, TagGroupItem } from "@keystoneui/react/tag-group";

export default function TagGroupDisabled() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Disabled Group</p>
        <TagGroup defaultValue={["travel"]} disabled>
          <TagGroupItem value="news">News</TagGroupItem>
          <TagGroupItem value="travel">Travel</TagGroupItem>
          <TagGroupItem value="gaming">Gaming</TagGroupItem>
        </TagGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Individual Disabled Items</p>
        <TagGroup defaultValue={["gaming"]}>
          <TagGroupItem value="news">News</TagGroupItem>
          <TagGroupItem disabled value="travel">
            Travel
          </TagGroupItem>
          <TagGroupItem value="gaming">Gaming</TagGroupItem>
          <TagGroupItem disabled value="shopping">
            Shopping
          </TagGroupItem>
        </TagGroup>
      </div>
    </div>
  );
}
