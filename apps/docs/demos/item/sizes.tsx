"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@keystoneui/react/item";
import { InboxIcon } from "lucide-react";

export default function ItemSizes() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Default Size</ItemTitle>
          <ItemDescription>Standard size for most use cases.</ItemDescription>
        </ItemContent>
      </Item>
      <Item size="sm" variant="outline">
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Small Size</ItemTitle>
          <ItemDescription>Compact size for dense layouts.</ItemDescription>
        </ItemContent>
      </Item>
      <Item size="xs" variant="outline">
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Extra Small Size</ItemTitle>
          <ItemDescription>The most compact size available.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}
