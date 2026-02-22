import type { Meta, StoryObj } from "@storybook/react-vite";
import { parseDate } from "chrono-node";
import { addDays, format } from "date-fns";
import { Button } from "@keystoneui/react/button";
import { Calendar } from "@keystoneui/react/calendar";
import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@keystoneui/react/popover";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { expect, userEvent, within } from "storybook/test";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Components/Date Picker",
  parameters: {
    docs: {
      description: {
        component: `
The Date Picker is built using a composition of the \`<Popover />\` and the \`<Calendar />\` components.

\`\`\`tsx
import { Calendar } from "@keystoneui/react/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@keystoneui/react/popover";
import { Button } from "@keystoneui/react/button";
import { format } from "date-fns";

<Popover>
  <PopoverTrigger
    render={
      <Button variant="outline" className="justify-start font-normal">
        {date ? format(date, "PPP") : "Pick a date"}
      </Button>
    }
  />
  <PopoverContent className="w-auto p-0">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
\`\`\`

## Installation

The Date Picker requires two components:

- [\`Calendar\`](?path=/docs/components-calendar--docs) — the date selection grid
- [\`Popover\`](?path=/docs/components-popover--docs) — the popup container

## Date Formatting

Use [date-fns format](https://date-fns.org/docs/format) strings:

| Format   | Example               |
|----------|-----------------------|
| \`PPP\`    | June 1st, 2025        |
| \`PP\`     | Jun 1, 2025           |
| \`P\`      | 06/01/2025            |
| \`yyyy-MM-dd\` | 2025-06-01       |
| \`MMMM do, yyyy\` | June 1st, 2025 |
| \`EEE, MMM d\` | Sun, Jun 1        |
`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return format(date, "MMMM dd, yyyy");
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}

// =============================================================================
// Default
// =============================================================================
export const Default: Story = {
  render() {
    const [date, setDate] = React.useState<Date>();

    return (
      <Popover>
        <PopoverTrigger
          render={
            <Button
              className="w-[212px] font-normal data-[empty=true]:text-muted-foreground [&>span]:w-full [&>span]:justify-between"
              data-empty={!date}
              variant="outline"
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <ChevronDownIcon className="text-muted-foreground" />
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            defaultMonth={date}
            mode="single"
            onSelect={setDate}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /pick a date/i });
    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);
    await new Promise((r) => setTimeout(r, 500));

    const calendar = document.querySelector("[data-slot='calendar']");
    await expect(calendar).toBeInTheDocument();
  },
};

// =============================================================================
// Basic (with label)
// =============================================================================
export const Basic: Story = {
  render() {
    const [date, setDate] = React.useState<Date>();

    return (
      <Field className="mx-auto w-44">
        <FieldLabel htmlFor="date-picker-simple">Date</FieldLabel>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                className="justify-start font-normal"
                id="date-picker-simple"
                variant="outline"
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              defaultMonth={date}
              mode="single"
              onSelect={setDate}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A basic date picker with a Field label.",
      },
    },
  },
};

// =============================================================================
// Range
// =============================================================================
export const Range: Story = {
  render() {
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: new Date(new Date().getFullYear(), 0, 20),
      to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
    });

    return (
      <Field className="mx-auto w-60">
        <FieldLabel htmlFor="date-picker-range">Date Range</FieldLabel>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                className="justify-start px-2.5 font-normal"
                id="date-picker-range"
                variant="outline"
              >
                <CalendarIcon data-icon="inline-start" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              defaultMonth={date?.from}
              mode="range"
              numberOfMonths={2}
              onSelect={setDate}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'A date range picker using `mode="range"` with two months displayed side by side.',
      },
    },
  },
};

// =============================================================================
// Date of Birth
// =============================================================================
export const DateOfBirth: Story = {
  render() {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(undefined);

    return (
      <Field className="mx-auto w-44">
        <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger
            render={
              <Button
                className="justify-start font-normal"
                id="dob"
                variant="outline"
              >
                {date ? date.toLocaleDateString() : "Select date"}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-auto overflow-hidden p-0">
            <Calendar
              captionLayout="dropdown"
              defaultMonth={date}
              mode="single"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'A date picker with `captionLayout="dropdown"` for easy month and year navigation. Closes on select.',
      },
    },
  },
};

