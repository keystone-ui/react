"use client";

import { Alert, AlertDescription, AlertTitle } from "@keystoneui/react/alert";
import { InfoIcon } from "lucide-react";

export default function AlertDefault() {
  return (
    <Alert className="max-w-md">
      <InfoIcon />
      <AlertTitle>New Feature Available</AlertTitle>
      <AlertDescription>
        Check out our latest tools and analytics dashboard.
      </AlertDescription>
    </Alert>
  );
}
