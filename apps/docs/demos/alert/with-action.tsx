"use client";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "keystoneui/alert";
import { Button } from "keystoneui/button";
import { AlertTriangleIcon } from "lucide-react";

export default function AlertWithAction() {
  return (
    <Alert className="max-w-lg" variant="warning">
      <AlertTriangleIcon />
      <AlertTitle>KYC Required</AlertTitle>
      <AlertDescription>
        Level 2 verification needed to deposit.
      </AlertDescription>
      <AlertAction>
        <Button className="hover:bg-current/10" size="xs" variant="ghost">
          Verify
        </Button>
      </AlertAction>
    </Alert>
  );
}
