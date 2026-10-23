"use client";

import { Calendar } from "@keystoneui/react/calendar";
import { useState } from "react";

export default function CalendarWeekNumbers() {
  // A fixed date: the demo is prerendered, so it must not read the clock.
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 0, 12));

  return (
    <Calendar
      className="rounded-lg shadow-lg ring-1 ring-popup-ring"
      defaultMonth={date}
      mode="single"
      onSelect={setDate}
      selected={date}
      showWeekNumber
    />
  );
}
