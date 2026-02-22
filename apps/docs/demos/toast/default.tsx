"use client";

import { Button } from "@keystoneui/react/button";
import { Toaster, toast } from "@keystoneui/react/toast";

export default function ToastDefault() {
  return (
    <div>
      <Button onClick={() => toast("Event has been created")} variant="outline">
        Show Toast
      </Button>
      <Toaster />
    </div>
  );
}
