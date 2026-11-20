"use client";

import { Badge } from "@keystoneui/react/badge";
import { Spinner } from "@keystoneui/react/spinner";

export default function BadgeWithSpinner() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge appearance="soft" variant="error">
        <Spinner data-icon="inline-start" />
        Deleting
      </Badge>
      <Badge variant="secondary">
        Generating
        <Spinner data-icon="inline-end" />
      </Badge>
    </div>
  );
}
