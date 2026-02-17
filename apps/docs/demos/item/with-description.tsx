"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "keystoneui/item";
import { InboxIcon } from "lucide-react";

export default function ItemWithDescription() {
  return (
    <Item className="max-w-md" variant="outline">
      <ItemMedia variant="icon">
        <InboxIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Notification</ItemTitle>
        <ItemDescription>You have a new message in your inbox.</ItemDescription>
      </ItemContent>
    </Item>
  );
}
