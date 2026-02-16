"use client";

import { Button } from "keystoneui/button";
import { ArrowRight, Bold, Italic, Mail, Plus } from "lucide-react";

export default function ButtonIconButtons() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button aria-label="Next" className="aspect-square">
        <ArrowRight size={16} />
      </Button>
      <Button aria-label="Mail" className="aspect-square" variant="secondary">
        <Mail size={16} />
      </Button>
      <Button aria-label="Bold" className="aspect-square" variant="outline">
        <Bold size={16} />
      </Button>
      <Button aria-label="Italic" className="aspect-square" variant="ghost">
        <Italic size={16} />
      </Button>
      <Button
        aria-label="Add"
        className="aspect-square rounded-full"
        variant="outline"
      >
        <Plus aria-hidden="true" size={16} />
      </Button>
    </div>
  );
}
