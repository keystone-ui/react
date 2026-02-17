"use client";

import { Button } from "keystoneui/button";
import { ButtonGroup } from "keystoneui/button-group";
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
