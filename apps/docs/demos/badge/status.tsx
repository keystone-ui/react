"use client";

import { Badge } from "@keystoneui/react/badge";
import {
  CircleCheck as CircleCheckIcon,
  CircleX as CircleXIcon,
  Info as InfoIcon,
  TriangleAlert as TriangleAlertIcon,
} from "lucide-react";

const tones = [
  { variant: "success", label: "Success", Icon: CircleCheckIcon },
  { variant: "warning", label: "Warning", Icon: TriangleAlertIcon },
  { variant: "info", label: "Info", Icon: InfoIcon },
  { variant: "error", label: "Error", Icon: CircleXIcon },
] as const;

export default function BadgeStatus() {
  return (
    <div className="flex flex-col gap-3">
      {tones.map(({ variant, label, Icon }) => (
        <div className="flex flex-wrap items-center gap-2" key={variant}>
          <Badge variant={variant}>{label}</Badge>
          <Badge variant={variant}>
            <Icon aria-hidden="true" data-icon="inline-start" />
            {label}
          </Badge>
          <Badge appearance="soft" variant={variant}>
            {label}
          </Badge>
          <Badge appearance="soft" variant={variant}>
            <Icon aria-hidden="true" data-icon="inline-start" />
            {label}
          </Badge>
        </div>
      ))}
    </div>
  );
}
