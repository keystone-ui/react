"use client";

import { Button } from "keystoneui/button";

export default function ButtonDisabled() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Disabled</Button>
      <Button disabled variant="secondary">
        Secondary
      </Button>
      <Button disabled variant="destructive">
        Destructive
      </Button>
      <Button disabled variant="outline">
        Outline
      </Button>
      <Button disabled variant="ghost">
        Ghost
      </Button>
    </div>
  );
}