// =============================================================================
// With Input
// =============================================================================
export const WithInput: Story = {
  render() {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(
      new Date("2025-06-01")
    );
    const [month, setMonth] = React.useState<Date | undefined>(date);
    const [value, setValue] = React.useState(formatDate(date));

    return (
      <Field className="mx-auto w-48">
        <FieldLabel htmlFor="date-input">Subscription Date</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="date-input"
            onChange={(e) => {
              const parsed = new Date(e.target.value);
              setValue(e.target.value);
              if (isValidDate(parsed)) {
                setDate(parsed);
                setMonth(parsed);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            placeholder="June 01, 2025"
            value={value}
          />
          <InputGroupAddon align="inline-end">
            <Popover onOpenChange={setOpen} open={open}>
              <PopoverTrigger
                render={
                  <InputGroupButton
                    aria-label="Select date"
                    id="date-picker-input"
                    size="icon-xs"
                    variant="ghost"
                  >
                    <CalendarIcon />
                    <span className="sr-only">Select date</span>
                  </InputGroupButton>
                }
              />
              <PopoverContent
                align="end"
                alignOffset={-8}
                className="w-auto overflow-hidden p-0"
                sideOffset={10}
              >
                <Calendar
                  mode="single"
                  month={month}
                  onMonthChange={setMonth}
                  onSelect={(date) => {
                    setDate(date);
                    setValue(formatDate(date));
                    setOpen(false);
                  }}
                  selected={date}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A date picker with a text input field. The input syncs bidirectionally with the calendar — typing a valid date updates the calendar, and selecting a date updates the input. Press ArrowDown to open the calendar.",
      },
    },
  },
};

// =============================================================================
// With Time
// =============================================================================
export const WithTime: Story = {
  render() {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(undefined);

    return (
      <FieldGroup className="mx-auto max-w-xs flex-row">
        <Field>
          <FieldLabel htmlFor="date-picker-time">Date</FieldLabel>
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger
              render={
                <Button
                  className="w-32 font-normal [&>span]:w-full [&>span]:justify-between"
                  id="date-picker-time"
                  variant="outline"
                >
                  {date ? format(date, "PPP") : "Select date"}
                  <ChevronDownIcon className="text-muted-foreground" />
                </Button>
              }
            />
            <PopoverContent
              align="start"
              className="w-auto overflow-hidden p-0"
            >
              <Calendar
                captionLayout="dropdown"
                defaultMonth={date}
                mode="single"
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                }}
                selected={date}
              />
            </PopoverContent>
          </Popover>
        </Field>
        <Field className="w-32">
          <FieldLabel htmlFor="time-picker">Time</FieldLabel>
          <Input
            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            defaultValue="10:30:00"
            id="time-picker"
            step="1"
            type="time"
          />
        </Field>
      </FieldGroup>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A date picker alongside a separate time input for combined date and time selection.",
      },
    },
  },
};

// =============================================================================
// Natural Language
// =============================================================================
export const NaturalLanguage: Story = {
  render() {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("In 2 days");
    const [date, setDate] = React.useState<Date | undefined>(
      parseDate(value) || undefined
    );

    return (
      <Field className="mx-auto max-w-xs">
        <FieldLabel htmlFor="date-natural">Schedule Date</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="date-natural"
            onChange={(e) => {
              setValue(e.target.value);
              const parsed = parseDate(e.target.value);
              if (parsed) {
                setDate(parsed);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            placeholder="Tomorrow or next week"
            value={value}
          />
          <InputGroupAddon align="inline-end">
            <Popover onOpenChange={setOpen} open={open}>
              <PopoverTrigger
                render={
                  <InputGroupButton
                    aria-label="Select date"
                    id="date-picker-natural"
                    size="icon-xs"
                    variant="ghost"
                  >
                    <CalendarIcon />
                    <span className="sr-only">Select date</span>
                  </InputGroupButton>
                }
              />
              <PopoverContent
                align="end"
                className="w-auto overflow-hidden p-0"
                sideOffset={8}
              >
                <Calendar
                  captionLayout="dropdown"
                  defaultMonth={date}
                  mode="single"
                  onSelect={(date) => {
                    setDate(date);
                    setValue(formatDate(date));
                    setOpen(false);
                  }}
                  selected={date}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>
        <div className="px-1 text-muted-foreground text-sm">
          Your post will be published on{" "}
          <span className="font-medium">{formatDate(date)}</span>.
        </div>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses the `chrono-node` library to parse natural language dates. Try typing "tomorrow", "next week", "in 3 days", or "March 15".',
      },
    },
  },
};

// =============================================================================
// Controlled
// =============================================================================
export const Controlled: Story = {
  render() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [open, setOpen] = React.useState(false);

    return (
      <div className="mx-auto flex max-w-xs flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="date-controlled">Controlled Date</FieldLabel>
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger
              render={
                <Button
                  className="justify-start font-normal"
                  id="date-controlled"
                  variant="outline"
                >
                  <CalendarIcon data-icon="inline-start" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              }
            />
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                defaultMonth={date}
                mode="single"
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                }}
                selected={date}
              />
            </PopoverContent>
          </Popover>
        </Field>
        <div className="flex gap-2">
          <Button
            onClick={() => setDate(new Date())}
            size="sm"
            variant="outline"
          >
            Today
          </Button>
          <Button
            onClick={() => setDate(undefined)}
            size="sm"
            variant="outline"
          >
            Clear
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Selected: {date ? format(date, "yyyy-MM-dd") : "none"}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully controlled date picker with external state management. The selected date can be set or cleared from outside the picker.",
      },
    },
  },
};

// =============================================================================
// Date Formats
// =============================================================================
export const DateFormats: Story = {
  render() {
    const [date, setDate] = React.useState<Date>(new Date(2025, 5, 1));

    const formats = [
      { label: "PPP", example: "Long" },
      { label: "PP", example: "Medium" },
      { label: "P", example: "Short" },
      { label: "yyyy-MM-dd", example: "ISO" },
      { label: "MMMM do, yyyy", example: "Full" },
      { label: "EEE, MMM d", example: "Compact" },
      { label: "dd/MM/yyyy", example: "EU" },
      { label: "MM/dd/yyyy", example: "US" },
    ];

    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                className="w-fit justify-start font-normal"
                variant="outline"
              >
                <CalendarIcon data-icon="inline-start" />
                {format(date, "PPP")}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              defaultMonth={date}
              mode="single"
              onSelect={(d) => d && setDate(d)}
              selected={date}
            />
          </PopoverContent>
        </Popover>
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium">Format</th>
                <th className="px-3 py-2 text-left font-medium">Code</th>
                <th className="px-3 py-2 text-left font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {formats.map((f) => (
                <tr className="border-b last:border-b-0" key={f.label}>
                  <td className="px-3 py-2 text-muted-foreground">
                    {f.example}
                  </td>
                  <td className="px-3 py-2">
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      {f.label}
                    </code>
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {format(date, f.label)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Reference for common `date-fns` format strings. Select a date to see how each format renders.",
      },
    },
  },
};
