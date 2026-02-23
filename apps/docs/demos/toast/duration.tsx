"use client";

import { Button } from "@keystoneui/react/button";
import { Toaster, toast } from "@keystoneui/react/toast";

export default function ToastDuration() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          toast("This toast stays for 10 seconds", { duration: 10_000 })
        }
        variant="outline"
      >
        10s Duration
      </Button>
      <Button
        onClick={() =>
          toast("Toast with close button", {
            closeButton: true,
            description: "Click the × to dismiss",
          })
        }
        variant="outline"
      >
        Close Button
      </Button>
      <Button
        onClick={() =>
          toast("This toast won't auto-close", {
            duration: Number.POSITIVE_INFINITY,
            closeButton: true,
            description: "Dismiss manually",
          })
        }
        variant="outline"
      >
        Persistent
      </Button>
      <Toaster />
    </div>
  );
}
