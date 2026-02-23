"use client";

import { Calendar } from "@keystoneui/react/calendar";
import { useState } from "react";

export default function CalendarWeekNumbers() {
  const [date, setDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), 0, 12)
  );

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
