"use client";

import { Button } from "@keystoneui/react/button";
import { RollingNumber } from "@keystoneui/react/rolling-number";
import { useState } from "react";

export default function RollingNumberDefault() {
  const [value, setValue] = useState(1284);
  return (
    <div className="flex flex-col items-center gap-4">
      <RollingNumber className="font-semibold text-4xl" value={value} />
      <div className="flex gap-2">
        <Button
          onClick={() => setValue((v) => v + 1)}
          size="sm"
          variant="outline"
        >
          +1
        </Button>
        <Button
          onClick={() => setValue((v) => v + 100)}
          size="sm"
          variant="outline"
        >
          +100
        </Button>
      </div>
    </div>
  );
}
