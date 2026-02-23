"use client";

import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import { ArchiveIcon, ArrowLeftIcon, FlagIcon } from "lucide-react";

export default function ButtonGroupNested() {
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button aria-label="Go back" size="icon" variant="outline">
          <ArrowLeftIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">
          <ArchiveIcon />
          Archive
        </Button>
        <Button variant="outline">
          <FlagIcon />
          Report
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
