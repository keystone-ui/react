"use client";

import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import { LayoutGridIcon, ListIcon } from "lucide-react";

export default function ButtonGroupDefault() {
  return (
    <ButtonGroup>
      <Button variant="outline">
        <ListIcon /> List
      </Button>
      <Button variant="outline">
        <LayoutGridIcon /> Grid
      </Button>
    </ButtonGroup>
  );
}
