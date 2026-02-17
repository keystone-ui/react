"use client";

import { Button } from "keystoneui/button";
import { ButtonGroup } from "keystoneui/button-group";
import { Input } from "keystoneui/input";
import { SearchIcon } from "lucide-react";

export default function ButtonGroupWithInput() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button aria-label="Search" variant="outline">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  );
}
