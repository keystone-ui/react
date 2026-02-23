"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@keystoneui/react/item";
import { InboxIcon } from "lucide-react";

export default function ItemWithSeparator() {
  return (
    <div className="flex max-w-md flex-col">
      <Item>
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>First Item</ItemTitle>
          <ItemDescription>Description for the first item.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Second Item</ItemTitle>
          <ItemDescription>Description for the second item.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Third Item</ItemTitle>
          <ItemDescription>Description for the third item.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}
