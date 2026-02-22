"use client";

import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import { CopyIcon, EllipsisIcon, ShareIcon } from "lucide-react";

export default function ButtonGroupSizes() {
  return (
    <div className="flex flex-col items-start gap-6">
      <ButtonGroup>
        <Button size="sm" variant="outline">
          <CopyIcon /> Copy
        </Button>
        <Button size="sm" variant="outline">
          <ShareIcon /> Share
        </Button>
        <Button aria-label="More" size="icon-sm" variant="outline">
          <EllipsisIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">
          <CopyIcon /> Copy
        </Button>
        <Button variant="outline">
          <ShareIcon /> Share
        </Button>
        <Button aria-label="More" size="icon" variant="outline">
          <EllipsisIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button size="lg" variant="outline">
          <CopyIcon /> Copy
        </Button>
        <Button size="lg" variant="outline">
          <ShareIcon /> Share
        </Button>
        <Button aria-label="More" size="icon-lg" variant="outline">
          <EllipsisIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
}
