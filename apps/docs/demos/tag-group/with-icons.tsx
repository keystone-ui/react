"use client";

import { TagGroup, TagGroupItem } from "@keystoneui/react/tag-group";
import {
  Gamepad as GamepadIcon,
  Globe as GlobeIcon,
  Newspaper as NewspaperIcon,
  ShoppingCart as ShoppingCartIcon,
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
