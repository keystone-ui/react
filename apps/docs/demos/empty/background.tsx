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
import { SearchIcon } from "lucide-react";

export default function EmptyBackground() {
  return (
    <Empty className="max-w-md rounded-xl border bg-muted/50">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t find anything matching your search. Try adjusting
          your filters or search terms.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          Clear Filters
        </Button>
      </EmptyContent>
    </Empty>
  );
}
