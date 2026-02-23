"use client";

import { Button } from "@keystoneui/react/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@keystoneui/react/empty";
import { BookOpenIcon, FileTextIcon, VideoIcon } from "lucide-react";

export default function EmptyWithList() {
  return (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyTitle>Get Started</EmptyTitle>
        <EmptyDescription>
          Not sure where to begin? Here are some suggestions.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="w-full max-w-xs gap-2">
        <Button className="w-full justify-start" variant="outline">
          <FileTextIcon />
          Read the documentation
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <VideoIcon />
          Watch a tutorial
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <BookOpenIcon />
          Browse examples
        </Button>
      </EmptyContent>
    </Empty>
  );
}
