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
import { InputGroup, InputGroupInput } from "@keystoneui/react/input-group";
import { LinkIcon } from "lucide-react";

export default function EmptyWithInput() {
  return (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LinkIcon />
        </EmptyMedia>
        <EmptyTitle>No Links Added</EmptyTitle>
        <EmptyDescription>
          Add your first link to start building your collection.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <InputGroup className="sm:w-3/4">
          <InputGroupInput placeholder="https://example.com" />
        </InputGroup>
        <Button size="sm">Add Link</Button>
      </EmptyContent>
    </Empty>
  );
}
