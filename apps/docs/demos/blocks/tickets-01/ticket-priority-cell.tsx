"use client";

import { cn } from "@keystoneui/react/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleDashedIcon,
  MinusIcon,
} from "lucide-react";

import { priorityLabels, type TicketPriority } from "./mock-tickets";

const priorityStyles: Record<
  TicketPriority,
  { icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  urgent: { icon: ArrowUpIcon, tone: "text-rose-500 dark:text-rose-400" },
  high: { icon: ArrowUpIcon, tone: "text-orange-500 dark:text-orange-400" },
  medium: { icon: MinusIcon, tone: "text-muted-foreground" },
  low: { icon: ArrowDownIcon, tone: "text-sky-500 dark:text-sky-400" },
  todo: { icon: CircleDashedIcon, tone: "text-muted-foreground" },
};

export function TicketPriorityCell({
  priority,
  className,
}: {
  priority: TicketPriority;
  className?: string;
}) {
  const { icon: Icon, tone } = priorityStyles[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Icon className={cn("size-3.5 shrink-0", tone)} />
      <span>{priorityLabels[priority]}</span>
    </span>
  );
}
