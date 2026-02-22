"use client";

import { addDays } from "date-fns";
import { Button } from "@keystoneui/react/button";
import { Calendar } from "@keystoneui/react/calendar";
import { Card, CardContent, CardFooter } from "@keystoneui/react/card";
import { useState } from "react";

export default function CalendarPresets() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  return (
    <Card className="w-fit shadow-lg" size="sm">
      <CardContent>
        <Calendar
          className="p-0 [--cell-size:--spacing(9.5)]"
          fixedWeeks
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          onSelect={setDate}
          selected={date}
        />
      </CardContent>
      <CardFooter className="flex w-0 min-w-full flex-wrap gap-2">
        {[
          { label: "Today", value: 0 },
          { label: "Tomorrow", value: 1 },
          { label: "In 3 days", value: 3 },
          { label: "In a week", value: 7 },
          { label: "In 2 weeks", value: 14 },
        ].map((preset) => (
          <Button
            key={preset.value}
            onClick={() => {
              const newDate = addDays(new Date(), preset.value);
              setDate(newDate);
              setCurrentMonth(
                new Date(newDate.getFullYear(), newDate.getMonth(), 1)
              );
            }}
            size="xs"
            variant="outline"
          >
            {preset.label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}
