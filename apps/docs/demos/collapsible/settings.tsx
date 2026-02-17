"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "keystoneui/collapsible";
import { ChevronRightIcon, SettingsIcon, ShieldIcon } from "lucide-react";

export default function CollapsibleSettings() {
  return (
    <div className="w-full max-w-sm space-y-2">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-3 py-2 font-medium text-sm hover:bg-muted">
          <ChevronRightIcon className="size-4 transition-transform group-data-[panel-open]:rotate-90" />
          <SettingsIcon className="size-4" />
          General Settings
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-10 space-y-1 py-1">
            <div className="rounded-md px-3 py-1.5 text-muted-foreground text-sm hover:bg-muted hover:text-foreground">
              Profile
            </div>
            <div className="rounded-md px-3 py-1.5 text-muted-foreground text-sm hover:bg-muted hover:text-foreground">
              Notifications
            </div>
            <div className="rounded-md px-3 py-1.5 text-muted-foreground text-sm hover:bg-muted hover:text-foreground">
              Appearance
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-3 py-2 font-medium text-sm hover:bg-muted">
          <ChevronRightIcon className="size-4 transition-transform group-data-[panel-open]:rotate-90" />
          <ShieldIcon className="size-4" />
          Security
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-10 space-y-1 py-1">
            <div className="rounded-md px-3 py-1.5 text-muted-foreground text-sm hover:bg-muted hover:text-foreground">
              Password
            </div>
            <div className="rounded-md px-3 py-1.5 text-muted-foreground text-sm hover:bg-muted hover:text-foreground">
              Two-Factor Auth
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
