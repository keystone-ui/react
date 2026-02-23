"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@keystoneui/react/item";
import { ShieldAlertIcon } from "lucide-react";

export default function ItemWithIcon() {
  return (
    <Item className="max-w-md" variant="outline">
      <ItemMedia variant="icon">
        <ShieldAlertIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Security Alert</ItemTitle>
        <ItemDescription>
          New login detected from unknown device.
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
