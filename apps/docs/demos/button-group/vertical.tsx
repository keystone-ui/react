"use client";

import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import { MinusIcon, PlusIcon } from "lucide-react";

export default function ButtonGroupVertical() {
  return (
    <div className="flex items-start gap-8">
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>
      <ButtonGroup
        aria-label="Quantity controls"
        className="h-fit"
        orientation="vertical"
      >
        <Button size="icon" variant="outline">
          <PlusIcon />
        </Button>
        <Button size="icon" variant="outline">
          <MinusIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
}
