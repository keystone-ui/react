"use client";

import { RollingNumber } from "@keystoneui/react/rolling-number";
import { useEffect, useState } from "react";

/** Literal values with fixed locales: the server and the client agree. */
export function RollingNumberFixture() {
  const [balance, setBalance] = useState(1239);
  useEffect(() => {
    document.documentElement.dataset.fixtureHydrated = "rolling-number";
  }, []);
  return (
    <main className="flex min-h-screen flex-col gap-6 bg-background p-4 text-4xl text-foreground">
      <p data-testid="eur">
        <RollingNumber
          format={{ style: "currency", currency: "EUR" }}
          locale="de-DE"
          value={1234.5}
        />
      </p>
      <p data-testid="copy">
        Balance{" "}
        <RollingNumber
          format={{ style: "currency", currency: "EUR" }}
          locale="de-DE"
          value={balance}
        />{" "}
        EUR
      </p>
      <button
        className="text-base"
        data-testid="copy-next"
        onClick={() => setBalance((v) => v + 1)}
        type="button"
      >
        +1
      </button>
      <p data-testid="plain">
        <RollingNumber locale="en-US" value={98_765.43} />
      </p>
    </main>
  );
}
