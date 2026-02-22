"use client";

import { Calendar } from "@keystoneui/react/calendar";
import { useState } from "react";

export default function CalendarBookedDates() {
  const [date, setDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), 0, 6)
  );

  const bookedDates = Array.from(
    { length: 15 },
    (_, i) => new Date(new Date().getFullYear(), 0, 12 + i)
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
