"use client";

import { cn } from "@keystoneui/react/utils";
import { HashIcon, MailIcon, MessageSquareIcon } from "lucide-react";

import { channelLabels, type TicketChannel } from "./mock-tickets";

const channelIcons: Record<
  TicketChannel,
  React.ComponentType<{ className?: string }>
> = {
  email: MailIcon,
  chat: MessageSquareIcon,
  slack: HashIcon,
};

export function TicketChannelCell({
  channel,
  className,
}: {
  channel: TicketChannel;
  className?: string;
}) {
  const Icon = channelIcons[channel];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span>{channelLabels[channel]}</span>
    </span>
  );
}
