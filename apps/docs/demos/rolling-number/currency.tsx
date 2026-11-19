"use client";

import { Button } from "@keystoneui/react/button";
import { RollingNumber } from "@keystoneui/react/rolling-number";
import { useState } from "react";

export default function RollingNumberCurrency() {
  const [balance, setBalance] = useState(1234.5);
  return (
    <div className="flex flex-col items-center gap-4">
      <RollingNumber
        className="font-semibold text-4xl"
        format={{ style: "currency", currency: "EUR" }}
        locale="de-DE"
        value={balance}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => setBalance((v) => v - 12.75)}
          size="sm"
          variant="outline"
        >
          Withdraw 12,75 €
        </Button>
        <Button
          onClick={() => setBalance((v) => v + 50)}
          size="sm"
          variant="outline"
        >
          Deposit 50 €
        </Button>
      </div>
    </div>
  );
}
