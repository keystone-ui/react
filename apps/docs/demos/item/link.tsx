"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@keystoneui/react/item";
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";

export default function ItemLink() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <Item
        render={
          <a href="/docs">
            <ItemContent>
              <ItemTitle>Visit our documentation</ItemTitle>
              <ItemDescription>
                Learn how to get started with our components.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4" />
            </ItemActions>
          </a>
        }
      />
      <Item
        render={
          <a
            href="https://keystoneui.io"
            rel="noopener noreferrer"
            target="_blank"
          >
            <ItemContent>
              <ItemTitle>External resource</ItemTitle>
              <ItemDescription>
                Opens in a new tab with security attributes.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ExternalLinkIcon className="size-4" />
            </ItemActions>
          </a>
        }
        variant="outline"
      />
    </div>
  );
}
