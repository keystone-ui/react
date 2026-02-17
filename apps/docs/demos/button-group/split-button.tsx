"use client";

import { Button } from "keystoneui/button";
import { ButtonGroup } from "keystoneui/button-group";
import { ChevronDownIcon, GitMergeIcon } from "lucide-react";

export default function ButtonGroupSplitButton() {
  return (
    <ButtonGroup>
      <Button>
        <GitMergeIcon /> Merge pull request
      </Button>
      <Button aria-label="Merge options" size="icon">
        <ChevronDownIcon />
      </Button>
    </ButtonGroup>
  );
}
