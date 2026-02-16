"use client";

import { Button } from "keystoneui/button";
import { Plus } from "lucide-react";

export default function ButtonRounded() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button className="rounded-full" size="sm">
        Default
      </Button>
      <Button className="rounded-full" size="sm" variant="secondary">
        Secondary
      </Button>
      <Button className="rounded-full" size="sm" variant="destructive">
        Destructive
      </Button>
      <Button className="rounded-full" size="sm" variant="outline">
        Outline
      </Button>
      <Button className="rounded-full" size="sm" variant="ghost">
        Ghost
      </Button>
      <Button className="rounded-full" size="sm" variant="link">
        Link
      </Button>
      <Button
        aria-label="Icon"
        className="aspect-square rounded-full"
        size="sm"
      >
        <Plus aria-hidden="true" size={16} />
      </Button>
    </div>
  );
}
