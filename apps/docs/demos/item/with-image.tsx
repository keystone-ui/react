"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@keystoneui/react/item";

export default function ItemWithImage() {
  return (
    <Item className="max-w-md" variant="outline">
      <ItemMedia variant="image">
        {/* biome-ignore lint/performance/noImgElement: demo uses plain img for simplicity */}
        <img
          alt="Album cover"
          className="object-cover"
          height={40}
          src="https://picsum.photos/seed/music/80/80"
          width={40}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Midnight City Lights</ItemTitle>
        <ItemDescription>Neon Dreams — Electric Nights</ItemDescription>
      </ItemContent>
    </Item>
  );
}
