"use client";

import { Button } from "keystoneui/button";
import { Toaster, toast } from "keystoneui/toast";

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
