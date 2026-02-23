"use client";

import { Button } from "@keystoneui/react/button";
import { Toaster, toast } from "@keystoneui/react/toast";

export default function ToastWithDescription() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          toast("Event has been created", {
            description: "Monday, January 3rd at 6:00pm",
          })
        }
        variant="outline"
      >
        Default
      </Button>
      <Button
        onClick={() =>
          toast.success("You have upgraded your plan", {
            description: "You can continue using the platform",
          })
        }
        variant="outline"
      >
        Success
      </Button>
      <Button
        onClick={() =>
          toast.error("Storage is full", {
            description: "Remove files to release space.",
          })
        }
        variant="outline"
      >
        Error
      </Button>
      <Toaster />
    </div>
  );
}
