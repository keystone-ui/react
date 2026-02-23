"use client";

import { Button } from "@keystoneui/react/button";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useState } from "react";

export default function ButtonCustomLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const toggleLoading = () => setIsLoading(!isLoading);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button onClick={toggleLoading} size="sm" variant="outline">
          {isLoading ? "Stop Loading" : "Start Loading"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Manual loader
        </Button>
        <Button isLoading={isLoading} variant="secondary">
          <Mail />
          With left icon
        </Button>
        <Button isLoading={isLoading} variant="outline">
          With right icon
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
