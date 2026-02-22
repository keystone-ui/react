"use client";

import { Button } from "@keystoneui/react/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@keystoneui/react/empty";
import { InboxIcon } from "lucide-react";

export default function EmptyDefault() {
  return (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>No messages</EmptyTitle>
        <EmptyDescription>
          Your inbox is empty. New messages will appear here when you receive
          them.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          Refresh
        </Button>
      </EmptyContent>
    </Empty>
  );
}
