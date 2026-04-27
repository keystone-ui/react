"use client";

import { statusLabels, type TicketStatus } from "@/components/mock-tickets";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<TicketStatus, string> = {
  open: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  pending:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  resolved:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  closed: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge
      className={cn("rounded-md border", statusStyles[status])}
      variant="outline"
    >
      {statusLabels[status]}
    </Badge>
  );
}
