"use client";

import { Button } from "@keystoneui/react/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@keystoneui/react/tooltip";
import { HomeIcon, InboxIcon, SearchIcon, SettingsIcon } from "lucide-react";

const sidebarItems = [
  { icon: HomeIcon, label: "Home" },
  { icon: SearchIcon, label: "Search" },
  { icon: InboxIcon, label: "Inbox" },
  { icon: SettingsIcon, label: "Settings" },
];

export default function TooltipGroupDelay() {
  return (
    <TooltipProvider closeDelay={150} delay={700}>
      <nav className="flex flex-col gap-1 rounded-lg border p-1.5">
        {sidebarItems.map(({ icon: Icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button size="icon-sm" variant="ghost">
                  <Icon />
                </Button>
              }
            />
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );
}
