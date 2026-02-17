"use client";

import { Alert, AlertDescription, AlertTitle } from "keystoneui/alert";
import { AlertTriangleIcon, InfoIcon, ShieldCheckIcon } from "lucide-react";

export default function AlertCustomColors() {
  return (
    <div className="grid w-full max-w-lg gap-4">
      <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
        <AlertTriangleIcon />
        <AlertTitle>Your subscription will expire in 3 days.</AlertTitle>
        <AlertDescription>
          Renew now to avoid service interruption.
        </AlertDescription>
      </Alert>
      <Alert className="border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-50">
        <ShieldCheckIcon />
        <AlertTitle>Two-factor authentication enabled</AlertTitle>
        <AlertDescription>
          Your account is protected with an additional layer of security.
        </AlertDescription>
      </Alert>
      <Alert className="border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-50">
        <InfoIcon />
        <AlertTitle>Custom teal alert</AlertTitle>
        <AlertDescription>
          Any Tailwind color can be used to create custom alert styles.
        </AlertDescription>
      </Alert>
    </div>
  );
}
