"use client";

import { Button } from "@keystoneui/react/button";
import { RollingNumber } from "@keystoneui/react/rolling-number";
import { useState } from "react";

const locales = ["en-US", "de-DE", "en-IN"];

export default function RollingNumberLocales() {
  const [value, setValue] = useState(1_234_567.89);
  return (
    <div className="flex flex-col items-center gap-4">
      <dl className="grid grid-cols-[auto_auto] items-baseline gap-x-6 gap-y-2">
        {locales.map((locale) => (
          <div className="contents" key={locale}>
            <dt className="text-muted-foreground text-sm">{locale}</dt>
            <dd className="font-semibold text-2xl">
              <RollingNumber locale={locale} value={value} />
            </dd>
          </div>
        ))}
      </dl>
      <Button
        onClick={() => setValue((v) => v + 11.11)}
        size="sm"
        variant="outline"
      >
        +11.11
      </Button>
    </div>
  );
}
