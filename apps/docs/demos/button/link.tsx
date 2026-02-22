"use client";

import { Button } from "@keystoneui/react/button";
import { ArrowLeft } from "lucide-react";

export default function ButtonLink() {
  return (
    <Button variant="link">
      <ArrowLeft /> Go back
    </Button>
  );
}
