"use client";

import { Button } from "keystoneui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "keystoneui/empty";
import { FileIcon, PlusIcon } from "lucide-react";

export default function EmptyOutline() {
  return (
    <Empty className="max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileIcon />
        </EmptyMedia>
        <EmptyTitle>No documents</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any documents yet. Get started by creating
          your first one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">
          <PlusIcon />
          Create Document
        </Button>
      </EmptyContent>
    </Empty>
  );
}
