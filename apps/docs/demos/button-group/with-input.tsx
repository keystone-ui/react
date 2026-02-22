"use client";

import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import { Input } from "@keystoneui/react/input";
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
