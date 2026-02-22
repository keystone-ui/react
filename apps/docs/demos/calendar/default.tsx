"use client";

import { Calendar } from "@keystoneui/react/calendar";

export default function CalendarDefault() {
  return (
    <Calendar
      className="rounded-lg shadow-lg ring-1 ring-popup-ring"
      mode="single"
    />
  );
}
