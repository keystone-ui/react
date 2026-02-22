"use client";

import { Button } from "@keystoneui/react/button";
import { ArrowLeft, ArrowRight, ChevronDown, Mail } from "lucide-react";

export default function ButtonWithIcons() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button>
        Next <ArrowRight />
      </Button>
      <Button variant="secondary">
        <Mail /> Email
      </Button>
      <Button variant="outline">
        <ArrowLeft /> Previous
      </Button>
      <Button variant="ghost">
        Settings <ChevronDown />
      </Button>
    </div>
  );
}
