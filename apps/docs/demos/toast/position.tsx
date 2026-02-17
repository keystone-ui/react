"use client";

import { Button } from "keystoneui/button";
import { Toaster, toast } from "keystoneui/toast";

export default function ToastPosition() {
  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-muted-foreground text-sm">
          Current position:{" "}
          <code className="font-mono text-foreground">bottom-right</code>
        </p>
        <Button
          onClick={() =>
            toast("Toast notification", {
              description: "This toast appears at the configured position.",
            })
          }
          variant="outline"
        >
          Show Toast
        </Button>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
