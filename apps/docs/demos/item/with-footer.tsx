"use client";

import { Button } from "@keystoneui/react/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@keystoneui/react/item";
import { CalendarIcon, PackageIcon, TagIcon } from "lucide-react";

export default function ItemWithFooter() {
  return (
    <Item className="max-w-lg" variant="outline">
      <ItemMedia variant="icon">
        <PackageIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>v2.4.0 Released</ItemTitle>
        <ItemDescription>
          New features include dark mode support, improved accessibility, and
          performance optimizations.
        </ItemDescription>
        <ItemFooter>
          <CalendarIcon />
          <span>Released Feb 8, 2026</span>
          <span className="text-border">|</span>
          <TagIcon />
          <span>stable</span>
        </ItemFooter>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          View
        </Button>
      </ItemActions>
    </Item>
  );
}
