import { Button } from "@keystone/ui/button";
import { Calendar, CalendarDayButton } from "@keystone/ui/calendar";
import { Card, CardContent, CardFooter } from "@keystone/ui/card";
import { Field, FieldGroup, FieldLabel } from "@keystone/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystone/ui/input-group";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { addDays } from "date-fns";
import { Clock2Icon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component: `
A date calendar component built on top of [React DayPicker](https://daypicker.dev/).

\`\`\`tsx
import { Calendar } from "@keystone/ui/calendar";

<Calendar mode="single" className="rounded-lg shadow-lg ring-1 ring-popup-ring" />
\`\`\`

## Features

- Single, multiple, and range date selection modes
- Customizable cell size via \`--cell-size\` CSS variable
- Week number display
- Dropdown caption layout for month/year selection
- Outside days visibility
- Disabled and booked date modifiers
- Custom day button rendering via \`CalendarDayButton\`
- RTL support

## Customization

You can customize the size of calendar cells using the \`--cell-size\` CSS variable:

\`\`\`tsx
<Calendar className="[--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]" />
\`\`\`

## API Reference

See the [React DayPicker documentation](https://daypicker.dev/) for the full API reference.
`,
      },
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof Calendar>;

// =============================================================================
// Default
// =============================================================================
export const Default: Story = {
  render: () => (
    <Calendar
      className="rounded-lg shadow-lg ring-1 ring-popup-ring"
      mode="single"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("grid");
    await expect(grid).toBeInTheDocument();
  },
};

// =============================================================================
// Range
// =============================================================================
export const Range: Story = {
  render() {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
      from: new Date(new Date().getFullYear(), 0, 12),
      to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
    });

    return (
      <Calendar
        className="rounded-lg shadow-lg ring-1 ring-popup-ring"
        defaultMonth={dateRange?.from}
        mode="range"
        numberOfMonths={2}
        onSelect={setDateRange}
        selected={dateRange}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `mode="range"` to enable range selection. Combine with `numberOfMonths={2}` to display two months side by side.',
      },
    },
  },
};

// =============================================================================
// Month and Year Selector
// =============================================================================
export const MonthAndYearSelector: Story = {
  render: () => (
    <Calendar
      captionLayout="dropdown"
      className="rounded-lg shadow-lg ring-1 ring-popup-ring"
      mode="single"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use `captionLayout="dropdown"` to show month and year dropdowns for quick navigation.',
      },
    },
  },
};

// =============================================================================
// Presets
// =============================================================================
export const Presets: Story = {
  render() {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(new Date().getFullYear(), 1, 12)
    );
    const [currentMonth, setCurrentMonth] = React.useState<Date>(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );

    return (
      <Card className="mx-auto w-fit shadow-lg" size="sm">
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
  },
  parameters: {
    docs: {
      description: {
        story:
          "Calendar with quick-select preset buttons inside a Card. Uses controlled `month` and `onMonthChange` to navigate when a preset is selected.",
      },
    },
  },
};

// =============================================================================
// Date and Time
// =============================================================================
export const DateTime: Story = {
  render() {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(new Date().getFullYear(), new Date().getMonth(), 12)
    );

    return (
      <Card className="mx-auto w-fit shadow-lg" size="sm">
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
  },
  parameters: {
    docs: {
      description: {
        story:
          "Calendar combined with time input fields inside a Card for date and time selection.",
      },
    },
  },
};

// =============================================================================
// Booked Dates
// =============================================================================
export const BookedDates: Story = {
  render() {
    const [date, setDate] = React.useState<Date | undefined>(
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
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the `disabled` prop to disable specific dates, and `modifiers` with `modifiersClassNames` to add visual indicators like strikethrough for booked dates.",
      },
    },
  },
};

// =============================================================================
// Custom Cell Size
// =============================================================================
export const CustomCellSize: Story = {
  render() {
    const [range, setRange] = React.useState<DateRange | undefined>({
      from: new Date(new Date().getFullYear(), 11, 8),
      to: addDays(new Date(new Date().getFullYear(), 11, 8), 10),
    });

    return (
      <div className="flex flex-wrap items-start gap-6">
        <Calendar
          className="rounded-lg shadow-lg ring-1 ring-popup-ring [--cell-size:--spacing(9.5)]"
          mode="single"
        />
        <Calendar
          className="rounded-lg shadow-lg ring-1 ring-popup-ring [--cell-size:--spacing(8)] md:[--cell-size:--spacing(10)]"
          components={{
            DayButton: ({ children, modifiers, day, ...props }) => {
              const isWeekend =
                day.date.getDay() === 0 || day.date.getDay() === 6;

              return (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                  {children}
                  {!modifiers.outside && (
                    <span className="text-xs opacity-70">
                      {isWeekend ? "$120" : "$100"}
                    </span>
                  )}
                </CalendarDayButton>
              );
            },
          }}
          defaultMonth={range?.from}
          mode="range"
          numberOfMonths={1}
          onSelect={setRange}
          selected={range}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Customize cell size with the `--cell-size` CSS variable. Use responsive values like `[--cell-size:--spacing(8)] md:[--cell-size:--spacing(10)]`. This example also shows custom day rendering with pricing via the `CalendarDayButton` component.",
      },
    },
  },
};

// =============================================================================
// Week Numbers
// =============================================================================
export const WeekNumbers: Story = {
  render() {
    const [date, setDate] = React.useState<Date | undefined>(
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
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `showWeekNumber` to display ISO week numbers alongside the calendar rows.",
      },
    },
  },
};
