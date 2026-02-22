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
import { Spinner } from "@keystoneui/react/spinner";

export default function EmptyWithSpinner() {
  return (
    <Empty className="w-full border md:p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Processing your request</EmptyTitle>
        <EmptyDescription>
          Please wait while we process your request. Do not refresh the page.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          Cancel
        </Button>
      </EmptyContent>
    </Empty>
  );
}
