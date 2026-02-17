"use client";

import { Item, ItemContent, ItemTitle } from "keystoneui/item";

export default function ItemDefault() {
  return (
    <Item className="max-w-md" variant="outline">
      <ItemContent>
        <ItemTitle>Basic Item</ItemTitle>
      </ItemContent>
    </Item>
  );
}
