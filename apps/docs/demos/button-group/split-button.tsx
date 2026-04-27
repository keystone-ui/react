"use client";

import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import {
  ChevronDown as ChevronDownIcon,
  GitMerge as GitMergeIcon,
} from "lucide-react";

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
