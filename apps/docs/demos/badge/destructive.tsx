"use client";

import { Badge } from "@keystoneui/react/badge";

export default function BadgeDestructive() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-col items-start gap-1.5">
        {/* The classes `variant="destructive"` drew before it followed `appearance`. */}
        <Badge className="bg-destructive/10 text-destructive dark:bg-destructive/20">
          Destructive
        </Badge>
        <span className="text-muted-foreground text-xs">
          Earlier destructive
        </span>
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <Badge appearance="soft" variant="error">
          Error
        </Badge>
        <span className="text-muted-foreground text-xs">error, soft</span>
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <Badge variant="error">Error</Badge>
        <span className="text-muted-foreground text-xs">
          error (solid, the default)
        </span>
      </div>
    </div>
  );
}
