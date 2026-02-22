"use client";

import { Button } from "@keystoneui/react/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@keystoneui/react/item";
import { ShieldAlertIcon } from "lucide-react";

export default function ItemWithActions() {
  return (
    <Item className="max-w-lg" variant="outline">
      <ItemMedia variant="icon">
        <ShieldAlertIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Security Alert</ItemTitle>
        <ItemDescription>
          New login detected from unknown device.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          Review
        </Button>
      </ItemActions>
    </Item>
  );
}
