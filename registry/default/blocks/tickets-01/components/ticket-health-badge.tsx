"use client";

import { healthLabels, type TicketHealth } from "@/components/mock-tickets";
import { cn } from "@/lib/utils";

const healthStyles: Record<TicketHealth, string> = {
  "on-track": "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  breached: "text-rose-600 dark:text-rose-400",
};

const healthDots: Record<TicketHealth, string> = {
  "on-track": "bg-emerald-500",
  warning: "bg-amber-500",
  breached: "bg-rose-500",
};

export function TicketHealthBadge({ health }: { health: TicketHealth }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        healthStyles[health]
      )}
    >
      <span className={cn("size-1.5 rounded-full", healthDots[health])} />
      {healthLabels[health]}
    </span>
  );
}
