"use client";

import { TagGroup, TagGroupItem } from "keystoneui/tag-group";
import {
  GamepadIcon,
  GlobeIcon,
  NewspaperIcon,
  ShoppingCartIcon,
} from "lucide-react";

export default function TagGroupWithIcons() {
  return (
    <TagGroup defaultValue={["shopping"]}>
      <TagGroupItem value="news">
        <NewspaperIcon />
        News
      </TagGroupItem>
      <TagGroupItem value="travel">
        <GlobeIcon />
        Travel
      </TagGroupItem>
      <TagGroupItem value="gaming">
        <GamepadIcon />
        Gaming
      </TagGroupItem>
      <TagGroupItem value="shopping">
        <ShoppingCartIcon />
        Shopping
      </TagGroupItem>
    </TagGroup>
  );
}
