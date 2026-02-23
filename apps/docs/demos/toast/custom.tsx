"use client";

import { Button } from "@keystoneui/react/button";
import { Toaster, toast } from "@keystoneui/react/toast";
import { UsersIcon } from "lucide-react";

export default function ToastCustom() {
  return (
    <div>
      <Button
        onClick={() =>
          toast.custom((t) => (
            <div className="flex w-[356px] flex-wrap items-center gap-3 rounded-lg border border-border-muted bg-popover p-4 text-popover-foreground shadow-lg">
              <UsersIcon className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1 basis-[calc(100%-2.75rem)]">
                <p className="font-medium text-sm">
                  You have been invited to join a team
                </p>
                <p className="text-muted-foreground text-xs">
                  Bob sent you an invitation to join the team
                </p>
              </div>
              <Button
                onClick={() => toast.dismiss(t)}
                size="sm"
                variant="secondary"
              >
                Dismiss
              </Button>
            </div>
          ))
        }
        variant="outline"
      >
        Show Custom Toast
      </Button>
      <Toaster />
    </div>
  );
}
