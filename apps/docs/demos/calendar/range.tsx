"use client";

import { Calendar } from "@keystoneui/react/calendar";
import { addDays } from "date-fns";
import { useState } from "react";

export default function CalendarRange() {
  // A fixed date: the demo is prerendered, so it must not read the clock.
  const startDate = new Date(2026, 0, 12);

  const [dateRange, setDateRange] = useState({
    from: startDate,
    to: addDays(startDate, 30),
  });

  return (
    <Calendar
      className="rounded-lg shadow-lg ring-1 ring-popup-ring"
      defaultMonth={dateRange.from}
      mode="range"
      numberOfMonths={2}
      onSelect={(range: unknown) => {
        if (range && typeof range === "object" && "from" in range) {
          setDateRange(range as { from: Date; to: Date });
        }
      }}
      selected={dateRange}
    />
  );
}
