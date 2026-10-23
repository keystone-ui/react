"use client";

import { Calendar } from "@keystoneui/react/calendar";
import { useState } from "react";

export default function CalendarBookedDates() {
  // Fixed dates: the demo is prerendered, so it must not read the clock.
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 0, 6));

  const bookedDates = Array.from(
    { length: 15 },
    (_, i) => new Date(2026, 0, 12 + i)
  );

  return (
    <Calendar
      className="rounded-lg shadow-lg ring-1 ring-popup-ring"
      defaultMonth={date}
      disabled={bookedDates}
      mode="single"
      modifiers={{
        booked: bookedDates,
      }}
      modifiersClassNames={{
        booked: "[&>button]:line-through opacity-100",
      }}
      onSelect={setDate}
      selected={date}
    />
  );
}
