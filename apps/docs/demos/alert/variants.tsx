"use client";

import { Alert, AlertDescription, AlertTitle } from "@keystoneui/react/alert";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  XCircleIcon,
} from "lucide-react";

export default function AlertVariants() {
  return (
    <div className="grid w-full max-w-lg gap-4">
      <Alert variant="success">
        <CheckCircle2Icon />
        <AlertTitle>Account updated successfully</AlertTitle>
        <AlertDescription>
          Your profile information has been saved.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTriangleIcon />
        <AlertTitle>KYC Required</AlertTitle>
        <AlertDescription>
          Level 2 verification needed to deposit.
        </AlertDescription>
      </Alert>
      <Alert variant="error">
        <XCircleIcon />
        <AlertTitle>Payment Failed</AlertTitle>
        <AlertDescription>
          Your transaction could not be processed.
        </AlertDescription>
      </Alert>
      <Alert variant="info">
        <InfoIcon />
        <AlertTitle>New Feature Available</AlertTitle>
        <AlertDescription>Check out our latest trading tools.</AlertDescription>
      </Alert>
    </div>
  );
}
