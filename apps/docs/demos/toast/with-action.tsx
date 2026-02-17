"use client";

import { Button } from "keystoneui/button";
import { Toaster, toast } from "keystoneui/toast";

export default function ToastWithAction() {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            toast("Event has been created", {
              action: {
                label: "Undo",
                onClick: () => toast("Event undone"),
              },
            })
          }
          variant="outline"
        >
          With Action
        </Button>
        <Button
          onClick={() =>
            toast.success("Payment processed", {
              description: "Your invoice has been sent to your email",
              action: {
                label: "View",
                onClick: () => undefined,
              },
              cancel: {
                label: "Dismiss",
                onClick: () => undefined,
              },
            })
          }
          variant="outline"
        >
          Both Buttons
        </Button>
      </div>
      <Toaster />
    </div>
  );
}
