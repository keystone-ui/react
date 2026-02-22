"use client";

import { Alert, AlertDescription, AlertTitle } from "@keystoneui/react/alert";

export default function AlertWithoutIcon() {
  return (
    <div className="grid w-full max-w-lg gap-4">
      <Alert>
        <AlertTitle>Default alert without icon</AlertTitle>
        <AlertDescription>
          The layout adapts to a single column when no icon is present.
        </AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertTitle>Did you know?</AlertTitle>
        <AlertDescription>
          You can use alerts without icons for simpler messages.
        </AlertDescription>
      </Alert>
    </div>
  );
}
