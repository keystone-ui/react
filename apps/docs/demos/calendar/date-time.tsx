"use client";

import { Calendar } from "@keystoneui/react/calendar";
import { Card, CardContent, CardFooter } from "@keystoneui/react/card";
import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { Clock2Icon } from "lucide-react";
import { useState } from "react";

export default function CalendarDateTime() {
  const [date, setDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 12)
  );

  return (
    <Card className="mx-auto w-fit shadow-lg" size="xs">
      <CardContent>
        <Calendar
          className="p-0"
          mode="single"
          onSelect={setDate}
          selected={date}
        />
      </CardContent>
      <CardFooter className="border-t bg-card">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="time-from">Start Time</FieldLabel>
            <InputGroup size="sm">
              <InputGroupInput
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue="10:30:00"
                id="time-from"
                step="1"
                type="time"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="time-to">End Time</FieldLabel>
            <InputGroup size="sm">
              <InputGroupInput
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue="12:30:00"
                id="time-to"
                step="1"
                type="time"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
      </CardFooter>
    </Card>
  );
}
