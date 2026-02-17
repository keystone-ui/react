"use client";

import { Avatar, AvatarFallback, AvatarImage } from "keystoneui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "keystoneui/item";

export default function ItemWithAvatar() {
  return (
    <Item className="max-w-md" variant="outline">
      <ItemMedia>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?u=alice" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Alice</ItemTitle>
        <ItemDescription>Last seen 5 minutes ago</ItemDescription>
      </ItemContent>
    </Item>
  );
}
