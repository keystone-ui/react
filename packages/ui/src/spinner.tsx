import { Loader2Icon } from "lucide-react";
import type * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------

/** An animated loading spinner icon. Pass `className` to control size (e.g. `size-6`). */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      data-slot="spinner"
      role="status"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Spinner };
