"use client";

import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import { Input } from "@keystoneui/react/input";

export default function InputWithButton() {
  return (
    <ButtonGroup className="max-w-sm">
      <Input placeholder="Type to search..." />
      <Button variant="outline">Search</Button>
    </ButtonGroup>
  );
}
