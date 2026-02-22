"use client";

import { Calendar } from "@keystoneui/react/calendar";

export default function CalendarMonthYear() {
  return (
    <Calendar
      captionLayout="dropdown"
      className="rounded-lg shadow-lg ring-1 ring-popup-ring"
      mode="single"
    />
  );
}
